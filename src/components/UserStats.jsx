import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const UserStats = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    recentUsers: [],
    loading: true,
    error: null
  });

  const API_BASE_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:30001/api' 
    : 'https://subx-real-bm3l6a3z9-colourfulrhythms-projects.vercel.app/api';

  useEffect(() => {
    fetchUserStats();
  }, []);

  const fetchUserStats = async () => {
    try {
      setStats(prev => ({ ...prev, loading: true }));
      
      // Fetch total user count
      const countResponse = await fetch(`${API_BASE_URL}/users/count`);
      const countData = await countResponse.json();
      
      // Fetch recent users
      const usersResponse = await fetch(`${API_BASE_URL}/users`);
      const usersData = await usersResponse.json();
      
      setStats({
        totalUsers: countData.totalUsers,
        recentUsers: usersData.slice(0, 10), // Show last 10 users
        loading: false,
        error: null
      });
    } catch (error) {
      console.error('Error fetching user stats:', error);
      setStats(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to load user statistics'
      }));
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (stats.loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (stats.error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">{stats.error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Total Users Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg"
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Total Registered Users
            </h3>
            <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
              {stats.totalUsers.toLocaleString()}
            </p>
          </div>
          <div className="bg-indigo-100 dark:bg-indigo-900 p-3 rounded-full">
            <svg className="h-8 w-8 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
          </div>
        </div>
      </motion.div>

      {/* Recent Users */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Recent Registrations
          </h3>
          <button
            onClick={fetchUserStats}
            className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>

        {stats.recentUsers.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">
            No users registered yet
          </p>
        ) : (
          <div className="space-y-3">
            {stats.recentUsers.map((user, index) => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className="bg-indigo-100 dark:bg-indigo-900 p-2 rounded-full">
                    <svg className="h-5 w-5 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {user.name}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {user.email}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(user.createdAt)}
                  </p>
                  {user.investmentInterests && (
                    <p className="text-xs text-indigo-600 dark:text-indigo-400">
                      {user.investmentInterests}
                    </p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Email List Export */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Email Management
        </h3>
        <div className="space-y-3">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            You have <span className="font-semibold">{stats.totalUsers}</span> user emails for notifications
          </p>
          <div className="flex space-x-3">
            <button
              onClick={() => {
                const emails = stats.recentUsers.map(user => user.email).join(', ');
                navigator.clipboard.writeText(emails);
                alert('Email list copied to clipboard!');
              }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Copy Recent Emails
            </button>
            <button
              onClick={() => {
                const allEmails = stats.recentUsers.map(user => user.email).join('\n');
                const blob = new Blob([allEmails], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'subx-users-emails.txt';
                a.click();
                URL.revokeObjectURL(url);
              }}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Download Email List
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default UserStats; 