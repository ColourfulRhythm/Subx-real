import axios from 'axios';
import { auth } from './firebase';

const API_URL = __DEV__ 
  ? 'http://localhost:30001/api'
  : 'https://subxbackend-production.up.railway.app/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  async (config) => {
    const user = auth.currentUser;
    if (user) {
      const token = await user.getIdToken();
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// User data functions
export const fetchUserData = async (userId) => {
  try {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch user data:', error);
    throw error;
  }
};

export const updateUserProfile = async (userId, profileData) => {
  try {
    const response = await api.put(`/users/${userId}`, profileData);
    return response.data;
  } catch (error) {
    console.error('Failed to update user profile:', error);
    throw error;
  }
};

export const fetchUserProperties = async (userId) => {
  try {
    const response = await api.get(`/users/${userId}/properties`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch user properties:', error);
    throw error;
  }
};

// Investment functions
export const createInvestment = async (investmentData) => {
  try {
    const response = await api.post('/investments', investmentData);
    return response.data;
  } catch (error) {
    console.error('Failed to create investment:', error);
    throw error;
  }
};

// Projects functions
export const fetchProjects = async () => {
  try {
    const response = await api.get('/projects');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch projects:', error);
    throw error;
  }
};

// Paystack verification
export const verifyPaystackPayment = async (reference) => {
  try {
    const response = await api.get(`/verify-paystack/${reference}`);
    return response.data;
  } catch (error) {
    console.error('Failed to verify payment:', error);
    throw error;
  }
};

// Health check
export const checkApiHealth = async () => {
  try {
    const response = await api.get('/health');
    return response.data;
  } catch (error) {
    console.error('API health check failed:', error);
    throw error;
  }
};

export default api; 