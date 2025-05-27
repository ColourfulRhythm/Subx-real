import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Image, Dimensions } from 'react-native';
import { Text, Button, Card, Icon } from 'react-native-elements';
import api from '../services/api';

const { width } = Dimensions.get('window');
const cardWidth = (width - 48) / 2; // 2 columns with padding

const DeveloperProfileScreen = () => {
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({
    projects: 0,
    followers: 0,
    following: 0,
    totalEarned: 0
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/developer/profile');
      setProfile(response.data);
      // Mock stats for now
      setStats({
        projects: 12,
        followers: 234,
        following: 45,
        totalEarned: 5.4
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
        <Text style={styles.bio}>{profile.bio || 'Web3 Developer'}</Text>
        
        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.projects}</Text>
            <Text style={styles.statLabel}>Projects</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.followers}</Text>
            <Text style={styles.statLabel}>Followers</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.following}</Text>
            <Text style={styles.statLabel}>Following</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.totalEarned} ETH</Text>
            <Text style={styles.statLabel}>Earned</Text>
          </View>
        </View>
      </View>

      {/* Skills Section */}
      <View style={styles.section}>
        <Text h4 style={styles.sectionTitle}>Skills</Text>
        <View style={styles.skillsContainer}>
          {profile.skills?.map((skill, index) => (
            <View key={index} style={styles.skillChip}>
              <Text style={styles.skillText}>{skill}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Recent Projects Grid */}
      <View style={styles.section}>
        <Text h4 style={styles.sectionTitle}>Recent Projects</Text>
        <View style={styles.projectsGrid}>
          {profile.recentProjects?.map((project, index) => (
            <Card key={index} containerStyle={[styles.projectCard, { width: cardWidth }]}>
              <Card.Image source={{ uri: project.imageUrl }} style={styles.projectImage} />
              <Text style={styles.projectTitle}>{project.title}</Text>
              <Text style={styles.projectDescription}>{project.description}</Text>
              <View style={styles.projectStats}>
                <Icon name="star" type="font-awesome" size={12} color="#FFD700" />
                <Text style={styles.projectStat}>{project.rating}</Text>
                <Icon name="users" type="font-awesome" size={12} color="#666" />
                <Text style={styles.projectStat}>{project.contributors}</Text>
              </View>
            </Card>
          ))}
        </View>
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
  statsGrid: {
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
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  skillChip: {
    backgroundColor: '#2A2A2A',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  skillText: {
    color: '#FFFFFF',
    fontSize: 12,
  },
  projectsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
  },
  projectCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 15,
    padding: 0,
    margin: 0,
    borderWidth: 0,
  },
  projectImage: {
    height: 120,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  projectTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
    marginHorizontal: 10,
  },
  projectDescription: {
    color: '#888888',
    fontSize: 12,
    marginHorizontal: 10,
    marginTop: 5,
  },
  projectStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    marginHorizontal: 10,
    marginBottom: 10,
  },
  projectStat: {
    color: '#888888',
    fontSize: 12,
    marginLeft: 5,
    marginRight: 10,
  },
});

export default DeveloperProfileScreen; 