import React, { useContext } from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { Platform, StyleSheet} from 'react-native';
import AuthContext from '../../contexts/Authcontext'; // Adjust path as needed

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const { userData } = useContext(AuthContext);
  
  // Define tab bar styles based on platform
  const tabBarStyle = {
    position: 'absolute',
    height: 60 + (Platform.OS === 'ios' ? insets.bottom : 0),
    backgroundColor: Platform.OS === 'ios' ? 'transparent' : '#FFFFFF',
    borderTopWidth: 0,
    elevation: 0,
    paddingBottom: Platform.OS === 'ios' ? insets.bottom : 0,
    paddingTop: 5,
  };

  // Check if user is admin - could be used for conditional tabs
  const isAdmin = userData?.role === 'admin';

  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          
          if (route.name === 'Dashboard') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          } else if (route.name === 'AdminSharesScreen') {
            iconName = focused ? 'wallet' : 'wallet-outline';
          } else if (route.name === 'settings') {
            iconName = focused ? 'settings' : 'settings-outline';
          } else if (route.name === 'admin') {
            iconName = focused ? 'shield' : 'shield-outline';
          }
          
          return <Ionicons name={iconName} size={24} color={color} />;
        },
        tabBarActiveTintColor: '#3498db',
        tabBarInactiveTintColor: '#8E8E93',
        tabBarStyle: tabBarStyle,
        tabBarBackground: () => (
          Platform.OS === 'ios' ? 
            <BlurView 
              tint="light" 
              intensity={90} 
              style={StyleSheet.absoluteFill} 
            /> : null
        ),
        tabBarLabelStyle: {
          fontFamily: 'Outfit_500Medium', // Make sure font is loaded
          fontSize: 12,
          paddingBottom: Platform.OS === 'ios' ? 0 : 5,
        },
        tabBarItemStyle: {
          paddingTop: 0,
        },
        unmountOnBlur: false, // Set to true if you want to reset screen state when tab is unfocused
      })}
      initialRouteName="Dashboard" // Adjust initial route as needed
    >


        <Tabs.Screen 
          name="Dashboard" 
          options={{ 
            title: 'Admin',
            tabBarLabel: 'Home'
          }} 
        />

        <Tabs.Screen 
          name="AdminSharesScreen" 
          options={{ 
            title: 'Shares',
            tabBarLabel: 'Shares'
          }} 
        />

        <Tabs.Screen 
          name="adminpages/announcements/Announcements" 
          options={{ 
            title: 'Announcements',
            tabBarLabel: 'Announcements',
            tabBarIcon: ({ focused, color }) => (
              <Ionicons 
                name={focused ? 'megaphone' : 'megaphone-outline'} 
                size={24} 
                color={color} 
              />
            )
          }} 
        />

      <Tabs.Screen 
        name="profile" 
        options={{ 
          title: 'Profile',
          tabBarLabel: 'Profile'
        }} 
      />
    </Tabs>
  );
}