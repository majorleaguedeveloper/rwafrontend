import React, { useState, useEffect, useContext } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, Alert, Modal, ActivityIndicator } from 'react-native';
import PropTypes from 'prop-types';
import AuthContext from '../../../contexts/Authcontext';
import { API_BASE_URL, ENDPOINTS } from '../../../config/api';

const AddGuarantorsScreen = ({ navigation, route }) => {
  const { userToken } = useContext(AuthContext);
  const { loanId } = route.params;
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [creditsToUse, setCreditsToUse] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [loan, setLoan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchUsers();
    fetchLoanDetails();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}${ENDPOINTS.USERS}`, {
        headers: {
          'Authorization': `Bearer ${userToken}`
        }
      });
      const data = await response.json();
      
      if (response.ok) {
        setUsers(data.filter(user => user._id !== userToken)); // Exclude current user
      } else {
        Alert.alert('Error', data.msg || 'Failed to fetch users');
      }
    } catch (error) {
      Alert.alert('Error', 'Network error occurred. Please try again.');
    }
  };

  const fetchLoanDetails = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}${ENDPOINTS.USER_LOANS}`, {
        headers: {
          'Authorization': `Bearer ${userToken}`
        }
      });
      const data = await response.json();
      
      if (response.ok) {
        const currentLoan = data.find(l => l._id === loanId);
        if (currentLoan) {
          setLoan(currentLoan);
        } else {
          Alert.alert('Error', 'Loan not found');
          navigation.goBack();
        }
      } else {
        Alert.alert('Error', data.msg || 'Failed to fetch loan details');
      }
    } catch (error) {
      Alert.alert('Error', 'Network error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const addGuarantor = async () => {
    if (!selectedUser || !creditsToUse) {
      Alert.alert('Error', 'Please select a guarantor and specify credits to use');
      return;
    }

    const credits = parseInt(creditsToUse);
    if (isNaN(credits) || credits <= 0) {
      Alert.alert('Error', 'Please enter a valid number of credits');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}${ENDPOINTS.LOANS}/${loanId}/guarantor`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`
        },
        body: JSON.stringify({
          guarantorId: selectedUser._id,
          legacyCreditsUsed: credits
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        Alert.alert('Success', 'Guarantor request sent successfully!');
        setModalVisible(false);
        setSelectedUser(null);
        setCreditsToUse('');
        fetchLoanDetails(); // Refresh loan details
      } else {
        Alert.alert('Error', data.msg || 'Failed to send guarantor request');
      }
    } catch (error) {
      Alert.alert('Error', 'Network error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderUser = ({ item }) => (
    <TouchableOpacity
      style={{
        padding: 15,
        backgroundColor: 'white',
        marginVertical: 5,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ddd'
      }}
      onPress={() => {
        setSelectedUser(item);
        setModalVisible(true);
      }}
    >
      <Text style={{ fontSize: 16, fontWeight: '600' }}>{item.name}</Text>
      <Text style={{ color: '#666', marginTop: 5 }}>{item.email}</Text>
    </TouchableOpacity>
  );

  const renderGuarantor = ({ item }) => (
    <View style={{
      padding: 15,
      backgroundColor: '#f8f9fa',
      marginVertical: 5,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: '#ddd'
    }}>
      <Text style={{ fontSize: 16, fontWeight: '600' }}>{item.user.name}</Text>
      <Text style={{ color: '#666' }}>Credits Used: {item.legacyCreditsUsed}</Text>
      <Text style={{ 
        color: item.status === 'accepted' ? '#28a745' : 
              item.status === 'rejected' ? '#dc3545' : '#ffc107',
        fontWeight: '600',
        marginTop: 5
      }}>
        Status: {item.status.toUpperCase()}
      </Text>
    </View>
  );

  const canSubmitForApproval = () => {
    if (!loan) return false;
    const acceptedGuarantors = loan.guarantors.filter(g => g.status === 'accepted');
    const totalCredits = acceptedGuarantors.reduce((sum, g) => sum + g.legacyCreditsUsed, 0);
    const requiredCredits = Math.ceil(loan.amount / 1000);
    return acceptedGuarantors.length >= 3 && totalCredits >= requiredCredits;
  };

  const submitForApproval = async () => {
    setSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}${ENDPOINTS.LOANS}/${loanId}/submit`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${userToken}`
        }
      });

      const data = await response.json();
      
      if (response.ok) {
        Alert.alert('Success', 'Loan submitted for approval!', [
          { text: 'OK', onPress: () => navigation.navigate('MyLoans') }
        ]);
      } else {
        Alert.alert('Error', data.msg || 'Failed to submit loan');
      }
    } catch (error) {
      Alert.alert('Error', 'Network error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 20, backgroundColor: '#f5f5f5' }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' }}>
        Add Guarantors
      </Text>

      {loan && (
        <View style={{ 
          backgroundColor: 'white', 
          padding: 15, 
          borderRadius: 8, 
          marginBottom: 20,
          borderWidth: 1,
          borderColor: '#ddd'
        }}>
          <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 10 }}>
            Loan Amount: KES {loan.amount?.toLocaleString()}
          </Text>
          <Text style={{ color: '#666' }}>
            Required Credits: {Math.ceil(loan.amount / 1000)}
          </Text>
          <Text style={{ color: '#666' }}>
            Guarantors Needed: 3 (Current: {loan.guarantors?.filter(g => g.status === 'accepted').length || 0})
          </Text>
        </View>
      )}

      {loan?.guarantors && loan.guarantors.length > 0 && (
        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 10 }}>Current Guarantors:</Text>
          <FlatList
            data={loan.guarantors}
            renderItem={renderGuarantor}
            keyExtractor={(item, index) => index.toString()}
            scrollEnabled={false}
          />
        </View>
      )}

      {canSubmitForApproval() && (
        <TouchableOpacity
          style={{
            backgroundColor: '#28a745',
            padding: 15,
            borderRadius: 8,
            alignItems: 'center',
            marginBottom: 20
          }}
          onPress={submitForApproval}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold' }}>
              Submit for Approval
            </Text>
          )}
        </TouchableOpacity>
      )}

      <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 10 }}>Select Guarantors:</Text>
      
      <FlatList
        data={users}
        renderItem={renderUser}
        keyExtractor={(item) => item._id}
        showsVerticalScrollIndicator={false}
      />

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'rgba(0,0,0,0.5)'
        }}>
          <View style={{
            backgroundColor: 'white',
            padding: 20,
            borderRadius: 10,
            width: '90%'
          }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 15 }}>
              Request Guarantor
            </Text>
            
            {selectedUser && (
              <Text style={{ fontSize: 16, marginBottom: 15 }}>
                Guarantor: {selectedUser.name}
              </Text>
            )}

            <TextInput
              style={{
                borderWidth: 1,
                borderColor: '#ddd',
                borderRadius: 8,
                padding: 12,
                marginBottom: 20,
                fontSize: 16
              }}
              placeholder="Number of credits to use"
              keyboardType="numeric"
              value={creditsToUse}
              onChangeText={setCreditsToUse}
              editable={!submitting}
            />

            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <TouchableOpacity
                style={{
                  backgroundColor: '#dc3545',
                  padding: 12,
                  borderRadius: 8,
                  flex: 1,
                  marginRight: 8
                }}
                onPress={() => setModalVisible(false)}
                disabled={submitting}
              >
                <Text style={{ color: 'white', textAlign: 'center', fontWeight: '600' }}>
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{
                  backgroundColor: '#28a745',
                  padding: 12,
                  borderRadius: 8,
                  flex: 1,
                  marginLeft: 8
                }}
                onPress={addGuarantor}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={{ color: 'white', textAlign: 'center', fontWeight: '600' }}>
                    Send Request
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

AddGuarantorsScreen.propTypes = {
  navigation: PropTypes.object.isRequired,
  route: PropTypes.shape({
    params: PropTypes.shape({
      loanId: PropTypes.string.isRequired
    }).isRequired
  }).isRequired
};

export default AddGuarantorsScreen;
