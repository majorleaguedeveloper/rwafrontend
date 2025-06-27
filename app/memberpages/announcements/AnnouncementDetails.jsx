import { StyleSheet, Text, View, ScrollView, ActivityIndicator } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import { useLocalSearchParams } from 'expo-router'
import AuthContext from '../../../contexts/Authcontext'

const AnnouncementDetails = () => {
  const { userToken } = useContext(AuthContext)
  const { announcementId } = useLocalSearchParams()
  const [announcement, setAnnouncement] = useState(null)
  const [loading, setLoading] = useState(true)

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
      }
    } catch (error) {
      console.error('Network error:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAnnouncementDetails()
  }, [announcementId, userToken])

  const getImportanceStyling = (importance) => {
    switch (importance) {
      case 'high':
        return {
          backgroundColor: '#dc3545',
          color: 'white'
        }
      case 'medium':
        return {
          backgroundColor: '#ffc107',
          color: 'black'
        }
      default:
        return {
          backgroundColor: '#28a745',
          color: 'white'
        }
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

  const importanceStyle = getImportanceStyling(announcement.importance)

  return (
    <ScrollView style={styles.container}>
      <View style={[styles.header, { borderLeftColor: importanceStyle.backgroundColor }]}>
        <Text style={styles.title}>{announcement.title}</Text>
        <View style={[styles.importanceBadge, { backgroundColor: importanceStyle.backgroundColor }]}>
          <Text style={[styles.importanceText, { color: importanceStyle.color }]}>
            {announcement.importance.toUpperCase()}
          </Text>
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.contentText}>{announcement.content}</Text>
      </View>

      <View style={styles.metadata}>
        <View style={styles.metadataItem}>
          <Text style={styles.metadataLabel}>Posted:</Text>
          <Text style={styles.metadataValue}>
            {new Date(announcement.createdAt).toLocaleDateString()}
          </Text>
        </View>

        {announcement.expiresAt && (
          <View style={styles.metadataItem}>
            <Text style={styles.metadataLabel}>Expires:</Text>
            <Text style={[
              styles.metadataValue,
              announcement.isExpired && styles.expiredText
            ]}>
              {new Date(announcement.expiresAt).toLocaleDateString()}
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
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
    borderLeftWidth: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  importanceBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  importanceText: {
    fontWeight: 'bold',
    fontSize: 12,
  },
  content: {
    backgroundColor: 'white',
    margin: 10,
    padding: 20,
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
  metadataItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 5,
  },
  metadataLabel: {
    color: '#666',
    fontWeight: '600',
  },
  metadataValue: {
    color: '#333',
  },
  expiredText: {
    color: '#dc3545',
    fontWeight: '500',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
})

export default AnnouncementDetails
