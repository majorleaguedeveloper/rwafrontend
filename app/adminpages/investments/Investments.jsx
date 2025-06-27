import { FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { use, useContext, useEffect, useState } from 'react'
import { router } from 'expo-router'
import AuthContext from '../../../contexts/Authcontext'

const Investments = () => {
  const { userToken } = useContext(AuthContext)
  const [investments, setInvestments] = useState([])

  const fetchInvestments = async () => {
    try {
      const response = await fetch('http://192.168.1.185:4000/api/investments', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': userToken, // Replace with actual token
        },
      })
        if (response.ok) {
            const data = await response.json()
            setInvestments(data)
        } else {
            const errorData = await response.json()
            console.error('Error fetching investments:', errorData)
        }
    }
    catch (error) {
      console.error('Network error:', error)
    }
    }

    useEffect(() => {
      fetchInvestments()
    }, [userToken])


  return (
    <View>
      <Text>Investments</Text>
      <FlatList
        data={investments}
        keyExtractor={item => item._id}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => router.push({ pathname: '/adminpages/InvestmentDetails', params: { investmentId: item._id } })}
            style={{ marginVertical: 8, padding: 8, borderWidth: 1, borderColor: '#ccc', borderRadius: 6 }}>
            <Text style={{ fontWeight: 'bold' }}>{item.name}</Text>
            <Text>Amount: {item.amount}</Text>
            <Text>Date: {new Date(item.date).toLocaleDateString()}</Text>
          </TouchableOpacity>
        )}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={<Text>No investments found</Text>}
        refreshControl={
          <RefreshControl
            refreshing={false}
            onRefresh={fetchInvestments}
          />
        }
        />

    </View>
  )
}

export default Investments

const styles = StyleSheet.create({})