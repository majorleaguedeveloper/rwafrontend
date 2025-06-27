import { StyleSheet, View, TextInput, ScrollView, TouchableOpacity, Alert } from 'react-native'
import React, { useState, useEffect, useContext } from 'react'
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ThemedText } from '../../../components/ThemedText';
import AuthContext from '../../../contexts/Authcontext';
import debounce from 'lodash/debounce';
import axios from 'axios';

const CreateLoanScreen = () => {
  const { userToken } = useContext(AuthContext);
  const { userId, userName } = useLocalSearchParams();
  const router = useRouter();
  const [loanData, setLoanData] = useState({
    amount: '',
    purpose: '',
    repaymentPeriod: '',
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [potentialGuarantors, setPotentialGuarantors] = useState([]);
  const [selectedGuarantors, setSelectedGuarantors] = useState([]);
  const API_BASE_URL = 'http://192.168.1.185:4000';

  const searchGuarantors = async (query) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/users/search?query=${query}`, {
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': userToken,
        }
    });
      // Filter out the loan applicant and already selected guarantors
      const filteredUsers = response.data.filter(user => 
        user._id !== userId && 
        !selectedGuarantors.find(g => g.user._id === user._id)
      );
      setPotentialGuarantors(filteredUsers);
    } catch (error) {
      console.error('Error searching guarantors:', error);
    }
  };

  const debouncedSearch = debounce((query) => {
    if (query) searchGuarantors(query);
    else setPotentialGuarantors([]);
  }, 500);

  useEffect(() => {
    debouncedSearch(searchQuery);
    return () => debouncedSearch.cancel();
  }, [searchQuery]);

  const addGuarantor = (guarantor) => {
    if (selectedGuarantors.length >= 3) {
      Alert.alert('Error', 'Maximum 3 guarantors allowed');
      return;
    }
    setSelectedGuarantors([...selectedGuarantors, {
      user: guarantor,
      legacyCreditsUsed: ''
    }]);
    setPotentialGuarantors(potentialGuarantors.filter(g => g._id !== guarantor._id));
    setSearchQuery('');
  };

  const removeGuarantor = (guarantorId) => {
    setSelectedGuarantors(selectedGuarantors.filter(g => g.user._id !== guarantorId));
  };

  const updateGuarantorCredits = (guarantorId, credits) => {
    setSelectedGuarantors(selectedGuarantors.map(g => 
      g.user._id === guarantorId ? { ...g, legacyCreditsUsed: credits } : g
    ));
  };
  const handleCreateLoan = async () => {
    try {
      // Validate required fields
      if (!loanData.amount || !loanData.purpose || !loanData.repaymentPeriod) {
        Alert.alert('Error', 'Please fill in all loan details');
        return;
      }

      if (selectedGuarantors.length === 0) {
        Alert.alert('Error', 'Please add at least one guarantor');
        return;
      }

      // First create the loan
      const loanResponse = await axios.post(
        `${API_BASE_URL}/api/loans`,
        {
          ...loanData,
          user: userId
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': userToken,
          }
        }
      );

      const loanId = loanResponse.data._id;

      // Add guarantors one by one
      for (const guarantor of selectedGuarantors) {
        await axios.post(
          `${API_BASE_URL}/api/loans/${loanId}/guarantor`,
          {
            guarantorId: guarantor.user._id,
            legacyCreditsUsed: parseInt(guarantor.legacyCreditsUsed)
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'x-auth-token': userToken,
            }
          }
        );
      }

      Alert.alert(
        'Success',
        'Loan created successfully',
        [{ text: 'OK', onPress: () => router.push('/adminpages/loans') }]
      );
    } catch (error) {
      Alert.alert('Error', error.response?.data?.msg || 'Failed to create loan');
    }
  };
  return (
    <ScrollView style={styles.container}>
      <ThemedText style={styles.header}>Create Loan for {userName}</ThemedText>
      
      <View style={styles.inputGroup}>
        <ThemedText style={styles.label}>Loan Amount</ThemedText>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={loanData.amount}
          onChangeText={(text) => setLoanData({...loanData, amount: text})}
          placeholder="Enter loan amount"
        />
      </View>

      <View style={styles.inputGroup}>        <ThemedText style={styles.label}>Purpose</ThemedText>
        <TextInput
          style={styles.input}
          value={loanData.purpose}
          onChangeText={(text) => setLoanData({...loanData, purpose: text})}
          placeholder="Enter loan purpose"
        />
      </View>

      <View style={styles.inputGroup}>        <ThemedText style={styles.label}>Repayment Period (months)</ThemedText>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={loanData.repaymentPeriod}
          onChangeText={(text) => setLoanData({...loanData, repaymentPeriod: text})}
          placeholder="Enter repayment period"
        />
      </View>

      <View style={styles.guarantorSection}>        <ThemedText style={styles.sectionTitle}>Add Guarantors</ThemedText>
        <TextInput
          style={styles.input}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search guarantors..."
        />

        {potentialGuarantors.map(user => (
          <TouchableOpacity 
            key={user._id}
            style={styles.guarantorItem}
            onPress={() => addGuarantor(user)}
          >            <ThemedText>{user.name}</ThemedText>
            <ThemedText style={styles.email}>{user.email}</ThemedText>
          </TouchableOpacity>
        ))}        <ThemedText style={styles.sectionTitle}>Selected Guarantors</ThemedText>
        {selectedGuarantors.map(guarantor => (
          <View key={guarantor.user._id} style={styles.selectedGuarantor}>
            <View>              <ThemedText>{guarantor.user.name}</ThemedText>
              <ThemedText style={styles.email}>{guarantor.user.email}</ThemedText>
            </View>
            <View style={styles.creditsInput}>
              <TextInput
                style={styles.smallInput}
                keyboardType="numeric"
                value={guarantor.legacyCreditsUsed}
                onChangeText={(text) => updateGuarantorCredits(guarantor.user._id, text)}
                placeholder="Credits"
              />
              <TouchableOpacity 
                style={styles.removeButton}
                onPress={() => removeGuarantor(guarantor.user._id)}
              >
                <ThemedText style={styles.removeButtonText}>Remove</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>

      <TouchableOpacity 
        style={styles.createButton}
        onPress={handleCreateLoan}
      >
        <ThemedText style={styles.createButtonText}>Create Loan</ThemedText>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default CreateLoanScreen;  const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 8,
    fontSize: 16,
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    color: '#000',
  },
  guarantorSection: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  guarantorItem: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 8,
  },
  selectedGuarantor: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  email: {
    fontSize: 12,
    color: '#666',
  },
  creditsInput: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  smallInput: {
    width: 80,
    height: 40,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 8,
    marginRight: 8,
    color: '#000',
  },
  removeButton: {
    backgroundColor: '#ff4444',
    padding: 8,
    borderRadius: 8,
  },
  removeButtonText: {
    color: 'white',
  },
  createButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  createButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});