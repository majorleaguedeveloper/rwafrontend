import { StyleSheet, View, FlatList, TextInput, TouchableOpacity } from 'react-native'
import React, { useState, useEffect, useContext } from 'react'
import { useRouter } from 'expo-router';
import { ThemedText } from '../../../components/ThemedText';
import debounce from 'lodash/debounce';
import axios from 'axios';
import AuthContext from '../../../contexts/Authcontext';

const SelectUserForLoan = () => {
  const { userToken } = useContext(AuthContext);
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();
  const API_BASE_URL = 'http://192.168.1.185:4000';

  // Load all users initially
  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/users`, {
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': userToken,
        }
    });
      setUsers(response.data);
      setError(null);
    } catch (error) {
      console.error('Error loading users:', error);
      setError('Failed to load users1. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const searchUsers = async (query) => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/users/search?query=${query}`, {
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': userToken,
        }
      });
      setUsers(response.data);
      setError(null);
    } catch (error) {
      console.error('Error searching users:', error);
      setError('Failed to search users2. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const debouncedSearch = debounce((query) => {
    if (query) searchUsers(query);
    else setUsers([]);
  }, 500);

  useEffect(() => {
    debouncedSearch(searchQuery);
    return () => debouncedSearch.cancel();
  }, [searchQuery]);

  const handleUserSelect = (user) => {
    router.push({
      pathname: '/adminpages/loans/CreateLoanScreen',
      params: { userId: user._id, userName: user.name }
    });
  };

  const renderUser = ({ item }) => (
    <TouchableOpacity 
      style={styles.userItem} 
      onPress={() => handleUserSelect(item)}
    >      <ThemedText style={styles.userName}>{item.name}</ThemedText>
      <ThemedText style={styles.userEmail}>{item.email}</ThemedText>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>      <ThemedText style={styles.header}>Select User for Loan</ThemedText>
      
      <TextInput
        style={styles.searchInput}
        placeholder="Search users..."
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholderTextColor="#666"
      />      {error && (
        <View style={styles.errorContainer}>
          <ThemedText style={styles.errorText}>{error}</ThemedText>
        </View>
      )}

      {loading ? (
        <View style={styles.centerContainer}>          <ThemedText>Loading...</ThemedText>
        </View>
      ) : users.length === 0 ? (
        <View style={styles.centerContainer}>
          <ThemedText>No users found</ThemedText>
        </View>
      ) : (
        <FlatList
          data={users}
          renderItem={renderUser}
          keyExtractor={item => item._id}
          style={styles.list}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
};

export default SelectUserForLoan;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  searchInput: {
    height: 40,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
    color: '#000',
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 16,
  },
  userItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  errorContainer: {
    padding: 16,
    backgroundColor: '#ffebee',
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: '#c62828',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
});
