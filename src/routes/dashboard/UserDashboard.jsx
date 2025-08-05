import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { auth } from '../../firebase';
import toast from 'react-hot-toast';

// Backend API functions
const API_BASE_URL = 'https://subx-backend.vercel.app/api';

const apiCall = async (endpoint, options = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
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

const mockUserData = {
  name: 'John Doe',
  email: 'john@example.com',
  avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
  portfolioValue: '₦750,000',
  totalLandOwned: '150 sqm',
  totalInvestments: 2,
  recentActivity: [
    {
      id: 1,
      title: 'Plot 77 - 2 Seasons Estate',
      sqm: 50,
      amount: '₦250,000',
      date: '2024-01-15',
      status: 'owned',
      location: 'Ogun State, Nigeria',
      description: 'Premium residential plot in 2 Seasons Estate with world-class amenities.',
                  documents: [
        { name: 'Group Purchase Agreement', type: 'pdf', url: '#', signed: true },
        { name: 'Deed of Sale (per owner)', type: 'pdf', url: '#', signed: true },
        { name: 'Co-ownership Certificate', type: 'pdf', url: '#', signed: false }
      ],
      coOwners: [
        { name: 'John Doe', percentage: 25, sqm: 50, email: 'john@example.com', phone: '+234 801 234 5678' },
        { name: 'Sarah Wilson', percentage: 20, sqm: 40, email: 'sarah@example.com', phone: '+234 802 345 6789' },
        { name: 'Mike Johnson', percentage: 15, sqm: 30, email: 'mike@example.com', phone: '+234 803 456 7890' },
        { name: 'Lisa Brown', percentage: 10, sqm: 20, email: 'lisa@example.com', phone: '+234 804 567 8901' },
        { name: 'David Lee', percentage: 30, sqm: 60, email: 'david@example.com', phone: '+234 805 678 9012' }
      ],
      amenities: ['Gated Community', '24/7 Security', 'Recreation Center', 'Shopping Mall'],
      nextPayment: '₦25,000',
      paymentDate: '2024-04-15',
      propertyValue: '₦300,000'
    },
    {
      id: 2,
      title: 'Plot 79 - 2 Seasons Estate',
      sqm: 100,
      amount: '₦500,000',
      date: '2024-01-10',
      status: 'owned',
      location: 'Ogun State, Nigeria',
      description: 'Exclusive residential plot with lakefront views and premium facilities.',
      documents: [
        { name: 'Group Purchase Agreement', type: 'pdf', url: '#', signed: true },
        { name: 'Deed of Sale (per owner)', type: 'pdf', url: '#', signed: false },
        { name: 'Co-ownership Certificate', type: 'pdf', url: '#', signed: false }
      ],
      coOwners: [
        { name: 'John Doe', percentage: 40, sqm: 100, email: 'john@example.com', phone: '+234 801 234 5678' },
        { name: 'Emma Davis', percentage: 30, sqm: 75, email: 'emma@example.com', phone: '+234 806 789 0123' },
        { name: 'Tom Wilson', percentage: 20, sqm: 50, email: 'tom@example.com', phone: '+234 807 890 1234' },
        { name: 'Anna Smith', percentage: 10, sqm: 25, email: 'anna@example.com', phone: '+234 808 901 2345' }
      ],
      amenities: ['Lakefront Views', 'Wellness Center', 'Sports Academy', 'Content Village'],
      nextPayment: '₦50,000',
      paymentDate: '2024-04-10',
      propertyValue: '₦600,000'
    }
  ]
};

const mockProjects = [
  {
    id: 1,
    title: '2 Seasons - Plot 77',
    location: 'Ogun State',
    price: '₦5,000/sq.m',
    totalSqm: 500,
    availableSqm: 350,
    image: '/2-seasons/2seasons-logo.jpg',
    status: 'Available',
    description: 'Premium residential plot in 2 Seasons Estate with world-class amenities.',
    amenities: ['Gated Community', '24/7 Security', 'Recreation Center', 'Shopping Mall']
  },
  {
    id: 2,
    title: '2 Seasons - Plot 79',
    location: 'Ogun State',
    price: '₦5,000/sq.m',
    totalSqm: 500,
    availableSqm: 280,
    image: '/2-seasons/2seasons-logo.jpg',
    status: 'Available',
    description: 'Exclusive residential plot with lakefront views and premium facilities.',
    amenities: ['Lakefront Views', 'Wellness Center', 'Sports Academy', 'Content Village']
  },
  {
    id: 3,
    title: '2 Seasons - Plot 81',
    location: 'Ogun State',
    price: '₦5,000/sq.m',
    totalSqm: 500,
    availableSqm: 420,
    image: '/2-seasons/2seasons-logo.jpg',
    status: 'Available',
    description: 'Premium plot in the wellness village with spa and recreation facilities.',
    amenities: ['Spa & Wellness', 'Fruit Forest', 'Yoga Pavilion', 'Juice Bars']
  },
  {
    id: 4,
    title: '2 Seasons - Plot 84',
    location: 'Ogun State',
    price: '₦5,000/sq.m',
    totalSqm: 500,
    availableSqm: 380,
    image: '/2-seasons/2seasons-logo.jpg',
    status: 'Available',
    description: 'Strategic plot with excellent connectivity and modern amenities.',
    amenities: ['Strategic Location', 'Easy Access', 'Modern Infrastructure', 'Community Hub']
  },
  {
    id: 5,
    title: '2 Seasons - Plot 87',
    location: 'Ogun State',
    price: '₦5,000/sq.m',
    totalSqm: 500,
    availableSqm: 320,
    image: '/2-seasons/2seasons-logo.jpg',
    status: 'Available',
    description: 'Premium plot with panoramic views and exclusive amenities.',
    amenities: ['Panoramic Views', 'Exclusive Access', 'Premium Facilities', 'Privacy']
  }
];

export default function UserDashboard() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(mockUserData);
  const [projects, setProjects] = useState(mockProjects);
  const [activeTab, setActiveTab] = useState('opportunities');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showOwnershipModal, setShowOwnershipModal] = useState(false);
  const [showCoOwnersModal, setShowCoOwnersModal] = useState(false);
  const [showDocumentsModal, setShowDocumentsModal] = useState(false);
  const [showDeedSignModal, setShowDeedSignModal] = useState(false);
  const [selectedSqm, setSelectedSqm] = useState(1);
  const [ownershipAmount, setOwnershipAmount] = useState('₦5,000');
  const [signatureCanvas, setSignatureCanvas] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [signatureData, setSignatureData] = useState(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    dateOfBirth: '',
    occupation: ''
  });

  // Sync profile data with user data when userData changes
  useEffect(() => {
    if (userData) {
      setProfileData(prev => ({
        ...prev,
        name: userData.name || prev.name,
        email: userData.email || prev.email
      }));
    }
  }, [userData]);

  useEffect(() => {
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    // Load data from backend
    const loadData = async () => {
      try {
        await Promise.all([
          fetchUserData(),
          fetchUserProperties()
        ]);
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setTimeout(() => setIsLoading(false), 1000);
      }
    };

    loadData();
    
    // Load Paystack script
    if (!window.PaystackPop) {
      const script = document.createElement('script');
      script.src = 'https://js.paystack.co/v1/inline.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('userType');
      navigate('/');
      toast.success('Logged out successfully');
    } catch (error) {
      toast.error('Failed to logout');
    }
  };

  const handleOwnNow = (project) => {
    setSelectedProject(project);
    setSelectedSqm(1);
    setOwnershipAmount('₦5,000');
    setShowOwnershipModal(true);
  };

  const handleViewDetails = (project) => {
    setSelectedProject(project);
    setShowProjectModal(true);
  };

  const handleViewCoOwners = (property) => {
    setSelectedProperty(property);
    setShowCoOwnersModal(true);
  };

  const handleViewDocuments = (property) => {
    setSelectedProperty(property);
    setShowDocumentsModal(true);
  };

  const handleSignDeed = (document) => {
    setSelectedDocument(document);
    setShowDeedSignModal(true);
  };

  const handleSignatureStart = (e) => {
    setIsDrawing(true);
    const canvas = signatureCanvas;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = '#1f2937';
    ctx.lineWidth = 2;
  };

  const handleSignatureMove = (e) => {
    if (!isDrawing) return;
    const canvas = signatureCanvas;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const handleSignatureEnd = () => {
    setIsDrawing(false);
    const canvas = signatureCanvas;
    const dataURL = canvas.toDataURL();
    setSignatureData(dataURL);
  };

  const clearSignature = () => {
    const canvas = signatureCanvas;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setSignatureData(null);
  };

  // Backend integration functions
  const fetchUserData = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const response = await apiCall(`/users/${user.uid}`);
      setUserData(response.data);
    } catch (error) {
      console.error('Failed to fetch user data:', error);
      // Fallback to mock data
    }
  };

  const updateUserProfile = async (profileData) => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('No authenticated user');

      // Update local state immediately for better UX
      setUserData(prev => ({ 
        ...prev, 
        name: profileData.name || prev.name,
        email: profileData.email || prev.email
      }));

      // Try to save to backend
      try {
        const response = await apiCall(`/users/${user.uid}`, {
          method: 'PUT',
          body: JSON.stringify(profileData),
        });
        console.log('Profile updated in backend:', response);
      } catch (backendError) {
        console.error('Backend update failed, but local state updated:', backendError);
      }

      toast.success('Profile updated successfully!');
      setIsEditingProfile(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast.error('Failed to update profile');
    }
  };

  const handleProfilePictureChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUserData(prev => ({
          ...prev,
          avatar: e.target.result
        }));
        toast.success('Profile picture updated!');
      };
      reader.readAsDataURL(file);
    }
  };

  const savePropertyDocument = async (propertyId, documentData) => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('No authenticated user');

      const response = await apiCall(`/properties/${propertyId}/documents`, {
        method: 'POST',
        body: JSON.stringify(documentData),
      });

      toast.success('Document signed successfully!');
      return response.data;
    } catch (error) {
      console.error('Failed to save document:', error);
      toast.error('Failed to save document');
      throw error;
    }
  };

  const fetchUserProperties = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const response = await apiCall(`/users/${user.uid}/properties`);
      // Update user data with fetched properties
      setUserData(prev => ({
        ...prev,
        recentActivity: response.data.properties || prev.recentActivity
      }));
    } catch (error) {
      console.error('Failed to fetch properties:', error);
      // Fallback to mock data
    }
  };

  const handleSqmChange = (sqm) => {
    setSelectedSqm(sqm);
    setOwnershipAmount(`₦${(sqm * 5000).toLocaleString()}`);
  };

  const handleOwnershipSubmit = () => {
    // Initialize Paystack payment
    const amount = selectedSqm * 5000 * 100; // Convert to kobo
    const email = userData.email;
    const name = userData.name;
    const reference = 'SUBX-' + Math.floor(Math.random() * 1000000000);
    
    if (window.PaystackPop) {
      const handler = window.PaystackPop.setup({
        key: 'pk_live_c6e9456f9a1b1071ed96b977c21f8fae727400e0',
        email: email,
        amount: amount,
        currency: 'NGN',
        ref: reference,
        label: name,
        callback: async function(response) {
          // Payment successful
          toast.success(`Payment successful! You now own ${selectedSqm} sq.m in ${selectedProject.title}!`);
          
          // Add to user's properties
          const newProperty = {
            id: Date.now(),
            title: selectedProject.title,
            sqm: selectedSqm,
            amount: ownershipAmount,
            date: new Date().toISOString(),
            status: 'owned',
            documents: [
              { name: 'Group Purchase Agreement', type: 'pdf', url: '#' },
              { name: 'Deed of Sale (per owner)', type: 'pdf', url: '#' },
              { name: 'Co-ownership Certificate', type: 'pdf', url: '#' }
            ]
          };
          
          // Save to backend
          try {
            await apiCall('/properties', {
              method: 'POST',
              body: JSON.stringify(newProperty),
            });
          } catch (error) {
            console.error('Failed to save property to backend:', error);
          }
          
          // Update user data
          setUserData(prev => ({
            ...prev,
            totalInvestments: prev.totalInvestments + 1,
            totalLandOwned: `${parseInt(prev.totalLandOwned.split(' ')[0]) + selectedSqm} sqm`,
            portfolioValue: `₦${(parseInt(prev.portfolioValue.replace(/[^0-9]/g, '')) + (selectedSqm * 5000)).toLocaleString()}`,
            recentActivity: [newProperty, ...prev.recentActivity]
          }));
          
          setShowOwnershipModal(false);
        },
        onClose: function() {
          toast.error('Payment cancelled');
        }
      });
      handler.openIframe();
    } else {
      toast.error('Payment gateway not loaded. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <img src="/subx-logo/subx-logo-3.png" alt="Subx Logo" className="h-8 w-auto" />
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <img src={userData.avatar} alt="Profile" className="h-10 w-10 rounded-full object-cover" />
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-gray-900">{userData.name}</p>
                  <p className="text-xs text-gray-500">{userData.email}</p>
                </div>
                <button onClick={handleLogout} className="p-2 text-gray-400 hover:text-gray-600">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex space-x-8 mt-6">
          {[
            { id: 'opportunities', label: 'Opportunities', icon: 'briefcase' },
            { id: 'overview', label: 'Overview', icon: 'home' },
            { id: 'investments', label: 'My Properties', icon: 'chart-bar' },
            { id: 'documents', label: 'Documents', icon: 'document' },
            { id: 'profile', label: 'Profile', icon: 'user' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {tab.icon === 'briefcase' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V6a2 2 0 012-2h4a2 2 0 012 2z" />}
                {tab.icon === 'home' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />}
                {tab.icon === 'chart-bar' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />}
                {tab.icon === 'document' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />}
                {tab.icon === 'user' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />}
              </svg>
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Welcome Section */}
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-3xl font-bold mb-2">Welcome back, {userData.name}! 👋</h2>
                    <p className="text-indigo-100 text-lg">Your real estate portfolio is growing steadily.</p>
                  </div>
                  <div className="hidden md:block">
                    <img src={userData.avatar} alt="Profile" className="h-20 w-20 rounded-full object-cover border-4 border-white/20" />
                  </div>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <motion.div whileHover={{ scale: 1.05 }} className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Land Portfolio Value</p>
                      <p className="text-2xl font-bold text-gray-900">{userData.portfolioValue}</p>
                    </div>
                    <div className="p-3 bg-green-100 rounded-full">
                      <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                    </div>
                  </div>
                </motion.div>

                <motion.div whileHover={{ scale: 1.05 }} className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Land Owned</p>
                      <p className="text-2xl font-bold text-gray-900">{userData.totalLandOwned}</p>
                    </div>
                    <div className="p-3 bg-blue-100 rounded-full">
                      <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                  </div>
                </motion.div>

                <motion.div whileHover={{ scale: 1.05 }} className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Sub-owned Properties</p>
                      <p className="text-2xl font-bold text-gray-900">{userData.totalInvestments}</p>
                    </div>
                    <div className="p-3 bg-purple-100 rounded-full">
                      <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                  </div>
                </motion.div>

                <motion.div whileHover={{ scale: 1.05 }} className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Growth Rate</p>
                      <p className="text-2xl font-bold text-gray-900">+15.2%</p>
                    </div>
                    <div className="p-3 bg-yellow-100 rounded-full">
                      <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-xl shadow-lg border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {userData.recentActivity.map((activity) => (
                      <motion.div
                        key={activity.id}
                        whileHover={{ scale: 1.02 }}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center space-x-4">
                          <div className={`p-2 rounded-full ${
                            activity.status === 'completed' ? 'bg-green-100' : 'bg-yellow-100'
                          }`}>
                            <svg className={`h-5 w-5 ${
                              activity.status === 'completed' ? 'text-green-600' : 'text-yellow-600'
                            }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                            </svg>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{activity.title}</p>
                            <p className="text-sm text-gray-500">{activity.amount}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">{activity.date}</p>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            activity.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {activity.status}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'opportunities' && (
            <motion.div
              key="opportunities"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Land Ownership Opportunities</h2>
                <div className="flex space-x-2">
                  <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                    Filter
                  </button>
                  <button className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">
                    Sort
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((project, index) => (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden"
                  >
                    <div className="relative">
                      <img src={project.image} alt={project.title} className="w-full h-48 object-cover" />
                      <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                        {project.status}
                      </div>
                    </div>
                    
                    <div className="p-6">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{project.title}</h3>
                      <p className="text-gray-600 mb-4">{project.description}</p>
                      
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-500">Location</p>
                          <p className="font-medium text-gray-900">{project.location}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Price</p>
                          <p className="font-medium text-gray-900">{project.price}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Available</p>
                          <p className="font-medium text-gray-900">{project.availableSqm} sq.m</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Total</p>
                          <p className="font-medium text-gray-900">{project.totalSqm} sq.m</p>
                        </div>
                      </div>

                      <div className="flex space-x-3">
                        <button 
                          onClick={() => handleViewDetails(project)}
                          className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                        >
                          View Details
                        </button>
                        <button
                          onClick={() => handleOwnNow(project)}
                          className="flex-1 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
                        >
                          Own Now
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'investments' && (
            <motion.div
              key="properties"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">My Sub-owned Properties</h2>
                <div className="flex space-x-2">
                  <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                    <svg className="h-4 w-4 mr-2 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
                    </svg>
                    Filter
                  </button>
                  <button className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">
                    <svg className="h-4 w-4 mr-2 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                    </svg>
                    Sort
                  </button>
                </div>
              </div>

              {/* Property Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Properties</p>
                      <p className="text-2xl font-bold text-gray-900">{userData.totalInvestments}</p>
                    </div>
                    <div className="p-3 bg-blue-100 rounded-full">
                      <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Land Owned</p>
                      <p className="text-2xl font-bold text-gray-900">{userData.totalLandOwned}</p>
                    </div>
                    <div className="p-3 bg-green-100 rounded-full">
                      <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Portfolio Value</p>
                      <p className="text-2xl font-bold text-gray-900">{userData.portfolioValue}</p>
                    </div>
                    <div className="p-3 bg-purple-100 rounded-full">
                      <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Growth Rate</p>
                      <p className="text-2xl font-bold text-gray-900">+20.5%</p>
                      <p className="text-xs text-gray-500">Purchase to current value</p>
                    </div>
                    <div className="p-3 bg-yellow-100 rounded-full">
                      <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {userData.recentActivity.filter(activity => activity.status === 'owned').map((property, index) => (
                  <motion.div
                    key={property.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden"
                  >
                    <div className="relative">
                      <img src="/2-seasons/2seasons-logo.jpg" alt={property.title} className="w-full h-48 object-cover" />
                      <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                        Owned
                      </div>
                      <div className="absolute top-4 left-4 bg-indigo-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                        {property.percentage || 25}% Share
                      </div>
                    </div>
                    
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900 mb-1">{property.title}</h3>
                          <p className="text-gray-600 text-sm">{property.location}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-indigo-600">{property.propertyValue}</p>
                          <p className="text-sm text-gray-500">Current Value</p>
                        </div>
                      </div>

                      <p className="text-gray-600 mb-4">{property.description}</p>
                      
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-500">Your Share</p>
                          <p className="font-medium text-gray-900">{property.sqm} sq.m</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Amount Paid</p>
                          <p className="font-medium text-gray-900">{property.amount}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Next Payment</p>
                          <p className="font-medium text-gray-900">{property.nextPayment}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Payment Date</p>
                          <p className="font-medium text-gray-900">{property.paymentDate}</p>
                        </div>
                      </div>

                      <div className="mb-4">
                        <p className="text-sm text-gray-500 mb-2">Amenities</p>
                        <div className="flex flex-wrap gap-2">
                          {property.amenities?.slice(0, 3).map((amenity, idx) => (
                            <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                              {amenity}
                            </span>
                          ))}
                          {property.amenities?.length > 3 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                              +{property.amenities.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex space-x-3">
                        <button 
                          onClick={() => handleViewCoOwners(property)}
                          className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 flex items-center justify-center"
                        >
                          <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          Co-owners
                        </button>
                        <button
                          onClick={() => handleViewDocuments(property)}
                          className="flex-1 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 flex items-center justify-center"
                        >
                          <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                          Documents
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'documents' && (
            <motion.div
              key="documents"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">My Documents</h2>
              </div>

              <div className="bg-white rounded-xl shadow-lg border border-gray-200">
                <div className="p-6">
                  <div className="space-y-6">
                    {userData.recentActivity.filter(activity => activity.status === 'owned').map((property) => (
                      <div key={property.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">{property.title}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {property.documents?.map((document, index) => (
                            <div key={index} className="bg-gray-50 rounded-lg p-4">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center space-x-2">
                                  <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                  </svg>
                                  <span className="font-medium text-gray-900">{document.name}</span>
                                </div>
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  document.signed ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {document.signed ? 'Signed' : 'Pending'}
                                </span>
                              </div>
                              <div className="flex space-x-2">
                                <button className="flex-1 px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50">
                                  View
                                </button>
                                {!document.signed && (
                                  <button 
                                    onClick={() => handleSignDeed(document)}
                                    className="flex-1 px-3 py-1 text-sm font-medium text-white bg-indigo-600 rounded hover:bg-indigo-700"
                                  >
                                    Sign
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'profile' && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">My Profile</h2>
                <button
                  onClick={() => setIsEditingProfile(!isEditingProfile)}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 flex items-center"
                >
                  <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  {isEditingProfile ? 'Cancel' : 'Edit Profile'}
                </button>
              </div>

              <div className="bg-white rounded-xl shadow-lg border border-gray-200">
                <div className="p-6">
                  <div className="flex items-center space-x-6 mb-6">
                    <div className="relative">
                      <img src={userData.avatar} alt="Profile" className="h-20 w-20 rounded-full object-cover" />
                      {isEditingProfile && (
                        <label className="absolute bottom-0 right-0 bg-indigo-600 text-white p-1 rounded-full cursor-pointer hover:bg-indigo-700">
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleProfilePictureChange}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">{userData.name}</h3>
                      <p className="text-gray-600">{userData.email}</p>
                    </div>
                  </div>
                  
                  {!isEditingProfile ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-4">Account Information</h4>
                        <div className="space-y-3">
                          <div>
                            <p className="text-sm text-gray-500">Full Name</p>
                            <p className="font-medium text-gray-900">{userData.name}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Email Address</p>
                            <p className="font-medium text-gray-900">{userData.email}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Phone Number</p>
                            <p className="font-medium text-gray-900">{profileData.phone || 'Not provided'}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Address</p>
                            <p className="font-medium text-gray-900">{profileData.address || 'Not provided'}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Date of Birth</p>
                            <p className="font-medium text-gray-900">{profileData.dateOfBirth || 'Not provided'}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Occupation</p>
                            <p className="font-medium text-gray-900">{profileData.occupation || 'Not provided'}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Member Since</p>
                            <p className="font-medium text-gray-900">January 2024</p>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-4">Land Portfolio Summary</h4>
                        <div className="space-y-3">
                          <div>
                            <p className="text-sm text-gray-500">Total Properties</p>
                            <p className="font-medium text-gray-900">{userData.totalInvestments}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Total Land Owned</p>
                            <p className="font-medium text-gray-900">{userData.totalLandOwned}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Portfolio Value</p>
                            <p className="font-medium text-gray-900">{userData.portfolioValue}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Growth Rate</p>
                            <p className="font-medium text-gray-900">+15.2%</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={(e) => {
                      e.preventDefault();
                      const updatedProfileData = {
                        ...profileData,
                        name: profileData.name || userData.name,
                        email: profileData.email || userData.email
                      };
                      updateUserProfile(updatedProfileData);
                    }} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-4">Personal Information</h4>
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                              <input
                                type="text"
                                value={profileData.name}
                                onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="Enter your full name"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                              <input
                                type="email"
                                value={profileData.email}
                                onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="Enter your email"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                              <input
                                type="tel"
                                value={profileData.phone}
                                onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="Enter your phone number"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                              <textarea
                                value={profileData.address}
                                onChange={(e) => setProfileData(prev => ({ ...prev, address: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="Enter your address"
                                rows={3}
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                              <input
                                type="date"
                                value={profileData.dateOfBirth}
                                onChange={(e) => setProfileData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Occupation</label>
                              <input
                                type="text"
                                value={profileData.occupation}
                                onChange={(e) => setProfileData(prev => ({ ...prev, occupation: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="Enter your occupation"
                              />
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-4">Land Portfolio Summary</h4>
                          <div className="space-y-3">
                            <div>
                              <p className="text-sm text-gray-500">Total Properties</p>
                              <p className="font-medium text-gray-900">{userData.totalInvestments}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Total Land Owned</p>
                              <p className="font-medium text-gray-900">{userData.totalLandOwned}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Portfolio Value</p>
                              <p className="font-medium text-gray-900">{userData.portfolioValue}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Growth Rate</p>
                              <p className="font-medium text-gray-900">+15.2%</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex justify-end space-x-4">
                        <button
                          type="button"
                          onClick={() => setIsEditingProfile(false)}
                          className="px-6 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-6 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
                        >
                          Save Changes
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Ownership Modal */}
      <AnimatePresence>
        {showOwnershipModal && selectedProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl max-w-md w-full p-6"
            >
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Own Land in {selectedProject.title}</h2>
                <button onClick={() => setShowOwnershipModal(false)} className="text-gray-400 hover:text-gray-600">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-6">
                <div>
                  <img src={selectedProject.image} alt={selectedProject.title} className="w-full h-48 object-cover rounded-lg mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{selectedProject.title}</h3>
                  <p className="text-gray-600 mb-4">{selectedProject.description}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Square Meters (1 - 500)
                  </label>
                  <div className="flex items-center space-x-4">
                    <input
                      type="range"
                      min="1"
                      max="500"
                      value={selectedSqm}
                      onChange={(e) => handleSqmChange(parseInt(e.target.value))}
                      className="flex-1"
                    />
                    <span className="text-lg font-semibold text-gray-900 min-w-[60px]">
                      {selectedSqm} sq.m
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">Price: ₦5,000 per square meter</p>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-medium text-gray-900">Total Ownership Cost:</span>
                    <span className="text-2xl font-bold text-indigo-600">{ownershipAmount}</span>
                  </div>
                </div>
                
                <div className="flex space-x-4">
                  <button
                    onClick={() => setShowOwnershipModal(false)}
                    className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleOwnershipSubmit}
                    className="flex-1 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
                  >
                    Confirm Ownership
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Co-owners Modal */}
      <AnimatePresence>
        {showCoOwnersModal && selectedProperty && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Co-owners - {selectedProperty.title}</h2>
                  <button onClick={() => setShowCoOwnersModal(false)} className="text-gray-400 hover:text-gray-600">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Ownership Distribution</h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="w-48 h-48 mx-auto mb-4">
                        {/* Pie Chart Placeholder */}
                        <div className="w-full h-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg">
                          Pie Chart
                        </div>
                      </div>
                      <p className="text-center text-sm text-gray-600">Visual representation of ownership percentages</p>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Co-owners List</h3>
                    <div className="space-y-3">
                      {selectedProperty.coOwners?.map((owner, index) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium text-indigo-600">{owner.name.split(' ').map(n => n[0]).join('')}</span>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{owner.name}</p>
                              <p className="text-sm text-gray-500">{owner.email}</p>
                              <p className="text-sm text-gray-500">{owner.phone}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-indigo-600">{owner.percentage}%</p>
                            <p className="text-sm text-gray-500">{owner.sqm} sq.m</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Documents Modal */}
      <AnimatePresence>
        {showDocumentsModal && selectedProperty && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Documents - {selectedProperty.title}</h2>
                  <button onClick={() => setShowDocumentsModal(false)} className="text-gray-400 hover:text-gray-600">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className="space-y-4">
                  {selectedProperty.documents?.map((document, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <svg className="h-8 w-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                          <div>
                            <h3 className="font-semibold text-gray-900">{document.name}</h3>
                            <p className="text-sm text-gray-500">PDF Document</p>
                          </div>
                        </div>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                          document.signed ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {document.signed ? 'Signed' : 'Pending Signature'}
                        </span>
                      </div>
                      
                      <div className="flex space-x-3">
                        <button className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">
                          View Document
                        </button>
                        {!document.signed && (
                          <button 
                            onClick={() => handleSignDeed(document)}
                            className="flex-1 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
                          >
                            Sign Document
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Deed Signing Modal */}
      <AnimatePresence>
        {showDeedSignModal && selectedDocument && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6"
            >
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Sign {selectedDocument.name}</h2>
                <button onClick={() => setShowDeedSignModal(false)} className="text-gray-400 hover:text-gray-600">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Document Preview</h3>
                  <p className="text-gray-600 mb-4">This is a preview of the {selectedDocument.name} document that you are about to sign.</p>
                  <div className="bg-white border border-gray-200 rounded-lg p-4 min-h-[200px]">
                    <p className="text-sm text-gray-600">
                      <strong>DEED OF SALE</strong><br/><br/>
                      This Deed of Sale is made on [Date] between:<br/><br/>
                      <strong>SELLER:</strong> 2 Seasons Estate Development Company<br/>
                      <strong>BUYER:</strong> {userData.name}<br/><br/>
                      For the purchase of land in 2 Seasons Estate, Ogun State, Nigeria.<br/><br/>
                      <strong>PROPERTY DETAILS:</strong><br/>
                      • Location: 2 Seasons Estate, Ogun State<br/>
                      • Plot Number: [Plot Number]<br/>
                      • Square Meters: [SQM]<br/>
                      • Purchase Price: [Amount]<br/><br/>
                      <strong>TERMS AND CONDITIONS:</strong><br/>
                      1. The Seller hereby transfers ownership of the specified land to the Buyer<br/>
                      2. The Buyer acknowledges receipt of the property and agrees to all terms<br/>
                      3. This deed is legally binding and enforceable under Nigerian law<br/><br/>
                      <strong>SIGNATURE SECTION:</strong><br/>
                      Buyer Signature: _________________<br/>
                      Date: _________________
                    </p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-4">Digital Signature</h3>
                  <p className="text-gray-600 mb-4">Please sign in the box below using your mouse or touch screen.</p>
                  
                  <div className="border-2 border-gray-300 rounded-lg bg-white relative">
                    <canvas
                      ref={setSignatureCanvas}
                      width={400}
                      height={150}
                      className="w-full h-[150px] cursor-crosshair block"
                      onMouseDown={handleSignatureStart}
                      onMouseMove={handleSignatureMove}
                      onMouseUp={handleSignatureEnd}
                      onMouseLeave={handleSignatureEnd}
                      onTouchStart={(e) => {
                        e.preventDefault();
                        const touch = e.touches[0];
                        const mouseEvent = new MouseEvent('mousedown', {
                          clientX: touch.clientX,
                          clientY: touch.clientY
                        });
                        handleSignatureStart(mouseEvent);
                      }}
                      onTouchMove={(e) => {
                        e.preventDefault();
                        const touch = e.touches[0];
                        const mouseEvent = new MouseEvent('mousemove', {
                          clientX: touch.clientX,
                          clientY: touch.clientY
                        });
                        handleSignatureMove(mouseEvent);
                      }}
                      onTouchEnd={(e) => {
                        e.preventDefault();
                        handleSignatureEnd();
                      }}
                    />
                    {!signatureData && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <p className="text-gray-400 text-sm">Sign here...</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex justify-between items-center mt-4">
                    <button
                      onClick={clearSignature}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                    >
                      Clear Signature
                    </button>
                    {signatureData && (
                      <div className="flex items-center space-x-2">
                        <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-sm text-green-600 font-medium">Signature Ready</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex space-x-4">
                  <button
                    onClick={() => setShowDeedSignModal(false)}
                    className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      if (!signatureData) {
                        toast.error('Please provide a signature before signing the document');
                        return;
                      }
                      toast.success(`${selectedDocument.name} signed successfully!`);
                      setShowDeedSignModal(false);
                      setSignatureData(null);
                      // Update document status
                      setUserData(prev => ({
                        ...prev,
                        recentActivity: prev.recentActivity.map(activity => 
                          activity.documents?.map(doc => 
                            doc.name === selectedDocument.name ? { ...doc, signed: true } : doc
                          )
                        )
                      }));
                    }}
                    disabled={!signatureData}
                    className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg ${
                      signatureData 
                        ? 'text-white bg-indigo-600 hover:bg-indigo-700' 
                        : 'text-gray-400 bg-gray-200 cursor-not-allowed'
                    }`}
                  >
                    Sign Document
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Project Modal */}
      <AnimatePresence>
        {showProjectModal && selectedProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">{selectedProject.title}</h2>
                  <button onClick={() => setShowProjectModal(false)} className="text-gray-400 hover:text-gray-600">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <img src={selectedProject.image} alt={selectedProject.title} className="w-full h-64 object-cover rounded-lg" />
                  </div>
                  
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Project Details</h3>
                      <p className="text-gray-600">{selectedProject.description}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Location</p>
                        <p className="font-medium text-gray-900">{selectedProject.location}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Price</p>
                        <p className="font-medium text-gray-900">{selectedProject.price}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Available</p>
                        <p className="font-medium text-gray-900">{selectedProject.availableSqm} sq.m</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Total</p>
                        <p className="font-medium text-gray-900">{selectedProject.totalSqm} sq.m</p>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">About 2 Seasons Estate</h3>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-gray-700 mb-4">
                          A regenerative, mixed-use lifestyle village in Ogun State — where wellness, tourism, creativity, and modern living converge.
                        </p>
                        
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-2">🏡 Zones & Amenities</h4>
                            <div className="space-y-3">
                              <div>
                                <h5 className="font-medium text-gray-800">1. Residential (35 acres)</h5>
                                <ul className="text-sm text-gray-600 ml-4 space-y-1">
                                  <li>• Gated homes with jogging & cycling lanes</li>
                                  <li>• Landscaped streets, play areas</li>
                                  <li>• Daycare/school & mini shopping mall</li>
                                </ul>
                              </div>
                              
                              <div>
                                <h5 className="font-medium text-gray-800">2. Villas & Lakefront (15 acres)</h5>
                                <ul className="text-sm text-gray-600 ml-4 space-y-1">
                                  <li>• Short-stay villas & pods</li>
                                  <li>• 4-acre artificial lake & waterfall</li>
                                  <li>• Designed for tourism, Airbnb, and influencer retreats</li>
                                </ul>
                              </div>
                              
                              <div>
                                <h5 className="font-medium text-gray-800">3. Wellness Village (12 acres)</h5>
                                <ul className="text-sm text-gray-600 ml-4 space-y-1">
                                  <li>• 5-acre farm + fruit forest</li>
                                  <li>• Spa, massage rooms, yoga pavilion</li>
                                  <li>• Sports zone (football, tennis, outdoor gym)</li>
                                  <li>• Juice bars, tea house, plant-based restaurant</li>
                                </ul>
                              </div>
                              
                              <div>
                                <h5 className="font-medium text-gray-800">4. Hygge Town</h5>
                                <ul className="text-sm text-gray-600 ml-4 space-y-1">
                                  <li>• 2 Seasons Sports academy</li>
                                  <li>• Content & Streaming Village</li>
                                  <li>• Modular studios & outdoor film sets</li>
                                  <li>• Creator residencies, masterclass arenas</li>
                                </ul>
                              </div>
                              
                              <div>
                                <h5 className="font-medium text-gray-800">5. Green Infrastructure</h5>
                                <ul className="text-sm text-gray-600 ml-4 space-y-1">
                                  <li>• Perimeter walking loop</li>
                                  <li>• Eco-conscious, regenerative systems</li>
                                  <li>• Ogun's first sustainable tourism + content hub</li>
                                </ul>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Available Documents</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <svg className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                            <span className="font-medium text-gray-900">Group Purchase Agreement</span>
                          </div>
                          <span className="text-sm text-gray-500">PDF</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <svg className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                            <span className="font-medium text-gray-900">Deed of Sale (per owner)</span>
                          </div>
                          <span className="text-sm text-gray-500">PDF</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <svg className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                            <span className="font-medium text-gray-900">Co-ownership Certificate</span>
                          </div>
                          <span className="text-sm text-gray-500">PDF</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end space-x-4">
                  <button
                    onClick={() => setShowProjectModal(false)}
                    className="px-6 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      setShowProjectModal(false);
                      handleOwnNow(selectedProject);
                    }}
                    className="px-6 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
                  >
                    Own Now
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 