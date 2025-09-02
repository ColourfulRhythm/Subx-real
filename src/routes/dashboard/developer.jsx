import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { auth } from '../../firebase';
import { signOut } from 'firebase/auth';

// Validation schema for developer profile
const developerSchema = yup.object().shape({
  name: yup.string().required('Name is required'),
  company: yup.string().required('Company name is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  phone: yup.string().matches(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number'),
  website: yup.string().url('Invalid website URL'),
  bio: yup.string().max(1000, 'Bio must be less than 1000 characters'),
  minUnits: yup.number().min(1, 'Minimum units must be at least 1'),
  maxUnits: yup.number().min(1, 'Maximum units must be at least 1'),
  unitPrice: yup.number().min(0, 'Unit price must be positive'),
  yearsOfExperience: yup.number().min(0, 'Years of experience must be positive'),
  ownershipFocus: yup.array().min(1, 'Select at least one ownership focus'),
  completedProjects: yup.array(),
  certifications: yup.array(),
  socialLinks: yup.object()
});

// Add mock data after the developerSchema
const mockProjects = [
  {
    id: 1,
    title: 'Lekki Luxury Apartments',
    location: 'Lagos',
    type: 'Residential',
    amount: '₦250,000,000',
    status: 'Active',
    units: 150,
    soldUnits: 45,
    startDate: '2024-01-15',
    expectedCompletion: '2025-12-31',
    investors: 12,
          totalOwnership: '₦112,500,000'
  },
  {
    id: 2,
    title: 'Maitama Office Complex',
    location: 'Abuja',
    type: 'Commercial',
    amount: '₦180,000,000',
    status: 'Active',
    units: 50,
    soldUnits: 20,
    startDate: '2024-02-01',
    expectedCompletion: '2025-06-30',
    investors: 8,
          totalOwnership: '₦72,000,000'
  }
];

const mockConnections = [
  {
    id: 1,
    investorName: 'John Smith',
          ownershipFocus: 'Residential Properties',
    email: 'john.smith@example.com',
    phone: '+234 801 234 5678',
    preferredLocations: ['Lagos', 'Abuja', 'Port Harcourt'],
          ownershipRange: '₦50M - ₦200M',
    investments: [
      {
        projectTitle: 'Lekki Luxury Apartments',
        amount: '₦75,000,000',
        date: '2024-03-15'
      },
      {
        projectTitle: 'Victoria Island Office Complex',
        amount: '₦120,000,000',
        date: '2024-02-28'
      }
    ]
  },
  {
    id: 2,
    investorName: 'Sarah Johnson',
          ownershipFocus: 'Commercial Properties',
    email: 'sarah.j@example.com',
    phone: '+234 802 345 6789',
    preferredLocations: ['Lagos', 'Abuja'],
          ownershipRange: '₦100M - ₦500M',
    investments: [
      {
        projectTitle: 'Ikeja Mall Development',
        amount: '₦250,000,000',
        date: '2024-04-01'
      }
    ]
  },
  {
    id: 3,
    investorName: 'Michael Brown',
          ownershipFocus: 'Mixed-Use Developments',
    email: 'michael.b@example.com',
    phone: '+234 803 456 7890',
    preferredLocations: ['Lagos', 'Port Harcourt', 'Calabar'],
          ownershipRange: '₦200M - ₦1B',
    investments: [
      {
        projectTitle: 'Eko Atlantic Mixed-Use Complex',
        amount: '₦450,000,000',
        date: '2024-03-20'
      },
      {
        projectTitle: 'Port Harcourt Business District',
        amount: '₦300,000,000',
        date: '2024-02-15'
      }
    ]
  }
];

const mockAnalytics = {
  totalProjects: 2,
  activeProjects: 2,
  totalInvestors: 20,
      totalOwnership: '₦184,500,000',
  projectStatus: {
    active: 2,
    completed: 0,
    upcoming: 1
  },
        ownershipDistribution: {
    residential: '₦112,500,000',
    commercial: '₦72,000,000'
  },
  recentConnections: [
    {
      id: 1,
      investorName: 'John Doe',
      projectTitle: 'Lekki Luxury Apartments',
      amount: '₦12,500,000',
      date: '2024-03-15'
    },
    {
      id: 2,
      investorName: 'Jane Smith',
      projectTitle: 'Maitama Office Complex',
      amount: '₦10,800,000',
      date: '2024-03-20'
    }
  ],
  responseRate: 85,
  projectTypes: {
    residential: 1,
    commercial: 1,
    industrial: 0
  },
  locationDistribution: {
    lagos: 1,
    abuja: 1,
    portHarcourt: 0
  }
};

// Add mock forum data
const mockForums = [
  {
    id: 1,
    title: 'Lekki Luxury Apartments Discussion',
    description: 'Discussion about the Lekki Luxury Apartments project',
    author: 'John Investor',
    date: '2024-03-15',
    content: 'I\'m interested in investing in this project. Can you provide more details about the expected ROI?',
    messages: 12,
    participants: 8,
    replies: [
      {
        author: 'Sarah Developer',
        date: '2024-03-15',
        content: 'The expected ROI is around 15-20% annually. We have a detailed financial projection document that I can share with you.'
      },
      {
        author: 'Mike Investor',
        date: '2024-03-16',
        content: 'What\'s the current occupancy rate of similar properties in the area?'
      }
    ]
  },
  {
    id: 2,
    title: 'Maitama Office Complex Updates',
    description: 'Updates and discussions about the Maitama Office Complex project',
    author: 'Emma Developer',
    date: '2024-03-14',
    content: 'We\'ve completed the foundation work ahead of schedule. Here are some photos of the progress.',
    messages: 8,
    participants: 5,
    replies: [
      {
        author: 'David Investor',
        date: '2024-03-14',
        content: 'Great progress! When do you expect to start the next phase?'
      }
    ]
  }
];

export default function DeveloperDashboard() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [projects, setProjects] = useState(mockProjects);
  const [connections, setConnections] = useState(mockConnections);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);
  const [isLoadingConnections, setIsLoadingConnections] = useState(false);
  const [showAddProjectModal, setShowAddProjectModal] = useState(false);
  const [showInvestorDetails, setShowInvestorDetails] = useState(false);
  const [selectedInvestor, setSelectedInvestor] = useState(null);
  const [toastType, setToastType] = useState('success');
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [analytics, setAnalytics] = useState(mockAnalytics);

  // Add new state for forums
  const [forums, setForums] = useState(mockForums);
  const [selectedForum, setSelectedForum] = useState(null);
  const [showForumModal, setShowForumModal] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [showNewTopicModal, setShowNewTopicModal] = useState(false);
  const [newTopic, setNewTopic] = useState({
    title: '',
    content: '',
    category: 'general'
  });

  // Add new state for form data
  const [newProject, setNewProject] = useState({
    title: '',
    location: '',
    type: '',
    amount: '',
    units: '',
    startDate: '',
    expectedCompletion: '',
    description: '',
    images: [],
    documents: [],
    paymentPlans: []
  });

  // Add new state for file uploads
  const [uploadedImages, setUploadedImages] = useState([]);
  const [uploadedDocuments, setUploadedDocuments] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

  // Form handling with react-hook-form
  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm({
    resolver: yupResolver(developerSchema),
    defaultValues: {
      name: 'John Developer',
      company: 'Lagos Properties Ltd',
      email: 'john@example.com',
      phone: '+234 123 456 7890',
      website: 'https://example.com',
      bio: 'Experienced real estate developer with a focus on sustainable development projects.',
      minUnits: 100,
      maxUnits: 1000000,
      unitPrice: 250000,
      ownershipFocus: ['Residential', 'Commercial'],
      yearsOfExperience: 5,
      certifications: [],
      socialLinks: {}
    }
  });

  // Initial profile data
  const [profile, setProfile] = useState({
    name: 'John Developer',
    company: 'Lagos Properties Ltd',
    email: 'john@example.com',
    phone: '+234 123 456 7890',
    website: 'https://example.com',
    bio: 'Experienced real estate developer with a focus on sustainable development projects.',
    minUnits: 100,
    maxUnits: 1000000,
    unitPrice: 250000,
          ownershipFocus: ['Residential', 'Commercial'],
    completedProjects: [],
    yearsOfExperience: 5,
    certifications: [],
    socialLinks: {},
    isSubscribed: false,
    imageUrl: null
  });

  // Check authentication on component mount
  useEffect(() => {
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    const userType = localStorage.getItem('userType');

    console.log('Auth check:', { isAuthenticated, userType });

    if (!isAuthenticated || userType !== 'developer') {
      navigate('/login');
      return;
    }

    // Initialize with mock data
    setProjects(mockProjects);
    setConnections(mockConnections);
    setForums(mockForums);
    
    // Fetch user profile data
    fetchProfile();
    
    setIsLoading(false);
  }, []);

  // Add a debug effect
  useEffect(() => {
    console.log('State updated:', { 
      isLoading, 
      activeTab, 
      projects: projects.length, 
      connections: connections.length 
    });
  }, [isLoading, activeTab, projects, connections]);

  // Fetch profile data
  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      const developerId = localStorage.getItem('userId');
      const data = await apiCall(`/api/developers/${developerId}`);
      setProfile(data);
      reset(data);
      setPreviewImage(data.imageUrl);
    } catch (error) {
      setError('Failed to load profile');
      console.error('Error fetching profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle profile image change
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  // Handle profile save
  const handleProfileSave = async (data) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const formData = new FormData();
      
      // Handle regular fields
      Object.keys(data).forEach(key => {
        if (key === 'ownershipFocus') {
          formData.append(key, JSON.stringify(data[key]));
        } else if (key === 'minUnits' || key === 'maxUnits' || key === 'unitPrice' || key === 'yearsOfExperience') {
          formData.append(key, data[key].toString());
        } else if (data[key] !== undefined && data[key] !== null) {
          formData.append(key, data[key]);
        }
      });

      // Handle profile image
      if (profileImage) {
        formData.append('logo', profileImage);
      }

      const developerId = localStorage.getItem('userId');
      console.log('Saving profile for developer:', developerId);
      
      const updatedProfile = await apiCall(`/api/developers/${developerId}`, {
        method: 'PUT',
        body: formData,
        headers: {
          // Don't set Content-Type here, let the browser set it with the boundary for FormData
        },
      });

      console.log('Profile update response:', updatedProfile);

      if (updatedProfile.developer) {
        setProfile(updatedProfile.developer);
        setIsEditingProfile(false);
        setSuccess('Profile updated successfully');
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(null), 3000);
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
              setError('Failed to save profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      // Sign out from Supabase Auth
      await signOut(auth)
      
      // Clear localStorage
      localStorage.removeItem('userType');
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('userId');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userName');
      localStorage.removeItem('userPhone');
      
      // Navigate to home
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error)
      // Still clear localStorage and navigate even if Supabase signOut fails
      localStorage.removeItem('userType');
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('userId');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userName');
      localStorage.removeItem('userPhone');
      navigate('/');
    }
  };

  // Toggle dark mode
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  // Fetch projects
  const fetchProjects = async () => {
    try {
      setIsLoadingProjects(true);
      const developerId = localStorage.getItem('userId');
      const data = await apiCall(`/api/projects/${developerId}`);
      setProjects(data);
    } catch (error) {
      setError('Failed to load projects');
      console.error('Error fetching projects:', error);
    } finally {
      setIsLoadingProjects(false);
    }
  };

  // Fetch connection requests
  const fetchConnections = async () => {
    try {
      setIsLoadingConnections(true);
      const developerId = localStorage.getItem('userId');
      const data = await apiCall(`/api/connections/${developerId}`);
      setConnections(data);
    } catch (error) {
      setError('Failed to load connection requests');
      console.error('Error fetching connections:', error);
    } finally {
      setIsLoadingConnections(false);
    }
  };

  // Handle add project
  const handleAddProject = () => {
    setNewProject({
      title: '',
      location: '',
      type: '',
      amount: '',
      units: '',
      startDate: '',
      expectedCompletion: '',
      description: '',
      images: [],
      documents: [],
      paymentPlans: []
    });
    setUploadedImages([]);
    setUploadedDocuments([]);
    setShowAddProjectModal(true);
  };

  // Handle edit project
  const handleEditProject = (project) => {
    setNewProject({
      id: project.id,
      title: project.title,
      location: project.location,
      type: project.type,
      amount: project.amount.replace(/[^0-9]/g, ''),
      units: project.units,
      startDate: project.startDate,
      expectedCompletion: project.expectedCompletion,
      description: project.description || '',
      images: project.images || [],
      documents: project.documents || [],
      paymentPlans: project.paymentPlans || []
    });
    setUploadedImages(project.images || []);
    setUploadedDocuments(project.documents || []);
    setShowAddProjectModal(true);
  };

  // Handle view investor details
  const handleViewInvestorDetails = (investor) => {
    console.log('Viewing investor details:', investor);
    setSelectedInvestor(investor);
    setShowInvestorDetails(true);
  };

  // Close investor details modal
  const handleCloseInvestorDetails = () => {
    setShowInvestorDetails(false);
    setSelectedInvestor(null);
  };

  // Handle toast notification
  const handleToast = (type, message) => {
    setToastType(type);
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProject(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle project submission
  const handleProjectSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      setError(null);

      const formData = new FormData();
      
      // Add project details
      Object.keys(newProject).forEach(key => {
        if (key === 'images' || key === 'documents' || key === 'paymentPlans') {
          formData.append(key, JSON.stringify(newProject[key]));
        } else if (newProject[key] !== undefined && newProject[key] !== null) {
          formData.append(key, newProject[key]);
        }
      });

      // Add uploaded files
      uploadedImages.forEach(image => {
        formData.append('images', image);
      });

      uploadedDocuments.forEach(doc => {
        formData.append('documents', doc);
      });

        const response = await apiCall('/api/projects', {
          method: 'POST',
        body: formData,
      });

      if (response.project) {
        setProjects(prev => [...prev, response.project]);
      setShowAddProjectModal(false);
      setNewProject({
        title: '',
        location: '',
        type: '',
        amount: '',
        units: '',
        startDate: '',
        expectedCompletion: '',
          description: '',
          images: [],
          documents: [],
          paymentPlans: []
        });
        setUploadedImages([]);
        setUploadedDocuments([]);
        handleToast('success', 'Project added successfully');
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Error adding project:', error);
              setError('Failed to add project. Please try again.');
      handleToast('error', 'Failed to add project');
    } finally {
      setIsLoading(false);
    }
  };

  // Default profile image
  const defaultProfileImage = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDE1MCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjE1MCIgaGVpZ2h0PSIxNTAiIGZpbGw9IiNFNUU3RUIiLz48cGF0aCBkPSJNNzUgNzVDODMuMjg0MyA3NSA5MCA2OC4yODQzIDkwIDYwQzkwIDUxLjcxNTcgODMuMjg0MyA0NSA3NSA0NUM2Ni43MTU3IDQ1IDYwIDUxLjcxNTcgNjAgNjBDNjAgNjguMjg0MyA2Ni43MTU3IDc1IDc1IDc1WiIgZmlsbD0iIzk0QTNCQiIvPjxwYXRoIGQ9Ik03NSA4NUM4NS40OTM0IDg1IDk0IDc2LjQ5MzQgOTQgNjZDOTQgNTUuNTA2NiA4NS40OTM0IDQ3IDc1IDQ3QzY0LjUwNjYgNDcgNTYgNTUuNTA2NiA1NiA2NkM1NiA3Ni40OTM0IDY0LjUwNjYgODUgNzUgODVaIiBmaWxsPSIjRTlFQkU2Ii8+PHBhdGggZD0iTTc1IDk1Qzg1LjQ5MzQgOTUgOTQgODYuNDkzNCA5NCA3NkM5NCA2NS41MDY2IDg1LjQ5MzQgNTcgNzUgNTdDNjQuNTA2NiA1NyA1NiA2NS41MDY2IDU2IDc2QzU2IDg2LjQ5MzQgNjQuNTA2NiA5NSA3NSA5NVoiIGZpbGw9IiNFOUVCRTYiLz48L3N2Zz4=';

  // Add file upload handlers
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    setIsUploading(true);
    
    // Simulate file upload
    setTimeout(() => {
      const newImages = files.map(file => ({
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        url: URL.createObjectURL(file),
        size: file.size
      }));
      
      setUploadedImages(prev => [...prev, ...newImages]);
      setNewProject(prev => ({
        ...prev,
        images: [...prev.images, ...newImages]
      }));
      setIsUploading(false);
    }, 1000);
  };

  const handleDocumentUpload = (e) => {
    const files = Array.from(e.target.files);
    setIsUploading(true);
    
    // Simulate file upload
    setTimeout(() => {
      const newDocuments = files.map(file => ({
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        type: file.type,
        size: file.size
      }));
      
      setUploadedDocuments(prev => [...prev, ...newDocuments]);
      setNewProject(prev => ({
        ...prev,
        documents: [...prev.documents, ...newDocuments]
      }));
      setIsUploading(false);
    }, 1000);
  };

  const removeImage = (imageId) => {
    setUploadedImages(prev => prev.filter(img => img.id !== imageId));
    setNewProject(prev => ({
      ...prev,
      images: prev.images.filter(img => img.id !== imageId)
    }));
  };

  const removeDocument = (docId) => {
    setUploadedDocuments(prev => prev.filter(doc => doc.id !== docId));
    setNewProject(prev => ({
      ...prev,
      documents: prev.documents.filter(doc => doc.id !== docId)
    }));
  };

  // Add payment plan handler
  const addPaymentPlan = () => {
    setNewProject(prev => ({
      ...prev,
      paymentPlans: [...prev.paymentPlans, {
        id: Math.random().toString(36).substr(2, 9),
        name: '',
        percentage: '',
        dueDate: ''
      }]
    }));
  };

  const removePaymentPlan = (planId) => {
    setNewProject(prev => ({
      ...prev,
      paymentPlans: prev.paymentPlans.filter(plan => plan.id !== planId)
    }));
  };

  const renderProfile = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
                          </div>
      );
    }

    if (error) {
      return (
        <div className="bg-red-50 dark:bg-red-900/50 p-4 rounded-lg">
          <p className="text-red-600 dark:text-red-400">{error}</p>
                          <button
            onClick={() => setError(null)}
            className="mt-2 text-sm text-red-600 dark:text-red-400 hover:underline"
                          >
            Dismiss
                          </button>
                        </div>
      );
    }

    return (
      <div className="max-w-4xl mx-auto p-4 sm:p-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          <div className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
              <div className="relative w-32 h-32 sm:w-40 sm:h-40">
                <img
                  src={previewImage || profile.imageUrl || 'https://via.placeholder.com/150'}
                              alt="Profile"
                  className="w-full h-full object-cover rounded-lg"
                />
                {isEditingProfile && (
                  <label className="absolute bottom-0 right-0 bg-blue-500 text-white p-2 rounded-full cursor-pointer hover:bg-blue-600 transition-colors">
                            <input
                              type="file"
                      className="hidden"
                              accept="image/*"
                              onChange={handleImageChange}
                    />
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </label>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white truncate">
                  {profile.name || 'Your Name'}
                </h2>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mt-1">
                  {profile.company || 'Your Company'}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {profile.ownershipFocus?.map((focus, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs sm:text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                    >
                      {focus}
                    </span>
                  ))}
                </div>
                          </div>
                        </div>

            {isEditingProfile ? (
              <form onSubmit={handleSubmit(handleProfileSave)} className="mt-6 space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                              Name
                            </label>
                            <input
                              type="text"
                              {...register('name')}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            />
                            {errors.name && (
                              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name.message}</p>
                            )}
                          </div>
                          <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                              Company
                            </label>
                            <input
                              type="text"
                              {...register('company')}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            />
                            {errors.company && (
                              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.company.message}</p>
                            )}
                  </div>
                          </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                              Email
                            </label>
                            <input
                              type="email"
                              {...register('email')}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            />
                            {errors.email && (
                              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email.message}</p>
                            )}
                          </div>
                          <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                              Phone
                            </label>
                            <input
                              type="tel"
                              {...register('phone')}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            />
                            {errors.phone && (
                              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.phone.message}</p>
                            )}
                          </div>
                          </div>

                          <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Bio
                          </label>
                          <textarea
                            {...register('bio')}
                            rows={4}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          />
                          {errors.bio && (
                            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.bio.message}</p>
                          )}
                        </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsEditingProfile(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    {isLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="mt-6">
                <button
                  onClick={() => setIsEditingProfile(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Edit Profile
                </button>
              </div>
                            )}
                          </div>
        </div>
      </div>
    );
  };

  const renderForum = () => {
    if (showForumModal && selectedForum) {
      return (
        <div className="h-screen flex flex-col bg-white dark:bg-gray-800">
          {/* Chat Header */}
          <div className="px-4 py-3 sm:px-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setShowForumModal(false)}
                  className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                </button>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                  {selectedForum.title}
                </h3>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {selectedForum.messages} messages
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {selectedForum.participants} participants
                </span>
              </div>
            </div>
                          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {selectedForum.replies.map((reply, index) => (
              <div
                key={index}
                className={`flex ${reply.author === 'You' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] sm:max-w-[70%] rounded-lg p-3 ${
                    reply.author === 'You'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                  }`}
                >
                  <div className="text-sm font-semibold mb-1">{reply.author}</div>
                  <p className="text-sm sm:text-base">{reply.content}</p>
                  <div className="text-xs mt-1 opacity-75">{reply.date}</div>
                          </div>
              </div>
            ))}
                        </div>

          {/* Chat Input */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800">
            <div className="max-w-4xl mx-auto">
              <div className="flex space-x-2">
                                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="Type your message..."
                  className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-4 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                >
                  Send
                </button>
                              </div>
                          </div>
                        </div>
        </div>
      );
    }

    return (
      <div className="max-w-4xl mx-auto p-4 sm:p-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          <div className="p-8 text-center">
            {/* Icon */}
            <div className="mb-6">
              <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
            </div>

            {/* Title */}
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              🚧 Forum Coming Soon! 🚧
            </h2>

            {/* Description */}
            <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-md mx-auto">
              We're building an amazing community forum where you can connect with other developers, 
              share insights, and discuss real estate opportunities.
            </p>

            {/* Features Preview */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6 max-w-sm mx-auto">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                What's Coming:
              </h3>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
                <li className="flex items-center justify-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Community discussions
                </li>
                <li className="flex items-center justify-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Development tips & strategies
                </li>
                <li className="flex items-center justify-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Real estate market insights
                </li>
                <li className="flex items-center justify-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Networking opportunities
                </li>
              </ul>
            </div>

            {/* CTA */}
            <p className="text-xs text-gray-500 dark:text-gray-400">
              We'll notify you when the forum is ready!
            </p>
          </div>
        </div>
      </div>
    );
  };

  const handleCreateTopic = () => {
    if (!newTopic.title.trim() || !newTopic.content.trim()) return;

    const topic = {
      id: forums.length + 1,
      title: newTopic.title.trim(),
      content: newTopic.content.trim(),
      author: 'You',
      date: new Date().toLocaleString(),
      messages: 0,
      participants: 1,
      replies: []
    };

    setForums([...forums, topic]);
    setShowNewTopicModal(false);
    setNewTopic({ title: '', content: '', category: 'general' });
  };

  // Add handleSendMessage function after handleCreateTopic
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedForum) return;

    const message = {
      author: 'You',
      date: new Date().toLocaleString(),
      content: newMessage.trim()
    };

    // Update the selected forum with the new message
    const updatedForum = {
      ...selectedForum,
      replies: [...selectedForum.replies, message],
      messages: selectedForum.messages + 1
    };

    // Update the forums list
    setForums(forums.map(forum => 
      forum.id === selectedForum.id ? updatedForum : forum
    ));

    // Update the selected forum
    setSelectedForum(updatedForum);

    // Clear the message input
    setNewMessage('');

    // Simulate API call
    try {
      // In a real application, you would make an API call here
      // await apiCall(`/api/forums/${selectedForum.id}/messages`, {
      //   method: 'POST',
      //   body: JSON.stringify(message)
      // });
      
      handleToast('success', 'Message sent successfully');
    } catch (error) {
      console.error('Error sending message:', error);
      handleToast('error', 'Failed to send message');
    }
  };

  // Add the renderAddProjectModal function
  const renderAddProjectModal = () => {
    if (!showAddProjectModal) return null;

    return (
      <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {newProject.id ? 'Edit Project' : 'Add New Project'}
                </h2>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowAddProjectModal(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </motion.button>
              </div>
            
            {error && (
              <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/50 rounded-lg">
                <p className="text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

              <form onSubmit={handleProjectSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Project Title
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={newProject.title}
                      onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      required
                    />
                  </div>

                  <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Location
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={newProject.location}
                      onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      required
                    />
                  </div>

                  <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Project Type
                    </label>
                    <select
                      name="type"
                      value={newProject.type}
                      onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      required
                    >
                    <option value="">Select Type</option>
                      <option value="Residential">Residential</option>
                      <option value="Commercial">Commercial</option>
                      <option value="Industrial">Industrial</option>
                      <option value="Mixed-Use">Mixed-Use</option>
                    </select>
                  </div>

                  <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Total Amount (₦)
                    </label>
                    <input
                      type="number"
                      name="amount"
                      value={newProject.amount}
                      onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      required
                    />
                  </div>

                  <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Number of Units
                    </label>
                    <input
                      type="number"
                      name="units"
                      value={newProject.units}
                      onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      required
                    />
                  </div>

                  <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Start Date
                    </label>
                    <input
                      type="date"
                      name="startDate"
                      value={newProject.startDate}
                      onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      required
                    />
                  </div>

                  <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Expected Completion
                    </label>
                    <input
                      type="date"
                      name="expectedCompletion"
                      value={newProject.expectedCompletion}
                      onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      required
                    />
                  </div>
                </div>

                <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Project Description
                  </label>
                  <textarea
                    name="description"
                    value={newProject.description}
                    onChange={handleInputChange}
                    rows={4}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Project Images
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-md">
                  <div className="space-y-1 text-center">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      stroke="currentColor"
                      fill="none"
                      viewBox="0 0 48 48"
                      aria-hidden="true"
                    >
                      <path
                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <div className="flex text-sm text-gray-600 dark:text-gray-400">
                      <label
                        htmlFor="file-upload"
                        className="relative cursor-pointer bg-white dark:bg-gray-700 rounded-md font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                      >
                        <span>Upload images</span>
                        <input
                          id="file-upload"
                          name="file-upload"
                          type="file"
                          className="sr-only"
                          multiple
                          accept="image/*"
                          onChange={handleImageUpload}
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      PNG, JPG, GIF up to 10MB
                    </p>
                  </div>
                </div>
                {uploadedImages.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                    {uploadedImages.map((image) => (
                      <div key={image.id} className="relative">
                        <img
                          src={image.url}
                          alt={image.name}
                          className="h-24 w-full object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(image.id)}
                          className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Project Documents
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-md">
                  <div className="space-y-1 text-center">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      stroke="currentColor"
                      fill="none"
                      viewBox="0 0 48 48"
                      aria-hidden="true"
                    >
                      <path
                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <div className="flex text-sm text-gray-600 dark:text-gray-400">
                      <label
                        htmlFor="doc-upload"
                        className="relative cursor-pointer bg-white dark:bg-gray-700 rounded-md font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                      >
                        <span>Upload documents</span>
                        <input
                          id="doc-upload"
                          name="doc-upload"
                          type="file"
                          className="sr-only"
                          multiple
                          accept=".pdf,.doc,.docx"
                          onChange={handleDocumentUpload}
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      PDF, DOC, DOCX up to 10MB
                    </p>
                  </div>
                </div>
                {uploadedDocuments.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {uploadedDocuments.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 p-2 rounded">
                        <span className="text-sm text-gray-900 dark:text-white">{doc.name}</span>
                        <button
                          type="button"
                          onClick={() => removeDocument(doc.id)}
                          className="text-red-500 hover:text-red-600"
                        >
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

                <div className="flex justify-end space-x-4">
                <button
                    type="button"
                    onClick={() => setShowAddProjectModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-500 dark:hover:text-gray-200"
                  >
                    Cancel
                </button>
                <button
                    type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Saving...
                </div>
                  ) : (
                    newProject.id ? 'Update Project' : 'Add Project'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  };

  // Investor Details Modal
  const renderInvestorDetails = () => {
    if (!showInvestorDetails || !selectedInvestor) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                Investor Details
              </h3>
              <button
                onClick={handleCloseInvestorDetails}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0 h-12 w-12 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center">
                  <span className="text-white text-lg font-medium">
                    {selectedInvestor.investorName.charAt(0)}
                  </span>
                </div>
                <div>
                  <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    {selectedInvestor.investorName}
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Ownership Focus: {selectedInvestor.ownershipFocus}
                  </p>
                </div>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <h5 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                  Ownership History
                </h5>
                <div className="space-y-2">
                  {selectedInvestor.investments?.map((investment, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {investment.projectTitle}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(investment.date).toLocaleDateString()}
                        </p>
                      </div>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {investment.amount}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <h5 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                  Contact Information
                </h5>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {selectedInvestor.email || 'Not provided'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Phone</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {selectedInvestor.phone || 'Not provided'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <h5 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                  Ownership Preferences
                </h5>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Preferred Locations:</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {selectedInvestor.preferredLocations?.join(', ') || 'Not specified'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Ownership Range:</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                              {selectedInvestor.ownershipRange || 'Not specified'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Header with Logout Button */}
      <div className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Developer Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-full text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                {isDarkMode ? (
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Toast Notifications */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className={`fixed bottom-4 right-4 px-4 py-3 rounded-lg shadow-lg ${
              toastType === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}
          >
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700 mb-8">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`${
                activeTab === 'dashboard'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('projects')}
              className={`${
                activeTab === 'projects'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Projects
            </button>
            <button
              onClick={() => setActiveTab('connections')}
              className={`${
                activeTab === 'connections'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Connections
            </button>
            <button
              onClick={() => setActiveTab('forum')}
              className={`${
                activeTab === 'forum'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Forum
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`${
                activeTab === 'profile'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Profile
            </button>
          </nav>
        </div>

        {/* Content based on active tab */}
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div>
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                {/* Main Analytics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Total Projects</h3>
                    <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{analytics.totalProjects}</p>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                      {analytics.projectStatus.active} Active, {analytics.projectStatus.completed} Completed
                    </p>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Active Projects</h3>
                    <p className="text-3xl font-bold text-green-600 dark:text-green-400">{analytics.activeProjects}</p>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                      {analytics.projectStatus.upcoming} Upcoming Projects
                    </p>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Total Ownership</h3>
                    <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{analytics.totalInvestment}</p>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                      Across {analytics.totalInvestors} Investors
                    </p>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Response Rate</h3>
                    <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">{analytics.responseRate}%</p>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                      Average response time: 24h
                    </p>
                  </div>
                </div>

                {/* Project Distribution */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Project Types</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500 dark:text-gray-400">Residential</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{analytics.projectTypes.residential} Projects</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500 dark:text-gray-400">Commercial</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{analytics.projectTypes.commercial} Projects</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500 dark:text-gray-400">Industrial</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{analytics.projectTypes.industrial} Projects</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Location Distribution</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500 dark:text-gray-400">Lagos</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{analytics.locationDistribution.lagos} Projects</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500 dark:text-gray-400">Abuja</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{analytics.locationDistribution.abuja} Projects</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500 dark:text-gray-400">Port Harcourt</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{analytics.locationDistribution.portHarcourt} Projects</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Connections */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Recent Connections</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Investor</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Project</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Amount</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {analytics.recentConnections.map((connection) => (
                          <tr key={connection.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                              {connection.investorName}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {connection.projectTitle}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {connection.amount}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {new Date(connection.date).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Investment Distribution */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Ownership Distribution</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Residential</span>
                                              <span className="text-sm font-medium text-gray-900 dark:text-white">{analytics.ownershipDistribution.residential}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Commercial</span>
                                              <span className="text-sm font-medium text-gray-900 dark:text-white">{analytics.ownershipDistribution.commercial}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'projects' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Projects</h2>
                  <button
                    onClick={handleAddProject}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
                  >
                    Add New Project
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {projects.map((project) => (
                    <div key={project.id} className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                      <img
                        src={project.imageUrl || 'https://via.placeholder.com/400x200'}
                        alt={project.title}
                        className="w-full h-48 object-cover"
                      />
                      <div className="p-4">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">{project.title}</h3>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{project.location}</p>
                        <div className="mt-4 flex items-center justify-between">
                          <span className="text-sm text-gray-500 dark:text-gray-400">{project.type}</span>
                          <span className="text-sm font-medium text-blue-600 dark:text-blue-400">{project.amount}</span>
                        </div>
                        <div className="mt-4 flex justify-end space-x-2">
                          <button
                            onClick={() => handleEditProject(project)}
                            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                          >
                            Edit
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'connections' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Connections</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {connections.map((connection) => (
                    <div key={connection.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">{connection.investorName}</h3>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{connection.ownershipFocus}</p>
                      <div className="mt-4">
                                                  <p className="text-sm text-gray-500 dark:text-gray-400">Ownership Range: {connection.ownershipRange}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Preferred Locations: {connection.preferredLocations.join(', ')}</p>
                      </div>
                      <div className="mt-4 flex justify-end">
                        <button
                          onClick={() => handleViewInvestorDetails(connection)}
                          className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'forum' && renderForum()}
            {activeTab === 'profile' && renderProfile()}
          </div>
        )}
      </div>

      {/* Add Project Modal */}
      {showAddProjectModal && renderAddProjectModal()}

      {/* Investor Details Modal */}
      {showInvestorDetails && renderInvestorDetails()}
    </div>
  );
} 