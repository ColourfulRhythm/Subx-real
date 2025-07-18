import { useState, useEffect } from 'react';
import { getProfile } from '../api/admin';
import axios from 'axios';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalDevelopers: 0,
    totalInvestors: 0,
    totalProjects: 0,
    totalInvestments: 0,
    pendingVerifications: 0
  });
  const [recentProjects, setRecentProjects] = useState([]);
  const [recentInvestments, setRecentInvestments] = useState([]);
  const [pendingVerifications, setPendingVerifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    fetchDashboardData();
  }, [refreshKey]);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        setError('No authentication token found');
        setLoading(false);
        return;
      }

      const headers = { Authorization: `Bearer ${token}` };

      // Fetch all data in parallel
      const [statsRes, projectsRes, investmentsRes, verificationsRes] = await Promise.allSettled([
        axios.get('/api/admin/stats', { headers }),
        axios.get('/api/admin/recent-projects', { headers }),
        axios.get('/api/admin/recent-investments', { headers }),
        axios.get('/api/verification/admin/pending', { headers })
      ]);

      // Handle stats
      if (statsRes.status === 'fulfilled') {
        setStats(statsRes.value.data);
      } else {
        console.error('Stats error:', statsRes.reason);
      }

      // Handle recent projects
      if (projectsRes.status === 'fulfilled') {
        setRecentProjects(projectsRes.value.data);
      } else {
        console.error('Projects error:', projectsRes.reason);
      }

      // Handle recent investments
      if (investmentsRes.status === 'fulfilled') {
        setRecentInvestments(investmentsRes.value.data);
      } else {
        console.error('Investments error:', investmentsRes.reason);
      }

      // Handle pending verifications
      if (verificationsRes.status === 'fulfilled') {
        setPendingVerifications(verificationsRes.value.data);
      } else {
        console.error('Verifications error:', verificationsRes.reason);
      }

    } catch (err) {
      console.error('Dashboard error:', err);
      setError('Failed to load dashboard data. Please try refreshing the page.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center mt-8">{error}</div>;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back! Here's what's happening with your platform.</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-sm text-gray-500">Last updated</p>
            <p className="text-sm font-medium">{new Date().toLocaleString()}</p>
          </div>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
        <StatCard 
          label="Total Developers" 
          value={stats.totalDevelopers} 
          icon="👨‍💼"
          color="blue"
        />
        <StatCard 
          label="Total Investors" 
          value={stats.totalInvestors} 
          icon="💰"
          color="green"
        />
        <StatCard 
          label="Active Projects" 
          value={stats.totalProjects} 
          icon="🏗️"
          color="purple"
        />
        <StatCard 
          label="Total Investments" 
          value={stats.totalInvestments} 
          icon="📈"
          color="yellow"
        />
        <StatCard 
          label="Pending Verifications" 
          value={stats.pendingVerifications} 
          icon="⏳"
          color="red"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Projects */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Recent Projects</h2>
            <a href="/projects" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
              View all →
            </a>
          </div>
          <div className="space-y-4">
            {recentProjects.length > 0 ? (
              recentProjects.map((project) => (
                <div key={project._id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                      <span className="text-primary-600 font-semibold">
                        {project.title.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{project.title}</p>
                    <p className="text-sm text-gray-500">
                      {project.developerId?.name || project.developerId?.company || 'Unknown Developer'}
                    </p>
                    <p className="text-xs text-gray-400">{project.location}</p>
                  </div>
                  <div className="flex-shrink-0">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      project.status === 'completed' ? 'bg-green-100 text-green-800' :
                      project.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {project.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No recent projects</p>
            )}
          </div>
        </div>

        {/* Recent Investments */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Recent Investments</h2>
            <a href="/connections" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
              View all →
            </a>
          </div>
          <div className="space-y-4">
            {recentInvestments.length > 0 ? (
              recentInvestments.map((investment) => (
                <div key={investment._id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <span className="text-green-600 font-semibold">₦</span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      Investment #{investment._id.slice(-6)}
                    </p>
                    <p className="text-sm text-gray-500">
                      {investment.investorId || 'Unknown Investor'}
                    </p>
                    <p className="text-xs text-gray-400">{new Date(investment.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <p className="text-sm font-medium text-gray-900">
                      ₦{investment.amount?.toLocaleString() || '0'}
                    </p>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      investment.status === 'approved' ? 'bg-green-100 text-green-800' :
                      investment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {investment.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No recent investments</p>
            )}
          </div>
        </div>
      </div>

      {/* Pending Verifications */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Pending Verifications</h2>
          <a href="/verifications" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
            View all →
          </a>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Documents
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {pendingVerifications.length > 0 ? (
                pendingVerifications.map((verification) => (
                  <tr key={verification._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {verification.userId?.name || 'Unknown User'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {verification.userId?.email || 'No email'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                      {verification.userType || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {verification.documents?.length || 0} documents
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                        Pending Review
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-primary-600 hover:text-primary-900 mr-3">
                        Review
                      </button>
                      <button className="text-green-600 hover:text-green-900 mr-3">
                        Approve
                      </button>
                      <button className="text-red-600 hover:text-red-900">
                        Reject
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                    No pending verifications
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button 
            onClick={() => window.location.href = '/projects'}
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors"
          >
            <div className="text-center">
              <div className="text-2xl mb-2">➕</div>
              <p className="font-medium text-gray-900">Add New Project</p>
              <p className="text-sm text-gray-500">Create a new property listing</p>
            </div>
          </button>
          <button 
            onClick={() => window.location.href = '/users'}
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors"
          >
            <div className="text-center">
              <div className="text-2xl mb-2">👤</div>
              <p className="font-medium text-gray-900">Manage Users</p>
              <p className="text-sm text-gray-500">View and manage user accounts</p>
            </div>
          </button>
          <button 
            onClick={() => window.location.href = '/profile'}
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors"
          >
            <div className="text-center">
              <div className="text-2xl mb-2">⚙️</div>
              <p className="font-medium text-gray-900">Profile Settings</p>
              <p className="text-sm text-gray-500">Update your admin profile</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ label, value, icon, color }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200',
    yellow: 'bg-yellow-50 text-yellow-600 border-yellow-200',
    red: 'bg-red-50 text-red-600 border-red-200'
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 border-l-4 border-primary-500">
      <div className="flex items-center">
        <div className={`p-3 rounded-full ${colorClasses[color]}`}>
          <span className="text-2xl">{icon}</span>
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 