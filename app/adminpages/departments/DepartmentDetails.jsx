import { StyleSheet, Text, View } from 'react-native';
import React, { useContext, useEffect, useState } from 'react';
import AuthContext from '../../../contexts/Authcontext';
import { useLocalSearchParams } from 'expo-router';

const DepartmentDetails = () => {
const { userToken } = useContext(AuthContext);
const [LoanDetails, setLoanDetails] = useState([]);
const { departmentId } = useLocalSearchParams(); // Get departmentId from route params

const fetchDepartmentDetails = async () => {
  try {
    const response = await fetch(`http://192.168.1.185:4000/api/departments/${departmentId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': userToken, // Replace with actual token
      },
    });
    if (response.ok) {
      const data = await response.json();
      setLoanDetails(data);
      console.log('Department Details:', data);
      // Handle the department details as needed
    } else {
      const errorData = await response.json();
      console.error('Error fetching department details:', errorData);
    }
    } catch (error) {
    console.error(error);
    }
}

useEffect(() => {
  fetchDepartmentDetails('some-department-id'); // Replace with actual department ID
}
, [userToken]);


  return (
    <View>
      <Text>{LoanDetails?.name}</Text>
      <Text>Head: {LoanDetails?.head?.name}</Text>
      <Text>Members: {LoanDetails?.members?.length}</Text>
      <Text>Budget: {LoanDetails?.budget}</Text>
    </View>
  )
}

export default DepartmentDetails

const styles = StyleSheet.create({})