import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Icon, Badge } from '@rneui/themed';
import { View } from 'react-native';
import { useAuth } from '../contexts/AuthContext';

// Import screens
import WelcomeScreen from '../screens/WelcomeScreen';
import LoginScreen from '../screens/LoginScreen';
import UserDashboardScreen from '../screens/UserDashboardScreen';
import PropertyDetailsScreen from '../screens/PropertyDetailsScreen';
import DeveloperProfileScreen from '../screens/DeveloperProfileScreen';
import InvestorProfileScreen from '../screens/InvestorProfileScreen';
import ProjectsScreen from '../screens/ProjectsScreen';
import ForumScreen from '../screens/ForumScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import QRScannerScreen from '../screens/QRScannerScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const MainTabs = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const { userData } = useAuth();

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchUnreadCount = async () => {
    try {
      // Mock unread count for now
      setUnreadCount(Math.floor(Math.random() * 5));
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopColor: '#e0e0e0',
          height: 60,
          paddingBottom: 8,
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#666',
        headerStyle: {
          backgroundColor: '#fff',
        },
        headerTintColor: '#333',
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={UserDashboardScreen}
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color }) => (
            <Icon name="dashboard" type="material" color={color} size={24} />
          ),
        }}
      />
      <Tab.Screen
        name="Projects"
        component={ProjectsScreen}
        options={{
          title: 'Projects',
          tabBarIcon: ({ color }) => (
            <Icon name="folder" type="material" color={color} size={24} />
          ),
        }}
      />
      <Tab.Screen
        name="Forum"
        component={ForumScreen}
        options={{
          title: 'Forum',
          tabBarIcon: ({ color }) => (
            <Icon name="forum" type="material" color={color} size={24} />
          ),
        }}
      />
      <Tab.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{
          title: 'Notifications',
          tabBarIcon: ({ color }) => (
            <View>
              <Icon name="notifications" type="material" color={color} size={24} />
              {unreadCount > 0 && (
                <Badge
                  value={unreadCount}
                  status="error"
                  containerStyle={styles.badgeContainer}
                />
              )}
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={InvestorProfileScreen}
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => (
            <Icon name="person" type="material" color={color} size={24} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return null; // Or a loading screen
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: '#fff',
          },
          headerTintColor: '#333',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          headerBackTitleVisible: false,
          animation: 'slide_from_right',
        }}
      >
        {!user ? (
          // Auth screens
          <>
            <Stack.Screen 
              name="Welcome" 
              component={WelcomeScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen 
              name="Login" 
              component={LoginScreen}
              options={{ headerShown: false }}
            />
          </>
        ) : (
          // Main app screens
          <>
            <Stack.Screen 
              name="Main" 
              component={MainTabs}
              options={{ headerShown: false }}
            />
            <Stack.Screen 
              name="PropertyDetails" 
              component={PropertyDetailsScreen}
              options={{
                title: 'Property Details',
                presentation: 'card',
              }}
            />
            <Stack.Screen 
              name="Settings" 
              component={SettingsScreen}
              options={{
                title: 'Settings',
                presentation: 'modal',
              }}
            />
            <Stack.Screen 
              name="QRScanner" 
              component={QRScannerScreen}
              options={{
                title: 'Scan QR Code',
                presentation: 'modal',
              }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = {
  badgeContainer: {
    position: 'absolute',
    top: -4,
    right: -4,
  },
};

export default AppNavigator; 