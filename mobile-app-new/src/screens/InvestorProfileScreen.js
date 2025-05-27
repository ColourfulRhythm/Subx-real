import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Image, Dimensions } from 'react-native';
import { Text, Card, Icon, Button } from 'react-native-elements';
import api from '../services/api';

const { width } = Dimensions.get('window');
const cardWidth = (width - 48) / 2;

const InvestorProfileScreen = () => {
  const [profile, setProfile] = useState(null);
  const [portfolio, setPortfolio] = useState({
    totalInvested: 0,
    activeInvestments: 0,
    completedProjects: 0,
    roi: 0
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/investor/profile');
      setProfile(response.data);
      // Mock portfolio data
      setPortfolio({
        totalInvested: 25.4,
        activeInvestments: 8,
        completedProjects: 12,
        roi: 156
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  if (!profile) return null;

  return (
    <ScrollView style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <Image
          source={{ uri: profile.imageUrl || 'https://via.placeholder.com/150' }}
          style={styles.profileImage}
        />
        <Text h4 style={styles.name}>{profile.name}</Text>
        <Text style={styles.bio}>{profile.bio || 'Web3 Investor'}</Text>
        
        {/* Portfolio Stats */}
        <View style={styles.portfolioStats}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{portfolio.totalInvested} ETH</Text>
            <Text style={styles.statLabel}>Total Invested</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{portfolio.activeInvestments}</Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{portfolio.completedProjects}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{portfolio.roi}%</Text>
            <Text style={styles.statLabel}>ROI</Text>
          </View>
        </View>
      </View>

      {/* Investment Preferences */}
      <View style={styles.section}>
        <Text h4 style={styles.sectionTitle}>Investment Preferences</Text>
        <View style={styles.preferencesContainer}>
          {profile.preferences?.map((pref, index) => (
            <View key={index} style={styles.preferenceChip}>
              <Icon name={pref.icon} type="font-awesome" size={12} color="#00FF9D" />
              <Text style={styles.preferenceText}>{pref.name}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Active Investments Grid */}
      <View style={styles.section}>
        <Text h4 style={styles.sectionTitle}>Active Investments</Text>
        <View style={styles.investmentsGrid}>
          {profile.activeInvestments?.map((investment, index) => (
            <Card key={index} containerStyle={[styles.investmentCard, { width: cardWidth }]}>
              <Card.Image source={{ uri: investment.projectImage }} style={styles.investmentImage} />
              <Text style={styles.investmentTitle}>{investment.projectName}</Text>
              <View style={styles.investmentDetails}>
                <View style={styles.investmentStat}>
                  <Icon name="ethereum" type="font-awesome" size={12} color="#00FF9D" />
                  <Text style={styles.investmentValue}>{investment.amount} ETH</Text>
                </View>
                <View style={styles.investmentStat}>
                  <Icon name="chart-line" type="font-awesome" size={12} color="#00FF9D" />
                  <Text style={styles.investmentValue}>{investment.roi}%</Text>
                </View>
              </View>
              <View style={styles.progressBar}>
                <View style={[styles.progress, { width: `${investment.progress}%` }]} />
              </View>
              <Text style={styles.progressText}>{investment.progress}% Complete</Text>
            </Card>
          ))}
        </View>
      </View>

      {/* Portfolio Performance */}
      <View style={styles.section}>
        <Text h4 style={styles.sectionTitle}>Portfolio Performance</Text>
        <Card containerStyle={styles.performanceCard}>
          <View style={styles.performanceHeader}>
            <Text style={styles.performanceTitle}>Total Value</Text>
            <Text style={styles.performanceValue}>{portfolio.totalInvested} ETH</Text>
          </View>
          <View style={styles.performanceChart}>
            {/* Add chart component here */}
            <Text style={styles.chartPlaceholder}>Performance Chart</Text>
          </View>
        </Card>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  header: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 15,
  },
  name: {
    color: '#FFFFFF',
    marginBottom: 5,
  },
  bio: {
    color: '#888888',
    textAlign: 'center',
    marginBottom: 20,
  },
  portfolioStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 10,
  },
  statItem: {
    width: '25%',
    alignItems: 'center',
    padding: 10,
  },
  statValue: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  statLabel: {
    color: '#888888',
    fontSize: 12,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    color: '#FFFFFF',
    marginBottom: 15,
  },
  preferencesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  preferenceChip: {
    backgroundColor: '#2A2A2A',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  preferenceText: {
    color: '#FFFFFF',
    fontSize: 12,
  },
  investmentsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
  },
  investmentCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 15,
    padding: 0,
    margin: 0,
    borderWidth: 0,
  },
  investmentImage: {
    height: 120,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  investmentTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
    marginHorizontal: 10,
  },
  investmentDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 10,
    marginTop: 10,
  },
  investmentStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  investmentValue: {
    color: '#00FF9D',
    fontSize: 14,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#2A2A2A',
    borderRadius: 2,
    marginTop: 15,
    marginHorizontal: 10,
  },
  progress: {
    height: '100%',
    backgroundColor: '#00FF9D',
    borderRadius: 2,
  },
  progressText: {
    color: '#888888',
    fontSize: 12,
    marginTop: 5,
    marginHorizontal: 10,
    marginBottom: 10,
  },
  performanceCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 15,
    padding: 15,
    margin: 0,
    borderWidth: 0,
  },
  performanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  performanceTitle: {
    color: '#888888',
    fontSize: 14,
  },
  performanceValue: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  performanceChart: {
    height: 200,
    backgroundColor: '#2A2A2A',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chartPlaceholder: {
    color: '#888888',
  },
});

export default InvestorProfileScreen; 