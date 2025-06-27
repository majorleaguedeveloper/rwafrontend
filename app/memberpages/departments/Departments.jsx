import { Text, View, FlatList, TouchableOpacity, RefreshControl, StyleSheet } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import { useRouter } from 'expo-router'
import AuthContext from '../../../contexts/Authcontext'

const Departments = () => {
  const { userToken } = useContext(AuthContext);
  const router = useRouter();
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDepartments = async () => {
    try {
      const response = await fetch('http://192.168.1.185:4000/api/departments', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': userToken,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setDepartments(data);
      } else {
        const errorData = await response.json();
        console.error('Error fetching departments:', errorData);
      }
    } catch (error) {
      console.error('Network error:', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchDepartments();
  }, [userToken]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading departments...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Departments</Text>
      <FlatList
        data={departments}
        keyExtractor={item => item._id}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => router.push({ 
              pathname: '/memberpages/departments/DepartmentDetails', 
              params: { departmentId: item._id } 
            })}
            style={styles.departmentCard}
          >
            <Text style={styles.departmentName}>{item.name}</Text>
            <Text>{item.description}</Text>
            <View style={styles.memberInfo}>
              <Text>Members: {item.members.length}</Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>No departments found.</Text>}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={fetchDepartments}
          />
        }
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  departmentCard: {
    marginVertical: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  departmentName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  memberInfo: {
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#666',
  },
});

export default Departments
