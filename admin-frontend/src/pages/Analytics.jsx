import { useState, useEffect } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';

const mockUserGrowth = [
  { date: '2024-01', users: 10 },
  { date: '2024-02', users: 30 },
  { date: '2024-03', users: 50 },
  { date: '2024-04', users: 80 },
  { date: '2024-05', users: 120 },
  { date: '2024-06', users: 180 },
];
const mockInvestments = [
  { month: 'Jan', investments: 5, projects: 2 },
  { month: 'Feb', investments: 10, projects: 3 },
  { month: 'Mar', investments: 15, projects: 4 },
  { month: 'Apr', investments: 20, projects: 5 },
  { month: 'May', investments: 25, projects: 6 },
  { month: 'Jun', investments: 30, projects: 7 },
];

const Analytics = () => {
  const [stats, setStats] = useState({
    totalDevelopers: 0,
    totalInvestors: 0,
    totalProjects: 0,
    totalInvestments: 0,
    pendingVerifications: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dateRange, setDateRange] = useState({ from: '', to: '' });

  useEffect(() => {
    fetchStats();
    // eslint-disable-next-line
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get('/api/admin/stats', {
        headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
      });
      setStats(res.data);
    } catch (err) {
      setError('Failed to load analytics');
    } finally {
      setLoading(false);
    }
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
    <div className="p-6 space-y-8">
      <h1 className="text-2xl font-bold mb-6">Analytics</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-8">
        <StatCard label="Developers" value={stats.totalDevelopers} />
        <StatCard label="Investors" value={stats.totalInvestors} />
        <StatCard label="Projects" value={stats.totalProjects} />
        <StatCard label="Investments" value={stats.totalInvestments} />
        <StatCard label="Pending Verifications" value={stats.pendingVerifications} />
      </div>
      {/* Date Range Filter (UI only, for demo) */}
      <div className="flex space-x-4 items-center mb-4">
        <label className="font-semibold">Date Range:</label>
        <input
          type="date"
          value={dateRange.from}
          onChange={e => setDateRange({ ...dateRange, from: e.target.value })}
          className="border border-gray-300 rounded px-2 py-1"
        />
        <span>-</span>
        <input
          type="date"
          value={dateRange.to}
          onChange={e => setDateRange({ ...dateRange, to: e.target.value })}
          className="border border-gray-300 rounded px-2 py-1"
        />
        <button className="btn btn-secondary" disabled>
          Filter (Demo)
        </button>
      </div>
      {/* User Growth Chart */}
      <div className="bg-white rounded shadow p-6">
        <h2 className="text-lg font-semibold mb-4">User Growth</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={mockUserGrowth} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="users" stroke="#2563eb" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      {/* Investments & Projects Chart */}
      <div className="bg-white rounded shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Investments & Projects (Monthly)</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={mockInvestments} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="investments" fill="#2563eb" />
            <Bar dataKey="projects" fill="#10b981" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

const StatCard = ({ label, value }) => (
  <div className="bg-white rounded shadow p-4 flex flex-col items-center">
    <div className="text-3xl font-bold text-primary-600 mb-2">{value}</div>
    <div className="text-gray-600 text-sm">{label}</div>
  </div>
);

export default Analytics; 