import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import { useLocalSearchParams } from 'expo-router'
import AuthContext from '../../../contexts/Authcontext'

const DepartmentDetails = () => {
  const { departmentId } = useLocalSearchParams();
  const { userToken } = useContext(AuthContext);
  const [department, setDepartment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDepartmentDetails = async () => {
      try {
        const response = await fetch(`http://192.168.1.185:4000/api/departments/${departmentId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': userToken,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setDepartment(data);
        } else {
          const errorData = await response.json();
          console.error('Error fetching department details:', errorData);
        }
      } catch (error) {
        console.error('Network error:', error);
      } finally {
        setLoading(false);
      }
    };

    if (departmentId && userToken) {
      fetchDepartmentDetails();
    }
  }, [departmentId, userToken]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!department) {
    return (
      <View style={styles.errorContainer}>
        <Text>Department not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{department.name}</Text>
        <Text style={styles.description}>{department.description}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Department Head</Text>
        <Text>{department.head ? department.head.name : 'No head assigned'}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Members ({department.members.length})</Text>
        {department.members.map((member) => (
          <View key={member._id} style={styles.memberItem}>
            <Text>{member.name}</Text>
            <Text style={styles.emailText}>{member.email}</Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Activities</Text>
        {department.activities && department.activities.length > 0 ? (
          department.activities.map((activity, index) => (
            <View key={index} style={styles.activityItem}>
              <Text style={styles.activityTitle}>{activity.title}</Text>
              <Text>{activity.description}</Text>
              <Text>Status: {activity.status}</Text>
              <Text>Budget: ${activity.budget}</Text>
              <Text>Start: {new Date(activity.startDate).toLocaleDateString()}</Text>
              <Text>End: {new Date(activity.endDate).toLocaleDateString()}</Text>
            </View>
          ))
        ) : (
          <Text>No activities found</Text>
        )}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: '#666',
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  memberItem: {
    marginVertical: 4,
  },
  emailText: {
    color: '#666',
    fontSize: 14,
  },
  activityItem: {
    marginVertical: 8,
    padding: 12,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
});

export default DepartmentDetails
