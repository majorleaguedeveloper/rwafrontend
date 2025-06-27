import { Text, View, FlatList, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native'
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
        'x-auth-token': userToken, // Replace with actual token
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
}
, [userToken]);


    if (loading) {
      return (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text>Loading departments...</Text>
          </View>
      );
    }

    return (
      <View style={{ flex: 1 }}>
        <View style={styles.header}>
          <Text style={styles.title}>Departments</Text>
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => router.push('/adminpages/departments/CreateDepartment')}
          >
            <Text style={styles.createButtonText}>Create New</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={departments}
          keyExtractor={item => item._id}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => router.push({
                pathname: '/adminpages/departments/DepartmentDetails',
                params: { departmentId: item._id }
              })}
              style={styles.departmentCard}
            >
              <Text style={styles.departmentName}>{item.name}</Text>
              <Text>{item.description}</Text>
              <View style={styles.departmentStats}>
                <Text>Members: {item.members.length}</Text>
                <Text>Budget: ${item.budget}</Text>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={<Text style={styles.emptyText}>No departments found.</Text>}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={fetchDepartments}
            />
          }
        />
      </View>
    );
  }

  const styles = StyleSheet.create({
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: '#eee',
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
    },
    createButton: {
      backgroundColor: '#2196F3',
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 6,
    },
    createButtonText: {
      color: '#fff',
      fontWeight: 'bold',
    },
    listContent: {
      padding: 16,
    },
    departmentCard: {
      marginBottom: 16,
      padding: 16,
      backgroundColor: '#fff',
      borderRadius: 8,
      borderWidth: 1,
      borderColor: '#eee',
      elevation: 2,
    },
    departmentName: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 8,
    },
    departmentStats: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 8,
    },
    emptyText: {
      textAlign: 'center',
      marginTop: 20,
      color: '#666',
    },
  });

export default Departments