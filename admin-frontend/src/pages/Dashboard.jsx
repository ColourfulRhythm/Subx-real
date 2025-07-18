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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const res = await axios.get('/api/admin/stats', {
          headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
        });
        setStats(res.data);
      } catch (err) {
        setError('Failed to load dashboard stats');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

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
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-8">
        <StatCard label="Developers" value={stats.totalDevelopers} />
        <StatCard label="Investors" value={stats.totalInvestors} />
        <StatCard label="Projects" value={stats.totalProjects} />
        <StatCard label="Investments" value={stats.totalInvestments} />
        <StatCard label="Pending Verifications" value={stats.pendingVerifications} />
      </div>
      {/* Add more dashboard widgets here as needed */}
    </div>
  );
};

const StatCard = ({ label, value }) => (
  <div className="bg-white rounded shadow p-4 flex flex-col items-center">
    <div className="text-3xl font-bold text-primary-600 mb-2">{value}</div>
    <div className="text-gray-600 text-sm">{label}</div>
  </div>
);

export default Dashboard; 