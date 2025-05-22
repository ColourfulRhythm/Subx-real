import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { apiCall } from '../../utils/api';
import { motion, AnimatePresence } from 'framer-motion';

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
  investmentFocus: yup.array().min(1, 'Select at least one investment focus'),
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
    totalInvestment: '₦112,500,000'
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
    totalInvestment: '₦72,000,000'
  }
];

const mockConnections = [
  {
    id: 1,
    investorName: 'John Smith',
    investmentFocus: 'Residential Properties',
    email: 'john.smith@example.com',
    phone: '+234 801 234 5678',
    preferredLocations: ['Lagos', 'Abuja', 'Port Harcourt'],
    investmentRange: '₦50M - ₦200M',
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
    investmentFocus: 'Commercial Properties',
    email: 'sarah.j@example.com',
    phone: '+234 802 345 6789',
    preferredLocations: ['Lagos', 'Abuja'],
    investmentRange: '₦100M - ₦500M',
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
    investmentFocus: 'Mixed-Use Developments',
    email: 'michael.b@example.com',
    phone: '+234 803 456 7890',
    preferredLocations: ['Lagos', 'Port Harcourt', 'Calabar'],
    investmentRange: '₦200M - ₦1B',
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
  totalInvestment: '₦184,500,000',
  projectStatus: {
    active: 2,
    completed: 0,
    upcoming: 1
  },
  investmentDistribution: {
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
    // Add new fields
    images: [],
    documents: [],
    amenities: [],
    specifications: {
      totalArea: '',
      floors: '',
      parkingSpaces: '',
      bedrooms: '',
      bathrooms: '',
    },
    locationDetails: {
      address: '',
      city: '',
      state: '',
      coordinates: {
        latitude: '',
        longitude: ''
      }
    },
    paymentPlans: [],
    expectedROI: '',
    completionStatus: '0'
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
      investmentFocus: ['Residential', 'Commercial'],
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
    investmentFocus: ['Residential', 'Commercial'],
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

    if (!isAuthenticated || userType !== 'developer') {
      navigate('/login');
      return;
    }

    // Initialize with mock data
    setProjects(mockProjects);
    setConnections(mockConnections);
    setForums(mockForums); // Add this line
    setIsLoading(false);
  }, []); // Remove navigate from dependencies

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
        if (key === 'investmentFocus') {
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
      setError(error.message || 'Failed to save profile');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('userType');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userId');
    navigate('/');
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
    setShowAddProjectModal(true);
  };

  // Handle edit project
  const handleEditProject = (project) => {
    setNewProject({
      id: project.id,
      title: project.title,
      location: project.location,
      type: project.type,
      amount: project.amount.replace(/[^0-9]/g, ''), // Remove currency symbol and commas
      units: project.units,
      startDate: project.startDate,
      expectedCompletion: project.expectedCompletion,
      description: project.description || ''
    });
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
      const developerId = localStorage.getItem('userId');
      const projectData = {
        ...newProject,
        developerId,
        status: 'pending',
        amount: `₦${Number(newProject.amount).toLocaleString()}` // Format amount with currency
      };

      if (newProject.id) {
        // Update existing project
        const response = await apiCall(`/api/projects/${newProject.id}`, {
          method: 'PUT',
          body: JSON.stringify(projectData)
        });
        
        if (response.error) {
          throw new Error(response.error);
        }
        
        setSuccess('Project updated successfully');
        handleToast('success', 'Project updated successfully');
      } else {
        // Create new project
        const response = await apiCall('/api/projects', {
          method: 'POST',
          body: JSON.stringify(projectData)
        });
        
        if (response.error) {
          throw new Error(response.error);
        }
        
        setSuccess('Project created successfully');
        handleToast('success', 'Project created successfully');
      }

      setShowAddProjectModal(false);
      setNewProject({
        title: '',
        location: '',
        type: '',
        amount: '',
        units: '',
        startDate: '',
        expectedCompletion: '',
        description: ''
      });
      fetchProjects();
    } catch (error) {
      console.error('Error saving project:', error);
      setError(error.message || 'Failed to save project');
      handleToast('error', error.message || 'Failed to save project');
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
    return (
      <div className="max-w-4xl mx-auto p-4 sm:p-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          <div className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
              <div className="relative w-32 h-32 sm:w-40 sm:h-40">
                <img
                  src={profileImage || 'https://via.placeholder.com/150'}
                  alt="Profile"
                  className="w-full h-full object-cover rounded-lg"
                />
                {isEditingProfile && (
                  <label className="absolute bottom-0 right-0 bg-blue-500 text-white p-2 rounded-full cursor-pointer">
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
                  {profile.investmentFocus?.map((focus, index) => (
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
          </div>
        </div>
      </div>
    );
  };

  const renderForum = () => {
    return (
      <div className="max-w-4xl mx-auto p-4 sm:p-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          <div className="p-4 sm:p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Forum</h2>
              <button
                onClick={() => setShowNewTopicModal(true)}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm sm:text-base"
              >
                New Topic
              </button>
            </div>
            
            <div className="space-y-4">
              {forums.map((topic) => (
                <div
                  key={topic.id}
                  className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 sm:p-6 cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => {
                    setSelectedForum(topic);
                    setShowForumModal(true);
                  }}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white truncate">
                        {topic.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">
                        {topic.content}
                      </p>
                    </div>
                    <div className="mt-2 sm:mt-0 sm:ml-4 flex items-center space-x-4">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {topic.messages} messages
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {topic.participants} participants
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Chat Modal */}
        <AnimatePresence>
          {showForumModal && selectedForum && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 overflow-y-auto"
            >
              <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                  <div className="absolute inset-0 bg-gray-500 dark:bg-gray-900 opacity-75"></div>
                </div>

                <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
                  <div className="flex flex-col h-[80vh] sm:h-[600px]">
                    {/* Chat Header */}
                    <div className="px-4 py-3 sm:px-6 border-b border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                          {selectedForum.title}
                        </h3>
                        <button
                          onClick={() => setShowForumModal(false)}
                          className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                        >
                          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
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
                    <div className="border-t border-gray-200 dark:border-gray-700 p-4">
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
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
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {console.log('Rendering with state:', { isLoading, activeTab })}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center">
            <motion.h1 
              whileHover={{ scale: 1.05 }}
              className="text-2xl font-bold bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent"
            >
              Subx
            </motion.h1>
          </div>
          <div className="flex items-center space-x-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleDarkMode}
              className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700"
            >
              {isDarkMode ? (
                <svg className="h-6 w-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLogout}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-red-500 to-red-600 text-white font-medium hover:opacity-90"
            >
              Logout
            </motion.button>
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="border-b border-gray-200 dark:border-gray-700 mb-8"
        >
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            {['dashboard', 'projects', 'investors', 'forums', 'profile'].map((tab) => (
              <motion.button
                key={tab}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveTab(tab)}
                className={`${
                  activeTab === tab
                    ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm capitalize transition-colors duration-200`}
              >
                {tab}
              </motion.button>
            ))}
          </nav>
        </motion.div>

        {/* Main Content */}
        <main>
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Dashboard Tab */}
              {activeTab === 'dashboard' && (
                <div className="space-y-6">
                  {/* Overview Cards */}
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="bg-white dark:bg-gray-800 overflow-hidden shadow-lg rounded-xl transition-all duration-200"
                    >
                      <div className="p-6">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-3">
                            <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                          </div>
                          <div className="ml-5 w-0 flex-1">
                            <dl>
                              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                                Total Projects
                              </dt>
                              <dd className="text-2xl font-semibold text-gray-900 dark:text-white">
                                {analytics.totalProjects}
                              </dd>
                            </dl>
                          </div>
                        </div>
                      </div>
                    </motion.div>

                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="bg-white dark:bg-gray-800 overflow-hidden shadow-lg rounded-xl transition-all duration-200"
                    >
                      <div className="p-6">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-3">
                            <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <div className="ml-5 w-0 flex-1">
                            <dl>
                              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                                Total Investment
                              </dt>
                              <dd className="text-2xl font-semibold text-gray-900 dark:text-white">
                                {analytics.totalInvestment}
                              </dd>
                            </dl>
                          </div>
                        </div>
                      </div>
                    </motion.div>

                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="bg-white dark:bg-gray-800 overflow-hidden shadow-lg rounded-xl transition-all duration-200"
                    >
                      <div className="p-6">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl p-3">
                            <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                          </div>
                          <div className="ml-5 w-0 flex-1">
                            <dl>
                              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                                Total Investors
                              </dt>
                              <dd className="text-2xl font-semibold text-gray-900 dark:text-white">
                                {analytics.totalInvestors}
                              </dd>
                            </dl>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </div>

                  {/* Project Status and Investment Distribution */}
                  <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6"
                    >
                      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                        Project Status
                      </h3>
                      <div className="space-y-4">
                        {Object.entries(analytics.projectStatus).map(([status, count]) => (
                          <div key={status} className="flex items-center justify-between">
                            <span className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                              {status}
                            </span>
                            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {count} projects
                            </span>
                          </div>
                        ))}
                      </div>
                    </motion.div>

                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6"
                    >
                      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                        Investment Distribution
                      </h3>
                      <div className="space-y-4">
                        {Object.entries(analytics.investmentDistribution).map(([type, amount]) => (
                          <div key={type} className="flex items-center justify-between">
                            <span className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                              {type}
                            </span>
                            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {amount}
                            </span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  </div>

                  {/* Recent Connections and Performance Metrics */}
                  <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6"
                    >
                      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                        Recent Connections
                      </h3>
                      <div className="space-y-4">
                        {analytics.recentConnections.map((connection) => (
                          <div key={connection.id} className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                {connection.investorName}
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {connection.projectTitle} • {new Date(connection.date).toLocaleDateString()}
                              </p>
                            </div>
                            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {connection.amount}
                            </span>
                          </div>
                        ))}
                      </div>
                    </motion.div>

                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6"
                    >
                      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                        Response Rate
                      </h3>
                      <div className="flex items-center justify-center">
                        <div className="relative">
                          <svg className="w-24 h-24">
                            <circle
                              className="text-gray-200 dark:text-gray-700"
                              strokeWidth="8"
                              stroke="currentColor"
                              fill="transparent"
                              r="40"
                              cx="48"
                              cy="48"
                            />
                            <circle
                              className="text-green-500"
                              strokeWidth="8"
                              strokeDasharray={251.2}
                              strokeDashoffset={251.2 - (251.2 * analytics.responseRate) / 100}
                              strokeLinecap="round"
                              stroke="currentColor"
                              fill="transparent"
                              r="40"
                              cx="48"
                              cy="48"
                            />
                          </svg>
                          <span className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-gray-900 dark:text-white">
                            {analytics.responseRate}%
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  </div>

                  {/* Project Types and Location Distribution */}
                  <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6"
                    >
                      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                        Project Types
                      </h3>
                      <div className="space-y-4">
                        {Object.entries(analytics.projectTypes).map(([type, count]) => (
                          <div key={type} className="flex items-center justify-between">
                            <span className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                              {type}
                            </span>
                            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {count} projects
                            </span>
                          </div>
                        ))}
                      </div>
                    </motion.div>

                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6"
                    >
                      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                        Location Distribution
                      </h3>
                      <div className="space-y-4">
                        {Object.entries(analytics.locationDistribution).map(([location, count]) => (
                          <div key={location} className="flex items-center justify-between">
                            <span className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                              {location}
                            </span>
                            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {count} projects
                            </span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  </div>
                </div>
              )}

              {/* Projects Tab */}
              {activeTab === 'projects' && (
                <div className="space-y-6">
                  {/* Project List */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6"
                  >
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                        Your Projects
                      </h3>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleAddProject}
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        Add New Project
                      </motion.button>
                    </div>

                    <div className="space-y-4">
                      {projects.map((project) => (
                        <motion.div
                          key={project.id}
                          whileHover={{ scale: 1.02 }}
                          className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                                {project.title}
                              </h4>
                              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                {project.location} • {project.type}
                              </p>
                            </div>
                            <div className="flex items-center space-x-4">
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                project.status === 'Active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                                'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                              }`}>
                                {project.status}
                              </span>
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleEditProject(project)}
                                className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                              >
                                Edit
                              </motion.button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                </div>
              )}

              {/* Investors Tab */}
              {activeTab === 'investors' && (
                <div className="space-y-6">
                  <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                      Connected Investors
                    </h3>
                    <div className="space-y-4">
                      {connections.map((connection) => (
                        <div
                          key={connection.id}
                          className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl"
                        >
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center">
                              <span className="text-white font-medium">
                                {connection.investorName.charAt(0)}
                              </span>
                            </div>
                            <div className="ml-4">
                              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                {connection.investorName}
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                Investment Focus: {connection.investmentFocus}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleViewInvestorDetails(connection)}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full shadow-sm text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                          >
                            View Details
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Forums Tab */}
              {activeTab === 'forums' && (
                <div className="space-y-6">
                  {renderForum()}
                </div>
              )}

              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div className="space-y-6">
                  {renderProfile()}
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Add Project Modal */}
      <AnimatePresence>
        {showAddProjectModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-gray-500/75 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="bg-white dark:bg-gray-800 rounded-2xl max-w-4xl w-full p-8 shadow-xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
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

              <form onSubmit={handleProjectSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Project Title
                    </label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      value={newProject.title}
                      onChange={handleInputChange}
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
                    />
                  </div>

                  <div>
                    <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Location
                    </label>
                    <input
                      type="text"
                      id="location"
                      name="location"
                      value={newProject.location}
                      onChange={handleInputChange}
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
                    />
                  </div>

                  <div>
                    <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Project Type
                    </label>
                    <select
                      id="type"
                      name="type"
                      value={newProject.type}
                      onChange={handleInputChange}
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
                    >
                      <option value="">Select type</option>
                      <option value="Residential">Residential</option>
                      <option value="Commercial">Commercial</option>
                      <option value="Industrial">Industrial</option>
                      <option value="Mixed-Use">Mixed-Use</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Total Amount (₦)
                    </label>
                    <input
                      type="number"
                      id="amount"
                      name="amount"
                      value={newProject.amount}
                      onChange={handleInputChange}
                      required
                      min="0"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
                    />
                  </div>

                  <div>
                    <label htmlFor="units" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Total Units
                    </label>
                    <input
                      type="number"
                      id="units"
                      name="units"
                      value={newProject.units}
                      onChange={handleInputChange}
                      required
                      min="1"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
                    />
                  </div>

                  <div>
                    <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Start Date
                    </label>
                    <input
                      type="date"
                      id="startDate"
                      name="startDate"
                      value={newProject.startDate}
                      onChange={handleInputChange}
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
                    />
                  </div>

                  <div>
                    <label htmlFor="expectedCompletion" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Expected Completion
                    </label>
                    <input
                      type="date"
                      id="expectedCompletion"
                      name="expectedCompletion"
                      value={newProject.expectedCompletion}
                      onChange={handleInputChange}
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Project Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={newProject.description}
                    onChange={handleInputChange}
                    rows={4}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
                  />
                </div>

                {/* Project Images */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Project Images
                  </label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-lg">
                    <div className="space-y-1 text-center">
                      <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <div className="flex text-sm text-gray-600 dark:text-gray-400">
                        <label className="relative cursor-pointer bg-white dark:bg-gray-800 rounded-md font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                          <span>Upload images</span>
                          <input type="file" className="sr-only" multiple accept="image/*" onChange={handleImageUpload} />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">PNG, JPG, GIF up to 10MB</p>
                    </div>
                  </div>
                  
                  {/* Image Preview Grid */}
                  {uploadedImages.length > 0 && (
                    <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {uploadedImages.map((image) => (
                        <div key={image.id} className="relative group">
                          <img src={image.url} alt={image.name} className="h-24 w-full object-cover rounded-lg" />
                          <button
                            type="button"
                            onClick={() => removeImage(image.id)}
                            className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
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

                {/* Project Documents */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Project Documents
                  </label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-lg">
                    <div className="space-y-1 text-center">
                      <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <div className="flex text-sm text-gray-600 dark:text-gray-400">
                        <label className="relative cursor-pointer bg-white dark:bg-gray-800 rounded-md font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                          <span>Upload documents</span>
                          <input type="file" className="sr-only" multiple accept=".pdf,.doc,.docx" onChange={handleDocumentUpload} />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">PDF, DOC up to 10MB</p>
                    </div>
                  </div>
                  
                  {/* Document List */}
                  {uploadedDocuments.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {uploadedDocuments.map((doc) => (
                        <div key={doc.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                            <span className="text-sm text-gray-900 dark:text-gray-100">{doc.name}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeDocument(doc.id)}
                            className="text-red-500 hover:text-red-700"
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

                {/* Project Specifications */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label htmlFor="totalArea" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Total Area (sq ft)
                    </label>
                    <input
                      type="number"
                      id="totalArea"
                      name="specifications.totalArea"
                      value={newProject.specifications.totalArea}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
                    />
                  </div>
                  <div>
                    <label htmlFor="floors" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Number of Floors
                    </label>
                    <input
                      type="number"
                      id="floors"
                      name="specifications.floors"
                      value={newProject.specifications.floors}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
                    />
                  </div>
                  <div>
                    <label htmlFor="parkingSpaces" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Parking Spaces
                    </label>
                    <input
                      type="number"
                      id="parkingSpaces"
                      name="specifications.parkingSpaces"
                      value={newProject.specifications.parkingSpaces}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
                    />
                  </div>
                  <div>
                    <label htmlFor="expectedROI" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Expected ROI (%)
                    </label>
                    <input
                      type="number"
                      id="expectedROI"
                      name="expectedROI"
                      value={newProject.expectedROI}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
                    />
                  </div>
                </div>

                {/* Location Details */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Address
                    </label>
                    <input
                      type="text"
                      id="address"
                      name="locationDetails.address"
                      value={newProject.locationDetails.address}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
                    />
                  </div>
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      City
                    </label>
                    <input
                      type="text"
                      id="city"
                      name="locationDetails.city"
                      value={newProject.locationDetails.city}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
                    />
                  </div>
                  <div>
                    <label htmlFor="state" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      State
                    </label>
                    <input
                      type="text"
                      id="state"
                      name="locationDetails.state"
                      value={newProject.locationDetails.state}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
                    />
                  </div>
                </div>

                {/* Payment Plans */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Payment Plans
                    </label>
                    <button
                      type="button"
                      onClick={addPaymentPlan}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Add Plan
                    </button>
                  </div>
                  <div className="space-y-4">
                    {newProject.paymentPlans.map((plan) => (
                      <div key={plan.id} className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <div>
                          <input
                            type="text"
                            placeholder="Plan Name"
                            value={plan.name}
                            onChange={(e) => {
                              const updatedPlans = newProject.paymentPlans.map(p =>
                                p.id === plan.id ? { ...p, name: e.target.value } : p
                              );
                              setNewProject(prev => ({ ...prev, paymentPlans: updatedPlans }));
                            }}
                            className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
                          />
                        </div>
                        <div>
                          <input
                            type="number"
                            placeholder="Percentage"
                            value={plan.percentage}
                            onChange={(e) => {
                              const updatedPlans = newProject.paymentPlans.map(p =>
                                p.id === plan.id ? { ...p, percentage: e.target.value } : p
                              );
                              setNewProject(prev => ({ ...prev, paymentPlans: updatedPlans }));
                            }}
                            className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
                          />
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="date"
                            value={plan.dueDate}
                            onChange={(e) => {
                              const updatedPlans = newProject.paymentPlans.map(p =>
                                p.id === plan.id ? { ...p, dueDate: e.target.value } : p
                              );
                              setNewProject(prev => ({ ...prev, paymentPlans: updatedPlans }));
                            }}
                            className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
                          />
                          <button
                            type="button"
                            onClick={() => removePaymentPlan(plan.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Submit Buttons */}
                <div className="flex justify-end space-x-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="button"
                    onClick={() => setShowAddProjectModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="submit"
                    disabled={isUploading}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isUploading ? (
                      <div className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Uploading...
                      </div>
                    ) : (
                      newProject.id ? 'Update Project' : 'Create Project'
                    )}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Investor Details Modal */}
      {showInvestorDetails && selectedInvestor && (
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
                    Investment Focus: {selectedInvestor.investmentFocus}
                  </p>
                </div>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <h5 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                  Investment History
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
                  Investment Preferences
                </h5>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Preferred Locations:</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {selectedInvestor.preferredLocations?.join(', ') || 'Not specified'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Investment Range:</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {selectedInvestor.investmentRange || 'Not specified'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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
    </div>
  );
} 