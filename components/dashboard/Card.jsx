import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'

const Card = ({iconName, iconColor, title, number, message, route }) => {
  const router = useRouter();

  return (
    <TouchableOpacity style={styles.card} onPress={() => router.push(route)}>
      <Ionicons name={iconName} size={24} color={iconColor} />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.number}>{number}</Text>
      <Text style={styles.message}>{message}</Text>
    </TouchableOpacity>
  )
}

export default Card

const styles = StyleSheet.create({
  card: {
    width: 140,
    height: 150,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    elevation: 2,
    marginBottom: 16,
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  number: {
    fontSize: 14,
    color: '#555',
  },
  message: {
    fontSize: 12,
    color: '#777',
  },
})