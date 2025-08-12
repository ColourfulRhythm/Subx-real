import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Dimensions
} from 'react-native';
import { Card, Button, Icon, Divider } from '@rneui/themed';
import { useAuth } from '../contexts/AuthContext';
import { fetchUserData, fetchUserProperties, updateUserProfile } from '../services/api';
import { signOutUser } from '../services/firebase';

const { width } = Dimensions.get('window');

const UserDashboardScreen = ({ navigation }) => {
  const { user, userData, setUserData } = useAuth();
  const [userProperties, setUserProperties] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  const loadUserData = async () => {
    try {
      const userIdentifier = user.email || user.uid;
      const [userDataResponse, propertiesResponse] = await Promise.all([
        fetchUserData(userIdentifier),
        fetchUserProperties(userIdentifier)
      ]);
      
      setUserData(userDataResponse);
      setUserProperties(propertiesResponse);
    } catch (error) {
      console.error('Failed to load user data:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadUserData();
    setRefreshing(false);
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOutUser();
              navigation.replace('Login');
            } catch (error) {
              Alert.alert('Error', 'Failed to logout');
            }
          }
        }
      ]
    );
  };

  const handleInvestment = (property) => {
    navigation.navigate('PropertyDetails', { property });
  };

  const handleViewDocuments = (property) => {
    navigation.navigate('Documents', { property });
  };

  const handleProfileEdit = () => {
    navigation.navigate('ProfileEdit');
  };

  const renderPortfolioCard = () => (
    <Card containerStyle={styles.portfolioCard}>
      <View style={styles.portfolioHeader}>
        <Icon name="account-balance-wallet" size={30} color="#007AFF" />
        <Text h4 style={styles.portfolioTitle}>Portfolio Overview</Text>
      </View>
      
      <View style={styles.portfolioStats}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{userData?.portfolioValue || '₦0'}</Text>
          <Text style={styles.statLabel}>Total Value</Text>
        </View>
        
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{userData?.totalLandOwned || '0 sqm'}</Text>
          <Text style={styles.statLabel}>Land Owned</Text>
        </View>
        
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{userData?.totalInvestments || 0}</Text>
          <Text style={styles.statLabel}>Investments</Text>
        </View>
      </View>
    </Card>
  );

  const renderRecentActivity = () => (
    <Card containerStyle={styles.activityCard}>
      <View style={styles.cardHeader}>
        <Icon name="history" size={24} color="#007AFF" />
        <Text h4 style={styles.cardTitle}>Recent Activity</Text>
      </View>
      
      {userData?.recentActivity?.length > 0 ? (
        userData.recentActivity.map((activity, index) => (
          <View key={index} style={styles.activityItem}>
            <View style={styles.activityIcon}>
              <Icon name="trending-up" size={20} color="#4CAF50" />
            </View>
            <View style={styles.activityContent}>
              <Text style={styles.activityTitle}>{activity.title}</Text>
              <Text style={styles.activityAmount}>{activity.amount}</Text>
              <Text style={styles.activityDate}>{activity.date}</Text>
            </View>
          </View>
        ))
      ) : (
        <Text style={styles.noActivity}>No recent activity</Text>
      )}
    </Card>
  );

  const renderProperties = () => (
    <Card containerStyle={styles.propertiesCard}>
      <View style={styles.cardHeader}>
        <Icon name="home" size={24} color="#007AFF" />
        <Text h4 style={styles.cardTitle}>My Properties</Text>
      </View>
      
      {userProperties.length > 0 ? (
        userProperties.map((property, index) => (
          <TouchableOpacity
            key={index}
            style={styles.propertyItem}
            onPress={() => handleInvestment(property)}
          >
            <View style={styles.propertyHeader}>
              <Text style={styles.propertyTitle}>{property.title}</Text>
              <Text style={styles.propertyValue}>{property.propertyValue}</Text>
            </View>
            
            <View style={styles.propertyDetails}>
              <Text style={styles.propertyLocation}>{property.location}</Text>
              <Text style={styles.propertySqm}>{property.sqm} sqm</Text>
            </View>
            
            <View style={styles.propertyActions}>
              <Button
                title="View Details"
                type="outline"
                size="sm"
                onPress={() => handleInvestment(property)}
              />
              <Button
                title="Documents"
                type="outline"
                size="sm"
                onPress={() => handleViewDocuments(property)}
              />
            </View>
          </TouchableOpacity>
        ))
      ) : (
        <Text style={styles.noProperties}>No properties yet</Text>
      )}
    </Card>
  );

  const renderQuickActions = () => (
    <Card containerStyle={styles.actionsCard}>
      <View style={styles.cardHeader}>
        <Icon name="flash-on" size={24} color="#007AFF" />
        <Text h4 style={styles.cardTitle}>Quick Actions</Text>
      </View>
      
      <View style={styles.actionsGrid}>
        <TouchableOpacity style={styles.actionItem} onPress={() => navigation.navigate('Projects')}>
          <Icon name="search" size={24} color="#007AFF" />
          <Text style={styles.actionText}>Browse Projects</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionItem} onPress={handleProfileEdit}>
          <Icon name="edit" size={24} color="#007AFF" />
          <Text style={styles.actionText}>Edit Profile</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionItem} onPress={() => navigation.navigate('Notifications')}>
          <Icon name="notifications" size={24} color="#007AFF" />
          <Text style={styles.actionText}>Notifications</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionItem} onPress={() => navigation.navigate('Settings')}>
          <Icon name="settings" size={24} color="#007AFF" />
          <Text style={styles.actionText}>Settings</Text>
        </TouchableOpacity>
      </View>
    </Card>
  );

  if (!userData) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <Icon name="account-circle" size={50} color="#007AFF" />
          <View style={styles.userText}>
            <Text h3 style={styles.userName}>{userData.name}</Text>
            <Text style={styles.userEmail}>{userData.email}</Text>
          </View>
        </View>
        
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Icon name="logout" size={24} color="#FF3B30" />
        </TouchableOpacity>
      </View>

      {/* Portfolio Card */}
      {renderPortfolioCard()}

      {/* Recent Activity */}
      {renderRecentActivity()}

      {/* Properties */}
      {renderProperties()}

      {/* Quick Actions */}
      {renderQuickActions()}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userText: {
    marginLeft: 15,
    flex: 1,
  },
  userName: {
    color: '#333',
    fontWeight: 'bold',
  },
  userEmail: {
    color: '#666',
    fontSize: 14,
  },
  logoutButton: {
    padding: 10,
  },
  portfolioCard: {
    margin: 15,
    borderRadius: 15,
    elevation: 3,
  },
  portfolioHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  portfolioTitle: {
    marginLeft: 10,
    color: '#333',
  },
  portfolioStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  activityCard: {
    margin: 15,
    borderRadius: 15,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  cardTitle: {
    marginLeft: 10,
    color: '#333',
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  activityIcon: {
    marginRight: 15,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  activityAmount: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: 'bold',
  },
  activityDate: {
    fontSize: 12,
    color: '#666',
  },
  noActivity: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
  },
  propertiesCard: {
    margin: 15,
    borderRadius: 15,
    elevation: 3,
  },
  propertyItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  propertyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  propertyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  propertyValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  propertyDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  propertyLocation: {
    fontSize: 14,
    color: '#666',
  },
  propertySqm: {
    fontSize: 14,
    color: '#666',
  },
  propertyActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  noProperties: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
  },
  actionsCard: {
    margin: 15,
    borderRadius: 15,
    elevation: 3,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionItem: {
    width: (width - 60) / 2,
    alignItems: 'center',
    padding: 15,
    marginBottom: 10,
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
  },
  actionText: {
    marginTop: 5,
    fontSize: 12,
    color: '#333',
    textAlign: 'center',
  },
});

export default UserDashboardScreen;
