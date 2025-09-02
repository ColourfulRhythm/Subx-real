import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function AuthTest() {
  const { currentUser, signup, login, logout, resetPassword } = useAuth();
  const [email, setEmail] = useState('test@example.com');
  const [password, setPassword] = useState('Test123!');
  const [name, setName] = useState('Test User');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      await signup(email, password, { name, user_type: 'investor' });
      setMessage('✅ Signup successful!');
    } catch (error) {
      setError('❌ Signup failed: ' + error.message);
      console.error('Signup error:', error);
    }
    setLoading(false);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      await login(email, password);
      setMessage('✅ Login successful!');
    } catch (error) {
      setError('❌ Login failed: ' + error.message);
      console.error('Login error:', error);
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    setLoading(true);
    setError('');
    setMessage('');

    try {
      await logout();
      setMessage('✅ Logout successful!');
    } catch (error) {
      setError('❌ Logout failed: ' + error.message);
      console.error('Logout error:', error);
    }
    setLoading(false);
  };

  const handleResetPassword = async () => {
    setLoading(true);
    setError('');
    setMessage('');

    try {
      await resetPassword(email);
      setMessage('✅ Password reset email sent!');
    } catch (error) {
      setError('❌ Password reset failed: ' + error.message);
      console.error('Password reset error:', error);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">🧪 Firebase Auth Test</h2>
      
      {/* Current User Status */}
      <div className="mb-6 p-4 rounded-lg bg-gray-50">
        <h3 className="font-semibold mb-2">Current User Status:</h3>
        {currentUser ? (
          <div className="text-green-600">
            <p>✅ Authenticated</p>
            <p>Email: {currentUser.email}</p>
            <p>UID: {currentUser.uid}</p>
            <p>Verified: {currentUser.emailVerified ? 'Yes' : 'No'}</p>
          </div>
        ) : (
          <p className="text-red-600">❌ Not authenticated</p>
        )}
      </div>

      {/* Messages */}
      {message && (
        <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
          {message}
        </div>
      )}
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Test Form */}
      <form className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
          <p className="mt-1 text-xs text-gray-500">
            Must contain: 6+ chars, uppercase, special character
          </p>
        </div>

        {/* Test Buttons */}
        <div className="space-y-2">
          <button
            type="button"
            onClick={handleSignup}
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Test Signup'}
          </button>

          <button
            type="button"
            onClick={handleLogin}
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Test Login'}
          </button>

          <button
            type="button"
            onClick={handleResetPassword}
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Test Password Reset'}
          </button>

          {currentUser && (
            <button
              type="button"
              onClick={handleLogout}
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
            >
              {loading ? 'Testing...' : 'Test Logout'}
            </button>
          )}
        </div>
      </form>

      {/* Instructions */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-semibold text-blue-800 mb-2">Instructions:</h4>
        <ol className="text-sm text-blue-700 space-y-1">
          <li>1. Open browser console (F12) to see detailed logs</li>
          <li>2. Test signup with a unique email</li>
          <li>3. Test login with the same credentials</li>
          <li>4. Check authentication status above</li>
          <li>5. Test logout when authenticated</li>
        </ol>
      </div>
    </div>
  );
}
