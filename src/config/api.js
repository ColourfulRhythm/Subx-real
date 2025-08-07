// API Configuration
const isProduction = import.meta.env.PROD
const isDevelopment = import.meta.env.DEV

export const API_BASE_URL = isProduction 
  ? 'https://subxbackend-production.up.railway.app' // Railway backend URL
  : 'http://localhost:30001'

export const apiCall = async (endpoint, options = {}) => {
  const url = endpoint.startsWith('/api') 
    ? `${API_BASE_URL}${endpoint}`
    : `${API_BASE_URL}/api${endpoint}`
    
  return fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  })
}