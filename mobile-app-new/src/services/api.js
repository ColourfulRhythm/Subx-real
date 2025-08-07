import axios from 'axios';

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
    // Add any auth headers here if needed
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api; 