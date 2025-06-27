import React, { useState, useEffect, useContext, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import AuthContext from '../../../contexts/Authcontext';

const MonthlyLegacyCredits = () => {
  const { userToken } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [legacyCredits, setLegacyCredits] = useState([]);
  const API_URL = 'http://192.168.1.185:4000';
  const months = [
    { label: 'January', value: 1 },
    { label: 'February', value: 2 },
    { label: 'March', value: 3 },
    { label: 'April', value: 4 },
    { label: 'May', value: 5 },
    { label: 'June', value: 6 },
    { label: 'July', value: 7 },
    { label: 'August', value: 8 },
    { label: 'September', value: 9 },
    { label: 'October', value: 10 },
    { label: 'November', value: 11 },
    { label: 'December', value: 12 },
  ];

  const years = Array.from({ length: 10 }, (_, i) => ({
    label: String(new Date().getFullYear() - 5 + i),
    value: new Date().getFullYear() - 5 + i,
  }));

  const fetchLegacyCredits = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(
        `${API_URL}/api/legacyCredits/monthly?month=${selectedMonth}&year=${selectedYear}`,
        {
          headers: {
            'x-auth-token': userToken
          }
        }
      );
      setLegacyCredits(response.data);
    } catch (error) {
      console.error('Error fetching legacy credits:', error);
      setError('Failed to fetch legacy credits. Please try again.');
      Alert.alert('Error', 'Failed to fetch legacy credits. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [selectedMonth, selectedYear, userToken]);

  const handleAddLegacyCredit = async (userId) => {
    try {
      setLoading(true);
      await axios.post(`${API_URL}/api/legacyCredits`, {
        userId,
        month: new Date(selectedYear, selectedMonth - 1, 1),
        amount: 1000,
        paymentMethod: 'cash'
      }, {
        headers: {
          'x-auth-token': userToken
        }
      });
      // Refresh the list after adding
      await fetchLegacyCredits();
      Alert.alert('Success', 'Legacy credit payment added successfully');
    } catch (error) {
      console.error('Error adding legacy credit:', error);
      Alert.alert('Error', 'Failed to add legacy credit. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userToken) {
      fetchLegacyCredits();
    }
  }, [fetchLegacyCredits, userToken]);

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={fetchLegacyCredits}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Monthly Legacy Credits</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={selectedMonth}
            onValueChange={(value) => setSelectedMonth(value)}
            style={styles.picker}
          >
            {months.map((month) => (
              <Picker.Item
                key={month.value}
                label={month.label}
                value={month.value}
              />
            ))}
          </Picker>

          <Picker
            selectedValue={selectedYear}
            onValueChange={(value) => setSelectedYear(value)}
            style={styles.picker}
          >
            {years.map((year) => (
              <Picker.Item
                key={year.value}
                label={year.label}
                value={year.value}
              />
            ))}
          </Picker>
        </View>
        <Text style={styles.selectedPeriod}>
          Showing records for {months.find(m => m.value === selectedMonth)?.label} {selectedYear}
        </Text>
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#2196F3" />
          <Text style={styles.loadingText}>Loading legacy credits...</Text>
        </View>
      ) : (
        <ScrollView style={styles.list}>
          {legacyCredits.length === 0 ? (
            <Text style={styles.noDataText}>No members found</Text>
          ) : (
            legacyCredits.map((item) => (
              <View key={item.user.id} style={styles.userCard}>
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>{item.user.name}</Text>
                  <Text style={styles.userEmail}>{item.user.email}</Text>
                  <Text style={styles.statusLabel}>
                    Status: 
                    <Text style={[
                      styles.statusValue,
                      { color: item.legacyCredit.amount > 0 ? '#4CAF50' : '#F44336' }
                    ]}>
                      {item.legacyCredit.amount > 0 ? ' Paid' : ' Pending'}
                    </Text>
                  </Text>
                </View>
                <View style={styles.statusContainer}>
                  {item.legacyCredit.amount > 0 ? (
                    <View style={[styles.status, styles.statusPaid]}>
                      <Text style={styles.statusText}>Paid</Text>
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={[styles.status, styles.statusUnpaid]}
                      onPress={() => handleAddLegacyCredit(item.user.id)}
                    >
                      <Text style={styles.statusText}>Add Payment</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))
          )}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 16,
    backgroundColor: '#f8f8f8',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e1e1',
  },
  pickerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  picker: {
    flex: 1,
    height: 50,
  },
  list: {
    flex: 1,
  },
  userCard: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e1e1',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
  },
  statusContainer: {
    minWidth: 100,
  },
  status: {
    padding: 8,
    borderRadius: 4,
    alignItems: 'center',
  },
  statusPaid: {
    backgroundColor: '#4CAF50',
  },
  statusUnpaid: {
    backgroundColor: '#F44336',
  },
  statusText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  selectedPeriod: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 10,
    color: '#666',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  noDataText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
    color: '#666',
  },
  errorText: {
    color: '#F44336',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 15,
  },
  retryButton: {
    backgroundColor: '#2196F3',
    padding: 10,
    borderRadius: 5,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  statusLabel: {
    fontSize: 14,
    marginTop: 4,
  },
  statusValue: {
    fontWeight: '500',
  }
});

export default MonthlyLegacyCredits;
