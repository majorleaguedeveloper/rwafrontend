import React, { useState, useEffect, useContext } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, RefreshControl, ActivityIndicator } from 'react-native';
import PropTypes from 'prop-types';
import AuthContext from '../../../contexts/Authcontext';
import { API_BASE_URL, ENDPOINTS } from '../../../config/api';

const GuarantorRequestsScreen = () => {
  const { userToken } = useContext(AuthContext);
  const [requests, setRequests] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}${ENDPOINTS.GUARANTOR_REQUESTS}`, {
        headers: {
          'Authorization': `Bearer ${userToken}`
        }
      });
      const data = await response.json();
      
      if (response.ok) {
        setRequests(data);
      } else {
        Alert.alert('Error', data.msg || 'Failed to fetch guarantor requests');
      }
    } catch (error) {
      Alert.alert('Error', 'Network error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchRequests();
    setRefreshing(false);
  };

  const respondToRequest = async (loanId, status) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}${ENDPOINTS.LOANS}/${loanId}/guarantor-response`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`
        },
        body: JSON.stringify({ status })
      });

      const data = await response.json();
      
      if (response.ok) {
        Alert.alert('Success', `Request ${status} successfully!`);
        fetchRequests(); // Refresh the list
      } else {
        Alert.alert('Error', data.msg || `Failed to ${status} request`);
      }
    } catch (error) {
      Alert.alert('Error', 'Network error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderRequest = ({ item }) => {
    const guarantor = item.guarantors.find(g => g.user._id === userToken); // Find the current user's guarantor entry
    
    return (
      <View style={{
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
      }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
          Loan Guarantee Request
        </Text>
        
        <Text style={{ fontSize: 16, marginBottom: 8 }}>
          <Text style={{ fontWeight: '600' }}>From:</Text> {item.user.name}
        </Text>
        
        <Text style={{ fontSize: 16, marginBottom: 8 }}>
          <Text style={{ fontWeight: '600' }}>Email:</Text> {item.user.email}
        </Text>
        
        <Text style={{ fontSize: 16, marginBottom: 8 }}>
          <Text style={{ fontWeight: '600' }}>Loan Amount:</Text> KES {item.amount?.toLocaleString()}
        </Text>
        
        <Text style={{ fontSize: 16, marginBottom: 8 }}>
          <Text style={{ fontWeight: '600' }}>Purpose:</Text> {item.purpose}
        </Text>
        
        <Text style={{ fontSize: 16, marginBottom: 15 }}>
          <Text style={{ fontWeight: '600' }}>Credits Requested:</Text> {guarantor.legacyCreditsUsed}
        </Text>
        
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <TouchableOpacity
            style={{
              backgroundColor: '#dc3545',
              padding: 12,
              borderRadius: 8,
              flex: 0.45
            }}
            onPress={() => {
              Alert.alert(
                'Reject Request',
                'Are you sure you want to reject this guarantee request?',
                [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Reject', onPress: () => respondToRequest(item._id, 'rejected') }
                ]
              );
            }}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={{ color: 'white', textAlign: 'center', fontWeight: 'bold' }}>
                Reject
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              backgroundColor: '#28a745',
              padding: 12,
              borderRadius: 8,
              flex: 0.45
            }}
            onPress={() => {
              Alert.alert(
                'Accept Request',
                `Are you sure you want to guarantee this loan using ${guarantor.legacyCreditsUsed} legacy credits?`,
                [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Accept', onPress: () => respondToRequest(item._id, 'accepted') }
                ]
              );
            }}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={{ color: 'white', textAlign: 'center', fontWeight: 'bold' }}>
                Accept
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
      <Text style={{ 
        fontSize: 24, 
        fontWeight: 'bold', 
        textAlign: 'center', 
        margin: 20 
      }}>
        Guarantor Requests
      </Text>

      {requests.length === 0 ? (
        <View style={{ 
          flex: 1, 
          justifyContent: 'center', 
          alignItems: 'center',
          padding: 20
        }}>
          <Text style={{ 
            fontSize: 18, 
            color: '#666', 
            textAlign: 'center' 
          }}>
            No guarantor requests at the moment
          </Text>
        </View>
      ) : (
        <FlatList
          data={requests}
          renderItem={renderRequest}
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

export default GuarantorRequestsScreen;