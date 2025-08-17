import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase, paystackKey } from '../../supabase';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';
import PaymentSuccessModal from '../../components/PaymentSuccessModal';

// Backend API functions
const API_BASE_URL = 'https://subxbackend-production.up.railway.app/api';

const apiCall = async (endpoint, options = {}) => {
  try {
    // Get the current user's session token
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
        ...options.headers,
      },
      ...options,
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
};

export default function UserDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState({});
  const [userProperties, setUserProperties] = useState([]);
  const [projects, setProjects] = useState([]);
  const [showOwnershipModal, setShowOwnershipModal] = useState(false);
  const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);
  const [paymentData, setPaymentData] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [forumTopics, setForumTopics] = useState([]);
  const [forumCategories, setForumCategories] = useState([]);
  const [newTopic, setNewTopic] = useState({ title: '', content: '', categoryId: '' });
  const [showNewTopicModal, setShowNewTopicModal] = useState(false);
  const [expandedPlots, setExpandedPlots] = useState(new Set());

  // Form states for ownership modal
  const [ownershipForm, setOwnershipForm] = useState({
    name: '',
    email: '',
    phone: '',
    amount: '',
    sqm: ''
  });

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUser(user);
        await Promise.all([
            fetchUserData(user),
            fetchUserProperties(user),
            fetchProjects(),
            fetchForumData()
          ]);
        }
      } catch (error) {
        console.error('Error getting user:', error);
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    getUser();
  }, [navigate]);

  const fetchUserData = async (user) => {
    try {
      const data = await apiCall(`/users/${user.email || user.id}`);
      setUserData(data);
    } catch (error) {
      console.error('Failed to fetch user data:', error);
    }
  };

  const fetchUserProperties = async (user) => {
    try {
      const data = await apiCall(`/users/${user.email || user.id}/properties`);
      setUserProperties(data);
    } catch (error) {
      console.error('Failed to fetch properties:', error);
    }
  };

  const fetchProjects = async () => {
    try {
      const data = await apiCall('/properties');
      setProjects(data);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    }
  };

  const fetchForumData = async () => {
    try {
      const [topics, categories] = await Promise.all([
        apiCall('/forum/topics'),
        apiCall('/forum/categories')
      ]);
      setForumTopics(topics);
      setForumCategories(categories);
    } catch (error) {
      console.error('Failed to fetch forum data:', error);
    }
  };

  const updateUserProfile = async (updateData) => {
    try {
      if (!user) return;

      const data = await apiCall(`/users/${user.email || user.id}`, {
        method: 'PUT',
        body: JSON.stringify(updateData)
      });

      setUserData(data);
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Backend update failed, but local state updated:', error);
      toast.error('Failed to update profile');
    }
  };

  const handleOwnershipSubmit = async () => {
    try {
      if (!user) return;

      const { name, email, phone, amount, sqm } = ownershipForm;
      
      if (!name || !email || !phone || !amount || !sqm) {
        toast.error('Please fill in all fields');
        return;
      }

      const reference = `SUBX_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const handler = window.PaystackPop.setup({
        key: paystackKey,
        email: email,
        amount: parseFloat(amount) * 100, // Convert to kobo
        currency: 'NGN',
        ref: reference,
        label: name,
        callback: function(response) {
          if (response.status === 'success') {
            const investmentData = {
              propertyId: selectedProject.id,
              amount: parseFloat(amount),
              paymentReference: reference,
              sqm: parseFloat(sqm)
            };

            apiCall('/investments', { 
              method: 'POST',
              body: JSON.stringify(investmentData) 
            })
            .then(() => Promise.all([fetchUserData(user), fetchUserProperties(user)]))
            .then(() => {
              setPaymentData(investmentData);
              setShowOwnershipModal(false);
              setShowPaymentSuccess(true);
              toast.success('Payment successful! Download your documents below.');
            })
            .catch((error) => {
              console.error('Failed to create investment:', error);
              toast.error('Payment successful but failed to save investment. Please contact support.');
            });
          }
        },
        onClose: function() {
          toast.error('Payment cancelled');
        }
      });
      
      handler.openIframe();
    } catch (error) {
      console.error('Failed to initialize payment:', error);
      toast.error('Failed to initialize payment. Please try again.');
    }
  };

  const generateReceipt = (investment) => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text('Payment Receipt', 105, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 40);
    doc.text(`Reference: ${investment.paymentReference}`, 20, 50);
    doc.text(`Amount: ₦${investment.amount.toLocaleString()}`, 20, 60);
    doc.text(`Property: ${investment.projectTitle}`, 20, 70);
    doc.text(`Size: ${investment.sqm} sqm`, 20, 80);
    
    doc.save(`receipt_${investment.paymentReference}.pdf`);
  };

  const generateCertificate = (investment) => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text('Certificate of Ownership', 105, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.text(`This certifies that ${userData.full_name || userData.email}`, 20, 40);
    doc.text(`owns ${investment.sqm} square meters in ${investment.projectTitle}`, 20, 50);
    doc.text(`Location: ${investment.location}`, 20, 60);
    doc.text(`Purchase Date: ${new Date().toLocaleDateString()}`, 20, 70);
    doc.text(`Certificate ID: ${investment.paymentReference}`, 20, 80);
    
    doc.save(`certificate_${investment.paymentReference}.pdf`);
  };

  const togglePlotExpansion = (plotId) => {
    const newExpanded = new Set(expandedPlots);
    if (newExpanded.has(plotId)) {
      newExpanded.delete(plotId);
    } else {
      newExpanded.add(plotId);
    }
    setExpandedPlots(newExpanded);
  };

  const createNewTopic = async () => {
    try {
      if (!user) return;

      await apiCall('/forum/topics', {
        method: 'POST',
        body: JSON.stringify(newTopic)
      });

      setNewTopic({ title: '', content: '', categoryId: '' });
      setShowNewTopicModal(false);
      await fetchForumData();
      toast.success('Topic created successfully!');
    } catch (error) {
      toast.error('Failed to create topic');
    }
  };

  const getAvailableSpots = () => {
    return 10000 - (userData.total_investments || 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600">Welcome back, {userData.full_name || userData.email}</p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                Member since {userData.created_at ? new Date(userData.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Recently'}
              </span>
              <button
                onClick={() => supabase.auth.signOut()}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
              >
                Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {['overview', 'my-properties', 'documents', 'co-owners', 'community'].map((tab) => (
            <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
                {tab.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
            </button>
          ))}
        </nav>
      </div>

        {/* Tab Content */}
        <div className="mt-6">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Portfolio Overview */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Portfolio Overview</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600">Total Investments</p>
                    <p className="text-2xl font-bold text-gray-900">₦{userData.total_investments?.toLocaleString() || '0'}</p>
                  </div>
                    <div>
                    <p className="text-sm text-gray-600">Properties Owned</p>
                    <p className="text-2xl font-bold text-gray-900">{userData.total_properties || 0}</p>
                    </div>
                    <div>
                    <p className="text-sm text-gray-600">Growth Rate</p>
                    <p className="text-2xl font-bold text-green-600">+{userData.total_investments > 0 ? '0.0' : '0.0'}%</p>
                    </div>
                    </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  {userProperties.slice(0, 3).map((property, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <div>
                        <p className="text-sm font-medium text-gray-900">Purchased {property.size_sqm} sqm</p>
                        <p className="text-xs text-gray-500">{property.properties?.name}</p>
                          </div>
                        </div>
                  ))}
                  {userProperties.length === 0 && (
                    <p className="text-sm text-gray-500">No recent activity</p>
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                        <button 
                    onClick={() => setActiveTab('my-properties')}
                    className="w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                        >
                    View Properties
                        </button>
                        <button
                    onClick={() => setActiveTab('community')}
                    className="w-full bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
                        >
                    Join Community
                        </button>
                      </div>
                    </div>
              </div>
          )}

          {activeTab === 'my-properties' && (
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">My Properties</h3>
                </div>
              <div className="p-6">
                {userProperties.length > 0 ? (
                  <div className="space-y-4">
                    {userProperties.map((property, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start">
                    <div>
                            <h4 className="font-semibold text-gray-900">{property.properties?.name}</h4>
                            <p className="text-sm text-gray-600">{property.properties?.location}</p>
                            <p className="text-sm text-gray-600">{property.size_sqm} sqm - ₦{property.purchase_price?.toLocaleString()}</p>
                    </div>
                          <button
                            onClick={() => togglePlotExpansion(property.id)}
                            className="text-blue-500 hover:text-blue-700"
                          >
                            {expandedPlots.has(property.id) ? 'Hide Details' : 'Show Details'}
                          </button>
                    </div>
                    
                        {expandedPlots.has(property.id) && (
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                                <h5 className="font-medium text-gray-900 mb-2">Property Details</h5>
                                <p className="text-sm text-gray-600">Status: {property.status}</p>
                                <p className="text-sm text-gray-600">Purchase Date: {new Date(property.purchase_date).toLocaleDateString()}</p>
                        </div>
                        <div>
                                <h5 className="font-medium text-gray-900 mb-2">Documents</h5>
                                <div className="space-y-2">
                        <button 
                                    onClick={() => generateReceipt(property)}
                                    className="block w-full text-left text-sm text-blue-600 hover:text-blue-800"
                        >
                                    📄 Download Receipt
                        </button>
                        <button
                                    onClick={() => generateCertificate(property)}
                                    className="block w-full text-left text-sm text-blue-600 hover:text-blue-800"
                        >
                                    🏆 Download Certificate
                        </button>
                      </div>
                    </div>
              </div>
              </div>
                        )}
                            </div>
                          ))}
                        </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No properties owned yet.</p>
                <button
                      onClick={() => setActiveTab('overview')}
                      className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                >
                      Browse Properties
                </button>
              </div>
                      )}
                    </div>
                    </div>
          )}

          {activeTab === 'documents' && (
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Documents</h3>
                          </div>
              <div className="p-6">
                {userProperties.length > 0 ? (
                  <div className="space-y-4">
                    {userProperties.map((property, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-semibold text-gray-900">{property.properties?.name}</h4>
                            <p className="text-sm text-gray-600">{property.size_sqm} sqm</p>
                          </div>
                          <button
                            onClick={() => togglePlotExpansion(property.id)}
                            className="text-blue-500 hover:text-blue-700"
                          >
                            {expandedPlots.has(property.id) ? 'Hide Documents' : 'Show Documents'}
                          </button>
                      </div>
                      
                        {expandedPlots.has(property.id) && (
                          <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                                <h5 className="font-medium text-gray-900 mb-3">Download Documents</h5>
                          <div className="space-y-3">
                        <button
                                    onClick={() => generateReceipt(property)}
                                    className="w-full bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 flex items-center justify-center space-x-2"
                        >
                                    <span>📄</span>
                                    <span>Download Receipt</span>
                        </button>
                        <button
                                    onClick={() => generateCertificate(property)}
                                    className="w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center justify-center space-x-2"
                        >
                                    <span>🏆</span>
                                    <span>Download Certificate</span>
                        </button>
                      </div>
                </div>
                              
                              <div>
                                <h5 className="font-medium text-gray-900 mb-3">Sign Deed of Assignment</h5>
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                                  <p className="text-sm text-gray-600 mb-3">Deed signing will be available soon</p>
                                  <button
                                    disabled
                                    className="bg-gray-300 text-gray-500 px-4 py-2 rounded-lg cursor-not-allowed"
                                  >
                                    Coming Soon
                </button>
              </div>
                </div>
                  </div>
                </div>
                        )}
                  </div>
                    ))}
                </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No documents available yet.</p>
                </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'co-owners' && (
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Co-owners</h3>
                </div>
              <div className="p-6">
                {projects.length > 0 ? (
                  <div className="space-y-4">
                    {projects.map((project) => {
                      const coOwners = userProperties.filter(prop => 
                        prop.property_id === project.id && prop.owner_id !== user?.id
                      );
                      
                      return (
                        <div key={project.id} className="border rounded-lg p-4">
                          <h4 className="font-semibold text-gray-900 mb-3">{project.name}</h4>
                          {coOwners.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              {coOwners.map((coOwner, index) => (
                                <div key={index} className="bg-gray-50 rounded-lg p-3">
                                  <p className="font-medium text-gray-900">{coOwner.users?.full_name || 'Anonymous'}</p>
                                  <p className="text-sm text-gray-600">{coOwner.size_sqm} sqm</p>
                                  <p className="text-xs text-gray-500">Purchased {new Date(coOwner.purchase_date).toLocaleDateString()}</p>
                        </div>
                              ))}
                      </div>
                          ) : (
                            <p className="text-gray-500">No co-owners for this property yet.</p>
                          )}
                    </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No properties available.</p>
                            </div>
                )}
                            </div>
                          </div>
          )}

          {activeTab === 'community' && (
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Community Forum</h3>
                <button
                  onClick={() => setShowNewTopicModal(true)}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                >
                  New Topic
                  </button>
                </div>
              <div className="p-6">
                {forumTopics.length > 0 ? (
                <div className="space-y-4">
                    {forumTopics.map((topic) => (
                      <div key={topic.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-semibold text-gray-900">{topic.title}</h4>
                            <p className="text-sm text-gray-600 mt-1">{topic.content.substring(0, 150)}...</p>
                            <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                              <span>By {topic.users?.full_name || 'Anonymous'}</span>
                              <span>{new Date(topic.created_at).toLocaleDateString()}</span>
                              <span>{topic.views} views</span>
                          </div>
                        </div>
                          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                            {topic.forum_categories?.name}
                        </span>
                      </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No forum topics yet.</p>
                          <button 
                      onClick={() => setShowNewTopicModal(true)}
                      className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                          >
                      Start the First Topic
                          </button>
                  </div>
                        )}
                      </div>
                    </div>
          )}
                </div>
              </div>

      {/* Ownership Modal */}
      <AnimatePresence>
        {showOwnershipModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg p-6 w-full max-w-md mx-4"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Purchase Property</h3>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Full Name"
                  value={ownershipForm.name}
                  onChange={(e) => setOwnershipForm({...ownershipForm, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={ownershipForm.email}
                  onChange={(e) => setOwnershipForm({...ownershipForm, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="tel"
                  placeholder="Phone"
                  value={ownershipForm.phone}
                  onChange={(e) => setOwnershipForm({...ownershipForm, phone: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="number"
                  placeholder="Amount (₦)"
                  value={ownershipForm.amount}
                  onChange={(e) => setOwnershipForm({...ownershipForm, amount: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="number"
                  placeholder="Square Meters"
                  value={ownershipForm.sqm}
                  onChange={(e) => setOwnershipForm({...ownershipForm, sqm: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                      </div>
              <div className="flex space-x-3 mt-6">
                    <button
                  onClick={() => setShowOwnershipModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                  onClick={handleOwnershipSubmit}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  Proceed to Payment
                  </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* New Topic Modal */}
      <AnimatePresence>
        {showNewTopicModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg p-6 w-full max-w-md mx-4"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Topic</h3>
                        <div className="space-y-4">
                <select
                  value={newTopic.categoryId}
                  onChange={(e) => setNewTopic({...newTopic, categoryId: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Category</option>
                  {forumCategories.map((category) => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Topic Title"
                  value={newTopic.title}
                  onChange={(e) => setNewTopic({...newTopic, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <textarea
                  placeholder="Topic Content"
                  value={newTopic.content}
                  onChange={(e) => setNewTopic({...newTopic, content: e.target.value})}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                              </div>
              <div className="flex space-x-3 mt-6">
                  <button
                  onClick={() => setShowNewTopicModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                  Cancel
                  </button>
                  <button
                  onClick={createNewTopic}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  Create Topic
                  </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Payment Success Modal */}
      <PaymentSuccessModal
        isOpen={showPaymentSuccess}
        onClose={() => setShowPaymentSuccess(false)}
        paymentData={paymentData}
        onDownloadReceipt={() => generateReceipt(paymentData)}
        onDownloadCertificate={() => generateCertificate(paymentData)}
      />
    </div>
  );
} 