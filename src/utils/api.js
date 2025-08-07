import { auth } from '../firebase';

// Utility function to find available backend port
export const findBackendPort = async () => {
  // Try port 3000 first since that's our main backend
  try {
    const response = await fetch('http://localhost:3000/api/health');
    if (response.ok) {
      return 3000;
    }
  } catch (error) {
    console.log('Port 3000 not available, trying other ports...');
  }

  // Fallback to trying other ports
  for (let port = 3001; port <= 3005; port++) {
    try {
      const response = await fetch(`http://localhost:${port}/api/health`);
      if (response.ok) {
        return port;
      }
    } catch (error) {
      continue;
    }
  }
  throw new Error('Backend server not found');
};

// Cache the backend URL to avoid multiple port checks
let cachedBackendUrl = null;

// Utility function to get backend URL
export const getBackendUrl = async () => {
  if (cachedBackendUrl) {
    return cachedBackendUrl;
  }
  
  // Use Railway URL for production
  if (import.meta.env.PROD) {
    cachedBackendUrl = 'https://subxbackend-production.up.railway.app';
    return cachedBackendUrl;
  }
  
  const port = await findBackendPort();
  cachedBackendUrl = `http://localhost:${port}`;
  return cachedBackendUrl;
};

const API_URL = import.meta.env.PROD 
  ? 'https://subxbackend-production.up.railway.app/api'
  : (import.meta.env.VITE_API_URL || 'http://localhost:30001/api');

// Utility function to make API calls
export const apiCall = async (endpoint, options = {}) => {
  try {
    const url = endpoint.startsWith('http') ? endpoint : `${API_URL}${endpoint}`;
    const defaultHeaders = {
      'Content-Type': 'application/json',
    };

    // Add Firebase ID token if user is authenticated
    const user = auth.currentUser;
    if (user) {
      const token = await user.getIdToken();
      defaultHeaders.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Something went wrong');
    }

    return data;
  } catch (error) {
    console.error('API call error:', error);
    throw error;
  }
}; 