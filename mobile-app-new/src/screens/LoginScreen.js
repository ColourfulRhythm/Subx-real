import React, { useState } from 'react';
import { View, StyleSheet, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Input, Button, Text, Icon } from '@rneui/themed';
import { signInUser, signUpUser } from '../services/firebase';
import { useAuth } from '../contexts/AuthContext';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const { setUserData } = useAuth();

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (isSignUp && !name) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }

    try {
      setLoading(true);
      
      let result;
      if (isSignUp) {
        result = await signUpUser(email, password, name);
      } else {
        result = await signInUser(email, password);
      }

      if (result.success) {
        // User data will be fetched by AuthContext
        Alert.alert('Success', isSignUp ? 'Account created successfully!' : 'Login successful!');
      } else {
        Alert.alert('Error', result.error);
      }
    } catch (error) {
      Alert.alert('Error', 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Icon
            name="home"
            type="material"
            size={60}
            color="#007AFF"
            style={styles.logo}
          />
          <Text h2 style={styles.title}>Subx</Text>
          <Text h4 style={styles.subtitle}>
            {isSignUp ? 'Create Account' : 'Welcome Back'}
          </Text>
        </View>

        <View style={styles.form}>
          {isSignUp && (
            <Input
              placeholder="Full Name"
              value={name}
              onChangeText={setName}
              leftIcon={<Icon name="person" size={20} color="#666" />}
              autoCapitalize="words"
            />
          )}
          
          <Input
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            leftIcon={<Icon name="email" size={20} color="#666" />}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          
          <Input
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            leftIcon={<Icon name="lock" size={20} color="#666" />}
            secureTextEntry
          />

          <Button
            title={isSignUp ? "Sign Up" : "Sign In"}
            onPress={handleAuth}
            loading={loading}
            containerStyle={styles.buttonContainer}
            buttonStyle={styles.button}
          />

          <Button
            title={isSignUp ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
            type="clear"
            onPress={() => setIsSignUp(!isSignUp)}
            titleStyle={styles.linkText}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    marginBottom: 10,
  },
  title: {
    color: '#007AFF',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  subtitle: {
    color: '#666',
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  buttonContainer: {
    marginTop: 20,
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 10,
    paddingVertical: 15,
  },
  linkText: {
    color: '#007AFF',
    fontSize: 16,
  },
});

export default LoginScreen; 