import { StyleSheet, Text, View, Pressable } from 'react-native';
import React from 'react';

const formatDate = (date) => {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return `${months[date.getMonth()]} ${date.getFullYear()}`;
};

export default function CurrentMonthLegacyCreditStatusCard({
  dueDate = new Date(),
  percentagePaid = 0,
  onPayNowPress,
  onViewHistoryPress,
}) {
  const borderColor = percentagePaid >= 100 ? '#4CAF50' : percentagePaid > 0 ? '#FFC107' : '#F44336';

  return (
    <View style={styles.container}>
      <Text style={styles.monthText}>{formatDate(dueDate)}</Text>
      <View style={styles.row}>
        <View style={styles.statusContainer}>
          <View style={[styles.status, { borderColor }]}>
            <Text style={styles.percentageText}>{percentagePaid}%</Text>
          </View>
          <Text style={styles.labelText}>Legacy Credit Due</Text>
        </View>
        <View style={styles.buttonContainer}>
          <Pressable 
            style={[styles.button, styles.historyButton]} 
            onPress={onViewHistoryPress}
          >
            <Text style={styles.buttonText}>View History</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  monthText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusContainer: {
    alignItems: 'center',
  },
  status: {
    width: 120,
    height: 120,
    backgroundColor: '#f8f8f8',
    padding: 10,
    borderWidth: 8,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  percentageText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  labelText: {
    fontSize: 14,
    color: '#666',
  },
  buttonContainer: {
    flex: 1,
    marginLeft: 24,
    height: 120,
    justifyContent: 'space-between',
  },
  button: {
    height: 54,
    borderRadius: 27,
    justifyContent: 'center',
    alignItems: 'center',
  },
  payButton: {
    backgroundColor: '#2196F3',
  },
  historyButton: {
    borderWidth: 1,
    borderColor: '#90CAF9',
    color: 'blue',
  },
  buttonText: {
    color: '#90CAF9',
    fontSize: 16,
    fontWeight: '600',
  },
});