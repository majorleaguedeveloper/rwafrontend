import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native'
import React, { useContext, useState } from 'react'
import { router } from 'expo-router'
import AuthContext from '../../../contexts/Authcontext'
import DateTimePicker from '@react-native-community/datetimepicker'

const CreateAnnouncement = () => {
  const { userToken } = useContext(AuthContext)
  const [loading, setLoading] = useState(false)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    importance: 'medium',
    expiresAt: null
  })

  const handleSubmit = async () => {
    if (!formData.title || !formData.content) {
      Alert.alert('Error', 'Please fill in all required fields')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('http://192.168.1.185:4000/api/announcements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': userToken,
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        Alert.alert('Success', 'Announcement created successfully', [
          { text: 'OK', onPress: () => router.back() }
        ])
      } else {
        const errorData = await response.json()
        Alert.alert('Error', errorData.message || 'Failed to create announcement')
      }
    } catch (error) {
      console.error('Network error:', error)
      Alert.alert('Error', 'Network error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Create Announcement</Text>

      <View style={styles.formContainer}>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Title *</Text>
          <TextInput
            style={styles.input}
            value={formData.title}
            onChangeText={(text) => setFormData({ ...formData, title: text })}
            placeholder="Enter announcement title"
            maxLength={100}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Content *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.content}
            onChangeText={(text) => setFormData({ ...formData, content: text })}
            placeholder="Enter announcement content"
            multiline
            numberOfLines={6}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Importance</Text>
          <View style={styles.importanceContainer}>
            {['low', 'medium', 'high'].map((level) => (
              <TouchableOpacity
                key={level}
                style={[
                  styles.importanceButton,
                  formData.importance === level && styles.importanceButtonActive,
                  { backgroundColor: level === 'high' ? '#dc3545' : level === 'medium' ? '#ffc107' : '#28a745' }
                ]}
                onPress={() => setFormData({ ...formData, importance: level })}
              >
                <Text style={[
                  styles.importanceButtonText,
                  formData.importance === level && styles.importanceButtonTextActive
                ]}>
                  {level.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Expiration Date (Optional)</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.dateButtonText}>
              {formData.expiresAt
                ? new Date(formData.expiresAt).toLocaleDateString()
                : 'Set expiration date'}
            </Text>
          </TouchableOpacity>
        </View>

        {showDatePicker && (
          <DateTimePicker
            value={formData.expiresAt ? new Date(formData.expiresAt) : new Date()}
            mode="date"
            minimumDate={new Date()}
            onChange={(event, selectedDate) => {
              setShowDatePicker(false)
              if (selectedDate) {
                setFormData({ ...formData, expiresAt: selectedDate })
              }
            }}
          />
        )}

        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.submitButtonText}>Create Announcement</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    margin: 20,
    textAlign: 'center',
  },
  formContainer: {
    padding: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '600',
  },
  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  importanceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  importanceButton: {
    flex: 1,
    margin: 4,
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  importanceButtonActive: {
    borderWidth: 2,
    borderColor: '#000',
  },
  importanceButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  dateButton: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
  },
  dateButtonText: {
    fontSize: 16,
    color: '#666',
  },
  submitButton: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonDisabled: {
    backgroundColor: '#cccccc',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
})

export default CreateAnnouncement
