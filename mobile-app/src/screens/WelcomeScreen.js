import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions, Animated, Easing } from 'react-native';
import { Text, Button } from 'react-native-elements';
import LottieView from 'lottie-react-native';

const { width, height } = Dimensions.get('window');

const WelcomeScreen = ({ navigation }) => {
  const fadeAnim = new Animated.Value(0);
  const scaleAnim = new Animated.Value(0.8);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 1000,
        easing: Easing.elastic(1),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <View style={styles.animationContainer}>
          <LottieView
            source={require('../assets/animations/fist-bump.json')}
            autoPlay
            loop
            style={styles.animation}
          />
        </View>
        
        <Text h1 style={styles.title}>Subx</Text>
        <Text style={styles.subtitle}>Where Developers Meet Investors</Text>
        
        <View style={styles.buttonContainer}>
          <Button
            title="Get Started"
            onPress={() => navigation.navigate('Login')}
            buttonStyle={styles.button}
            titleStyle={styles.buttonText}
            containerStyle={styles.buttonWrapper}
          />
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    padding: 20,
  },
  animationContainer: {
    width: width * 0.8,
    height: width * 0.8,
    marginBottom: 40,
  },
  animation: {
    width: '100%',
    height: '100%',
  },
  title: {
    color: '#00FF9D',
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    color: '#FFFFFF',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 40,
    opacity: 0.8,
  },
  buttonContainer: {
    width: '100%',
    paddingHorizontal: 20,
  },
  buttonWrapper: {
    marginTop: 20,
  },
  button: {
    backgroundColor: '#00FF9D',
    borderRadius: 12,
    paddingVertical: 15,
  },
  buttonText: {
    color: '#000000',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default WelcomeScreen; 