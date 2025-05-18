import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDevelopers: 0,
    pendingApprovals: 0,
    activeSubscriptions: 0
  });
  const [pendingDevelopers, setPendingDevelopers] = useState([]);
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    fetchDashboardData();
  }, [navigate]);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, developersRes, usersRes] = await Promise.all([
        axios.get('/api/admin/stats', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }),
        axios.get('/api/admin/pending-developers', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }),
        axios.get('/api/admin/users', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
      ]);

      setStats(statsRes.data);
      setPendingDevelopers(developersRes.data);
      setUsers(usersRes.data);
    } catch (error) {
      toast.error('Failed to fetch dashboard data');
      if (error.response?.status === 401) {
        navigate('/login');
      }
    }
  };

  const handleDeveloperApproval = async (developerId, approved) => {
    try {
      await axios.post(`/api/admin/approve-developer/${developerId}`, 
        { approved },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }}
      );
      toast.success(`Developer ${approved ? 'approved' : 'rejected'} successfully`);
      fetchDashboardData();
    } catch (error) {
      toast.error('Failed to process developer approval');
    }
  };

  const handleUserStatus = async (userId, active) => {
    try {
      await axios.put(`/api/admin/users/${userId}`, 
        { active },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }}
      );
      toast.success(`User ${active ? 'activated' : 'deactivated'} successfully`);
      fetchDashboardData();
    } catch (error) {
      toast.error('Failed to update user status');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold">Admin Dashboard</h1>
            </div>
            <div className="flex items-center">
              <button
                onClick={handleLogout}
                className="ml-4 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">Total Users</dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats.totalUsers}</dd>
            </div>
          </div>
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">Total Developers</dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats.totalDevelopers}</dd>
            </div>
          </div>
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">Pending Approvals</dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats.pendingApprovals}</dd>
            </div>
          </div>
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">Active Subscriptions</dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats.activeSubscriptions}</dd>
            </div>
          </div>
        </div>

        {/* Pending Developer Approvals */}
        <div className="bg-white shadow rounded-lg mb-8">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-lg font-medium mb-4">Pending Developer Approvals</h2>
            <div className="space-y-4">
              {pendingDevelopers.map((developer) => (
                <div
                  key={developer._id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div>
                    <h3 className="text-lg font-medium">{developer.name}</h3>
                    <p className="text-sm text-gray-500">{developer.email}</p>
                    <p className="text-sm text-gray-500">Portfolio: {developer.portfolio}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleDeveloperApproval(developer._id, true)}
                      className="px-3 py-1 text-sm text-green-600 hover:text-green-800"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleDeveloperApproval(developer._id, false)}
                      className="px-3 py-1 text-sm text-red-600 hover:text-red-800"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* User Management */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-lg font-medium mb-4">User Management</h2>
            <div className="space-y-4">
              {users.map((user) => (
                <div
                  key={user._id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div>
                    <h3 className="text-lg font-medium">{user.name}</h3>
                    <p className="text-sm text-gray-500">{user.email}</p>
                    <p className="text-sm text-gray-500">
                      Role: {user.role}
                    </p>
                    <p className="text-sm text-gray-500">
                      Status: {user.active ? 'Active' : 'Inactive'}
                    </p>
                  </div>
                  <button
                    onClick={() => handleUserStatus(user._id, !user.active)}
                    className={`px-3 py-1 text-sm ${
                      user.active
                        ? 'text-red-600 hover:text-red-800'
                        : 'text-green-600 hover:text-green-800'
                    }`}
                  >
                    {user.active ? 'Deactivate' : 'Activate'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default AdminDashboard; 