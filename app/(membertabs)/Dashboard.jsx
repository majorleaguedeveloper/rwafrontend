import React, { useState, useCallback, useContext } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  ActivityIndicator
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import AuthContext from '../../contexts/Authcontext';
import CurrentMonthLegacyCreditStatusCard from '../../components/dashboard/CurrentMonthLegacyCreditStatusCard';
import Card from '../../components/dashboard/Card';
import QuickLinkCard from '../../components/dashboard/QuickLinkCard';

export default function Dashboard() {
  const { userToken, userData } = useContext(AuthContext);
  const [dashboardData, setDashboardData] = useState({
    loans: [],
    guarantorRequests: [], 
    guaranteeSummary: null,
    legacyCredits: [],
    departments: [],
    announcements: [],
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const API_BASE_URL = 'http://192.168.1.185:4000/api';

  const fetchDashboardData = useCallback(async () => {
    try {
      if (!userToken) return;

      // Fetch user profile
      const userResponse = await axios.get(`${API_BASE_URL}/auth/me`, {
        headers: { 'x-auth-token': userToken }
      });
      console.log('User:', userResponse.data);

      // Fetch announcements
      const announcementsResponse = await axios.get(`${API_BASE_URL}/announcements`, {
        headers: { 'x-auth-token': userToken }
      });

      // Fetch departments
      const departmentsResponse = await axios.get(`${API_BASE_URL}/departments`, {
        headers: { 'x-auth-token': userToken }
      });

      // Fetch user loans
      const loansResponse = await axios.get(`${API_BASE_URL}/loans/user`, {
        headers: { 'x-auth-token': userToken }
      });

      // Fetch guarantor requests
      const guarantorRequestsResponse = await axios.get(`${API_BASE_URL}/loans/guarantor-requests`, {
        headers: { 'x-auth-token': userToken }
      });

      // Fetch guarantee summary
      const guaranteeSummaryResponse = await axios.get(`${API_BASE_URL}/loans/guarantee-summary`, {
        headers: { 'x-auth-token': userToken }
      });

      // Fetch user legacy credits
      const legacyCreditsResponse = await axios.get(`${API_BASE_URL}/legacyCredits/user/${userResponse.data._id}`, {
        headers: { 'x-auth-token': userToken }
      });

      setDashboardData({
        loans: loansResponse.data,
        guarantorRequests: guarantorRequestsResponse.data,
        guaranteeSummary: guaranteeSummaryResponse.data,
        legacyCredits: legacyCreditsResponse.data,
        departments: departmentsResponse.data,
        announcements: announcementsResponse.data,
      });    } catch (_error) {
      console.error('Error fetching dashboard data:', _error);
      Alert.alert('Error', 'Failed to load dashboard data');    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userToken, API_BASE_URL]);
  useFocusEffect(
    useCallback(() => {
      fetchDashboardData();
    }, [fetchDashboardData])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  const handleGuarantorResponse = async (loanId, status) => {
    try {
      await axios.put(`${API_BASE_URL}/loans/${loanId}/guarantor-response`, 
        { status },
        { headers: { 'x-auth-token': userToken } }
      );
      Alert.alert('Success', `Guarantor request ${status}`);
      fetchDashboardData();    } catch (_error) {
      Alert.alert('Error', 'Failed to respond to guarantor request');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return '#10B981';
      case 'pending': return '#F59E0B';
      case 'rejected': return '#EF4444';
      case 'paid': return '#8B5CF6';
      default: return '#6B7280';
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
        <Text>Loading dashboard...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: '#F9FAFB' }}
      contentContainerStyle={{ padding: 16 }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Welcome Section */}
      <View style={{ backgroundColor: 'white', padding: 20, borderRadius: 12, marginBottom: 16 }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#1F2937' }}>
          Welcome {userData?.name}
        </Text>
      </View>

      <CurrentMonthLegacyCreditStatusCard />

      <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 16 }}>
        Dashboard
      </Text>

      <View style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <Card
        iconName="megaphone"
        iconColor="#4c669f"
        title="Announcements"
        route="/memberpages/announcements/Announcements"
        number={1}
        message="View Announcements"
      />

        <Card
        iconName="megaphone"
        iconColor="#4c669f"
        title="Legacy Credits"
        route="/memberpages/legacyCredits/LegacyCredits"
        number={2}
        message="View Your Legacy Credits"
      />

      <Card
        iconName="megaphone"
        iconColor="#4c669f"
        title="Loans"
        route="/memberpages/Loans/MyLoansScreen"
        number={3}
        message="View Your Loans"
      />

      <Card
        iconName="megaphone"
        iconColor="#4c669f"
        title="Investments"
        route="/generalpages/Investments"
        number={4}
        message="View RWA Investments"
      />

    </View>

      <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 16 }}>
        Quick Links
      </Text>

      <View style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
      <QuickLinkCard
        ioniconName="megaphone"
        ioniconColor="#4c669f"
        text="Legacy Credits Reports"
      />

      <QuickLinkCard
        ioniconName="megaphone"
        ioniconColor="#4c669f"
        text="Apply for New Loan"
      />

      </View>

      {/* Quick Stats */}
      <View style={{ flexDirection: 'row', marginBottom: 16 }}>
        <View style={{ 
          flex: 1, 
          backgroundColor: 'white', 
          padding: 16, 
          borderRadius: 12, 
          marginRight: 8 
        }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#3B82F6' }}>
            {dashboardData.loans.length}
          </Text>
          <Text style={{ color: '#6B7280', fontSize: 12 }}>My Loans</Text>
        </View>
        <View style={{ 
          flex: 1, 
          backgroundColor: 'white', 
          padding: 16, 
          borderRadius: 12, 
          marginLeft: 8 
        }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#10B981' }}>
            {dashboardData.guaranteeSummary?.availableCredits || 0}
          </Text>
          <Text style={{ color: '#6B7280', fontSize: 12 }}>Available Credits</Text>
        </View>
      </View>

      {/* Announcements Section */}
      <TouchableOpacity
        onPress={() => router.push('/memberpages/announcements')}
        style={{
          backgroundColor: '#ffffff',
          borderRadius: 10,
          padding: 16,
          marginBottom: 16,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
          <Ionicons name="megaphone" size={24} color="#4c669f" />
          <Text style={{ fontSize: 18, fontWeight: 'bold', marginLeft: 8 }}>
            Announcements
          </Text>
        </View>
        <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#4c669f' }}>
          {dashboardData.announcements.length}
        </Text>
        <Text style={{ color: '#666' }}>New Announcements</Text>
      </TouchableOpacity>

      {/* Guarantor Requests */}
      {dashboardData.guarantorRequests.length > 0 && (
        <View style={{ backgroundColor: 'white', padding: 16, borderRadius: 12, marginBottom: 16 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 12 }}>
            Guarantor Requests ({dashboardData.guarantorRequests.length})
          </Text>
          {dashboardData.guarantorRequests.map((loan) => (
            <View key={loan._id} style={{ 
              backgroundColor: '#FEF3C7', 
              padding: 12, 
              borderRadius: 8, 
              marginBottom: 8 
            }}>
              <Text style={{ fontWeight: 'bold' }}>
                Loan Request from {loan.user.name}
              </Text>
              <Text style={{ color: '#6B7280' }}>
                Amount: KES {loan.amount.toLocaleString()}
              </Text>
              <Text style={{ color: '#6B7280' }}>
                Purpose: {loan.purpose}
              </Text>
              {loan.guarantors.map((guarantor) => (
                <Text key={guarantor._id} style={{ color: '#6B7280' }}>
                  Credits Required: {guarantor.legacyCreditsUsed}
                </Text>
              ))}
              <View style={{ flexDirection: 'row', marginTop: 8 }}>
                <TouchableOpacity
                  style={{ 
                    backgroundColor: '#10B981', 
                    padding: 8, 
                    borderRadius: 6, 
                    marginRight: 8 
                  }}
                  onPress={() => handleGuarantorResponse(loan._id, 'accepted')}
                >
                  <Text style={{ color: 'white', fontWeight: 'bold' }}>Accept</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{ 
                    backgroundColor: '#EF4444', 
                    padding: 8, 
                    borderRadius: 6 
                  }}
                  onPress={() => handleGuarantorResponse(loan._id, 'rejected')}
                >
                  <Text style={{ color: 'white', fontWeight: 'bold' }}>Reject</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* My Loans */}
      <View style={{ backgroundColor: 'white', padding: 16, borderRadius: 12, marginBottom: 16 }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 12 }}>
          My Loans ({dashboardData.loans.length})
        </Text>
        {dashboardData.loans.length === 0 ? (
          <Text style={{ color: '#6B7280', textAlign: 'center', padding: 20 }}>
            No loans found
          </Text>
        ) : (
          dashboardData.loans.slice(0, 3).map((loan) => (
            <View key={loan._id} style={{ 
              borderBottomWidth: 1, 
              borderBottomColor: '#E5E7EB', 
              paddingVertical: 12 
            }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontWeight: 'bold' }}>
                  KES {loan.amount.toLocaleString()}
                </Text>
                <View style={{ 
                  backgroundColor: getStatusColor(loan.status), 
                  paddingHorizontal: 8, 
                  paddingVertical: 2, 
                  borderRadius: 12 
                }}>
                  <Text style={{ color: 'white', fontSize: 12, fontWeight: 'bold' }}>
                    {loan.status.toUpperCase()}
                  </Text>
                </View>
              </View>
              <Text style={{ color: '#6B7280', marginTop: 2 }}>
                Purpose: {loan.purpose}
              </Text>
              <Text style={{ color: '#6B7280' }}>
                Applied: {new Date(loan.applicationDate).toLocaleDateString()}
              </Text>
              {loan.repayments && loan.repayments.length > 0 && (
                <Text style={{ color: '#6B7280' }}>
                  Total Repaid: KES {loan.repayments.reduce((sum, rep) => sum + rep.amount, 0).toLocaleString()}
                </Text>
              )}
            </View>
          ))
        )}
        {dashboardData.loans.length > 3 && (
          <TouchableOpacity style={{ marginTop: 12 }}>
            <Text style={{ color: '#3B82F6', textAlign: 'center', fontWeight: 'bold' }}>
              View All Loans
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Guarantee Summary */}
      {dashboardData.guaranteeSummary && (
        <View style={{ backgroundColor: 'white', padding: 16, borderRadius: 12, marginBottom: 16 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 12 }}>
            My Guarantee Summary
          </Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
            <Text style={{ color: '#6B7280' }}>Total Credits:</Text>
            <Text style={{ fontWeight: 'bold' }}>
              {dashboardData.guaranteeSummary.totalCredits}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
            <Text style={{ color: '#6B7280' }}>Used Credits:</Text>
            <Text style={{ fontWeight: 'bold', color: '#EF4444' }}>
              {dashboardData.guaranteeSummary.usedCredits}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
            <Text style={{ color: '#6B7280' }}>Available Credits:</Text>
            <Text style={{ fontWeight: 'bold', color: '#10B981' }}>
              {dashboardData.guaranteeSummary.availableCredits}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ color: '#6B7280' }}>Active Guarantees:</Text>
            <Text style={{ fontWeight: 'bold' }}>
              {dashboardData.guaranteeSummary.activeGuarantees}/3
            </Text>
          </View>
        </View>
      )}

      {/* Recent Legacy Credits */}
      <View style={{ backgroundColor: 'white', padding: 16, borderRadius: 12, marginBottom: 16 }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 12 }}>
          Recent Legacy Credits
        </Text>        {dashboardData.legacyCredits.length === 0 ? (
          <Text style={{ color: '#6B7280', textAlign: 'center', padding: 20 }}>
            No legacy credits found
          </Text>
        ) : dashboardData.legacyCredits.slice(0, 3).map((credit) => (
            <View key={credit._id} style={{ 
              borderBottomWidth: 1, 
              borderBottomColor: '#E5E7EB', 
              paddingVertical: 12 
            }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontWeight: 'bold' }}>
                  KES {credit.amount.toLocaleString()}
                </Text>
                <View style={{ 
                  backgroundColor: getStatusColor(credit.status), 
                  paddingHorizontal: 8, 
                  paddingVertical: 2, 
                  borderRadius: 12 
                }}>
                  <Text style={{ color: 'white', fontSize: 12, fontWeight: 'bold' }}>
                    {credit.status.toUpperCase()}
                  </Text>
                </View>
              </View>
              <Text style={{ color: '#6B7280', marginTop: 2 }}>
                Month: {new Date(credit.month).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long' 
                })}
              </Text>
              {credit.paymentMethod && (
                <Text style={{ color: '#6B7280' }}>
                  Payment: {credit.paymentMethod}
                </Text>
              )}
            </View>
          ))}
      </View>

      {/* My Departments */}
      <View style={{ backgroundColor: 'white', padding: 16, borderRadius: 12, marginBottom: 16 }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 12 }}>
          My Departments
        </Text>        {dashboardData.departments.filter(dept => 
          dept.members.some(member => member._id === userData?._id) ||
          dept.head?._id === userData?._id
        ).length === 0 ? (
          <Text style={{ color: '#6B7280', textAlign: 'center', padding: 20 }}>
            Not a member of any department
          </Text>
        ) : dashboardData.departments
            .filter(dept => 
              dept.members.some(member => member._id === userData?._id) ||
              dept.head?._id === userData?._id
            )
            .map((dept) => (
              <View key={dept._id} style={{ 
                borderBottomWidth: 1, 
                borderBottomColor: '#E5E7EB', 
                paddingVertical: 12 
              }}>
                <Text style={{ fontWeight: 'bold' }}>{dept.name}</Text>
                <Text style={{ color: '#6B7280', marginTop: 2 }}>
                  {dept.description}
                </Text>
                <Text style={{ color: '#6B7280' }}>
                  Head: {dept.head?.name || 'Not assigned'}
                </Text>
                <Text style={{ color: '#6B7280' }}>
                  Members: {dept.members.length}
                </Text>
                {dept.budget && (
                  <Text style={{ color: '#6B7280' }}>
                    Budget: KES {dept.budget.toLocaleString()}
                  </Text>
                )}
              </View>
            ))}
      </View>

      {/* Quick Actions */}
      <View style={{ backgroundColor: 'white', padding: 16, borderRadius: 12 }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 12 }}>
          Quick Actions
        </Text>
        <TouchableOpacity style={{ 
          backgroundColor: '#3B82F6', 
          padding: 12, 
          borderRadius: 8, 
          marginBottom: 8 
        }}>
          <Text style={{ color: 'white', textAlign: 'center', fontWeight: 'bold' }}>
            Apply for New Loan
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={{ 
          backgroundColor: '#10B981', 
          padding: 12, 
          borderRadius: 8, 
          marginBottom: 8 
        }}>
          <Text style={{ color: 'white', textAlign: 'center', fontWeight: 'bold' }}>
            Add Legacy Credit
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={{ 
          backgroundColor: '#8B5CF6', 
          padding: 12, 
          borderRadius: 8 
        }}>
          <Text style={{ color: 'white', textAlign: 'center', fontWeight: 'bold' }}>
            View All Departments
          </Text>
        </TouchableOpacity>
      </View>

      {/* Department Section */}
      <TouchableOpacity
        style={styles.section}
        onPress={() => router.push('/memberpages/departments/Departments')}
      >
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Departments</Text>
          <Text style={styles.sectionCount}>{dashboardData.departments.length}</Text>
        </View>
        <Text style={styles.sectionDescription}>
          View your department memberships and activities
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = {
  section: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  sectionCount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3B82F6',
  },
  sectionDescription: {
    color: '#6B7280',
    fontSize: 14,
  },
};