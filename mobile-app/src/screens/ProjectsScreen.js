import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Image, Dimensions, TouchableOpacity } from 'react-native';
import { Text, SearchBar, Icon } from 'react-native-elements';
import api from '../services/api';

const { width } = Dimensions.get('window');
const GRID_SPACING = 2;
const GRID_COLUMNS = 2;
const ITEM_WIDTH = (width - (GRID_COLUMNS + 1) * GRID_SPACING) / GRID_COLUMNS;

const ProjectsScreen = ({ navigation }) => {
  const [projects, setProjects] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await api.get('/projects');
      setProjects(response.data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const categories = ['All', 'DeFi', 'NFT', 'GameFi', 'Infrastructure', 'Social'];

  const renderProjectCard = (project, index) => {
    const isLarge = index % 5 === 0; // Every 5th item is large
    const cardStyle = isLarge ? styles.largeCard : styles.smallCard;

    return (
      <TouchableOpacity
        key={project.id}
        style={[styles.card, cardStyle]}
        onPress={() => navigation.navigate('ProjectDetails', { project })}
      >
        <Image source={{ uri: project.imageUrl }} style={styles.projectImage} />
        <View style={styles.cardOverlay}>
          <View style={styles.cardHeader}>
            <View style={styles.categoryTag}>
              <Text style={styles.categoryText}>{project.category}</Text>
            </View>
            <Icon
              name="bookmark-o"
              type="font-awesome"
              size={20}
              color="#FFFFFF"
              containerStyle={styles.bookmarkIcon}
            />
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.projectTitle} numberOfLines={2}>
              {project.title}
            </Text>
            <Text style={styles.projectDescription} numberOfLines={2}>
              {project.description}
            </Text>
            <View style={styles.projectStats}>
              <View style={styles.stat}>
                <Icon name="ethereum" type="font-awesome" size={12} color="#00FF9D" />
                <Text style={styles.statText}>{project.fundingGoal} ETH</Text>
              </View>
              <View style={styles.stat}>
                <Icon name="users" type="font-awesome" size={12} color="#FFFFFF" />
                <Text style={styles.statText}>{project.backers}</Text>
              </View>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <SearchBar
        placeholder="Search projects..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        containerStyle={styles.searchContainer}
        inputContainerStyle={styles.searchInputContainer}
        round
        lightTheme
        darkTheme
      />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesContainer}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryButton,
              selectedCategory === category && styles.selectedCategory,
            ]}
            onPress={() => setSelectedCategory(category)}
          >
            <Text
              style={[
                styles.categoryButtonText,
                selectedCategory === category && styles.selectedCategoryText,
              ]}
            >
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView style={styles.projectsContainer}>
        <View style={styles.grid}>
          {projects.map((project, index) => renderProjectCard(project, index))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  searchContainer: {
    backgroundColor: 'transparent',
    borderTopWidth: 0,
    borderBottomWidth: 0,
    paddingHorizontal: 10,
  },
  searchInputContainer: {
    backgroundColor: '#1A1A1A',
  },
  categoriesContainer: {
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  categoryButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    marginRight: 10,
    borderRadius: 20,
    backgroundColor: '#1A1A1A',
  },
  selectedCategory: {
    backgroundColor: '#00FF9D',
  },
  categoryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  selectedCategoryText: {
    color: '#000000',
  },
  projectsContainer: {
    flex: 1,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: GRID_SPACING,
  },
  card: {
    margin: GRID_SPACING,
    borderRadius: 15,
    overflow: 'hidden',
    backgroundColor: '#1A1A1A',
  },
  smallCard: {
    width: ITEM_WIDTH,
    height: ITEM_WIDTH,
  },
  largeCard: {
    width: ITEM_WIDTH * 2 + GRID_SPACING,
    height: ITEM_WIDTH,
  },
  projectImage: {
    width: '100%',
    height: '100%',
  },
  cardOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryTag: {
    backgroundColor: 'rgba(0,255,157,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    color: '#00FF9D',
    fontSize: 12,
  },
  bookmarkIcon: {
    padding: 5,
  },
  cardContent: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    right: 10,
  },
  projectTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  projectDescription: {
    color: '#888888',
    fontSize: 12,
    marginBottom: 8,
  },
  projectStats: {
    flexDirection: 'row',
    gap: 15,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  statText: {
    color: '#FFFFFF',
    fontSize: 12,
  },
});

export default ProjectsScreen; 