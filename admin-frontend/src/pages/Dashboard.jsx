import { useState, useEffect } from 'react';
import axios from 'axios';
import { HomeIcon, UsersIcon, BuildingOfficeIcon, ShieldCheckIcon, CogIcon } from '@heroicons/react/24/outline';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import VerificationReview from '../components/VerificationReview';
import Settings from '../components/Settings';

const navigation = [
  { name: 'Overview', href: '/', icon: HomeIcon },
  { name: 'Users', href: '/users', icon: UsersIcon },
  { name: 'Projects', href: '/projects', icon: BuildingOfficeIcon },
  { name: 'Verifications', href: '/verifications', icon: ShieldCheckIcon },
  { name: 'Settings', href: '/settings', icon: CogIcon }
];

const Dashboard = () => {
  const location = useLocation();
  
  const [stats, setStats] = useState({
    totalDevelopers: 0,
    totalInvestors: 0,
    totalProjects: 0,
    totalInvestments: 0
  });
  const [recentProjects, setRecentProjects] = useState([]);
  const [recentInvestments, setRecentInvestments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await axios.get('/api/admin/dashboard');
        setStats(response.data.stats);
        setRecentProjects(response.data.recentProjects);
        setRecentInvestments(response.data.recentInvestments);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex">
        {/* Sidebar */}
        <div className="hidden md:flex md:flex-shrink-0">
          <div className="flex flex-col w-64">
            <div className="flex flex-col h-0 flex-1 bg-white border-r border-gray-200">
              <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
                <div className="flex items-center flex-shrink-0 px-4">
                  <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
                </div>
                <nav className="mt-5 flex-1 px-2 bg-white space-y-1">
                  {navigation.map((item) => {
                    const isActive = location.pathname === item.href;
                    return (
                      <Link
                        key={item.name}
                        to={item.href}
                        className={`${
                          isActive
                            ? 'bg-gray-100 text-gray-900'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        } group flex items-center px-2 py-2 text-sm font-medium rounded-md`}
                      >
                        <item.icon
                          className={`${
                            isActive ? 'text-gray-500' : 'text-gray-400 group-hover:text-gray-500'
                          } mr-3 flex-shrink-0 h-6 w-6`}
                          aria-hidden="true"
                        />
                        {item.name}
                      </Link>
                    );
                  })}
                </nav>
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex flex-col w-0 flex-1 overflow-hidden">
          <main className="flex-1 relative overflow-y-auto focus:outline-none">
            <div className="py-6">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                <Routes>
                  <Route path="/" element={<Overview />} />
                  <Route path="/users" element={<Users />} />
                  <Route path="/projects" element={<Projects />} />
                  <Route path="/verifications" element={<VerificationReview />} />
                  <Route path="/settings" element={<Settings />} />
                </Routes>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 