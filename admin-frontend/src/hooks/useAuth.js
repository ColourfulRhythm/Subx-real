import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as adminApi from '../api/admin';

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('adminToken'));
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // Check if user is authenticated on mount
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      // Verify token is still valid by getting profile
      adminApi.getProfile()
        .then(res => {
          setUser(res.data.profile);
          setIsAuthenticated(true);
        })
        .catch(() => {
          // Token is invalid, clear it
          localStorage.removeItem('adminToken');
          setIsAuthenticated(false);
          setUser(null);
        });
    }
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await adminApi.login(email, password);
      const { token, user: userData } = res.data;
      localStorage.setItem('adminToken', token);
      setUser(userData);
      setIsAuthenticated(true);
      return true;
    } catch (error) {
      throw error.response?.data?.error || error.message || 'Login failed';
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('adminToken');
    setUser(null);
    setIsAuthenticated(false);
    navigate('/login');
  };

  return {
    isAuthenticated,
    loading,
    user,
    login,
    logout
  };
} 