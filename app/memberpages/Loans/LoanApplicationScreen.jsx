import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, StyleSheet, ActivityIndicator } from 'react-native';
import PropTypes from 'prop-types';
import AuthContext from '../../../contexts/Authcontext';
import { API_BASE_URL, ENDPOINTS } from '../../../config/api';

const LoanApplicationScreen = ({ navigation }) => {
  const { userToken } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    purpose: '',
    repaymentPeriod: ''
  });

  const handleSubmit = async () => {
    if (!formData.amount || !formData.purpose || !formData.repaymentPeriod) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    const amount = parseFloat(formData.amount);
    const repaymentPeriod = parseInt(formData.repaymentPeriod);

    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Error', 'Please enter a valid loan amount');
      return;
    }

    if (isNaN(repaymentPeriod) || repaymentPeriod <= 0) {
      Alert.alert('Error', 'Please enter a valid repayment period');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}${ENDPOINTS.LOANS}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`
        },
        body: JSON.stringify({
          amount,
          purpose: formData.purpose,
          repaymentPeriod
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        Alert.alert(
          'Success', 
          'Loan application created! Now add guarantors.', 
          [
            { 
              text: 'OK', 
              onPress: () => navigation.navigate('AddGuarantors', { 
                loanId: data._id,
                amount: amount,
                purpose: formData.purpose
              }) 
            }
          ]
        );
      } else {
        Alert.alert('Error', data.msg || 'Failed to create loan application');
      }
    } catch (error) {
      Alert.alert('Error', 'Network error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>
        Apply for Loan
      </Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Loan Amount (KES)</Text>
        <TextInput
          style={styles.input}
          value={formData.amount}
          onChangeText={(text) => setFormData({...formData, amount: text})}
          placeholder="Enter loan amount"
          keyboardType="numeric"
          editable={!loading}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Purpose</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={formData.purpose}
          onChangeText={(text) => setFormData({...formData, purpose: text})}
          placeholder="Describe the purpose of the loan"
          multiline
          textAlignVertical="top"
          editable={!loading}
        />
      </View>

      <View style={[styles.inputContainer, styles.lastInput]}>
        <Text style={styles.label}>Repayment Period (Months)</Text>
        <TextInput
          style={styles.input}
          value={formData.repaymentPeriod}
          onChangeText={(text) => setFormData({...formData, repaymentPeriod: text})}
          placeholder="Enter repayment period in months"
          keyboardType="numeric"
          editable={!loading}
        />
      </View>

      <TouchableOpacity
        style={[styles.submitButton, loading && styles.submitButtonDisabled]}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.submitButtonText}>
            Create Loan Application
          </Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

LoanApplicationScreen.propTypes = {
  navigation: PropTypes.object.isRequired,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 20,
  },
  lastInput: {
    marginBottom: 30,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 15,
    borderRadius: 8,
    backgroundColor: 'white',
    fontSize: 16,
  },
  textArea: {
    height: 100,
  },
  submitButton: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#cccccc',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default LoanApplicationScreen;