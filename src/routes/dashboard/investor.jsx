import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { motion, AnimatePresence } from 'framer-motion'
import AIAnalysis from '../../components/AIAnalysis'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { doc, updateDoc } from 'firebase/firestore'
import { auth, db } from '../../firebase'
import PaymentSuccessModal from '../../components/PaymentSuccessModal'
import DeedSignatureModal from '../../components/DeedSignatureModal'
import { generateReceipt, generateOwnershipCertificate, generateDeedPDF } from '../../components/ReceiptDownload'

// API endpoints (to be implemented)
const API_ENDPOINTS = {
  PROFILE: '/api/investor/profile',
  OPPORTUNITIES: '/api/investor/opportunities',
  CONNECTIONS: '/api/investor/connections',
  INVESTMENTS: '/api/investor/investments'
}

// Validation schema for profile
const profileSchema = yup.object().shape({
  name: yup.string().required('Name is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  phone: yup.string().matches(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number'),
  bio: yup.string().max(500, 'Bio must be less than 500 characters'),
  investmentInterests: yup.array().min(1, 'Select at least one interest'),
  investmentExperience: yup.string().required('Investment experience is required'),
  preferredInvestmentAmount: yup.number().min(10000, 'Minimum investment amount is $10,000').required('Preferred investment amount is required'),
  preferredLocations: yup.array().min(1, 'Select at least one preferred location'),
  riskTolerance: yup.string().required('Risk tolerance is required'),
  investmentGoals: yup.array().min(1, 'Select at least one investment goal')
})

// Add developer profiles
const mockDevelopers = {
  'dev1': {
    id: 'dev1',
    name: 'Lagos Properties Ltd',
    minUnits: 100,
    maxUnits: 1000000,
    unitPrice: 250000 // ₦250,000 per unit
  },
  'dev2': {
    id: 'dev2',
    name: 'Abuja Developers',
    minUnits: 50,
    maxUnits: 1000000,
    unitPrice: 180000 // ₦180,000 per unit
  },
  'dev3': {
    id: 'dev3',
    name: 'Port Harcourt Estates',
    minUnits: 150,
    maxUnits: 1000000,
    unitPrice: 350000 // ₦350,000 per unit
  },
  'focalpoint': {
    id: 'focalpoint',
    name: 'Focal Point Property Development and Management Services Ltd.',
    minUnits: 4,
    maxUnits: 5000,
    unitPrice: 5000 // ₦5,000 per sqm
  }
}

// Filter options
const locationOptions = ['All', 'Lagos', 'Abuja', 'Port Harcourt', 'Kano', 'Calabar']
const typeOptions = ['All', 'Residential', 'Commercial', 'Industrial', 'Mixed-Use']

// Add mock connections data
const mockConnections = [
  {
    id: 1,
    developer: 'Focal Point Property Development and Management Services Ltd.',
    developerId: 'focalpoint',
    projectId: 76, // Example plot/project ID
    projectTitle: '2 Seasons - Plot 76',
    units: 1,
    amount: '₦2,500,000',
    status: 'approved',
    createdAt: '2024-07-18T10:00:00Z',
    notes: 'Interested in long-term ownership',
    updatedAt: '2024-07-18T10:30:00Z',
    documents: [] // Will be fetched from backend
  }
];

// Forum data will be populated dynamically when users create topics

// Add mock messages data
const mockMessages = [
  {
    id: 1,
    type: 'investor',
    author: 'John Doe',
    avatar: 'https://ui-avatars.com/api/?name=John+Doe&background=random',
    content: "What are the current market trends in Lagos? I'm particularly interested in the Lekki area.",
    timestamp: '2024-03-20T10:30:00Z',
    likes: 5
  },
  {
    id: 2,
    type: 'developer',
    author: 'Lagos Properties Ltd',
    avatar: 'https://ui-avatars.com/api/?name=Lagos+Properties&background=random',
    content: "The Lekki area is experiencing significant growth, with property values increasing by 15% year-over-year. We're seeing strong demand for both residential and commercial properties.",
    timestamp: '2024-03-20T10:35:00Z',
    likes: 8
  },
  {
    id: 3,
    type: 'update',
    author: 'Lagos Properties Ltd',
    avatar: 'https://ui-avatars.com/api/?name=Lagos+Properties&background=random',
    content: "📢 Construction Update: Phase 1 of the Lekki Luxury Apartments is now 75% complete. We're on track for the Q3 2024 completion date.",
    timestamp: '2024-03-20T11:00:00Z',
    isUpdate: true
  },
  {
    id: 4,
    type: 'investor',
    author: 'Jane Smith',
    avatar: 'https://ui-avatars.com/api/?name=Jane+Smith&background=random',
    content: "That's great news! What about the amenities? Will there be a swimming pool and gym?",
    timestamp: '2024-03-20T11:05:00Z',
    likes: 3
  }
];
// Add Paystack script loader

// Add Paystack payment handler
const payWithPaystack = (amount, email, name) => {
  if (!window.PaystackPop) {
    alert('Payment gateway not loaded. Please try again.');
    return;
  }
  const reference = 'SUBX-' + Math.floor(Math.random() * 1000000000);
  const handler = window.PaystackPop.setup({
    key: 'pk_live_c6e9456f9a1b1071ed96b977c21f8fae727400e0',
    email: email,
    amount: amount * 100, // Paystack expects amount in kobo
    currency: 'NGN',
    ref: reference,
    label: name,
    callback: function(response) {
      // Show a loading spinner or message
      fetch(`http://localhost:30002/api/verify-paystack/${response.reference}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            // Payment is verified!
            // Show receipt, update user profile, etc.
          } else {
            // Show error
          }
        })
        .catch(() => {
          // Network or server error, show error
        });
    },
    onClose: function() {
      handleToast('Payment window closed', 'info');
    }
  });
  handler.openIframe();
};

export default function InvestorDashboard() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('discover');
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [expandedCard, setExpandedCard] = useState(null)
  const [connections, setConnections] = useState([])
  const [projects, setProjects] = useState([])
  const [selectedProject, setSelectedProject] = useState(null)
  const [showProjectModal, setShowProjectModal] = useState(false)
  const [showConnectionModal, setShowConnectionModal] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [selectedImage, setSelectedImage] = useState(0)
  const [filters, setFilters] = useState({
    location: 'All',
    type: 'All',
    search: ''
  })
  const [unitPrice, setUnitPrice] = useState(0)
  const [minUnits, setMinUnits] = useState(1)
  const [maxUnits, setMaxUnits] = useState(100)
  const [selectedUnits, setSelectedUnits] = useState(1)
  const [investmentAmount, setInvestmentAmount] = useState('')
  const [investmentError, setInvestmentError] = useState('')
  const [investmentNotes, setInvestmentNotes] = useState('')
  const [isSendingRequest, setIsSendingRequest] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [toastType, setToastType] = useState('success')
  const [showNewTopicModal, setShowNewTopicModal] = useState(false)
  const [showChatModal, setShowChatModal] = useState(false)
  const [selectedTopic, setSelectedTopic] = useState(null)
  const [newMessage, setNewMessage] = useState('')
  const [isSendingMessage, setIsSendingMessage] = useState(false)
  const [forumSearchQuery, setForumSearchQuery] = useState('')
  const [forumTopics, setForumTopics] = useState([])
  const [forums, setForums] = useState({
    general: {
      topics: []
    },
    projectForums: {}
  })
  const [analytics, setAnalytics] = useState({
    totalInvestments: 0,
    activeInvestments: 0,
    totalReturns: 0,
    portfolioValue: 0,
    growthRate: 0,
    investmentDistribution: {},
    expectedReturns: {},
    recentTransactions: [],
    performanceMetrics: {
      monthlyReturn: 0,
      yearlyReturn: 0,
      riskScore: 0
    }
  })
  const [profile, setProfile] = useState(null)
  const [profileImage, setProfileImage] = useState(null)
  const [showShareModal, setShowShareModal] = useState(false)
  const [projectToShare, setProjectToShare] = useState(null)
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    darkMode: false,
    language: 'en'
  })
  const [showConnectionDetails, setShowConnectionDetails] = useState(false)
  const [selectedConnection, setSelectedConnection] = useState(null)
  const [activeForum, setActiveForum] = useState('general')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [newTopic, setNewTopic] = useState({
    title: '',
    content: '',
    category: 'general'
  })
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  // Add state for payment/deed modals and document storage
  const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);
  const [showDeedModal, setShowDeedModal] = useState(false);
  const [receipts, setReceipts] = useState([]); // {reference, date}
  const [deeds, setDeeds] = useState([]); // {date, signatureDataUrl}
  const [showSqmModal, setShowSqmModal] = useState(false);
  const [desiredSqm, setDesiredSqm] = useState(2);
  const [sqmError, setSqmError] = useState('');
  // Add state for fetched documents
  const [connectionDocuments, setConnectionDocuments] = useState([]);
  const [messages, setMessages] = useState([]);

  // Add profileImage state
  const handleImageChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      try {
        // Create a preview URL
        const previewUrl = URL.createObjectURL(file);
        setProfileImage(previewUrl);

        // Upload to Firebase Storage
        const storageRef = ref(storage, `profile_images/${auth.currentUser.uid}`);
        const uploadResult = await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(uploadResult.ref);

        // Update profile in Firestore
        const userRef = doc(db, 'users', auth.currentUser.uid);
        await updateDoc(userRef, {
          profileImage: downloadURL
        });

        handleToast('Profile picture updated successfully');
      } catch (error) {
        console.error('Error uploading profile image:', error);
        handleToast('Failed to update profile picture', 'error');
      }
    }
  };

  // Form handling with react-hook-form
  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm({
    resolver: yupResolver(profileSchema),
    defaultValues: profile
  });

  // Calculate profile completion percentage
  const calculateProfileCompletion = (data) => {
    const requiredFields = [
      'name',
      'email',
      'phone',
      'bio',
      'investmentExperience',
      'preferredInvestmentAmount',
      'riskTolerance'
    ];
    
    const optionalFields = [
      'investmentInterests',
      'preferredLocations',
      'investmentGoals'
    ];

    let completedRequired = 0;
    let completedOptional = 0;

    // Check required fields
    requiredFields.forEach(field => {
      if (data[field] && data[field].toString().trim() !== '') {
        completedRequired++;
      }
    });

    // Check optional fields
    optionalFields.forEach(field => {
      if (data[field] && Array.isArray(data[field]) && data[field].length > 0) {
        completedOptional++;
      }
    });

    // Calculate completion percentage
    const requiredWeight = 0.7; // 70% weight for required fields
    const optionalWeight = 0.3; // 30% weight for optional fields

    const requiredCompletion = (completedRequired / requiredFields.length) * requiredWeight;
    const optionalCompletion = (completedOptional / optionalFields.length) * optionalWeight;

    return Math.round((requiredCompletion + optionalCompletion) * 100);
  };

  // Check authentication on component mount
  useEffect(() => {
    const isAuthenticated = localStorage.getItem('isAuthenticated')
    const userType = localStorage.getItem('userType')

    if (!isAuthenticated || userType !== 'investor') {
      navigate('/login')
      return
    }

    // Simulate loading data
    setTimeout(() => {
      setIsLoading(false)
    }, 1000)
  }, [navigate])

  // Fetch profile and analytics data on component mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Not authenticated');
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    
    // Load analytics data immediately
    fetchAnalytics();
    
    Promise.all([
      fetch('/api/investors/profile', { headers: { Authorization: `Bearer ${token}` } })
        .then(res => res.json()),
      fetch('/api/projects').then(res => res.json()),
      fetch('/api/connections/' + JSON.parse(atob(token.split('.')[1])).id).then(res => res.json()),
      fetch('/api/admin/messages?userId=' + JSON.parse(atob(token.split('.')[1])).id, { headers: { Authorization: `Bearer ${token}` } }).then(res => res.json())
    ])
      .then(([profileData, projectsData, connectionsData, messagesData]) => {
        setProfile(profileData);
        setProjects(Array.isArray(projectsData) ? projectsData : []);
        setConnections(Array.isArray(connectionsData) ? connectionsData : []);
        setMessages(Array.isArray(messagesData) ? messagesData : []);
        setIsLoading(false);
      })
      .catch(err => {
        setError('Failed to load data');
        setIsLoading(false);
      });
  }, []);

  // Load Paystack script on mount
  useEffect(() => {
    if (!window.PaystackPop) {
      const script = document.createElement('script');
      script.src = 'https://js.paystack.co/v1/inline.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  // API integration functions
  const fetchProfile = async () => {
    try {
      // For now, use mock data since backend is not connected
      const mockProfileData = {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+2341234567890',
        bio: 'Experienced real estate investor with a focus on residential properties.',
        investmentExperience: 'Advanced',
        preferredInvestmentAmount: 50000000,
        riskTolerance: 'Moderate',
        investmentInterests: ['Residential', 'Commercial'],
        preferredLocations: ['Lagos', 'Abuja'],
        investmentGoals: ['Long-term Growth', 'Portfolio Diversification']
      };
      
      setProfile(mockProfileData);
    } catch (error) {
      console.error('Error fetching profile:', error);
      handleToast('Failed to load profile data', 'error');
    }
  };

  const handleProfileSave = async (data) => {
    try {
      setIsLoading(true);
      setError(null);

      // Validate required fields
      const requiredFields = ['name', 'email', 'phone', 'bio', 'investmentExperience'];
      const missingFields = requiredFields.filter(field => !data[field] || data[field].toString().trim() === '');
      
      if (missingFields.length > 0) {
        throw new Error(`Please fill in all required fields: ${missingFields.join(', ')}`);
      }

      // Validate phone number format
      const phoneRegex = /^\+?[\d\s-()]{10,}$/;
      if (!phoneRegex.test(data.phone)) {
        throw new Error('Please enter a valid phone number');
      }

      // Validate investment amount
      if (data.preferredInvestmentAmount && isNaN(data.preferredInvestmentAmount)) {
        throw new Error('Please enter a valid investment amount');
      }

      // TODO: Replace with actual API call
      const response = await fetch('/api/investor/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to save profile');
      }
      
      // Update profile completion
      const completion = calculateProfileCompletion(data);
      const updatedProfile = { ...data, profileCompletion: completion };
      
      setProfile(updatedProfile);
      setIsEditingProfile(false);
      handleToast('Profile updated successfully', 'success');
    } catch (error) {
      console.error('Error saving profile:', error);
      setError(error.message || 'Failed to save profile. Please try again later.');
      handleToast(error.message || 'Failed to save profile', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('userType')
    localStorage.removeItem('isAuthenticated')
    navigate('/')
  }

  const handleShare = (project) => {
    setProjectToShare(project)
    setShowShareModal(true)
  }

  const handleCloseShareModal = () => {
    setShowShareModal(false)
    setProjectToShare(null)
  }

  const handleShareToSocial = (platform) => {
    if (!projectToShare) return

    const shareText = `Check out this amazing development opportunity: ${projectToShare.title} - ${projectToShare.description}`
    const shareUrl = window.location.href

    let shareLink = ''
    switch (platform) {
      case 'whatsapp':
        shareLink = `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`
        break
      case 'telegram':
        shareLink = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`
        break
      case 'twitter':
        shareLink = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`
        break
      case 'facebook':
        shareLink = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`
        break
      case 'linkedin':
        shareLink = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`
        break
      case 'instagram':
        // Instagram doesn't support direct sharing via URL
        handleToast('To share on Instagram, please save the image and share it to your story', 'info')
        return
      default:
        return
    }

    window.open(shareLink, '_blank')
    handleCloseShareModal()
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const handleTabChange = (tab) => {
    setActiveTab(tab)
    setSelectedProject(null)
    setShowProjectModal(false)
    setShowConnectionModal(false)
    
    // Reset profile states when switching to profile tab
    if (tab === 'profile') {
      setIsEditingProfile(false)
      setShowSettings(false)
      // Always fetch profile data when switching to profile tab
      fetchProfile()
    }
  }

  // Filter projects based on selected filters
  const filteredProjects = projects.filter(project => {
    const matchesLocation = filters.location === 'All' || project.location === filters.location
    const matchesType = filters.type === 'All' || project.type === filters.type
    const matchesSearch = project.title.toLowerCase().includes(filters.search.toLowerCase()) ||
                         project.developer.toLowerCase().includes(filters.search.toLowerCase())
    return matchesLocation && matchesType && matchesSearch
  })

  // Handle filter changes
  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }))
  }

  // Handle connection request
  const handleConnectionRequest = async (project) => {
    try {
    setSelectedProject(project)
      // Debug: Log developerId and mockDevelopers
      console.log('handleConnectionRequest: developerId', project.developerId)
      console.log('Available developers:', Object.keys(mockDevelopers))
    // Get developer profile
    const developer = mockDevelopers[project.developerId]
    if (!developer) {
        handleToast('Developer profile not found for ID: ' + project.developerId, 'error')
      return
    }
    
    // Set unit price and limits from developer profile
    setUnitPrice(developer.unitPrice)
    setMinUnits(developer.minUnits)
    setMaxUnits(developer.maxUnits)
    
    // Set initial units to minimum required
    setSelectedUnits(developer.minUnits)
    
    // Calculate and format initial investment amount
    const initialAmount = developer.minUnits * developer.unitPrice
    setInvestmentAmount(initialAmount.toLocaleString('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }))
    
    setShowConnectionModal(true)
    } catch (error) {
      console.error('Error handling connection request:', error)
      handleToast('Failed to process connection request', 'error')
    }
  }

  const validateInvestment = (units) => {
    const num = parseInt(units)
    if (isNaN(num)) {
      setInvestmentError('Please enter a valid number')
      return false
    }
    
    if (num < minUnits) {
      setInvestmentError(`Minimum ${minUnits} units required`)
      return false
    }
    
    if (num > maxUnits) {
      setInvestmentError(`Maximum ${maxUnits.toLocaleString()} units allowed`)
      return false
    }
    
    setInvestmentError('')
    return true
  }

  const handleUnitChange = (e) => {
    const value = e.target.value
    setSelectedUnits(value)
    
    if (validateInvestment(value)) {
      const amount = parseInt(value) * unitPrice
      setInvestmentAmount(amount.toLocaleString('en-NG', {
        style: 'currency',
        currency: 'NGN',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }))
    }
  }

  // Remove duplicate showToast function and use the existing one
  const handleToast = (message, type = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  const handleRequestSubmit = () => {
    if (!validateInvestment(selectedUnits)) {
      return;
    }
    submitConnectionRequest();
  }

  const submitConnectionRequest = async () => {
    try {
      if (!validateInvestment(selectedUnits)) {
        return;
      }

      setIsSendingRequest(true);
      
      // Get Firebase ID token
      const user = auth.currentUser;
      if (!user) {
        handleToast('Please log in to submit investment requests', 'error');
        return;
      }

      const token = await user.getIdToken();
      
      // Prepare request data
      const requestData = {
        projectId: selectedProject.id,
        units: parseInt(selectedUnits),
        notes: investmentNotes
      };

      // Send request to backend
      const response = await fetch('http://localhost:30001/api/investments/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit investment request');
      }

      const data = await response.json();

      // Create new connection object
      const newConnection = {
        id: data.investment._id,
        developerId: selectedProject.developerId,
        developer: selectedProject.developer,
        projectId: selectedProject.id,
        projectTitle: selectedProject.title,
        units: selectedUnits,
        amount: investmentAmount,
        status: 'pending',
        createdAt: new Date().toISOString(),
        notes: investmentNotes,
        documents: []
      };

      // Update connections list
      setConnections(prev => [newConnection, ...prev]);
      
      // Show success message
      handleToast(
        `Investment request sent successfully! We've notified ${selectedProject.developer} about your interest in ${selectedUnits} unit(s) (${investmentAmount}).`
      );

      // Switch to connections tab
      setActiveTab('connections');
      
      // Reset states
      setSelectedUnits(1);
      setInvestmentAmount('');
      setInvestmentNotes('');
      setUnitPrice(0);
      setMinUnits(1);
      setMaxUnits(100);
      setInvestmentError('');
      
      // Close modals
      setShowConnectionModal(false);
      setShowConfirmation(false);
      
    } catch (error) {
      console.error('Error in submitConnectionRequest:', error);
      handleToast(
        error.message || 'Failed to send investment request. Please try again later.',
        'error'
      );
    } finally {
      setIsSendingRequest(false);
    }
  };

  const handleViewConnectionDetails = (developer) => {
    setSelectedConnection(developer)
    setShowConnectionDetails(true)
  }

  // Toggle dark mode
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  // Toggle card expansion
  const toggleCardExpansion = (cardId) => {
    setExpandedCard(expandedCard === cardId ? null : cardId);
  };

  // Add this function to handle project selection
  const handleProjectSelect = (project) => {
    setSelectedProject(project)
    setShowProjectModal(true)
    setSelectedImage(0)
  }

  // Update handleInvestNow to trigger Paystack
  const handleOwnNow = (project) => {
    setSelectedProject(project);
    setDesiredSqm(project.minUnits || 2); // default to minimum
    setSqmError('');
    setShowSqmModal(true);
  };

  // Find the section where project cards are rendered and modify it to include AI Analysis
  const renderProjectCards = () => {
    if (!projects || projects.length === 0 || projects.every(p => p.title && p.title.includes('2 Seasons'))) {
      return (
        <div className="flex flex-col items-center justify-center py-16">
          <h2 className="text-2xl font-bold mb-4 text-indigo-700">Welcome to Subx by Focal Point Prop.</h2>
          <p className="text-lg text-gray-700 mb-2">We are building a billion dollar portfolio through group buying and co-ownership.</p>
          <p className="text-lg text-indigo-700 font-semibold">Listings coming soon.</p>
        </div>
      );
    }
    return (
      <div className="grid grid-cols-1 gap-6 p-4">
        {projects.map((project) => (
        <motion.div 
            key={project.id}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
            initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.01 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex flex-col md:flex-row">
              <div className="relative w-full md:w-1/2 aspect-video md:aspect-square">
                <img
                  src={project.images[0]}
                  alt={project.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 right-4 bg-blue-600 text-white px-3 py-1 rounded-full text-sm">
                  {project.status}
          </div>
          </div>
              
              <div className="p-6 flex-1">
                <h3 className="text-2xl font-semibold mb-3 text-gray-900 dark:text-white">{project.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">{project.description}</p>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Location</p>
                    <p className="font-medium text-gray-900 dark:text-white">{project.location}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Type</p>
                    <p className="font-medium text-gray-900 dark:text-white">{project.type}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Amount</p>
                    <p className="font-medium text-gray-900 dark:text-white">{project.amount}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">ROI</p>
                    <p className="font-medium text-gray-900 dark:text-white">{project.roi}</p>
                  </div>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => handleShare(project)}
                    className="px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center space-x-2"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                    <span>Share</span>
                  </button>
                  <button
                    onClick={() => handleProjectSelect(project)}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:opacity-90 transition-opacity"
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
            </motion.div>
        ))}
      </div>
    );
  };

  // Add this function to fetch analytics data
  const fetchAnalytics = async () => {
    try {
      // Realistic land sub-ownership analytics data
      const mockAnalytics = {
        totalLandOwned: 250, // 250 square meters
        activeLandUnits: 150, // 150 square meters
        totalLandValue: 1250000, // ₦1.25M (₦5,000 per sqm)
        portfolioValue: 750000, // ₦750K (current market value)
        growthRate: 8.5, // Year-over-Year land value growth
        landDistribution: {
          residential: 60, // 60% residential land
          commercial: 25, // 25% commercial land
          agricultural: 10, // 10% agricultural land
          mixed: 5 // 5% mixed-use land
        },
        expectedReturns: {
          threeMonths: 62500, // ₦62.5K (5% appreciation)
          sixMonths: 125000, // ₦125K (10% appreciation)
          oneYear: 250000 // ₦250K (20% appreciation)
        },
        recentTransactions: [
          { id: 1, type: 'Land Purchase', amount: 50000, date: '2024-03-15', status: 'Completed', units: '10 sqm' },
          { id: 2, type: 'Land Appreciation', amount: 25000, date: '2024-03-10', status: 'Completed', units: '5 sqm' },
          { id: 3, type: 'Land Purchase', amount: 75000, date: '2024-03-01', status: 'Completed', units: '15 sqm' }
        ],
        performanceMetrics: {
          monthlyReturn: 1.2, // 1.2% monthly land appreciation
          yearlyReturn: 15.5, // 15.5% yearly land appreciation
          riskScore: 35 // Low risk for land ownership
        }
      }
      setAnalytics(mockAnalytics)
    } catch (error) {
      console.error('Error fetching analytics:', error)
      setError('Failed to load analytics data')
    }
  }

  // Add this function to render analytics section
  const renderAnalytics = () => {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Total Land Owned</h3>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{(analytics.totalLandOwned || 0).toLocaleString()} sqm</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Active Land Units</h3>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">{(analytics.activeLandUnits || 0).toLocaleString()} sqm</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Total Land Value</h3>
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">₦{(analytics.totalLandValue || 0).toLocaleString()}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Portfolio Value</h3>
            <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">₦{(analytics.portfolioValue || 0).toLocaleString()}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">Performance Metrics</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-600 dark:text-gray-400">Monthly Appreciation</label>
                <div className="flex items-center">
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${analytics.performanceMetrics.monthlyReturn * 4}%` }}></div>
                  </div>
                  <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">{analytics.performanceMetrics.monthlyReturn}%</span>
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-600 dark:text-gray-400">Yearly Appreciation</label>
                <div className="flex items-center">
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-green-600 h-2.5 rounded-full" style={{ width: `${analytics.performanceMetrics.yearlyReturn / 2}%` }}></div>
                  </div>
                  <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">{analytics.performanceMetrics.yearlyReturn}%</span>
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-600 dark:text-gray-400">Risk Score</label>
                <div className="flex items-center">
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-yellow-600 h-2.5 rounded-full" style={{ width: `${analytics.performanceMetrics.riskScore}%` }}></div>
                  </div>
                  <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">{analytics.performanceMetrics.riskScore}/100</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">Land Distribution</h3>
            <div className="space-y-3">
              {Object.entries(analytics.landDistribution).map(([type, percentage]) => (
                <div key={type} className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">{type}</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{percentage}%</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">Expected Appreciation</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">3 Months</span>
                <span className="font-medium text-green-600 dark:text-green-400">₦{(analytics.expectedReturns?.threeMonths || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">6 Months</span>
                <span className="font-medium text-green-600 dark:text-green-400">₦{(analytics.expectedReturns?.sixMonths || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">1 Year</span>
                <span className="font-medium text-green-600 dark:text-green-400">₦{(analytics.expectedReturns?.oneYear || 0).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Growth Rate</h3>
            <span className="text-2xl font-bold text-green-600 dark:text-green-400">+{analytics.growthRate || 0}%</span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Year-over-Year land value growth</p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">Recent Land Transactions</h3>
          <div className="space-y-3">
            {analytics.recentTransactions.map((transaction) => (
              <div key={transaction.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{transaction.type}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{transaction.units} • {new Date(transaction.date).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-green-600 dark:text-green-400">₦{transaction.amount.toLocaleString()}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{transaction.status}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Update the renderConnections function to show more details
  const renderConnections = () => {
    if (!connections || connections.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">No land connections yet. Start by exploring land ownership opportunities.</p>
        </div>
      );
    }
    return (
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Your Land Connections</h3>
            <div className="flex space-x-2">
              <span className="px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full text-sm">
                {connections.filter(c => c.status === 'approved').length} Approved
              </span>
              <span className="px-3 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 rounded-full text-sm">
                {connections.filter(c => c.status === 'pending').length} Pending
              </span>
              <span className="px-3 py-1 bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 rounded-full text-sm">
                {connections.filter(c => c.status === 'rejected').length} Rejected
              </span>
            </div>
          </div>
          
          {connections.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">No land connections yet. Start by exploring land ownership opportunities.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {connections.map((connection) => (
                      <motion.div
                  key={connection.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start">
                              <div>
                      <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                        {connection.projectTitle}
                      </h4>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                        Developer: {connection.developer}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Requested: {new Date(connection.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      connection.status === 'approved' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                      connection.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                      'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}>
                      {connection.status.charAt(0).toUpperCase() + connection.status.slice(1)}
                              </span>
                            </div>
                  
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Units</p>
                      <p className="font-medium text-gray-900 dark:text-white">{connection.units}</p>
                        </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Amount</p>
                      <p className="font-medium text-gray-900 dark:text-white">{connection.amount}</p>
                    </div>
                    {connection.notes && (
                      <div className="col-span-2">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Notes</p>
                        <p className="font-medium text-gray-900 dark:text-white">{connection.notes}</p>
                      </div>
                    )}
                    </div>

                  <div className="mt-4 flex justify-end space-x-3">
                    <button
                      onClick={() => handleViewConnectionDetails(connection)}
                      className="px-4 py-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300"
                    >
                      View Details
                    </button>
                    {connection.status === 'pending' && (
                      <button
                        onClick={() => {
                          // TODO: Implement cancel request functionality
                          handleToast('Connection request cancelled', 'success')
                        }}
                        className="px-4 py-2 text-red-600 dark:text-red-400 hover:text-red-500 dark:hover:text-red-300"
                      >
                        Cancel Request
                      </button>
                    )}
                        </div>
                      </motion.div>
              ))}
                    </div>
          )}
        </div>
      </div>
    )
  }

  // Add this function to filter topics based on search query
  const filterTopics = (topics) => {
    if (!forumSearchQuery.trim()) return topics;
    
    const query = forumSearchQuery.toLowerCase();
    return topics.filter(topic => 
      topic.title.toLowerCase().includes(query) ||
      topic.tags.some(tag => tag.toLowerCase().includes(query)) ||
      topic.author.toLowerCase().includes(query)
    );
  };

  // Add this function to render the forum section
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
            
            {forums.general.topics.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 dark:text-gray-500 mb-4">
                  <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No topics yet</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  Be the first to start a discussion! Topics will appear here once users begin creating them.
                </p>
                <button
                  onClick={() => setShowNewTopicModal(true)}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Create First Topic
                </button>
              </div>
            ) : (
                        <div className="space-y-4">
              {forums.general.topics.map((topic) => (
                <div
                  key={topic.id}
                  className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 sm:p-6 cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => navigate(`/forum/${topic.id}`)}
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
                        {topic.replies?.length || 0} replies
                              </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {topic.views} views
                              </span>
                    </div>
                  </div>
                            </div>
                          ))}
                        </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Modify the renderContent function to include analytics, connections, and forum
  const renderContent = () => {
    switch (activeTab) {
      case 'discover':
        return renderProjectCards();
      case 'analytics':
        return renderAnalytics();
      case 'connections':
        return renderConnections();
      case 'forum':
        return renderForum();
      case 'profile':
        return renderProfile();
      default:
        return renderProjectCards();
    }
  };

  // Add this before the final return statement
  const renderProjectModal = () => {
    if (!selectedProject) return null

    const handleSwipe = (event, info) => {
      const swipeThreshold = 50
      if (Math.abs(info.offset.x) > swipeThreshold) {
        if (info.offset.x > 0 && selectedImage > 0) {
          setSelectedImage(selectedImage - 1)
        } else if (info.offset.x < 0 && selectedImage < selectedProject.images.length - 1) {
          setSelectedImage(selectedImage + 1)
        }
      }
    }

    return (
      <AnimatePresence>
        {showProjectModal && (
                      <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
                        >
                          <div className="relative">
                <motion.div 
                  className="aspect-video relative cursor-grab active:cursor-grabbing"
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  onDragEnd={handleSwipe}
                  whileTap={{ cursor: "grabbing" }}
                >
                  <motion.img
                    key={selectedImage}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    src={selectedProject.images[selectedImage]}
                    alt={selectedProject.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-between px-4">
                    {selectedImage > 0 && (
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setSelectedImage(selectedImage - 1)}
                        className="bg-black/50 text-white rounded-full p-2 hover:bg-black/75"
                      >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </motion.button>
                    )}
                    {selectedImage < selectedProject.images.length - 1 && (
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setSelectedImage(selectedImage + 1)}
                        className="bg-black/50 text-white rounded-full p-2 hover:bg-black/75"
                      >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </motion.button>
                    )}
                            </div>
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                    {selectedProject.images.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImage(index)}
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${
                          selectedImage === index ? 'bg-white scale-125' : 'bg-white/50'
                        }`}
                      />
                          ))}
                        </div>
                      </motion.div>
                <button
                  onClick={() => setShowProjectModal(false)}
                  className="absolute top-4 right-4 text-white bg-black/50 rounded-full p-2 hover:bg-black/75"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                    </div>

                          <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {selectedProject.title}
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  {selectedProject.detailedDescription}
                </p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-xl">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Location</p>
                    <p className="font-medium text-gray-900 dark:text-white">{selectedProject.location}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-xl">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Type</p>
                    <p className="font-medium text-gray-900 dark:text-white">{selectedProject.type}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-xl">
                                <p className="text-sm text-gray-500 dark:text-gray-400">Amount</p>
                    <p className="font-medium text-gray-900 dark:text-white">{selectedProject.amount}</p>
                              </div>
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-xl">
                                <p className="text-sm text-gray-500 dark:text-gray-400">ROI</p>
                    <p className="font-medium text-gray-900 dark:text-white">{selectedProject.roi}</p>
                              </div>
                            </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Amenities</h3>
                    <ul className="grid grid-cols-2 gap-2">
                      {selectedProject.amenities.map((amenity, index) => (
                        <li key={index} className="flex items-center text-gray-600 dark:text-gray-300">
                          <svg className="w-5 h-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          {amenity}
                        </li>
                      ))}
                    </ul>
                          </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Documents</h3>
                    <ul className="space-y-2">
                      {selectedProject.documents.map((doc, index) => (
                        <li key={index}>
                          <a
                            href={doc.url}
                            className="flex items-center text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                            {doc.name}
                          </a>
                        </li>
                      ))}
                    </ul>
                        </div>
                  </div>

                <div className="mt-8">
                  {renderAIAnalysis()}
                </div>

                <div className="mt-6 flex justify-end space-x-4">
                  <button
                    onClick={() => setShowProjectModal(false)}
                    className="px-6 py-3 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => handleOwnNow(selectedProject)}
                    className="px-6 py-3 text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl hover:opacity-90"
                  >
                    Own Now
                  </button>
                </div>
                      </div>
                    </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    )
  }

  // Update the AI Analysis component title
  const renderAIAnalysis = () => {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Analyze Development with AI</h3>
        <AIAnalysis developmentId={selectedProject?.id} />
      </div>
    )
  }

  // Add document handling functions
  const handleDownloadDocument = (document) => {
    try {
      // Create a temporary link element
      const link = document.createElement('a');
      link.href = document.url;
      link.download = document.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      handleToast(`Downloading ${document.name}...`, 'success');
    } catch (error) {
      console.error('Error downloading document:', error);
      handleToast('Failed to download document', 'error');
    }
  };

  const handleViewDocument = (document) => {
    try {
      // Open document in a new tab
      window.open(document.url, '_blank');
      handleToast(`Opening ${document.name}...`, 'success');
    } catch (error) {
      console.error('Error viewing document:', error);
      handleToast('Failed to open document', 'error');
    }
  };

  // Update the connection details modal to include documents section
  const renderConnectionDetails = () => {
    if (!selectedConnection) return null

    return (
      <AnimatePresence>
        {showConnectionDetails && (
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
              className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full p-8 shadow-xl"
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Connection Details
                  </h3>
                  <p className="mt-2 text-gray-600 dark:text-gray-400">
                    {selectedConnection.projectTitle}
                  </p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowConnectionDetails(false)}
                  className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </motion.button>
              </div>

              <div className="space-y-6 max-h-[80vh] overflow-y-auto pr-2">
                {/* Project Information */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    Project Information
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Developer</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {selectedConnection.developer}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        selectedConnection.status === 'approved' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                        selectedConnection.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                        'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                              }`}>
                        {selectedConnection.status.charAt(0).toUpperCase() + selectedConnection.status.slice(1)}
                              </span>
                            </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Units</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {selectedConnection.units}
                      </p>
                    </div>
                              <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Amount</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {selectedConnection.amount}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Documents Section */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    Documents
                  </h4>
                  <div className="space-y-4">
                    {selectedConnection.documents && selectedConnection.documents.length > 0 ? (
                      selectedConnection.documents.map((doc) => (
                        <motion.div
                          key={doc.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm"
                        >
                          <div className="flex items-center space-x-4">
                            <div className={`p-2 rounded-lg ${
                              doc.type === 'pdf' ? 'bg-red-100 dark:bg-red-900' :
                              doc.type === 'xlsx' ? 'bg-green-100 dark:bg-green-900' :
                              'bg-blue-100 dark:bg-blue-900'
                            }`}>
                              <svg className="w-6 h-6 text-gray-600 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                              </svg>
                              </div>
                              <div>
                              <p className="font-medium text-gray-900 dark:text-white">{doc.name}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                {doc.size} • {new Date(doc.uploadedAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          <div className="flex space-x-2">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleViewDocument(doc)}
                              className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                            >
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleDownloadDocument(doc)}
                              className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                            >
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                              </svg>
                            </motion.button>
                          </div>
                        </motion.div>
                      ))
                    ) : (
                      <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                        No documents available
                      </p>
                    )}
                    </div>
                </div>

                {/* Notes Section */}
                {selectedConnection.notes && (
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                      Notes
                    </h4>
                    <p className="text-gray-600 dark:text-gray-300">
                      {selectedConnection.notes}
                    </p>
                  </div>
                )}

                {/* Timeline Section */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    Timeline
                  </h4>
                      <div className="space-y-4">
                            <div className="flex items-center">
                      <div className="flex-shrink-0 h-2 w-2 rounded-full bg-green-400"></div>
                      <p className="ml-3 text-sm text-gray-500 dark:text-gray-400">
                        Connection requested on {new Date(selectedConnection.createdAt).toLocaleDateString()}
                      </p>
                              </div>
                    {selectedConnection.updatedAt && (
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-2 w-2 rounded-full bg-blue-400"></div>
                        <p className="ml-3 text-sm text-gray-500 dark:text-gray-400">
                          Status updated on {new Date(selectedConnection.updatedAt).toLocaleDateString()}
                                </p>
                              </div>
                    )}
                            </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-4 pt-4">
                  {selectedConnection.status === 'pending' && (
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setShowConnectionDetails(false)
                        handleToast('Connection request cancelled', 'success')
                      }}
                      className="px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:text-red-500 dark:hover:text-red-300"
                    >
                      Cancel Request
                            </motion.button>
                  )}
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                    onClick={() => setShowConnectionDetails(false)}
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg"
                        >
                    Close
                        </motion.button>
                      </div>
                  </div>
            </motion.div>
          </motion.div>
                )}
      </AnimatePresence>
    )
  }

  // Add renderProfile function
  const renderProfile = () => {
    if (!profile) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
        </div>
      );
    }

    if (showSettings) {
      return (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h2>
            <button
              onClick={() => setShowSettings(false)}
              className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Email Notifications</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Receive email updates about your investments</p>
              </div>
              <button
                onClick={() => setSettings(prev => ({ ...prev, emailNotifications: !prev.emailNotifications }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                  settings.emailNotifications ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                  settings.emailNotifications ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Push Notifications</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Receive push notifications on your device</p>
              </div>
              <button
                onClick={() => setSettings(prev => ({ ...prev, pushNotifications: !prev.pushNotifications }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                  settings.pushNotifications ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                  settings.pushNotifications ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Dark Mode</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Toggle dark mode appearance</p>
              </div>
              <button
                onClick={() => {
                  setSettings(prev => ({ ...prev, darkMode: !prev.darkMode }));
                  toggleDarkMode();
                }}
                className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                  settings.darkMode ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                  settings.darkMode ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>

            <div>
              <label className="block text-lg font-medium text-gray-900 dark:text-white mb-2">
                Language
              </label>
              <select
                value={settings.language}
                onChange={(e) => setSettings(prev => ({ ...prev, language: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="English">English</option>
                <option value="Spanish">Spanish</option>
                <option value="French">French</option>
                <option value="German">German</option>
              </select>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Profile</h2>
          <div className="flex space-x-4">
            <button
              onClick={() => setIsEditingProfile(!isEditingProfile)}
              className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
            >
              {isEditingProfile ? (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              )}
            </button>
            <button
              onClick={() => setShowSettings(true)}
              className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
        </div>

        {isEditingProfile ? (
          <form onSubmit={handleSubmit(handleProfileSave)} className="space-y-6">
            <div className="flex flex-col items-center mb-6">
              <div className="relative">
                <img
                  src={profileImage || 'https://via.placeholder.com/150'}
                  alt="Profile"
                  className="h-32 w-32 rounded-full object-cover border-4 border-indigo-500"
                />
                <label
                  htmlFor="profile-image-upload"
                  className="absolute bottom-0 right-0 bg-indigo-600 text-white p-2 rounded-full cursor-pointer hover:bg-indigo-700 transition-colors"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </label>
                <input
                  id="profile-image-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </div>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Click the camera icon to change your profile picture</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  {...register('name')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  {...register('email')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  {...register('phone')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.phone.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Investment Experience
                </label>
                <select
                  {...register('investmentExperience')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="">Select experience</option>
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                  <option value="Expert">Expert</option>
                </select>
                {errors.investmentExperience && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.investmentExperience.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Preferred Investment Amount
                </label>
                <input
                  type="number"
                  {...register('preferredInvestmentAmount')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
                {errors.preferredInvestmentAmount && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.preferredInvestmentAmount.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Risk Tolerance
                </label>
                <select
                  {...register('riskTolerance')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="">Select risk tolerance</option>
                  <option value="Conservative">Conservative</option>
                  <option value="Moderate">Moderate</option>
                  <option value="Aggressive">Aggressive</option>
                </select>
                {errors.riskTolerance && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.riskTolerance.message}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Bio
              </label>
              <textarea
                {...register('bio')}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
              {errors.bio && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.bio.message}</p>
              )}
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => setIsEditingProfile(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600"
              >
                Save Changes
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Name</h3>
                <p className="mt-1 text-gray-900 dark:text-white">{profile.name || 'Not specified'}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</h3>
                <p className="mt-1 text-gray-900 dark:text-white">{profile.email || 'Not specified'}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Investment Experience</h3>
                <p className="mt-1 text-gray-900 dark:text-white">{profile.investmentExperience || 'Not specified'}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Preferred Investment Amount</h3>
                <p className="mt-1 text-gray-900 dark:text-white">
                  {profile.preferredInvestmentAmount ? `₦${profile.preferredInvestmentAmount.toLocaleString()}` : 'Not specified'}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Risk Tolerance</h3>
                <p className="mt-1 text-gray-900 dark:text-white">{profile.riskTolerance || 'Not specified'}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Phone</h3>
                <p className="mt-1 text-gray-900 dark:text-white">{profile.phone || 'Not specified'}</p>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Bio</h3>
              <p className="mt-1 text-gray-900 dark:text-white">{profile.bio || 'No bio provided'}</p>
            </div>
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={() => {
              setIsEditingProfile(false);
              // Add your settings navigation logic here
            }}
            className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-gray-600 to-gray-700 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Settings
          </button>
        </div>
      </div>
    );
  };

  // Add this function before the main return if not present
  const renderConnectionModal = () => {
    if (!showConnectionModal || !selectedProject) return null;
    return (
      <AnimatePresence>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white dark:bg-gray-800 rounded-2xl max-w-lg w-full p-8 shadow-xl"
          >
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Investment Request</h2>
            <p className="mb-2 text-gray-700 dark:text-gray-300">Project: <span className="font-semibold">{selectedProject.title}</span></p>
            <p className="mb-4 text-gray-700 dark:text-gray-300">Developer: <span className="font-semibold">{selectedProject.developer}</span></p>
            
            {/* Unit Selection */}
            <div className="mb-4">
              <label htmlFor="units" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Number of Units
                    </label>
                <div className="flex items-center space-x-4">
                      <input
                        type="number"
                        id="units"
                        min={minUnits}
                        max={maxUnits}
                  value={selectedUnits}
                  onChange={handleUnitChange}
                  className="block w-32 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
                />
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Min: {minUnits} | Max: {maxUnits}
                    </span>
                  </div>
                    {investmentError && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{investmentError}</p>
                    )}
                </div>

            {/* Investment Amount Display */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Total Investment Amount
                    </label>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">{investmentAmount}</p>
                </div>

            {/* Notes Field */}
            <div className="mb-6">
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Notes (Optional)
                    </label>
                      <textarea
                        id="notes"
                        value={investmentNotes}
                        onChange={(e) => setInvestmentNotes(e.target.value)}
                placeholder="Add any additional notes or questions..."
                rows={3}
                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
                      />
                </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4">
                    <button
                    onClick={() => setShowConnectionModal(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
                  >
                    Cancel
                    </button>
                  <button
                    onClick={handleRequestSubmit}
                disabled={isSendingRequest}
                className="px-4 py-2 text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                {isSendingRequest ? 'Sending...' : 'Submit Request'}
                  </button>
              </div>
            </motion.div>
          </motion.div>
      </AnimatePresence>
    );
  };

  // Add this function to handle sending messages
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedTopic) return;

    const newReply = {
      author: 'You',
      content: newMessage.trim(),
      date: new Date().toLocaleString()
    };

    // Update the forums state with the new reply
    setForums(prevForums => {
      const updatedTopics = prevForums.general.topics.map(topic => {
        if (topic.id === selectedTopic.id) {
          return {
            ...topic,
            replies: [...topic.replies, newReply]
          };
        }
        return topic;
      });

      return {
        ...prevForums,
        general: {
          ...prevForums.general,
          topics: updatedTopics
        }
      };
    });

    // Clear the input
    setNewMessage('');
  };

  const handleCreateTopic = () => {
    if (!newTopic.title.trim() || !newTopic.content.trim()) return;

    const topic = {
      id: forums.general.topics.length + 1,
      title: newTopic.title.trim(),
      content: newTopic.content.trim(),
      views: 0,
      replies: []
    };

    setForums(prevForums => ({
      ...prevForums,
      general: {
        ...prevForums.general,
        topics: [...prevForums.general.topics, topic]
      }
    }));

    setShowNewTopicModal(false);
    setNewTopic({ title: '', content: '', category: 'general' });
  };

  const renderShareModal = () => {
    if (!showShareModal || !projectToShare) return null

    return (
      <AnimatePresence>
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
            className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6 shadow-xl"
          >
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Share Development</h3>
              <button
                onClick={handleCloseShareModal}
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => handleShareToSocial('whatsapp')}
                className="flex items-center justify-center space-x-2 p-4 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                <span>WhatsApp</span>
              </button>

              <button
                onClick={() => handleShareToSocial('telegram')}
                className="flex items-center justify-center space-x-2 p-4 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                </svg>
                <span>Telegram</span>
              </button>

              <button
                onClick={() => handleShareToSocial('twitter')}
                className="flex items-center justify-center space-x-2 p-4 bg-sky-500 text-white rounded-xl hover:bg-sky-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
                <span>Twitter</span>
              </button>

              <button
                onClick={() => handleShareToSocial('facebook')}
                className="flex items-center justify-center space-x-2 p-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                <span>Facebook</span>
              </button>

              <button
                onClick={() => handleShareToSocial('linkedin')}
                className="flex items-center justify-center space-x-2 p-4 bg-blue-700 text-white rounded-xl hover:bg-blue-800 transition-colors"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
                <span>LinkedIn</span>
              </button>

              <button
                onClick={() => handleShareToSocial('instagram')}
                className="flex items-center justify-center space-x-2 p-4 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 text-white rounded-xl hover:opacity-90 transition-opacity"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                </svg>
                <span>Instagram</span>
              </button>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    )
  }

  const handleProfileClick = () => {
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
  };

  const handleProfileOptionClick = (option) => {
    setIsProfileDropdownOpen(false);
    switch (option) {
      case 'view':
        handleTabChange('profile');
        break;
      case 'settings':
        setIsEditingProfile(true);
        break;
      case 'logout':
        handleLogout();
        break;
    }
  };

  // Receipt download handler
  const handleDownloadReceipt = () => {
    const lastReceipt = receipts[receipts.length - 1];
    if (!lastReceipt) return;
    generateReceipt({
      user: profile,
      project: selectedProject,
      amount: investmentAmount,
      date: lastReceipt.date,
      reference: lastReceipt.reference,
    });
  };

  // Deed signature handlers
  const handleSignDeed = () => {
    setShowDeedModal(true);
  };
  const handleDeedSubmit = (signatureDataUrl) => {
    setDeeds(prev => [...prev, { date: new Date().toLocaleString(), signatureDataUrl }]);
    setShowDeedModal(false);
  };

  // Example usage after a successful purchase (replace with your actual purchase handler):
  const handleDownloadCertificate = () => {
    if (!profile || !selectedProject) return;
    generateOwnershipCertificate({
      user: profile,
      project: selectedProject,
      sqm: selectedUnits,
      date: new Date().toLocaleDateString(),
      certificateId: `${selectedProject.id}-${profile.email}-${Date.now()}`
    });
  };

  // Example usage after deed signing (replace with your actual deed signing handler):
  const handleDownloadDeed = () => {
    if (!profile || !selectedProject) return;
    generateDeedPDF({
      user: profile,
      project: selectedProject,
      sqm: selectedUnits,
      date: new Date().toLocaleDateString(),
      deedId: `${selectedProject.id}-${profile.email}-${Date.now()}`,
      signatureDataUrl: deeds.length > 0 ? deeds[deeds.length - 1].signatureDataUrl : null
    });
  };

  // Only show Focal Point connections
  const focalPointConnections = connections.filter(
    (conn) => conn.developer === 'Focal Point Property Development and Management Services Ltd.'
  );

  // Fetch documents for the selected connection
  useEffect(() => {
    async function fetchDocuments() {
      if (!showConnectionModal || !selectedConnection) return;
      try {
        const res = await fetch(`/api/documents/list?userId=${profile?.email}`);
        const docs = await res.json();
        // Filter by plotId (projectId)
        setConnectionDocuments(docs.filter(doc => doc.plotId == selectedConnection.projectId));
      } catch (err) {
        setConnectionDocuments([]);
      }
    }
    fetchDocuments();
  }, [showConnectionModal, selectedConnection, profile]);

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
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
                <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex items-center space-x-4"
            >
                <div className="relative">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleProfileClick}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <img
                      src={profileImage || 'https://via.placeholder.com/32'}
                      alt="Profile"
                      className="h-8 w-8 rounded-full mr-2"
                    />
                    <span>{profile?.name || 'Profile'}</span>
                    <motion.svg
                      className="ml-2 h-5 w-5"
                      animate={{ rotate: isProfileDropdownOpen ? 180 : 0 }}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </motion.svg>
                  </motion.button>

                  <AnimatePresence>
                    {isProfileDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 z-50"
                      >
                        <div className="py-1" role="menu" aria-orientation="vertical">
                          <button
                            onClick={() => handleProfileOptionClick('view')}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                            role="menuitem"
                          >
                            View Profile
                          </button>
                          <button
                            onClick={() => handleProfileOptionClick('settings')}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                            role="menuitem"
                          >
                            Settings
                          </button>
                          <button
                            onClick={() => handleProfileOptionClick('logout')}
                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                            role="menuitem"
                          >
                            Logout
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
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
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-gradient-to-r from-red-600 to-red-700 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Logout
              </motion.button>
            </motion.div>
              </div>
            </motion.div>

        {/* Tabs */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="border-b border-gray-200 dark:border-gray-700 mb-8"
        >
          <nav className="-mb-px flex space-x-4 sm:space-x-8 overflow-x-auto" aria-label="Tabs">
            {[
              { key: "discover", label: "Land Opportunities" },
              { key: "analytics", label: "Land Analytics" },
              { key: "connections", label: "Land Connections" },
              { key: "forum", label: "Community" }
            ].map((tab) => (
              <motion.button
                key={tab.key}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleTabChange(tab.key)}
                className={`${
                  activeTab === tab.key
                    ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                } whitespace-nowrap py-4 px-2 sm:px-1 border-b-2 font-medium text-xs sm:text-sm transition-colors duration-200 flex-shrink-0`}
              >
                {tab.label}
              </motion.button>
            ))}
          </nav>
        </motion.div>

        {/* Main Content */}
        <main>
          {isLoading ? (
                    <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-center h-64"
            >
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
                    </motion.div>
          ) : (
            <AnimatePresence mode="wait">
                    <motion.div 
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                {renderContent()}
                    </motion.div>
      </AnimatePresence>
          )}
        </main>
                </div>

      {renderConnectionDetails()}

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

      {renderProjectModal()}
      {renderConnectionModal()}

      {/* New Topic Modal */}
      <AnimatePresence>
        {showNewTopicModal && (
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
                <div className="px-4 py-3 sm:px-6 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                      Create New Topic
                    </h3>
                    <button
                      onClick={() => setShowNewTopicModal(false)}
                  className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                    </button>
                  </div>
              </div>

                <div className="px-4 py-5 sm:p-6">
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Title
                      </label>
                      <input
                        type="text"
                        id="title"
                        value={newTopic.title}
                        onChange={(e) => setNewTopic({ ...newTopic, title: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        placeholder="Enter topic title"
                      />
                    </div>

                    <div>
                      <label htmlFor="content" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Content
                      </label>
                      <textarea
                        id="content"
                        value={newTopic.content}
                        onChange={(e) => setNewTopic({ ...newTopic, content: e.target.value })}
                        rows={4}
                        className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        placeholder="Enter topic content"
                      />
                    </div>
                  </div>
                </div>

                <div className="px-4 py-3 sm:px-6 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => setShowNewTopicModal(false)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Cancel
                    </button>
                    <button
                      onClick={handleCreateTopic}
                      disabled={!newTopic.title.trim() || !newTopic.content.trim()}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Create Topic
                    </button>
                  </div>
                </div>
                </div>
              </div>
          </motion.div>
        )}
      </AnimatePresence>

      {renderShareModal()}
      <PaymentSuccessModal
        open={showPaymentSuccess}
        onClose={() => setShowPaymentSuccess(false)}
        onDownloadReceipt={handleDownloadReceipt}
        onSignDeed={handleSignDeed}
      />
      <DeedSignatureModal
        open={showDeedModal}
        onClose={() => setShowDeedModal(false)}
        onSubmit={handleDeedSubmit}
      />
      {showSqmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">How many sqm do you want to own?</h2>
            <input
              type="number"
              min={selectedProject?.minUnits || 2}
              value={desiredSqm}
              onChange={e => setDesiredSqm(Number(e.target.value))}
              className="border p-2 rounded w-full mb-2"
            />
            <div className="flex gap-2 mb-2">
              {[150, 300, 500, 600].map(val => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setDesiredSqm(val)}
                  className="px-3 py-1 bg-gray-100 rounded hover:bg-blue-100 border border-gray-300"
                >
                  {val}
                </button>
              ))}
            </div>
            <div className="mb-2 text-lg font-semibold">
              Amount: ₦{(desiredSqm * 5000).toLocaleString()}
            </div>
            {sqmError && <div className="text-red-600 mb-2">{sqmError}</div>}
            <div className="flex gap-4">
              <button
                onClick={() => setShowSqmModal(false)}
                className="px-4 py-2 bg-gray-200 rounded"
              >Cancel</button>
              <button
                onClick={() => {
                  if (desiredSqm < (selectedProject?.minUnits || 2)) {
                    setSqmError(`Minimum is ${selectedProject?.minUnits || 2} sqm`);
                    return;
                  }
                  setShowSqmModal(false);
                  setSelectedUnits(desiredSqm);
                  setUnitPrice(5000); // 2 Seasons price per sqm
                  const userEmail = profile?.email || 'test@example.com';
                  const userName = profile?.name || 'User';
                  payWithPaystack(desiredSqm * 5000, userEmail, userName);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded"
              >Proceed to Payment</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}