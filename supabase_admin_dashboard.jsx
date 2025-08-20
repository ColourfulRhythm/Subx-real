import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const SupabaseAdminDashboard = () => {
  const [stats, setStats] = useState({
    total_users: 0,
    total_projects: 0,
    total_ownerships: 0,
    total_referral_codes: 0,
    pending_verifications: 0,
    total_portfolio_value: 0
  });
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [analytics, setAnalytics] = useState([]);
  const [verifications, setVerifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      
      // Fetch all data in parallel
      const [statsData, usersData, projectsData, analyticsData, verificationsData] = await Promise.all([
        supabase.rpc('get_admin_dashboard_stats'),
        supabase.rpc('get_admin_users_list'),
        supabase.rpc('get_admin_projects_list'),
        supabase.rpc('get_admin_analytics'),
        supabase.rpc('get_admin_verifications')
      ]);

      if (statsData.data) setStats(statsData.data[0]);
      if (usersData.data) setUsers(usersData.data);
      if (projectsData.data) setProjects(projectsData.data);
      if (analyticsData.data) setAnalytics(analyticsData.data);
      if (verificationsData.data) setVerifications(verificationsData.data);

    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const verifyUser = async (userEmail) => {
    try {
      const { data, error } = await supabase.rpc('admin_verify_user', { user_email: userEmail });
      if (error) throw error;
      
      if (data) {
        // Refresh data
        fetchAdminData();
        alert('User verified successfully!');
      }
    } catch (error) {
      console.error('Error verifying user:', error);
      alert('Failed to verify user');
    }
  };

  const suspendUser = async (userEmail) => {
    try {
      const { data, error } = await supabase.rpc('admin_suspend_user', { user_email: userEmail });
      if (error) throw error;
      
      if (data) {
        // Refresh data
        fetchAdminData();
        alert('User suspended successfully!');
      }
    } catch (error) {
      console.error('Error suspending user:', error);
      alert('Failed to suspend user');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl">Loading Admin Dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">Complete platform management system</p>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-6">
          <nav className="flex space-x-8">
            {['overview', 'users', 'projects', 'analytics', 'verifications'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-2 px-1 border-b-2 font-medium text-sm capitalize ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="bg-white shadow rounded-lg p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-blue-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-blue-900">Total Users</h3>
                <p className="text-3xl font-bold text-blue-600">{stats.total_users}</p>
              </div>
              <div className="bg-green-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-green-900">Total Projects</h3>
                <p className="text-3xl font-bold text-green-600">{stats.total_projects}</p>
              </div>
              <div className="bg-purple-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-purple-900">Total Land Sold</h3>
                <p className="text-3xl font-bold text-purple-600">{stats.total_ownerships} plots</p>
              </div>
              <div className="bg-yellow-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-yellow-900">Referral Users</h3>
                <p className="text-3xl font-bold text-yellow-600">{stats.total_referral_codes}</p>
              </div>
              <div className="bg-red-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-red-900">Pending Verifications</h3>
                <p className="text-3xl font-bold text-red-600">{stats.pending_verifications}</p>
              </div>
              <div className="bg-indigo-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-indigo-900">Total Revenue</h3>
                <p className="text-3xl font-bold text-indigo-600">₦{stats.total_portfolio_value?.toLocaleString()}</p>
              </div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">User Management</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Referral Code</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Land Owned</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Portfolio Value</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user.user_id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.referral_code || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.total_land_owned} sqm</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₦{user.total_portfolio_value?.toLocaleString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            user.is_verified ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {user.is_verified ? 'Verified' : 'Pending'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {user.is_verified ? (
                            <button
                              onClick={() => suspendUser(user.email)}
                              className="text-red-600 hover:text-red-900 mr-2"
                            >
                              Suspend
                            </button>
                          ) : (
                            <button
                              onClick={() => verifyUser(user.email)}
                              className="text-green-600 hover:text-green-900 mr-2"
                            >
                              Verify
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Projects Tab */}
          {activeTab === 'projects' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Project Management</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price/SQM</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Available</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Owners</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {projects.map((project) => (
                      <tr key={project.project_id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{project.title}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{project.location}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₦{project.price_per_sqm?.toLocaleString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{project.available_sqm} sqm</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{project.total_owners}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₦{project.total_revenue?.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Platform Analytics</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {analytics.map((metric, index) => (
                  <div key={index} className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-900">{metric.metric_name}</h3>
                    <p className="text-3xl font-bold text-blue-600">{metric.metric_value}</p>
                    <p className="text-sm text-gray-600 mt-2">{metric.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Verifications Tab */}
          {activeTab === 'verifications' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Pending Verifications</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Referral Code</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Wallet Balance</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {verifications.map((user) => (
                      <tr key={user.user_id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.referral_code || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₦{user.wallet_balance?.toLocaleString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(user.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => verifyUser(user.email)}
                            className="text-green-600 hover:text-green-900 mr-2"
                          >
                            Verify
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SupabaseAdminDashboard;
