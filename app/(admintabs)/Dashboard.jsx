import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AuthContext from '../../contexts/Authcontext';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 32;

const AdminDashboard = () => {
  const { userToken, userData } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    users: { total: 0, admins: 0, members: 0 },
    loans: { total: 0, pending: 0, approved: 0, disbursed: 0, paid: 0, rejected: 0 },
    legacyCredits: { total: 0, verified: 0, pending: 0 },
    contributions: { total: 0, verified: 0, pending: 0 },
    departments: { total: 0 },
    investments: { total: 0, active: 0, completed: 0 },
    announcements: { total: 0 },
  });

  const API_BASE_URL = 'http://192.168.1.185:4000';

  useEffect(() => {
    loadDashboardData();
  }, []);

  const getAuthToken = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      return token;
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  };

  const apiCall = async (endpoint) => {
    try {
      const token = userToken;
      if (!token) {
        router.push('/login');
        return null;
      }

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
      });

      if (response.status === 401) {
        router.push('/login');
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error(`Error fetching ${endpoint}:`, error);
      return null;
    }
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      const [
        usersData,
        loansData,
        legacyCreditsData,
        contributionsData,
        departmentsData,
        investmentsData,
        announcementsData,
      ] = await Promise.all([
        apiCall('/api/users'),
        apiCall('/api/loans'),
        apiCall('/api/legacyCredits/monthly?month=1&year=2024'),
        apiCall('/api/contributions/monthly?month=1&year=2024'),
        apiCall('/api/departments'),
        apiCall('/api/investments'),
        apiCall('/api/announcements'),
      ]);

      const usersStats = {
        total: usersData?.length || 0,
        admins: usersData?.filter(user => user.role === 'admin').length || 0,
        members: usersData?.filter(user => user.role === 'member').length || 0,
      };

      const loansStats = {
        total: loansData?.length || 0,
        pending: loansData?.filter(loan => loan.status === 'pending').length || 0,
        approved: loansData?.filter(loan => loan.status === 'approved').length || 0,
        disbursed: loansData?.filter(loan => loan.status === 'disbursed').length || 0,
        cleared: loansData?.filter(loan => loan.status === 'cleared').length || 0,
        rejected: loansData?.filter(loan => loan.status === 'rejected').length || 0,
      };

      const legacyCreditsStats = {
        total: legacyCreditsData?.length || 0,
        verified: legacyCreditsData?.filter(item => item.legacyCredit?.status === 'verified').length || 0,
        pending: legacyCreditsData?.filter(item => item.legacyCredit?.status === 'pending').length || 0,
      };

      const contributionsStats = {
        total: contributionsData?.length || 0,
        verified: contributionsData?.filter(item => item.contribution?.status === 'verified').length || 0,
        pending: contributionsData?.filter(item => item.contribution?.status === 'pending').length || 0,
      };

      const departmentsStats = {
        total: departmentsData?.length || 0,
      };

      const investmentsStats = {
        total: investmentsData?.length || 0,
        active: investmentsData?.filter(inv => inv.status === 'active').length || 0,
        completed: investmentsData?.filter(inv => inv.status === 'completed').length || 0,
      };

      const announcementsStats = {
        total: announcementsData?.data.length || 0,
      };

      setDashboardData({
        users: usersStats,
        loans: loansStats,
        legacyCredits: legacyCreditsStats,
        contributions: contributionsStats,
        departments: departmentsStats,
        investments: investmentsStats,
        announcements: announcementsStats,
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      Alert.alert('Error', 'Failed to load dashboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  const navigateTo = (route) => {
    router.push(route);
  };

  const StatCard = ({ title, value, subtitle, onPress, color = '#3B82F6' }) => (
    <TouchableOpacity onPress={onPress} style={styles.statCard}>
      <LinearGradient
        colors={[color + '20', color + '10']}
        style={styles.statCardGradient}
      >
        <Text style={styles.statCardTitle}>{title}</Text>
        <Text style={styles.statCardValue}>{value}</Text>
        {subtitle && <Text style={styles.statCardSubtitle}>{subtitle}</Text>}
      </LinearGradient>
    </TouchableOpacity>
  );

  const QuickActionButton = ({ title, onPress, icon, color = '#3B82F6' }) => (
    <TouchableOpacity onPress={onPress} style={styles.quickActionButton}>
      <LinearGradient
        colors={[color, color + 'CC']}
        style={styles.quickActionGradient}
      >
        <Ionicons name={icon} size={24} color="#FFFFFF" />
        <Text style={styles.quickActionText}>{title}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Loading Dashboard...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View>
        <Text style={styles.headerTitle}>Admin Dashboard</Text>
      </View>
      <View style={styles.cardsContainer}>
        {/* Announcements Card */}
        <TouchableOpacity
          style={styles.card}
          onPress={() => router.push('/adminpages/announcements/Announcements')}
        >
          <LinearGradient
            colors={['#4c669f', '#3b5998', '#192f6a']}
            style={styles.gradientCard}
          >
            <View style={styles.cardHeader}>
              <Ionicons name="megaphone" size={24} color="white" />
              <Text style={styles.cardTitle}>Announcements</Text>
            </View>
            <Text style={styles.cardValue}>{dashboardData.announcements.total}</Text>
            <Text style={styles.cardSubtitle}>Total Announcements</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Departments Card */}
        <TouchableOpacity
          style={[styles.card, { backgroundColor: '#4CAF50' }]}
          onPress={() => router.push('/adminpages/departments/Departments')}
        >
          <LinearGradient
            colors={['#4CAF50', '#45a049']}
            style={styles.statCardGradient}
          >
            <View style={styles.cardHeader}>
              <Ionicons name="business" size={24} color="#fff" />
              <Text style={styles.cardTitle}>Departments</Text>
            </View>
            <View style={styles.cardBody}>
              <Text style={styles.cardValue}>{dashboardData.departments.total}</Text>
              <Text style={styles.cardLabel}>Total Departments</Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* Existing cards... */}

        {/* Users Overview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Users Overview</Text>
          <View style={styles.statsGrid}>
            <StatCard
              title="Total Users"
              value={dashboardData.users.total}
              subtitle={`${dashboardData.users.admins} Admins, ${dashboardData.users.members} Members`}
              onPress={() => navigateTo('/admin/users')}
              color="#3B82F6"
            />
          </View>
        </View>

        {/* Loans Overview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Loans Management</Text>
          <View style={styles.statsGrid}>
            <StatCard
              title="Total Loans"
              value={dashboardData.loans.total}
              onPress={() => router.push('/adminpages/loans/AllLoansScreen')}
              color="#3B82F6"
            />
            <StatCard
              title="Pending"
              value={dashboardData.loans.pending}
              subtitle="Needs Review"
              onPress={() => router.push('/admin/loans?status=pending')}
              color="#F59E0B"
            />
            <StatCard
              title="Approved"
              value={dashboardData.loans.approved}
              onPress={() => router.push('/admin/loans?status=approved')}
              color="#10B981"
            />
            <StatCard
              title="Disbursed"
              value={dashboardData.loans.disbursed}
              onPress={() => router.push('/admin/loans?status=disbursed')}
              color="#6366F1"
            />
            <StatCard
              title="Rejected"
              value={dashboardData.loans.rejected}
              onPress={() => router.push('/admin/loans?status=rejected')}
              color="#EF4444"
            />
            <StatCard
              title="Paid Off"
              value={dashboardData.loans.cleared}
              onPress={() => router.push('/admin/loans?status=cleared')}
              color="#8B5CF6"
            />
          </View>
        </View>

        {/* Financial Overview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Financial Overview</Text>
          <View style={styles.statsGrid}>
            <StatCard
              title="Legacy Credits"
              value={dashboardData.legacyCredits.total}
              subtitle={`${dashboardData.legacyCredits.verified} Verified, ${dashboardData.legacyCredits.pending} Pending`}
              onPress={() => router.push('/adminpages/legacyCredits/LegacyCredits')}
              color="#3B82F6"
            />
            <StatCard
              title="Contributions"
              value={dashboardData.contributions.total}
              subtitle={`${dashboardData.contributions.verified} Verified, ${dashboardData.contributions.pending} Pending`}
              onPress={() => router.push('/admin/contributions')}
              color="#10B981"
            />
            <StatCard
              title="Investments"
              value={dashboardData.investments.total}
              subtitle={`${dashboardData.investments.active} Active, ${dashboardData.investments.completed} Completed`}
              onPress={() => router.push('/adminpages/Investments')}
              color="#8B5CF6"
            />
          </View>
        </View>

        {/* Departments Overview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Organization</Text>
          <View style={styles.statsGrid}>
            <StatCard
              title="Departments"
              value={dashboardData.departments.total}
              onPress={() => router.push('/adminpages/departments/Departments')}
              color="#3B82F6"
            />
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            <QuickActionButton
              title="Add New User"
              icon="person-add"
              onPress={() => router.push('/admin/users/add')}
              color="#3B82F6"
            />
            <QuickActionButton
              title="Create Department"
              icon="business"
              onPress={() => router.push('/admin/departments/add')}
              color="#10B981"
            />
            <QuickActionButton
              title="New Investment"
              icon="trending-up"
              onPress={() => router.push('/admin/investments/add')}
              color="#8B5CF6"
            />
            <QuickActionButton
              title="View Reports"
              icon="bar-chart"
              onPress={() => router.push('/admin/reports')}
              color="#F59E0B"
            />
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <View style={styles.activityList}>
            <View style={styles.activityItem}>
              <View style={[styles.activityIcon, { backgroundColor: '#F59E0B20' }]}>
                <Ionicons name="notifications" size={24} color="#F59E0B" />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>Loan Applications Pending</Text>
                <Text style={styles.activitySubtitle}>{dashboardData.loans.pending} loans require review</Text>
              </View>
            </View>
            <View style={styles.activityItem}>
              <View style={[styles.activityIcon, { backgroundColor: '#3B82F620' }]}>
                <Ionicons name="time" size={24} color="#3B82F6" />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>Legacy Credits Verification</Text>
                <Text style={styles.activitySubtitle}>{dashboardData.legacyCredits.pending} credits pending verification</Text>
              </View>
            </View>
            <View style={styles.activityItem}>
              <View style={[styles.activityIcon, { backgroundColor: '#10B98120' }]}>
                <Ionicons name="card" size={24} color="#10B981" />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>Contributions Review</Text>
                <Text style={styles.activitySubtitle}>{dashboardData.contributions.pending} contributions need verification</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Navigation Menu */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Management</Text>
          <View style={styles.navigationMenu}>
            <TouchableOpacity 
              style={styles.navItem}
              onPress={() => router.push('/admin/users')}
            >
              <View style={[styles.navIcon, { backgroundColor: '#3B82F620' }]}>
                <Ionicons name="people" size={24} color="#3B82F6" />
              </View>
              <View style={styles.navContent}>
                <Text style={styles.navTitle}>User Management</Text>
                <Text style={styles.navSubtitle}>View and manage all users</Text>
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.navItem}
              onPress={() => router.push('/admin/loans')}
            >
              <View style={[styles.navIcon, { backgroundColor: '#10B98120' }]}>
                <Ionicons name="wallet" size={24} color="#10B981" />
              </View>
              <View style={styles.navContent}>
                <Text style={styles.navTitle}>Loan Management</Text>
                <Text style={styles.navSubtitle}>Process loan applications</Text>
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.navItem}
              onPress={() => router.push('/admin/departments')}
            >
              <View style={[styles.navIcon, { backgroundColor: '#8B5CF620' }]}>
                <Ionicons name="business" size={24} color="#8B5CF6" />
              </View>
              <View style={styles.navContent}>
                <Text style={styles.navTitle}>Department Management</Text>
                <Text style={styles.navSubtitle}>Manage departments and activities</Text>
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.navItem}
              onPress={() => router.push('/admin/investments')}
            >
              <View style={[styles.navIcon, { backgroundColor: '#F59E0B20' }]}>
                <Ionicons name="trending-up" size={24} color="#F59E0B" />
              </View>
              <View style={styles.navContent}>
                <Text style={styles.navTitle}>Investment Management</Text>
                <Text style={styles.navSubtitle}>Track and manage investments</Text>
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.navItem}
              onPress={() => router.push('/adminpages/legacyCredits/MonthlyLegacyCredits')}
            >
              <View style={[styles.navIcon, { backgroundColor: '#3B82F620' }]}>
                <Ionicons name="trophy" size={24} color="#3B82F6" />
              </View>
              <View style={styles.navContent}>
                <Text style={styles.navTitle}>Legacy Credits</Text>
                <Text style={styles.navSubtitle}>Verify and manage credits</Text>
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.navItem}
              onPress={() => router.push('/admin/contributions')}
            >
              <View style={[styles.navIcon, { backgroundColor: '#10B98120' }]}>
                <Ionicons name="cash" size={24} color="#10B981" />
              </View>
              <View style={styles.navContent}>
                <Text style={styles.navTitle}>Contributions</Text>
                <Text style={styles.navSubtitle}>Monitor member contributions</Text>
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.navItem}
              onPress={() => router.push('/admin/reports')}
            >
              <View style={[styles.navIcon, { backgroundColor: '#8B5CF620' }]}>
                <Ionicons name="bar-chart" size={24} color="#8B5CF6" />
              </View>
              <View style={styles.navContent}>
                <Text style={styles.navTitle}>Reports & Analytics</Text>
                <Text style={styles.navSubtitle}>View detailed reports</Text>
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.navItem}
              onPress={() => router.push('/admin/settings')}
            >
              <View style={[styles.navIcon, { backgroundColor: '#F59E0B20' }]}>
                <Ionicons name="settings" size={24} color="#F59E0B" />
              </View>
              <View style={styles.navContent}>
                <Text style={styles.navTitle}>System Settings</Text>
                <Text style={styles.navSubtitle}>Configure system preferences</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={async () => {
            Alert.alert(
              'Logout',
              'Are you sure you want to logout?',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Logout',
                  style: 'destructive',
                  onPress: async () => {
                    await AsyncStorage.removeItem('authToken');
                    router.replace('/login');
                  },
                },
              ]
            );
          }}
        >
          <Ionicons name="log-out" size={24} color="#FFFFFF" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#64748B',
    fontFamily: 'Outfit_400Regular',
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 24,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTitle: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 32,
    color: '#FFFFFF',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 20,
    color: '#1E293B',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  statCard: {
    width: CARD_WIDTH / 2 - 16,
    margin: 8,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statCardGradient: {
    padding: 16,
  },
  statCardTitle: {
    fontFamily: 'Outfit_500Medium',
    fontSize: 14,
    color: '#64748B',
    marginBottom: 8,
  },
  statCardValue: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 24,
    color: '#1E293B',
    marginBottom: 4,
  },
  statCardSubtitle: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 12,
    color: '#64748B',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  quickActionButton: {
    width: CARD_WIDTH / 2 - 16,
    margin: 8,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  quickActionGradient: {
    padding: 16,
    alignItems: 'center',
  },
  quickActionText: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 14,
    color: '#FFFFFF',
    marginTop: 8,
  },
  activityList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 14,
    color: '#1E293B',
    marginBottom: 4,
  },
  activitySubtitle: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 12,
    color: '#64748B',
  },
  navigationMenu: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  navIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  navContent: {
    flex: 1,
  },
  navTitle: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 14,
    color: '#1E293B',
    marginBottom: 4,
  },
  navSubtitle: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 12,
    color: '#64748B',
  },
  logoutButton: {
    flexDirection: 'row',
    backgroundColor: '#EF4444',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  logoutText: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 16,
    color: '#FFFFFF',
    marginLeft: 8,
  },
  cardsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginHorizontal: -8,
  },
  card: {
    width: CARD_WIDTH / 2 - 16,
    margin: 8,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  gradientCard: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 16,
    color: '#FFFFFF',
    marginLeft: 8,
  },
  cardValue: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 28,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  cardBody: {
    marginTop: 8,
  },
  cardLabel: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
});

export default AdminDashboard;