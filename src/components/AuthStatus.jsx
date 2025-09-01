import React, { useState, useEffect } from 'react';
import { auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';

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
    return (
      <div className="text-sm text-gray-500">
        Checking auth status...
      </div>
    );
  }

  if (user) {
    return (
      <div className="text-sm text-green-600">
        ✅ Authenticated as {user.email}
      </div>
    );
  }

  return (
    <div className="text-sm text-red-600">
      ❌ Not authenticated
    </div>
  );
};

export default AuthStatus; 