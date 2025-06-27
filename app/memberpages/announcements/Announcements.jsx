import { FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import { router } from 'expo-router'
import AuthContext from '../../../contexts/Authcontext'

const Announcements = () => {
  const { userToken } = useContext(AuthContext)
  const [announcements, setAnnouncements] = useState([])
  const [refreshing, setRefreshing] = useState(false)
  const [loading, setLoading] = useState(true)

  const fetchAnnouncements = async () => {
    try {
      const response = await fetch('http://192.168.1.185:4000/api/announcements', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': userToken,
        },
      })
      if (response.ok) {
        const data = await response.json()
        setAnnouncements(data.data)
        setLoading(false)
      } else {
        const errorData = await response.json()
        console.error('Error fetching announcements:', errorData)
      }
    } catch (error) {
      console.error('Network error:', error)
    }
  }

  useEffect(() => {
    fetchAnnouncements()
  }, [userToken])

  const onRefresh = async () => {
    setRefreshing(true)
    await fetchAnnouncements()
    setRefreshing(false)
  }

  const getImportanceStyle = (importance) => {
    switch (importance) {
      case 'high':
        return {
          container: { borderLeftColor: '#dc3545', borderLeftWidth: 4 },
          text: { color: '#dc3545' }
        }
      case 'medium':
        return {
          container: { borderLeftColor: '#ffc107', borderLeftWidth: 4 },
          text: { color: '#ffc107' }
        }
      default:
        return {
          container: { borderLeftColor: '#28a745', borderLeftWidth: 4 },
          text: { color: '#28a745' }
        }
    }
  }

  const renderAnnouncement = ({ item }) => {
    const importanceStyle = getImportanceStyle(item.importance)
    
    return (
      <TouchableOpacity
        style={[styles.announcementCard, importanceStyle.container]}
        onPress={() => router.push({
          pathname: '/memberpages/announcements/AnnouncementDetails',
          params: { announcementId: item._id }
        })}
      >
        <View style={styles.headerContainer}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={[styles.importance, importanceStyle.text]}>
            {item.importance.toUpperCase()}
          </Text>
        </View>
        
        <Text style={styles.content} numberOfLines={2}>
          {item.content}
        </Text>
        
        <View style={styles.footer}>
          <Text style={styles.date}>
            Posted: {new Date(item.createdAt).toLocaleDateString()}
          </Text>
          {item.expiresAt && (
            <Text style={[styles.date, item.isExpired && styles.expired]}>
              Expires: {new Date(item.expiresAt).toLocaleDateString()}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    )
  }

  if (loading && !refreshing) {
    return (
      <View style={styles.centerContainer}>
        <Text>Loading announcements...</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Announcements</Text>
      
      <FlatList
        data={announcements}
        renderItem={renderAnnouncement}
        keyExtractor={item => item._id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.centerContainer}>
            <Text style={styles.emptyText}>No announcements available</Text>
          </View>
        }
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  listContainer: {
    padding: 15,
  },
  announcementCard: {
    backgroundColor: 'white',
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  importance: {
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    color: '#666',
    marginBottom: 10,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 10,
  },
  date: {
    color: '#666',
    fontSize: 12,
  },
  expired: {
    color: '#dc3545',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
})

export default Announcements
