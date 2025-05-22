import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { motion, AnimatePresence } from 'framer-motion'
import AIAnalysis from '../../components/AIAnalysis'

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

// Mock data for projects with additional media
const mockProjects = [
  {
    id: 1,
    title: 'Lekki Luxury Apartments',
    developer: 'Lagos Properties Ltd',
    developerId: 'dev1',
    location: 'Lagos',
    type: 'Residential',
    amount: '₦250,000,000',
    roi: '25%',
    timeline: '24 months',
    riskLevel: 'Medium',
    minUnits: 100,
    description: 'Luxury apartment complex in the heart of Lekki Phase 1, featuring modern amenities and premium finishes.',
    detailedDescription: 'This premium residential development offers 150 luxury apartments across 15 floors. Each unit features high-end finishes, smart home technology, and panoramic views of the Lagos skyline. The complex includes a rooftop pool, fitness center, and 24/7 security.',
    status: 'Active',
    images: [
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
    ],
    amenities: ['Swimming Pool', 'Fitness Center', '24/7 Security', 'Smart Home', 'Parking'],
    documents: [
      { name: 'Project Brochure', url: '#' },
      { name: 'Financial Projections', url: '#' },
      { name: 'Location Map', url: '#' }
    ]
  },
  {
    id: 2,
    title: 'Maitama Office Complex',
    developer: 'Abuja Developers',
    developerId: 'dev2',
    location: 'Abuja',
    type: 'Commercial',
    amount: '₦180,000,000',
    roi: '20%',
    timeline: '18 months',
    riskLevel: 'Low',
    minUnits: 50,
    description: 'Premium office space in Maitama, designed for corporate clients with state-of-the-art facilities.',
    detailedDescription: 'A modern office complex in the heart of Maitama, offering premium office spaces with cutting-edge technology and amenities. The complex features a business center, conference facilities, and premium security services.',
    status: 'Active',
    images: [
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
      'https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
      'https://images.unsplash.com/photo-1497366754035-f200968a6e72?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
    ],
    amenities: ['Business Center', 'Conference Rooms', 'High-Speed Internet', 'Security', 'Parking'],
    documents: [
      { name: 'Project Brochure', url: '#' },
      { name: 'Floor Plans', url: '#' },
      { name: 'Location Map', url: '#' }
    ]
  },
  {
    id: 3,
    title: 'Victoria Island Mall',
    developer: 'Lagos Properties Ltd',
    developerId: 'dev3',
    location: 'Lagos',
    type: 'Commercial',
    amount: '₦500,000,000',
    roi: '30%',
    timeline: '36 months',
    riskLevel: 'High',
    minUnits: 200,
    description: 'Luxury shopping mall in Victoria Island, featuring international brands and entertainment facilities.',
    detailedDescription: 'A premier shopping destination in Victoria Island, offering a mix of luxury retail, entertainment, and dining options. The mall features international brands, a cinema complex, and a food court.',
    status: 'Active',
    images: [
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
      'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
      'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
    ],
    amenities: ['Cinema', 'Food Court', 'Parking', 'Security', 'WiFi'],
    documents: [
      { name: 'Project Brochure', url: '#' },
      { name: 'Tenant Mix', url: '#' },
      { name: 'Location Map', url: '#' }
    ]
  },
  {
    id: 4,
    title: 'Port Harcourt Industrial Park',
    developer: 'Port Harcourt Estates',
    developerId: 'dev3',
    location: 'Port Harcourt',
    type: 'Industrial',
    amount: '₦350,000,000',
    roi: '22%',
    timeline: '30 months',
    riskLevel: 'Medium',
    minUnits: 150,
    description: 'Modern industrial park with warehouse facilities and logistics support.',
    detailedDescription: 'A state-of-the-art industrial park offering modern warehouse facilities, logistics support, and business services. The park is strategically located near major transportation routes.',
    status: 'Active',
    images: [
      'https://images.unsplash.com/photo-1504307651254-35680f356dfd?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
    ],
    amenities: ['Warehouse Space', 'Logistics Support', 'Security', 'Parking', 'Loading Docks'],
    documents: [
      { name: 'Project Brochure', url: '#' },
      { name: 'Site Plans', url: '#' },
      { name: 'Location Map', url: '#' }
    ]
  }
]

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
  }
}

// Filter options
const locationOptions = ['All', 'Lagos', 'Abuja', 'Port Harcourt', 'Kano', 'Calabar']
const typeOptions = ['All', 'Residential', 'Commercial', 'Industrial', 'Mixed-Use']

// Add mock connections data
const mockConnections = [
  {
    id: 1,
    developerId: 'dev1',
    developer: 'Lagos Properties Ltd',
    projectId: 1,
    projectTitle: 'Lekki Luxury Apartments',
    units: 2,
    amount: '₦500,000',
    status: 'approved',
    createdAt: '2024-03-15T10:30:00Z',
    notes: 'Interested in long-term investment',
    updatedAt: '2024-03-16T14:20:00Z',
    documents: [
      {
        id: 'doc1',
        name: 'Investment Agreement',
        type: 'pdf',
        size: '2.4 MB',
        url: '#',
        uploadedAt: '2024-03-16T14:20:00Z'
      },
      {
        id: 'doc2',
        name: 'Property Deed',
        type: 'pdf',
        size: '1.8 MB',
        url: '#',
        uploadedAt: '2024-03-16T14:20:00Z'
      },
      {
        id: 'doc3',
        name: 'Financial Projections',
        type: 'xlsx',
        size: '1.2 MB',
        url: '#',
        uploadedAt: '2024-03-16T14:20:00Z'
      }
    ]
  },
  {
    id: 2,
    developerId: 'dev2',
    developer: 'Abuja Developers',
    projectId: 2,
    projectTitle: 'Maitama Office Complex',
    units: 1,
    amount: '₦180,000',
    status: 'pending',
    createdAt: '2024-03-20T09:15:00Z',
    notes: 'Looking for commercial space investment',
    documents: [
      {
        id: 'doc4',
        name: 'Proposal Document',
        type: 'pdf',
        size: '3.1 MB',
        url: '#',
        uploadedAt: '2024-03-20T09:15:00Z'
      }
    ]
  },
  {
    id: 3,
    developerId: 'dev3',
    developer: 'Port Harcourt Estates',
    projectId: 4,
    projectTitle: 'Port Harcourt Industrial Park',
    units: 3,
    amount: '₦1,050,000',
    status: 'rejected',
    createdAt: '2024-03-10T16:45:00Z',
    notes: 'Investment proposal under review',
    updatedAt: '2024-03-12T11:30:00Z',
    documents: [
      {
        id: 'doc5',
        name: 'Rejection Letter',
        type: 'pdf',
        size: '0.8 MB',
        url: '#',
        uploadedAt: '2024-03-12T11:30:00Z'
      }
    ]
  }
]

// Add mock forum data
const mockForums = {
  general: {
    id: 'general',
    title: 'General Discussion',
    description: 'Discuss general topics about real estate investment',
    topics: [
      {
        id: 1,
        title: 'Welcome to Subx Forum!',
        author: 'Admin',
        content: 'Welcome to our community forum. Feel free to start discussions about real estate investment.',
        replies: [],
        views: 120,
        lastActivity: new Date().toISOString(),
        tags: ['welcome', 'introduction']
      }
    ]
  },
  projectForums: {}
}

// Add mock messages data
const mockMessages = {
  'topic-1': [
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
  ]
}

export default function InvestorDashboard() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('analytics')
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [expandedCard, setExpandedCard] = useState(null)
  const [connections, setConnections] = useState(mockConnections) // Initialize with mock data
  const [analytics, setAnalytics] = useState({
    totalInvestments: 0,
    activeInvestments: 0,
    totalReturns: 0,
    portfolioValue: 0,
    growthRate: 0, // Year-over-Year growth rate
    investmentDistribution: {},
    expectedReturns: {},
    recentTransactions: [],
    performanceMetrics: {
      monthlyReturn: 0,
      yearlyReturn: 0,
      riskScore: 0
    }
  })
  
  // Initial profile data
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    bio: '',
    investmentInterests: [],
    investmentExperience: '',
    preferredInvestmentAmount: 0,
    preferredLocations: [],
    riskTolerance: '',
    investmentGoals: [],
    profileCompletion: 0
  })

  // Form handling with react-hook-form
  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm({
    resolver: yupResolver(profileSchema),
    defaultValues: profile
  })

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
    const fetchData = async () => {
      try {
        setIsLoading(true)
        await Promise.all([fetchProfile(), fetchAnalytics()])
      } catch (error) {
        console.error('Error fetching data:', error)
        setError('Failed to load data')
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  // API integration functions
  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // TODO: Replace with actual API call
      const response = await fetch('/api/investor/profile');
      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }
      const data = await response.json();
      
      setProfile(data);
      reset(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError('Failed to load profile. Please try again later.');
      
      // Fallback to mock data for development
      const mockProfile = {
        name: 'John Doe',
        email: 'john.doe@example.com',
        phone: '+1 (555) 123-4567',
        bio: 'Experienced real estate investor with a focus on sustainable development projects.',
        investmentInterests: ['Residential', 'Commercial', 'Green Projects'],
        investmentExperience: '5+ years',
        preferredInvestmentAmount: 250000,
        preferredLocations: ['New York', 'Los Angeles', 'Miami'],
        riskTolerance: 'Moderate',
        investmentGoals: ['Capital Appreciation', 'Passive Income']
      };
      setProfile(mockProfile);
      reset(mockProfile);
    } finally {
      setIsLoading(false);
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

  // Remove the duplicate analytics object
  const [projects, setProjects] = useState(mockProjects)
  const [filters, setFilters] = useState({
    location: 'All',
    type: 'All',
    search: ''
  })
  const [selectedProject, setSelectedProject] = useState(null)
  const [showProjectModal, setShowProjectModal] = useState(false)
  const [selectedImage, setSelectedImage] = useState(0)
  const [showConnectionModal, setShowConnectionModal] = useState(false)
  const [selectedUnits, setSelectedUnits] = useState(1)
  const [investmentAmount, setInvestmentAmount] = useState('')
  const [investmentNotes, setInvestmentNotes] = useState('')
  const [unitPrice, setUnitPrice] = useState(0)
  const [minUnits, setMinUnits] = useState(1)
  const [maxUnits, setMaxUnits] = useState(100)
  const [investmentError, setInvestmentError] = useState('')
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [toastType, setToastType] = useState('success')
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [showConnectionDetails, setShowConnectionDetails] = useState(false)
  const [selectedConnection, setSelectedConnection] = useState(null)
  const [isSendingRequest, setIsSendingRequest] = useState(false)
  const [activeForum, setActiveForum] = useState('general')
  const [selectedTopic, setSelectedTopic] = useState(null)
  const [newMessage, setNewMessage] = useState('')
  const [isSendingMessage, setIsSendingMessage] = useState(false)
  const [forumSearchQuery, setForumSearchQuery] = useState('')
  const [showNewTopicModal, setShowNewTopicModal] = useState(false)
  const [forumTopics, setForumTopics] = useState([])

  // Initialize mock forum data
  const [mockForums] = useState({
    general: {
      id: 'general',
      title: 'General Discussion',
      topics: [
        {
          id: 1,
          title: 'Welcome to Subx Forum!',
          author: 'Admin',
          content: 'Welcome to our community forum. Feel free to start discussions about real estate investment.',
          replies: [],
          views: 120,
          lastActivity: new Date().toISOString(),
          tags: ['welcome', 'introduction']
        }
      ]
    },
    projectForums: {}
  });

  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab)
    setSelectedProject(null)
    setShowProjectModal(false)
    setShowConnectionModal(false)
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
      return
    }
    setShowConfirmation(true)
  }

  // Update submitConnectionRequest to use handleToast
  const submitConnectionRequest = async () => {
    try {
      if (!validateInvestment(selectedUnits)) {
        return;
      }

      setIsSendingRequest(true);
      
      // Get auth token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        handleToast('Please log in to submit investment requests', 'error');
        return;
      }

      try {
        // Prepare request data
        const requestData = {
          projectId: selectedProject.id,
          units: parseInt(selectedUnits),
          notes: investmentNotes
        };

        // Send request to backend
        const response = await fetch('http://localhost:3000/api/investments/request', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(requestData)
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to submit investment request');
        }

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
      } catch (error) {
        // If backend request fails, create a temporary connection
        console.warn('Backend request failed, creating temporary connection:', error);
        
        const tempConnection = {
          id: Date.now().toString(),
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

        // Update connections list with temporary connection
        setConnections(prev => [tempConnection, ...prev]);
        
        // Show success message
        handleToast(
          `Investment request created! Note: Backend connection failed, this is a temporary record.`,
          'warning'
        );

        // Switch to connections tab
        setActiveTab('connections');
      }
      
      // Reset states
      setSelectedProject(null);
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

  const handleInvestNow = (project) => {
    setSelectedProject(project)
    setShowProjectModal(false)
    handleConnectionRequest(project)
  }

  // Find the section where project cards are rendered and modify it to include AI Analysis
  const renderProjectCards = () => {
  return (
      <div className="grid grid-cols-1 gap-6 p-4">
        {mockProjects.map((project) => (
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

                <div className="flex justify-end">
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
      // TODO: Replace with actual API call
      const mockAnalytics = {
        totalInvestments: 5,
        activeInvestments: 3,
        totalReturns: 15000000,
        portfolioValue: 75000000,
        growthRate: 12.5, // Year-over-Year growth rate
        investmentDistribution: {
          residential: 45,
          commercial: 30,
          industrial: 15,
          land: 10
        },
        expectedReturns: {
          threeMonths: 2500000,
          sixMonths: 5500000,
          oneYear: 12000000
        },
        recentTransactions: [
          { id: 1, type: 'Investment', amount: 10000000, date: '2024-03-15', status: 'Completed' },
          { id: 2, type: 'Return', amount: 2500000, date: '2024-03-10', status: 'Completed' },
          { id: 3, type: 'Investment', amount: 15000000, date: '2024-03-01', status: 'Completed' }
        ],
        performanceMetrics: {
          monthlyReturn: 2.5,
          yearlyReturn: 18.5,
          riskScore: 65
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
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Total Investments</h3>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">₦{analytics.totalInvestments.toLocaleString()}</p>
                            </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Active Investments</h3>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">₦{analytics.activeInvestments.toLocaleString()}</p>
                            </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Total Returns</h3>
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">₦{analytics.totalReturns.toLocaleString()}</p>
                          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Portfolio Value</h3>
            <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">₦{analytics.portfolioValue.toLocaleString()}</p>
                        </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">Performance Metrics</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-600 dark:text-gray-400">Monthly Return</label>
                          <div className="flex items-center">
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${analytics.performanceMetrics.monthlyReturn * 4}%` }}></div>
                            </div>
                  <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">{analytics.performanceMetrics.monthlyReturn}%</span>
                            </div>
                          </div>
              <div>
                <label className="text-sm text-gray-600 dark:text-gray-400">Yearly Return</label>
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
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">Investment Distribution</h3>
                        <div className="space-y-4">
              {Object.entries(analytics.investmentDistribution).map(([type, percentage]) => (
                <div key={type}>
                  <div className="flex justify-between mb-1">
                    <label className="text-sm text-gray-600 dark:text-gray-400 capitalize">{type}</label>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="h-2.5 rounded-full" 
                      style={{ 
                        width: `${percentage}%`,
                        backgroundColor: type === 'residential' ? '#3B82F6' :
                                       type === 'commercial' ? '#10B981' :
                                       type === 'industrial' ? '#F59E0B' :
                                       '#8B5CF6'
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">Expected Returns</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <span className="text-sm text-gray-600 dark:text-gray-400">3 Months</span>
                <span className="font-medium text-green-600 dark:text-green-400">₦{analytics.expectedReturns.threeMonths.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <span className="text-sm text-gray-600 dark:text-gray-400">6 Months</span>
                <span className="font-medium text-green-600 dark:text-green-400">₦{analytics.expectedReturns.sixMonths.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <span className="text-sm text-gray-600 dark:text-gray-400">1 Year</span>
                <span className="font-medium text-green-600 dark:text-green-400">₦{analytics.expectedReturns.oneYear.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Growth Rate</h3>
            <span className="text-2xl font-bold text-green-600 dark:text-green-400">+{analytics.growthRate}%</span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Year-over-Year portfolio growth</p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">Recent Transactions</h3>
          <div className="space-y-4">
            {analytics.recentTransactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div>
                  <p className="font-medium text-gray-700 dark:text-gray-300">{transaction.type}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{transaction.date}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-700 dark:text-gray-300">₦{transaction.amount.toLocaleString()}</p>
                  <p className="text-sm text-green-500">{transaction.status}</p>
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
    return (
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Your Connections</h3>
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
              <p className="text-gray-500 dark:text-gray-400">No connections yet. Start by exploring investment opportunities.</p>
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
    const currentForum = activeForum === 'general' 
      ? mockForums.general 
      : mockForums.projectForums[activeForum];

    const filteredTopics = filterTopics(currentForum?.topics || []);

    return (
      <div className="space-y-6">
        {/* Forum Header */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {activeForum === 'general' ? 'General Discussion' : currentForum?.projectTitle}
            </h2>
            <p className="text-gray-500 dark:text-gray-400">
              {filteredTopics.length} topics
            </p>
          </div>
          <button
            onClick={() => setShowNewTopicModal(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            New Topic
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <input
            type="text"
            value={forumSearchQuery}
            onChange={(e) => setForumSearchQuery(e.target.value)}
            placeholder="Search topics..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
          <svg
            className="absolute right-3 top-2.5 h-5 w-5 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        {/* Topics List */}
        <div className="space-y-4">
          {filteredTopics.map((topic) => (
            <motion.div
              key={topic.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.02 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-all cursor-pointer"
              onClick={() => setSelectedTopic(topic)}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {topic.title}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Posted by {topic.author} • {new Date(topic.lastActivity).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {topic.replies?.length || 0} replies
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {topic.views} views
                  </span>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {topic.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Topic Detail Modal (Group Chat) */}
        {selectedTopic && (
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
              className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-2xl shadow-xl flex flex-col"
              style={{ maxHeight: '80vh' }}
            >
              {/* Header */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-700/50">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                    <span className="text-indigo-600 dark:text-indigo-300 font-semibold">
                      {selectedTopic.title.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {selectedTopic.title}
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {selectedTopic.replies?.length || 0} messages
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedTopic(null)}
                  className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Messages Container */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ maxHeight: 'calc(80vh - 140px)' }}>
                {/* Original Post */}
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                      <span className="text-blue-600 dark:text-blue-300 text-sm font-medium">
                        {selectedTopic.author.charAt(0)}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{selectedTopic.author}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(selectedTopic.lastActivity).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div className="ml-10 bg-blue-50 dark:bg-blue-900/30 rounded-2xl rounded-tl-none p-3 max-w-[80%]">
                    <p className="text-sm text-gray-700 dark:text-gray-300">{selectedTopic.content}</p>
                  </div>
                </div>

                {/* Replies */}
                {selectedTopic.replies?.map((reply) => (
                  <div key={reply.id} className="flex flex-col space-y-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                        <span className="text-indigo-600 dark:text-indigo-300 text-sm font-medium">
                          {reply.author.charAt(0)}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{reply.author}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(reply.timestamp).toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <div className="ml-10 bg-gray-50 dark:bg-gray-700 rounded-2xl rounded-tl-none p-3 max-w-[80%]">
                      <p className="text-sm text-gray-700 dark:text-gray-300">{reply.content}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                <div className="flex space-x-2">
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Write your message..."
                    rows={2}
                    className="flex-1 text-sm border border-gray-300 rounded-2xl px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white resize-none"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={isSendingMessage || !newMessage.trim()}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center justify-center"
                  >
                    {isSendingMessage ? (
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    );
  };

  // Modify the renderContent function to include analytics, connections, and forum
  const renderContent = () => {
    switch (activeTab) {
      case 'analytics':
        return renderAnalytics();
      case 'discover':
        return renderProjectCards();
      case 'connections':
        return renderConnections();
      case 'profile':
        return renderProfile();
      case 'forum':
        return renderForum();
      default:
        return renderAnalytics();
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
                    onClick={() => handleInvestNow(selectedProject)}
                    className="px-6 py-3 text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl hover:opacity-90"
                  >
                    Invest Now
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

              <div className="space-y-6">
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
    return (
                  <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Profile Information</h3>
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {profile.profileCompletion}% Complete
                </span>
              </div>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setIsEditingProfile(!isEditingProfile)}
                className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg hover:opacity-90"
                        >
                          {isEditingProfile ? 'Cancel' : 'Edit Profile'}
                        </motion.button>
            </div>
                      </div>

                      {isEditingProfile ? (
                        <form onSubmit={handleSubmit(handleProfileSave)} className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Full Name
                              </label>
                              <input
                                type="text"
                    id="name"
                                {...register('name')}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
                              />
                              {errors.name && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name.message}</p>
                              )}
                            </div>

                            <div>
                              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Email
                              </label>
                              <input
                                type="email"
                    id="email"
                                {...register('email')}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
                              />
                              {errors.email && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email.message}</p>
                              )}
                            </div>

                            <div>
                              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Phone Number
                              </label>
                              <input
                                type="tel"
                    id="phone"
                                {...register('phone')}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
                              />
                              {errors.phone && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.phone.message}</p>
                              )}
                            </div>

                            <div>
                              <label htmlFor="investmentExperience" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Investment Experience
                              </label>
                              <select
                    id="investmentExperience"
                                {...register('investmentExperience')}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
                              >
                                <option value="">Select experience</option>
                    <option value="0-2 years">0-2 years</option>
                    <option value="3-5 years">3-5 years</option>
                    <option value="5-10 years">5-10 years</option>
                    <option value="10+ years">10+ years</option>
                              </select>
                              {errors.investmentExperience && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.investmentExperience.message}</p>
                              )}
                            </div>
                          </div>

              {/* Bio */}
                          <div>
                            <label htmlFor="bio" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                              Bio
                            </label>
                            <textarea
                  id="bio"
                              {...register('bio')}
                  rows={4}
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
                            />
                            {errors.bio && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.bio.message}</p>
                            )}
                          </div>

              {/* Investment Preferences */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="preferredInvestmentAmount" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Preferred Investment Amount (₦)
                  </label>
                  <input
                    type="number"
                    id="preferredInvestmentAmount"
                    {...register('preferredInvestmentAmount')}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
                  />
                  {errors.preferredInvestmentAmount && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.preferredInvestmentAmount.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="riskTolerance" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Risk Tolerance
                  </label>
                  <select
                    id="riskTolerance"
                    {...register('riskTolerance')}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
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

              {/* Investment Interests */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Investment Interests
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {['Residential', 'Commercial', 'Industrial', 'Mixed-Use', 'Green Projects', 'Luxury'].map((interest) => (
                    <label key={interest} className="inline-flex items-center">
                      <input
                        type="checkbox"
                        value={interest}
                        {...register('investmentInterests')}
                        className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:border-gray-600"
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">{interest}</span>
                    </label>
                  ))}
                </div>
                {errors.investmentInterests && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.investmentInterests.message}</p>
                )}
              </div>

              {/* Preferred Locations */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Preferred Locations
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {['Lagos', 'Abuja', 'Port Harcourt', 'Kano', 'Calabar', 'Ibadan'].map((location) => (
                    <label key={location} className="inline-flex items-center">
                      <input
                        type="checkbox"
                        value={location}
                        {...register('preferredLocations')}
                        className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:border-gray-600"
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">{location}</span>
                    </label>
                  ))}
                </div>
                {errors.preferredLocations && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.preferredLocations.message}</p>
                )}
              </div>

              {/* Investment Goals */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Investment Goals
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {['Capital Appreciation', 'Passive Income', 'Portfolio Diversification', 'Tax Benefits', 'Long-term Growth'].map((goal) => (
                    <label key={goal} className="inline-flex items-center">
                      <input
                        type="checkbox"
                        value={goal}
                        {...register('investmentGoals')}
                        className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:border-gray-600"
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">{goal}</span>
                    </label>
                  ))}
                </div>
                {errors.investmentGoals && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.investmentGoals.message}</p>
                )}
              </div>

              {/* Form Actions */}
              <div className="flex justify-end space-x-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={() => setIsEditingProfile(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                              type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg hover:opacity-90"
                            >
                              Save Changes
                </motion.button>
                          </div>
                        </form>
                      ) : (
                        <div className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Full Name</p>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white">{profile.name}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</p>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white">{profile.email}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Phone</p>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white">{profile.phone}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Investment Experience</p>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white">{profile.investmentExperience}</p>
                            </div>
                          </div>

              {/* Bio */}
                          <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Bio</p>
                <p className="mt-1 text-sm text-gray-900 dark:text-white">{profile.bio}</p>
                          </div>

              {/* Investment Preferences */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Preferred Investment Amount</p>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white">
                    ₦{profile.preferredInvestmentAmount?.toLocaleString('en-NG')}
                  </p>
                        </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Risk Tolerance</p>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white">{profile.riskTolerance}</p>
                  </div>
      </div>

              {/* Investment Interests */}
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Investment Interests</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {profile.investmentInterests?.map((interest) => (
                    <span
                      key={interest}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200"
                    >
                      {interest}
                    </span>
                  ))}
                  </div>
              </div>

              {/* Preferred Locations */}
                  <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Preferred Locations</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {profile.preferredLocations?.map((location) => (
                    <span
                      key={location}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                    >
                      {location}
                      </span>
                  ))}
                  </div>
                </div>

              {/* Investment Goals */}
                    <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Investment Goals</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {profile.investmentGoals?.map((goal) => (
                    <span
                      key={goal}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                    >
                      {goal}
                    </span>
                  ))}
                    </div>
                    </div>
                      </div>
                    )}
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

    setIsSendingMessage(true);
    try {
      // Create a new reply
      const reply = {
        id: Date.now(),
        author: profile?.name || 'Anonymous',
        content: newMessage,
        timestamp: new Date().toISOString()
      };

      // Update the topic with the new reply
      const updatedTopic = {
        ...selectedTopic,
        replies: [...(selectedTopic.replies || []), reply],
        lastActivity: new Date().toISOString()
      };

      // Update the state
      setSelectedTopic(updatedTopic);
      
      // Update the forum topics
      if (activeForum === 'general') {
        const updatedTopics = mockForums.general.topics.map(topic => 
          topic.id === selectedTopic.id ? updatedTopic : topic
        );
        mockForums.general.topics = updatedTopics;
      } else {
        const projectId = activeForum.split('-')[1];
        const projectForum = mockForums.projectForums[`project-${projectId}`];
        if (projectForum) {
          const updatedTopics = projectForum.topics.map(topic => 
            topic.id === selectedTopic.id ? updatedTopic : topic
          );
          projectForum.topics = updatedTopics;
        }
      }

      // Clear the message input
      setNewMessage('');
      handleToast('Reply posted successfully!', 'success');
    } catch (error) {
      console.error('Error posting reply:', error);
      handleToast('Failed to post reply', 'error');
    } finally {
      setIsSendingMessage(false);
    }
  };

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
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-gradient-to-r from-red-600 to-red-700 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
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
            {['analytics', 'discover', 'connections', 'forum', 'profile'].map((tab) => (
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
    </div>
  )
}