import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabase';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  async function signup(email, password, userData = {}) {
    try {
      console.log('Starting user registration for:', email);
      
      // Step 1: Create Supabase auth user
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData,
          emailRedirectTo: `${window.location.origin}/login`
        }
      });
      
      if (error) {
        console.error('Supabase auth signup error:', error);
        throw error;
      }
      
      console.log('Supabase auth user created:', data.user?.id);
      
      // Step 2: Create user in our users table (NEW SCHEMA)
      if (data.user) {
        try {
          // Generate referral code
          const referralCode = 'SUBX-' + Math.random().toString(36).substr(2, 5).toUpperCase();
          
          // Insert into new users table
          const { error: userError } = await supabase
            .from('users_new')
            .insert({
              id: data.user.id,
              name: userData.full_name || userData.name || email.split('@')[0],
              email: email,
              phone: userData.phone || null,
              referral_code: referralCode,
              referred_by: userData.referral_code ? 
                (await getUserIdByReferralCode(userData.referral_code)) : null
            });
          
          if (userError) {
            console.error('Error creating user in users_new table:', userError);
            throw userError;
          }
          
          console.log('User created in users_new table with referral code:', referralCode);
          
          // Step 3: Also create in user_profiles for backward compatibility
          try {
            const { error: profileError } = await supabase
              .from('user_profiles')
              .insert({
                id: data.user.id,
                full_name: userData.full_name || userData.name || email.split('@')[0],
                email: email,
                phone: userData.phone || null,
                referral_code: referralCode,
                created_at: new Date().toISOString()
              });
            
            if (profileError) {
              console.warn('User profile creation warning (backward compatibility):', profileError);
            } else {
              console.log('User profile created for backward compatibility');
            }
          } catch (profileError) {
            console.warn('Failed to create user profile (backward compatibility):', profileError);
          }
          
        } catch (userTableError) {
          console.error('Critical error creating user in database:', userTableError);
          // If we can't create the user in our tables, we should clean up the auth user
          try {
            await supabase.auth.admin.deleteUser(data.user.id);
          } catch (cleanupError) {
            console.error('Failed to cleanup auth user after database error:', cleanupError);
          }
          throw new Error('Failed to create user profile. Please try again.');
        }
      }
      
      console.log('User registration completed successfully');
      return data;
      
    } catch (error) {
      console.error('User registration failed:', error);
      throw error;
    }
  }

  async function login(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      return data;
    } catch (error) {
      throw error;
    }
  }

  async function logout() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { success: true };
    } catch (error) {
      throw error;
    }
  }

  async function resetPassword(email) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
      return { success: true };
    } catch (error) {
      throw error;
    }
  }

  // Google authentication removed for now

  // Helper function to get user ID by referral code
  async function getUserIdByReferralCode(referralCode) {
    try {
      // Try new schema first
      const { data: newUser, error: newError } = await supabase
        .from('users_new')
        .select('id')
        .eq('referral_code', referralCode)
        .single();
      
      if (!newError && newUser) {
        return newUser.id;
      }
      
      // Fallback to old schema
      const { data: oldUser, error: oldError } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('referral_code', referralCode)
        .single();
      
      if (!oldError && oldUser) {
        return oldUser.id;
      }
      
      return null;
    } catch (error) {
      console.warn('Error getting user ID by referral code:', error);
      return null;
    }
  }

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setCurrentUser(session?.user || null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setCurrentUser(session?.user || null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const value = {
    currentUser,
    signup,
    login,
    logout,
    resetPassword
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
} 