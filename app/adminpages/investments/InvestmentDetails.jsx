import { StyleSheet, Text, View } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import { useLocalSearchParams } from 'expo-router'
import AuthContext from '../../../contexts/Authcontext'  

const InvestmentDetails = () => {
    const { userToken } = useContext(AuthContext)
    const { investmentId } = useLocalSearchParams() // Get investmentId from route params
    const [investmentDetails, setInvestmentDetails] = useState(null)

    const fetchInvestmentDetails = async () => {
        try {
            console.log('Fetching investment details for ID:', investmentId);
          
            const response = await fetch(`http://192.168.1.185:4000/api/investments/${investmentId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': userToken, // Replace with actual token
                },
            })
            if (response.ok) {
                const data = await response.json()
                setInvestmentDetails(data)
                console.log('Investment Details:', data)
                // Handle the investment details data as needed
            } else {
                const errorData = await response.json()
                console.error('Error fetching investment details:', errorData)
            }
        } catch (error) {
            console.error('Network error:', error)
        }
    } 

    useEffect(() => {
        fetchInvestmentDetails()
    }, [investmentId, userToken])
    
  return (
    <View>
      <Text>InvestmentDetails</Text>
      {investmentDetails ? (
        <View>
          <Text>Investment Name: {investmentDetails.name}</Text>
          <Text>Amount: {investmentDetails.amount}</Text>
          <Text>Date: {new Date(investmentDetails.date).toLocaleDateString()}</Text>
          <Text>Status: {investmentDetails.status}</Text>
          {/* Add more fields as necessary */}
        </View>
      ) : (
        <Text>Loading investment details...</Text>
      )}
    </View>
  )
}

export default InvestmentDetails

const styles = StyleSheet.create({})