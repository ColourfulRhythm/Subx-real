import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';

const AuthStatus = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div className="text-sm text-gray-500">Checking auth status...</div>;
  }

  if (!user) {
    return (
      <div className="text-sm text-red-500">
        Not authenticated
      </div>
    );
  }

  return (
    <div className="text-sm text-green-500">
      ✅ Authenticated as: {user.email}
      <br />
      <span className="text-xs text-gray-500">
        UID: {user.uid}
      </span>
    </div>
  );
};

export default AuthStatus; 