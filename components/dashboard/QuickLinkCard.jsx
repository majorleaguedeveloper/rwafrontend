import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { Ionicons } from '@expo/vector-icons'

const QuickLinkCard = ({ioniconName, ioniconColor, text}) => {
  return (
    <View style={styles.container}>
      <Ionicons name={ioniconName} size={24} color={ioniconColor} />
      <Text style={styles.text}>{text}</Text>
    </View>
  )
}

export default QuickLinkCard

const styles = StyleSheet.create({
    container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: 140,
    height: 150,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    elevation: 2,
    marginBottom: 16,
    },
    text: {
        fontSize: 14,
        color: '#555',
        marginTop: 8,
        textAlign: 'center',
    },
})