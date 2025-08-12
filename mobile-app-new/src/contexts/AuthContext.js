import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, onAuthStateChange } from '../services/firebase';
import { fetchUserData } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChange(async (supabaseUser) => {
      setUser(supabaseUser);
      
      if (supabaseUser) {
        try {
          // Fetch user data from backend using email
          const userIdentifier = supabaseUser.email || supabaseUser.id;
          const data = await fetchUserData(userIdentifier);
          setUserData(data);
        } catch (error) {
          console.error('Failed to fetch user data:', error);
          // Set default user data
          setUserData({
            name: supabaseUser.user_metadata?.name || supabaseUser.email || 'User',
            email: supabaseUser.email || '',
            avatar: '',
            portfolioValue: '₦0',
            totalLandOwned: '0 sqm',
            totalInvestments: 0,
            recentActivity: []
          });
        }
      } else {
        setUserData(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    user,
    userData,
    loading,
    setUserData
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
