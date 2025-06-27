import { Alert, StyleSheet, Text, View } from 'react-native'
import React, { use, useContext, useEffect, useState } from 'react'
import AuthContext from '../../../contexts/Authcontext';
import { useLocalSearchParams } from 'expo-router';

const LoanDetailsScreen = () => {
  const [isLoading, setIsLoading] = useState(true);
  const { loanId } = useLocalSearchParams(); // Assuming you are using react-router for navigation
  const { userToken} = useContext(AuthContext);
  const [loanDetails, setLoanDetails] = useState(null);

  const fetchLoanDetails = async () => {
    try {
      const response = await fetch(`http://192.168.1.185:4000/api/loans/${loanId}`, {
        headers: {
          'x-auth-token': userToken
        }
      });
      const data = await response.json();

      if (response.ok) {
        setLoanDetails(data);
        setIsLoading(false);
      } else {
        Alert.alert('Error', data.msg || 'Failed to fetch loan details');
      }
    } catch (error) {
      Alert.alert('Error', 'Network error occurred. Please try again.');
    }
  };

  useEffect(() => {
    fetchLoanDetails();
  }, []);

  if (isLoading) {
    return <Text>Loading...</Text>;
  }

  if (!loanDetails) {
    return (
      <View style={styles.container}>
        <Text>No loan details available</Text>
      </View>
    );
  }

  // Helper to format date
  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Loan Details</Text>
      <View style={styles.detailRow}>
        <Text style={styles.label}>Amount:</Text>
        <Text style={styles.value}>${loanDetails.amount?.toLocaleString() || '-'}</Text>
      </View>
      <View style={styles.detailRow}>
        <Text style={styles.label}>Purpose:</Text>
        <Text style={styles.value}>{loanDetails.purpose || '-'}</Text>
      </View>
      <View style={styles.detailRow}>
        <Text style={styles.label}>Status:</Text>
        <Text style={[styles.value, { color: loanDetails.status === 'approved' ? 'green' : loanDetails.status === 'pending' ? 'orange' : 'red' }]}>{loanDetails.status || '-'}</Text>
      </View>
      <View style={styles.detailRow}>
        <Text style={styles.label}>Interest Rate:</Text>
        <Text style={styles.value}>{loanDetails.interestRate ? loanDetails.interestRate + '%' : '-'}</Text>
      </View>
      <View style={styles.detailRow}>
        <Text style={styles.label}>Repayment Period:</Text>
        <Text style={styles.value}>{loanDetails.repaymentPeriod ? loanDetails.repaymentPeriod + ' months' : '-'}</Text>
      </View>
      <View style={styles.detailRow}>
        <Text style={styles.label}>Application Date:</Text>
        <Text style={styles.value}>{formatDate(loanDetails.applicationDate)}</Text>
      </View>
      <View style={styles.detailRow}>
        <Text style={styles.label}>Approval Date:</Text>
        <Text style={styles.value}>{formatDate(loanDetails.approvalDate)}</Text>
      </View>
      <View style={styles.detailRow}>
        <Text style={styles.label}>Approved By:</Text>
        <Text style={styles.value}>{loanDetails.approvedBy?.name || '-'}</Text>
      </View>
      <View style={styles.detailRow}>
        <Text style={styles.label}>Guarantors:</Text>
        <Text style={styles.value}>{loanDetails.guarantors && loanDetails.guarantors.length > 0 ? loanDetails.guarantors.map(g => g.name || g).join(', ') : 'None'}</Text>
      </View>
      <View style={styles.detailRow}>
        <Text style={styles.label}>Repayments:</Text>
        <Text style={styles.value}>{loanDetails.repayments && loanDetails.repayments.length > 0 ? loanDetails.repayments.length + ' record(s)' : 'None'}</Text>
      </View>
      {/* AI-powered summary */}
      <View style={styles.aiSummaryBox}>
        <Text style={styles.aiSummaryTitle}>AI Insights</Text>
        <Text style={styles.aiSummaryText}>
          {loanDetails.status === 'approved'
            ? `This loan of $${loanDetails.amount?.toLocaleString()} for "${loanDetails.purpose}" was approved by ${loanDetails.approvedBy?.name || 'an admin'} on ${formatDate(loanDetails.approvalDate)}. The interest rate is ${loanDetails.interestRate}% over ${loanDetails.repaymentPeriod} months. ${loanDetails.guarantors?.length ? 'Guarantors are involved.' : 'No guarantors.'}`
            : 'No AI summary available for this loan status.'}
        </Text>
      </View>
    </View>
  )
}

export default LoanDetailsScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#2a2a2a',
    textAlign: 'center',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#eee',
    paddingBottom: 6,
  },
  label: {
    fontWeight: '600',
    color: '#555',
    fontSize: 16,
  },
  value: {
    fontSize: 16,
    color: '#222',
    flexShrink: 1,
    textAlign: 'right',
  },
  aiSummaryBox: {
    marginTop: 30,
    padding: 16,
    backgroundColor: '#f0f8ff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#b3d8fd',
  },
  aiSummaryTitle: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 8,
    color: '#1976d2',
  },
  aiSummaryText: {
    fontSize: 15,
    color: '#333',
  },
});