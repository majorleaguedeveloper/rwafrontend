import React, { useEffect, useState, useContext } from 'react';
import { StyleSheet, Text, View, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import AuthContext from '../../../contexts/Authcontext';
import axios from 'axios';

const LegacyCreditCard = ({ credit }) => {
  const statusColor = credit.status === 'verified' ? '#4CAF50' : credit.status === 'pending' ? '#FFC107' : '#F44336';
  return (
    <View style={[styles.card, { borderLeftColor: statusColor }]}> 
      <View style={styles.cardHeader}>
        <Text style={styles.amountText}>KES {credit.amount?.toLocaleString() || '0'}</Text>
        <Text style={[styles.status, { color: statusColor }]}>{credit.status ? credit.status.toUpperCase() : 'PENDING'}</Text>
      </View>
      <Text style={styles.monthText}>{credit.month ? new Date(credit.month).toLocaleString('default', { month: 'long', year: 'numeric' }) : 'Unknown Month'}</Text>
      <View style={styles.cardDetails}>
        <Text style={styles.detailText}>Payment Method: <Text style={styles.detailValue}>{credit.paymentMethod || 'N/A'}</Text></Text>
        <Text style={styles.detailText}>Receipt #: <Text style={styles.detailValue}>{credit.receiptNumber || 'N/A'}</Text></Text>
        {credit.paidOn && <Text style={styles.detailText}>Paid On: <Text style={styles.detailValue}>{new Date(credit.paidOn).toLocaleDateString()}</Text></Text>}
      </View>
    </View>
  );
};

const LegacyCredits = () => {
  const { userData, userToken } = useContext(AuthContext);
  const [credits, setCredits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchCredits = async () => {
    if (!userData?.id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`http://192.168.1.185:4000/api/legacyCredits/user/${userData.id}`, {
        headers: {
          'x-auth-token': userToken,
        },
      });
      setCredits(res.data);
    } catch (err) {
      setError('Failed to load legacy credits.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCredits();
  }, [userData?._id]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchCredits();
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Loading legacy credits...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!credits.length) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyText}>No legacy credits found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Legacy Credits</Text>
      <FlatList
        data={credits}
        keyExtractor={item => item._id}
        renderItem={({ item }) => <LegacyCreditCard credit={item} />}
        contentContainerStyle={{ paddingBottom: 32 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

export default LegacyCredits;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FB',
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#222',
    marginBottom: 16,
    alignSelf: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    marginBottom: 16,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
    borderLeftWidth: 6,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  amountText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  status: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1,
  },
  monthText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  cardDetails: {
    marginTop: 4,
  },
  detailText: {
    fontSize: 14,
    color: '#444',
    marginBottom: 2,
  },
  detailValue: {
    fontWeight: '600',
    color: '#222',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F7FB',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#2196F3',
  },
  errorText: {
    color: '#F44336',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyText: {
    color: '#888',
    fontSize: 16,
    fontStyle: 'italic',
  },
});