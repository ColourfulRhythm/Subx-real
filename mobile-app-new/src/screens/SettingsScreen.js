import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { Text, Input, Button, Icon, Avatar } from 'react-native-elements';
import * as ImagePicker from 'expo-image-picker';
import api from '../services/api';

const SettingsScreen = ({ navigation }) => {
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    darkMode: true,
    language: 'en'
  });
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    email: '',
    phone: ''
  });

  useEffect(() => {
    fetchProfile();
    fetchSettings();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/profile');
      setProfile(response.data);
      setFormData({
        name: response.data.name || '',
        bio: response.data.bio || '',
        email: response.data.email || '',
        phone: response.data.phone || ''
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchSettings = async () => {
    try {
      const response = await api.get('/settings');
      setSettings(response.data);
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const handleImagePick = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        const formData = new FormData();
        formData.append('image', {
          uri: result.assets[0].uri,
          type: 'image/jpeg',
          name: 'profile.jpg',
        });

        await api.put('/profile/image', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        fetchProfile();
      }
    } catch (error) {
      console.error('Error updating profile image:', error);
    }
  };

  const handleSaveProfile = async () => {
    try {
      await api.put('/profile', formData);
      setIsEditing(false);
      fetchProfile();
    } catch (error) {
      console.error('Error saving profile:', error);
    }
  };

  const handleSaveSettings = async () => {
    try {
      await api.put('/settings', settings);
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Profile Section */}
      <View style={styles.section}>
        <View style={styles.profileHeader}>
          <TouchableOpacity onPress={handleImagePick}>
            <Avatar
              rounded
              size="large"
              source={{ uri: profile?.imageUrl }}
              containerStyle={styles.avatar}
            >
              <Avatar.Accessory size={23} />
            </Avatar>
          </TouchableOpacity>
          <View style={styles.profileInfo}>
            {isEditing ? (
              <Input
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
                placeholder="Your name"
                inputStyle={styles.input}
                containerStyle={styles.inputContainer}
              />
            ) : (
              <Text h4 style={styles.name}>{profile?.name}</Text>
            )}
            <Text style={styles.email}>{profile?.email}</Text>
          </View>
        </View>

        {isEditing ? (
          <View style={styles.editForm}>
            <Input
              value={formData.bio}
              onChangeText={(text) => setFormData({ ...formData, bio: text })}
              placeholder="Your bio"
              multiline
              inputStyle={styles.input}
              containerStyle={styles.inputContainer}
            />
            <Input
              value={formData.phone}
              onChangeText={(text) => setFormData({ ...formData, phone: text })}
              placeholder="Phone number"
              inputStyle={styles.input}
              containerStyle={styles.inputContainer}
            />
            <View style={styles.editButtons}>
              <Button
                title="Cancel"
                type="outline"
                onPress={() => setIsEditing(false)}
                buttonStyle={styles.cancelButton}
                titleStyle={styles.buttonText}
              />
              <Button
                title="Save"
                onPress={handleSaveProfile}
                buttonStyle={styles.saveButton}
                titleStyle={styles.buttonText}
              />
            </View>
          </View>
        ) : (
          <Button
            title="Edit Profile"
            type="outline"
            onPress={() => setIsEditing(true)}
            buttonStyle={styles.editButton}
            titleStyle={styles.buttonText}
          />
        )}
      </View>

      {/* Notification Settings */}
      <View style={styles.section}>
        <Text h4 style={styles.sectionTitle}>Notifications</Text>
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>Email Notifications</Text>
            <Text style={styles.settingDescription}>Receive updates via email</Text>
          </View>
          <Switch
            value={settings.emailNotifications}
            onValueChange={(value) => {
              setSettings({ ...settings, emailNotifications: value });
              handleSaveSettings();
            }}
            trackColor={{ false: '#2A2A2A', true: '#00FF9D' }}
            thumbColor="#FFFFFF"
          />
        </View>
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>Push Notifications</Text>
            <Text style={styles.settingDescription}>Receive push notifications</Text>
          </View>
          <Switch
            value={settings.pushNotifications}
            onValueChange={(value) => {
              setSettings({ ...settings, pushNotifications: value });
              handleSaveSettings();
            }}
            trackColor={{ false: '#2A2A2A', true: '#00FF9D' }}
            thumbColor="#FFFFFF"
          />
        </View>
      </View>

      {/* App Settings */}
      <View style={styles.section}>
        <Text h4 style={styles.sectionTitle}>App Settings</Text>
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>Dark Mode</Text>
            <Text style={styles.settingDescription}>Use dark theme</Text>
          </View>
          <Switch
            value={settings.darkMode}
            onValueChange={(value) => {
              setSettings({ ...settings, darkMode: value });
              handleSaveSettings();
            }}
            trackColor={{ false: '#2A2A2A', true: '#00FF9D' }}
            thumbColor="#FFFFFF"
          />
        </View>
      </View>

      {/* Logout Button */}
      <View style={styles.section}>
        <Button
          title="Logout"
          onPress={handleLogout}
          buttonStyle={styles.logoutButton}
          titleStyle={styles.logoutButtonText}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A2A',
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    backgroundColor: '#2A2A2A',
  },
  profileInfo: {
    marginLeft: 20,
    flex: 1,
  },
  name: {
    color: '#FFFFFF',
    marginBottom: 5,
  },
  email: {
    color: '#888888',
    fontSize: 14,
  },
  editForm: {
    marginTop: 20,
  },
  input: {
    color: '#FFFFFF',
  },
  inputContainer: {
    paddingHorizontal: 0,
  },
  editButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 20,
  },
  editButton: {
    borderColor: '#00FF9D',
    borderWidth: 1,
    borderRadius: 8,
  },
  cancelButton: {
    borderColor: '#666666',
    borderWidth: 1,
    borderRadius: 8,
    marginRight: 10,
  },
  saveButton: {
    backgroundColor: '#00FF9D',
    borderRadius: 8,
  },
  buttonText: {
    color: '#FFFFFF',
  },
  sectionTitle: {
    color: '#FFFFFF',
    marginBottom: 20,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 4,
  },
  settingDescription: {
    color: '#888888',
    fontSize: 14,
  },
  logoutButton: {
    backgroundColor: '#FF4444',
    borderRadius: 8,
  },
  logoutButtonText: {
    color: '#FFFFFF',
  },
});

export default SettingsScreen; 