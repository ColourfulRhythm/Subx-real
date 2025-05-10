// Utility function to find available backend port
export const findBackendPort = async () => {
  // Try port 3001 first since we know it's being used
  try {
    const response = await fetch('http://localhost:3001/api/health');
    if (response.ok) {
      return 3001;
    }
  } catch (error) {
    console.log('Port 3001 not available, trying other ports...');
  }

  // Fallback to trying other ports
  for (let port = 3000; port <= 3005; port++) {
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
  const port = await findBackendPort();
  cachedBackendUrl = `http://localhost:${port}`;
  return cachedBackendUrl;
};

// Utility function to make API calls
export const apiCall = async (endpoint, options = {}) => {
  try {
    const baseUrl = await getBackendUrl();
    console.log('Making API call to:', `${baseUrl}${endpoint}`);
    
    const response = await fetch(`${baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(error.message || `API call failed: ${response.statusText}`);
    }
    
    return response.json();
  } catch (error) {
    console.error('API call error:', error);
    throw error;
  }
}; 