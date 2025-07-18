import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as adminApi from '../api/admin';

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('adminToken'));
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await adminApi.login(email, password);
      const { token, admin } = res.data;
      localStorage.setItem('adminToken', token);
      setUser(admin);
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