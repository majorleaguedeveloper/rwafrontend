import { StyleSheet, Text, View, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import React, { useContext, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'expo-router';
import AuthContext from '../../../contexts/Authcontext';
import { Picker } from '@react-native-picker/picker';

const LegacyCredits = () => {
  const router = useRouter();
  const { userToken } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [legacyCredits, setLegacyCredits] = useState([]);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [verifyingId, setVerifyingId] = useState(null);

  const getLegacyCredits = useCallback(async (selectedMonth, selectedYear) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(`http://192.168.1.185:4000/api/contributions?month=${selectedMonth}&year=${selectedYear}`, {
        headers: {
          'x-auth-token': userToken,
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setLegacyCredits(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch legacy credits');
      console.error('Error fetching legacy credits:', err);
    } finally {
      setIsLoading(false);
    }
  }, [userToken]);

  const handleVerify = async (legacyCreditId, currentStatus) => {
    try {
      setVerifyingId(legacyCreditId);
      const newStatus = currentStatus === 'verified' ? 'pending' : 'verified';
      
      const response = await fetch(`http://192.168.1.185:4000/api/legacyCredits/verify/${legacyCreditId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': userToken,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Refresh the data after verification
      await getLegacyCredits(month, year);
      Alert.alert('Success', 'Legacy credit status updated successfully');
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to verify legacy credit');
      console.error('Error verifying legacy credit:', err);
    } finally {
      setVerifyingId(null);
    }
  };

  useEffect(() => {
    getLegacyCredits(month, year);
  }, [month, year, getLegacyCredits]);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i);

  if (isLoading && legacyCredits.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>Loading Monthly Legacy Credits</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error: {error}</Text>
        <Text style={styles.retryText} onPress={() => getLegacyCredits(month, year)}>
          Tap to retry
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Legacy Credits</Text>
        <TouchableOpacity 
          style={styles.monthlyViewButton}
          onPress={() => router.push('/adminpages/legacyCredits/MonthlyLegacyCredits')}
        >
          <Text style={styles.monthlyViewButtonText}>Monthly View</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.pickerContainer}>
        <View style={styles.pickerWrapper}>
          <Text style={styles.pickerLabel}>Select Month:</Text>
          <Picker
            selectedValue={month}
            onValueChange={(itemValue) => setMonth(itemValue)}
            style={styles.picker}
          >
            {months.map((m, idx) => (
              <Picker.Item key={m} label={m} value={idx + 1} />
            ))}
          </Picker>
        </View>

        <View style={styles.pickerWrapper}>
          <Text style={styles.pickerLabel}>Select Year:</Text>
          <Picker
            selectedValue={year}
            onValueChange={(itemValue) => setYear(itemValue)}
            style={styles.picker}
          >
            {years.map((y) => (
              <Picker.Item key={y} label={y.toString()} value={y} />
            ))}
          </Picker>
        </View>
      </View>

      <Text style={styles.selectedDate}>
        Selected: {months[month - 1]} {year}
      </Text>

      <View style={styles.creditsContainer}>
        <Text style={styles.sectionTitle}>Members Legacy Status</Text>
        {legacyCredits.length === 0 ? (
          <Text style={styles.noDataText}>No data found for this month.</Text>
        ) : (
          legacyCredits.map((item, idx) => (
            <View key={item.user.id || idx} style={styles.creditItem}>
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{item.user.name}</Text>
                <Text style={styles.userEmail}>{item.user.email}</Text>
              </View>
              <View style={styles.creditInfo}>
                <Text style={[
                  styles.status,
                  { color: item.legacyCredit.status === 'verified' ? '#4CAF50' : '#FFA000' }
                ]}>
                  Status: {item.legacyCredit.status || 'pending'}
                </Text>
                <Text style={styles.amount}>
                  Amount: {item.legacyCredit.amount || 0}
                </Text>
                {item.legacyCredit._id && (
                  <Text
                    style={styles.verifyButton}
                    onPress={() => handleVerify(item.legacyCredit._id, item.legacyCredit.status)}
                    disabled={verifyingId === item.legacyCredit._id}
                  >
                    {verifyingId === item.legacyCredit._id ? 'Verifying...' : 
                     item.legacyCredit.status === 'verified' ? 'Unverify' : 'Verify'}
                  </Text>
                )}
              </View>
            </View>
          ))
        )}
      </View>
    </View>
  );
};

export default LegacyCredits;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
  },
  retryText: {
    color: 'blue',
    marginTop: 10,
    textDecorationLine: 'underline',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  monthlyViewButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  monthlyViewButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  pickerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  pickerWrapper: {
    flex: 1,
    marginHorizontal: 5,
  },
  pickerLabel: {
    fontSize: 16,
    marginBottom: 5,
  },
  picker: {
    height: 50,
    width: '100%',
  },
  selectedDate: {
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 20,
    textAlign: 'center',
  },
  creditsContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  noDataText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
  },
  creditItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  userInfo: {
    flex: 2,
  },
  userName: {
    fontSize: 16,
    fontWeight: '500',
  },
  userEmail: {
    color: '#666',
    fontSize: 14,
  },
  creditInfo: {
    flex: 1,
    alignItems: 'flex-end',
  },
  status: {
    fontSize: 14,
    fontWeight: '500',
  },
  amount: {
    fontSize: 14,
    marginTop: 4,
  },
  verifyButton: {
    color: '#2196F3',
    marginTop: 8,
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});