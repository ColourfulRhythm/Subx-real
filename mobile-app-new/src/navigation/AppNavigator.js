import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Icon, Badge } from 'react-native-elements';
import api from '../services/api';

// Import screens
import WelcomeScreen from '../screens/WelcomeScreen';
import LoginScreen from '../screens/LoginScreen';
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
  const [userType, setUserType] = useState('developer'); // or 'investor'

  useEffect(() => {
    fetchUnreadCount();
    fetchUserType();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const response = await api.get('/notifications/unread/count');
      setUnreadCount(response.data.count);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const fetchUserType = async () => {
    try {
      const response = await api.get('/profile');
      setUserType(response.data.type);
    } catch (error) {
      console.error('Error fetching user type:', error);
    }
  };

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: {
          backgroundColor: '#1A1A1A',
          borderTopColor: '#2A2A2A',
          height: 60,
          paddingBottom: 8,
        },
        tabBarActiveTintColor: '#00FF9D',
        tabBarInactiveTintColor: '#888888',
        headerStyle: {
          backgroundColor: '#1A1A1A',
        },
        headerTintColor: '#FFFFFF',
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      }}
    >
      <Tab.Screen
        name="Projects"
        component={ProjectsScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <Icon name="folder" type="font-awesome" color={color} size={24} />
          ),
        }}
      />
      <Tab.Screen
        name="Forum"
        component={ForumScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <Icon name="comments" type="font-awesome" color={color} size={24} />
          ),
        }}
      />
      <Tab.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <View>
              <Icon name="bell" type="font-awesome" color={color} size={24} />
              {unreadCount > 0 && (
                <Badge
                  value={unreadCount}
                  status="success"
                  containerStyle={styles.badgeContainer}
                />
              )}
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={userType === 'developer' ? DeveloperProfileScreen : InvestorProfileScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <Icon name="user" type="font-awesome" color={color} size={24} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: '#1A1A1A',
          },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          headerBackTitleVisible: false,
          animation: 'slide_from_right',
        }}
      >
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
        <Stack.Screen 
          name="Main" 
          component={MainTabs}
          options={{ headerShown: false }}
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