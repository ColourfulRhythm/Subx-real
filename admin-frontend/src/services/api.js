import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error.response?.data || error);
  }
);

// Admin endpoints
export const login = (email, password) => api.post('/admin/login', { email, password });

// Developer endpoints
export const getDevelopers = () => api.get('/developers');
export const createDeveloper = (developerData) => api.post('/developers/register', developerData);
export const updateDeveloper = (id, developerData) => api.put(`/developers/${id}`, developerData);
export const deleteDeveloper = (id) => api.delete(`/developers/${id}`);

// Project endpoints
export const getProjects = () => api.get('/projects');
export const createProject = (projectData) => api.post('/projects', projectData);
export const updateProject = (id, projectData) => api.put(`/projects/${id}`, projectData);
export const deleteProject = (id) => api.delete(`/projects/${id}`);

export default api; 