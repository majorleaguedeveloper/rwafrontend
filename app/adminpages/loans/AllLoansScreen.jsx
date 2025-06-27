import React, { useState, useEffect, useContext } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import AuthContext from '../../../contexts/Authcontext';
import axios from 'axios';

const AllLoansScreen = () => {
  const router = useRouter();
  const { userToken } = useContext(AuthContext);
  const [loans, setLoans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const API_BASE_URL = 'http://192.168.1.185:4000'; // Replace with your actual API URL

  useEffect(() => {
    fetchLoans();
  }, []);

  const fetchLoans = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/loans`, {
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': userToken,
        },
      });
      setLoans(response.data);
    } catch (error) {
      console.error('Error fetching loans:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      draft: '#FFA500',
      pending: '#3498DB',
      approved: '#2ECC71',
      rejected: '#E74C3C',
      disbursed: '#9B59B6',
      paid: '#27AE60'
    };

    return (
      <View style={{ backgroundColor: statusColors[status], padding: 5, borderRadius: 5 }}>
        <Text style={{ color: '#FFFFFF' }}>{status.toUpperCase()}</Text>
      </View>
    );
  };

  const renderLoanItem = ({ item }) => (
    <TouchableOpacity 
      onPress={() => router.push(`/adminpages/loans/${item._id}`)}
    >
      <View style={{ padding: 15, borderBottomWidth: 1, borderBottomColor: '#EEEEEE' }}>
        <Text>Applicant: {item.user?.name}</Text>
        <Text>Amount: ${item.amount}</Text>
        <Text>Purpose: {item.purpose}</Text>
        <Text>Repayment Period: {item.repaymentPeriod} months</Text>
        {getStatusBadge(item.status)}
        
        <Text>Guarantors: {item.guarantors?.length || 0}</Text>
        <Text>Application Date: {new Date(item.applicationDate).toLocaleDateString()}</Text>
      </View>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }
  return (
    <View style={{ flex: 1 }}>
      <TouchableOpacity 
        style={{
          backgroundColor: '#007AFF',
          padding: 15,
          margin: 10,
          borderRadius: 8,
          alignItems: 'center'
        }}
        onPress={() => router.push('/adminpages/loans/SelectUserForLoan')}
      >
        <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' }}>
          Create New Loan
        </Text>
      </TouchableOpacity>
      
      <FlatList
        data={loans}
        renderItem={renderLoanItem}
        keyExtractor={item => item._id}
        contentContainerStyle={{ padding: 10 }}
      />
    </View>
  );
};

export default AllLoansScreen;
