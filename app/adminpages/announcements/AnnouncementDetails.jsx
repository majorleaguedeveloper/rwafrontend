import { StyleSheet, Text, View, TouchableOpacity, Alert, ActivityIndicator } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import { useLocalSearchParams, router } from 'expo-router'
import AuthContext from '../../../contexts/Authcontext'

const AnnouncementDetails = () => {
  const { userToken } = useContext(AuthContext)
  const { announcementId } = useLocalSearchParams()
  const [announcement, setAnnouncement] = useState(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)

  const fetchAnnouncementDetails = async () => {
    try {
      const response = await fetch(`http://192.168.1.185:4000/api/announcements/${announcementId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': userToken,
        },
      })
      if (response.ok) {
        const data = await response.json()
        setAnnouncement(data.data)
      } else {
        const errorData = await response.json()
        console.error('Error fetching announcement details:', errorData)
        Alert.alert('Error', 'Failed to load announcement details')
      }
    } catch (error) {
      console.error('Network error:', error)
      Alert.alert('Error', 'Network error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAnnouncementDetails()
  }, [announcementId, userToken])

  const handleDelete = async () => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this announcement?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setDeleting(true)
            try {
              const response = await fetch(`http://192.168.1.185:4000/api/announcements/${announcementId}`, {
                method: 'DELETE',
                headers: {
                  'Content-Type': 'application/json',
                  'x-auth-token': userToken,
                },
              })
              if (response.ok) {
                Alert.alert('Success', 'Announcement deleted successfully')
                router.back()
              } else {
                const errorData = await response.json()
                Alert.alert('Error', errorData.message || 'Failed to delete announcement')
              }
            } catch (error) {
              console.error('Network error:', error)
              Alert.alert('Error', 'Network error occurred')
            } finally {
              setDeleting(false)
            }
          },
        },
      ]
    )
  }

  const getImportanceStyle = (importance) => {
    switch (importance) {
      case 'high':
        return { backgroundColor: '#dc3545' }
      case 'medium':
        return { backgroundColor: '#ffc107' }
      default:
        return { backgroundColor: '#28a745' }
    }
  }

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    )
  }

  if (!announcement) {
    return (
      <View style={styles.centerContainer}>
        <Text>Announcement not found</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{announcement.title}</Text>
        <View style={[styles.importanceBadge, getImportanceStyle(announcement.importance)]}>
          <Text style={styles.importanceText}>
            {announcement.importance.toUpperCase()}
          </Text>
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.contentText}>{announcement.content}</Text>
      </View>

      <View style={styles.metadata}>
        <Text style={styles.metadataText}>
          Created: {new Date(announcement.createdAt).toLocaleDateString()}
        </Text>
        {announcement.expiresAt && (
          <Text style={styles.metadataText}>
            Expires: {new Date(announcement.expiresAt).toLocaleDateString()}
          </Text>
        )}
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.button, styles.editButton]}
          onPress={() => router.push({
            pathname: '/adminpages/announcements/EditAnnouncement',
            params: { announcementId: announcement._id }
          })}
        >
          <Text style={styles.buttonText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.deleteButton]}
          onPress={handleDelete}
          disabled={deleting}
        >
          {deleting ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <Text style={styles.buttonText}>Delete</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: 'white',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  importanceBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  importanceText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  content: {
    backgroundColor: 'white',
    margin: 10,
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  contentText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
  metadata: {
    backgroundColor: 'white',
    margin: 10,
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  metadataText: {
    color: '#666',
    marginBottom: 5,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
  },
  button: {
    flex: 1,
    margin: 5,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: '#007bff',
  },
  deleteButton: {
    backgroundColor: '#dc3545',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
})

export default AnnouncementDetails
