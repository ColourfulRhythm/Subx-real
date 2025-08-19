import axios from 'axios';

const API_BASE = '/api/admin';

// Set up axios instance with token
const getAuthHeaders = () => {
  const token = localStorage.getItem('adminToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const login = (email, password) =>
  axios.post(`${API_BASE}/login`, { email, password });

export const getProfile = () =>
  axios.get(`${API_BASE}/profile`, { headers: getAuthHeaders() });

export const getStats = () =>
  axios.get(`${API_BASE}/stats`, { headers: getAuthHeaders() });

export const getRecentProjects = () =>
  axios.get(`${API_BASE}/recent-projects`, { headers: getAuthHeaders() });

export const getRecentInvestments = () =>
  axios.get(`${API_BASE}/recent-investments`, { headers: getAuthHeaders() });

export const getPendingVerifications = () =>
  axios.get('/api/verification/admin/pending', { headers: getAuthHeaders() });

export const getUsers = () =>
  axios.get(`${API_BASE}/users`, { headers: getAuthHeaders() });

export const updateUserStatus = (userId, isActive) =>
  axios.patch(`${API_BASE}/users/${userId}/status`, { isActive }, { headers: getAuthHeaders() });

export const createUser = (userData) =>
  axios.post(`${API_BASE}/users`, userData, { headers: getAuthHeaders() });

export const getConnections = () =>
  axios.get(`${API_BASE}/connections`, { headers: getAuthHeaders() });

export const getDocuments = () =>
  axios.get(`${API_BASE}/documents`, { headers: getAuthHeaders() });

export const getMessages = (userId) =>
  axios.get(`${API_BASE}/messages`, { headers: getAuthHeaders(), params: userId ? { userId } : {} });

export const sendMessage = (recipientId, content) =>
  axios.post(`${API_BASE}/messages`, { recipientId, content }, { headers: getAuthHeaders() });

export const getProjects = () =>
  axios.get(`${API_BASE}/projects`, { headers: getAuthHeaders() });

export const verifyPaystack = (reference) =>
  axios.get(`${API_BASE}/paystack/verify/${reference}`, { headers: getAuthHeaders() });

export const createProject = (formData) =>
  axios.post(`${API_BASE}/projects`, formData, { headers: { ...getAuthHeaders(), 'Content-Type': 'multipart/form-data' } });

export const updateProject = (id, formData) =>
  axios.put(`${API_BASE}/projects/${id}`, formData, { headers: { ...getAuthHeaders(), 'Content-Type': 'multipart/form-data' } });

export const deleteProject = (id) =>
  axios.delete(`${API_BASE}/projects/${id}`, { headers: getAuthHeaders() });

export const uploadDocument = (formData) =>
  axios.post(`${API_BASE}/documents`, formData, { headers: { ...getAuthHeaders(), 'Content-Type': 'multipart/form-data' } });

export const sendDocumentToUser = (docId, userId) =>
  axios.post(`${API_BASE}/documents/${docId}/send`, { userId }, { headers: getAuthHeaders() });

export const deleteDocument = (docId) =>
  axios.delete(`${API_BASE}/documents/${docId}`, { headers: getAuthHeaders() });

// Add more as needed for create/update/delete, etc. 