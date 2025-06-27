import React, { useState, useEffect, useContext } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl, Alert, ActivityIndicator } from 'react-native';
import PropTypes from 'prop-types';
import AuthContext from '../../../contexts/Authcontext';
import { API_BASE_URL, ENDPOINTS } from '../../../config/api';
import { router } from 'expo-router';

const MyLoansScreen = ({ navigation }) => {
  const { userToken, userData } = useContext(AuthContext);
  const [loans, setLoans] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLoans();
  }, []);

  const fetchLoans = async () => {
    try {
      const response = await fetch(`http://192.168.1.185:4000/api/loans/user/${userData.id}`, {
        headers: {
          'x-auth-token': userToken
        }
      });
      const data = await response.json();
      
      if (response.ok) {
        setLoans(data);
      } else {
        Alert.alert('Error', data.msg || 'Failed to fetch loans');
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'An error occurred while fetching loans');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchLoans();
    setRefreshing(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'draft': return '#ffc107';
      case 'pending': return '#17a2b8';
      case 'approved': return '#28a745';
      case 'rejected': return '#dc3545';
      case 'disbursed': return '#007bff';
      case 'paid': return '#28a745';
      default: return '#6c757d';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'draft': return 'Draft';
      case 'pending': return 'Pending Approval';
      case 'approved': return 'Approved';
      case 'rejected': return 'Rejected';
      case 'disbursed': return 'Disbursed';
      case 'paid': return 'Paid';
      default: return status;
    }
  };

  const renderLoan = ({ item }) => (
    <TouchableOpacity
      style={{
        backgroundColor: 'white',
        padding: 20,
        marginVertical: 8,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#ddd',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3
      }}
      onPress={() => router.push({
        pathname: '/memberpages/Loans/LoanDetailsScreen',
        params: { loanId: item._id },
      })}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold' }}>
          KES {item.amount?.toLocaleString()}
        </Text>
        <Text style={{
          color: getStatusColor(item.status),
          fontWeight: 'bold',
          textTransform: 'uppercase',
          fontSize: 12,
          backgroundColor: getStatusColor(item.status) + '20',
          paddingHorizontal: 8,
          paddingVertical: 4,
          borderRadius: 12
        }}>
          {getStatusText(item.status)}
        </Text>
      </View>
      
      <Text style={{ color: '#666', marginBottom: 8 }}>
        <Text style={{ fontWeight: '600' }}>Purpose:</Text> {item.purpose}
      </Text>
      
      <Text style={{ color: '#666', marginBottom: 8 }}>
        <Text style={{ fontWeight: '600' }}>Repayment Period:</Text> {item.repaymentPeriod} months
      </Text>
      
      <Text style={{ color: '#666', marginBottom: 8 }}>
        <Text style={{ fontWeight: '600' }}>Applied:</Text> {new Date(item.createdAt).toLocaleDateString()}
      </Text>
      
      <Text style={{ color: '#666' }}>
        <Text style={{ fontWeight: '600' }}>Guarantors:</Text> {item.guarantors?.filter(g => g.status === 'accepted').length || 0}/3
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
      <View style={{ 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        padding: 20 
      }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold' }}>My Loans</Text>
        <TouchableOpacity
          style={{
            backgroundColor: '#007bff',
            paddingHorizontal: 15,
            paddingVertical: 8,
            borderRadius: 5
          }}
          onPress={() => navigation.navigate('LoanApplication')}
        >
          <Text style={{ color: 'white', fontWeight: '600' }}>New Loan</Text>
        </TouchableOpacity>
      </View>

      {loans.length === 0 ? (
        <View style={{ 
          flex: 1, 
          justifyContent: 'center', 
          alignItems: 'center',
          padding: 20
        }}>
          <Text style={{ 
            fontSize: 18, 
            color: '#666', 
            textAlign: 'center',
            marginBottom: 20
          }}>
            You have no loans yet. Start by applying for a new loan.
          </Text>
          <TouchableOpacity
            style={{
              backgroundColor: '#007bff',
              paddingHorizontal: 20,
              paddingVertical: 12,
              borderRadius: 8
            }}
            onPress={() => navigation.navigate('LoanApplication')}
          >
            <Text style={{ color: 'white', fontWeight: '600', fontSize: 16 }}>
              Apply for Loan
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={loans}
          renderItem={renderLoan}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{ padding: 15 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
    </View>
  );
};

MyLoansScreen.propTypes = {
  navigation: PropTypes.object.isRequired,
};

export default MyLoansScreen;
