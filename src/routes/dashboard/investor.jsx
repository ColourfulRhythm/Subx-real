import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'

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

export default function InvestorDashboard() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [expandedCard, setExpandedCard] = useState(null)
  
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
    const totalFields = 10
    const completedFields = Object.entries(data).filter(([key, value]) => {
      if (Array.isArray(value)) return value.length > 0
      return value !== '' && value !== null && value !== undefined
    }).length
    return Math.round((completedFields / totalFields) * 100)
  }

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

  // Fetch profile data on component mount
  useEffect(() => {
    fetchProfile()
  }, [])

  // API integration functions
  const fetchProfile = async () => {
    try {
      setIsLoading(true)
      // TODO: Replace with actual API call
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
      }
      setProfile(mockProfile)
      reset(mockProfile)
    } catch (error) {
      setError('Failed to load profile')
    } finally {
      setIsLoading(false)
    }
  }

  const handleProfileSave = async (data) => {
    try {
      setIsLoading(true)
      setError(null)
      // TODO: Replace with actual API call
      console.log('Saving profile:', data)
      
      // Update profile completion
      const completion = calculateProfileCompletion(data)
      const updatedProfile = { ...data, profileCompletion: completion }
      
      setProfile(updatedProfile)
      setIsEditingProfile(false)
      setSuccess('Profile updated successfully')
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000)
    } catch (error) {
      setError('Failed to save profile')
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('userType')
    localStorage.removeItem('isAuthenticated')
    navigate('/')
  }

  // Mock data for analytics with Nigerian context
  const analytics = {
    projectsViewed: {
      total: 48,
      breakdown: {
        residential: 30,
        commercial: 18
      },
      locations: {
        lagos: 25,
        abuja: 15,
        portHarcourt: 8
      }
    },
    connectionRequests: {
      total: 12,
      approved: 5,
      pending: 6,
      rejected: 1,
      developers: [
        { name: 'Lagos Properties Ltd', status: 'approved' },
        { name: 'Abuja Developers', status: 'pending' },
        { name: 'Port Harcourt Estates', status: 'approved' }
      ]
    },
    savedProjects: {
      total: 7,
      recent: [
        { 
          id: 1, 
          title: 'Lekki Luxury Apartments', 
          location: 'Lagos',
          amount: '₦250,000,000',
          date: '2024-05-01' 
        },
        { 
          id: 2, 
          title: 'Maitama Office Complex', 
          location: 'Abuja',
          amount: '₦180,000,000',
          date: '2024-04-28' 
        },
        { 
          id: 3, 
          title: 'Victoria Island Mall', 
          location: 'Lagos',
          amount: '₦500,000,000',
          date: '2024-04-25' 
        }
      ]
    },
    responseRate: 83,
    totalInvestment: {
      amount: '₦1,250,000,000',
      breakdown: {
        lagos: '₦850,000,000',
        abuja: '₦300,000,000',
        others: '₦100,000,000'
      }
    }
  }

  const [projects, setProjects] = useState(mockProjects)
  const [filters, setFilters] = useState({
    location: 'All',
    type: 'All',
    search: ''
  })
  const [selectedProject, setSelectedProject] = useState(null)
  const [showProjectDetail, setShowProjectDetail] = useState(false)
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

  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab)
    setSelectedProject(null)
    setShowProjectDetail(false)
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
    setSelectedProject(project)
    
    // Get developer profile
    const developer = mockDevelopers[project.developerId]
    if (!developer) {
      showNotification('Developer profile not found', 'error')
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

  const showNotification = (message, type = 'success') => {
    setToastMessage(message)
    setToastType(type)
    setShowToast(true)
    setTimeout(() => {
      setShowToast(false)
    }, 3000)
  }

  const handleRequestSubmit = () => {
    if (!validateInvestment(selectedUnits)) {
      return
    }
    setShowConfirmation(true)
  }

  const submitConnectionRequest = async () => {
    try {
      if (!validateInvestment(selectedUnits)) {
        return;
      }

      setIsSendingRequest(true);
      
      // Try ports 3000-3005 for the backend
      let response;
      let lastError;
      
      for (let port = 3000; port <= 3005; port++) {
        try {
          response = await fetch(`http://localhost:${port}/api/connections/request`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              investorId: 'current-user-id', // TODO: Get from auth context
              developerId: selectedProject.developerId,
              projectId: selectedProject.id,
              units: selectedUnits,
              investmentAmount: selectedUnits * unitPrice,
              notes: investmentNotes
            })
          });
          
          if (response.ok) {
            break;
          }
        } catch (error) {
          lastError = error;
          continue;
        }
      }

      if (!response || !response.ok) {
        throw new Error(lastError?.message || 'Failed to connect to backend server');
      }

      const data = await response.json();
      
      setShowConnectionModal(false);
      setShowConfirmation(false);
      showNotification(
        `Request Sent! We've notified ${selectedProject.developer} about your interest in ${selectedUnits} unit(s) (${investmentAmount}).`
      );
    } catch (error) {
      console.error('Error sending connection request:', error);
      showNotification(
        error.message || 'Failed to send connection request. Please try again later.',
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

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
              Subx
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
            >
              {isDarkMode ? (
                <svg className="h-6 w-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700 mb-8">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            {['dashboard', 'discover', 'connections', 'profile'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`${
                  activeTab === tab
                    ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm capitalize transition-colors duration-200`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>

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
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {/* Overview Card */}
                  <div className={`bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg transition-all duration-200 hover:shadow-lg`}>
                    <div className="p-5">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
                          <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                        </div>
                        <div className="ml-5 w-0 flex-1">
                          <dl>
                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                              Total Investment
                            </dt>
                            <dd className="flex items-baseline">
                              <div className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                                ₦1,250,000,000
                              </div>
                              <div className="ml-2 flex items-baseline text-sm font-semibold text-green-600 dark:text-green-400">
                                <svg className="self-center flex-shrink-0 h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                </svg>
                                <span className="sr-only">Increased by</span>
                                12%
                              </div>
                            </dd>
                          </dl>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Projects Card */}
                  <div className={`bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg transition-all duration-200 hover:shadow-lg`}>
                    <div className="p-5">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
                          <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                        </div>
                        <div className="ml-5 w-0 flex-1">
                          <dl>
                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                              Active Projects
                            </dt>
                            <dd className="flex items-baseline">
                              <div className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                                12
                              </div>
                              <div className="ml-2 flex items-baseline text-sm font-semibold text-green-600 dark:text-green-400">
                                <svg className="self-center flex-shrink-0 h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                </svg>
                                <span className="sr-only">Increased by</span>
                                3
                              </div>
                            </dd>
                          </dl>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ROI Card */}
                  <div className={`bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg transition-all duration-200 hover:shadow-lg`}>
                    <div className="p-5">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
                          <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div className="ml-5 w-0 flex-1">
                          <dl>
                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                              Average ROI
                            </dt>
                            <dd className="flex items-baseline">
                              <div className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                                22%
                              </div>
                              <div className="ml-2 flex items-baseline text-sm font-semibold text-green-600 dark:text-green-400">
                                <svg className="self-center flex-shrink-0 h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                </svg>
                                <span className="sr-only">Increased by</span>
                                2%
                              </div>
                            </dd>
                          </dl>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Discover Tab */}
              {activeTab === 'discover' && (
                <div className="space-y-6">
                  {/* Filters */}
                  <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                      <div>
                        <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Location
                        </label>
                        <select
                          id="location"
                          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
                          value={filters.location}
                          onChange={(e) => handleFilterChange('location', e.target.value)}
                        >
                          {locationOptions.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Project Type
                        </label>
                        <select
                          id="type"
                          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
                          value={filters.type}
                          onChange={(e) => handleFilterChange('type', e.target.value)}
                        >
                          {typeOptions.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label htmlFor="search" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Search
                        </label>
                        <input
                          type="text"
                          id="search"
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
                          placeholder="Search projects..."
                          value={filters.search}
                          onChange={(e) => handleFilterChange('search', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Projects Grid */}
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredProjects.map((project) => (
                      <div
                        key={project.id}
                        className={`bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg transition-all duration-200 hover:shadow-lg`}
                      >
                        <div className="relative h-48">
                          <img
                            className="w-full h-full object-cover"
                            src={project.images[0]}
                            alt={project.title}
                          />
                          <div className="absolute top-2 right-2">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              project.riskLevel === 'Low' ? 'bg-green-100 text-green-800' :
                              project.riskLevel === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {project.riskLevel} Risk
                            </span>
                          </div>
                        </div>
                        <div className="p-4">
                          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                            {project.title}
                          </h3>
                          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            {project.developer} • {project.location}
                          </p>
                          <div className="mt-4 grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-gray-500 dark:text-gray-400">Amount</p>
                              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{project.amount}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500 dark:text-gray-400">ROI</p>
                              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{project.roi}</p>
                            </div>
                          </div>
                          <div className="mt-4">
                            <button
                              onClick={() => handleConnectionRequest(project)}
                              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                              Request Connection
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Connections Tab */}
              {activeTab === 'connections' && (
                <div className="space-y-6">
                  <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                      Your Connections
                    </h3>
                    <div className="space-y-4">
                      {analytics.connectionRequests.developers.map((developer) => (
                        <div
                          key={developer.name}
                          className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                        >
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                              <span className="text-indigo-600 dark:text-indigo-300 font-medium">
                                {developer.name.charAt(0)}
                              </span>
                            </div>
                            <div className="ml-4">
                              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                {developer.name}
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                Status: {developer.status}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleViewConnectionDetails(developer)}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                          >
                            View Details
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div className="space-y-6">
                  <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                        Profile Information
                      </h3>
                      <button
                        onClick={() => setIsEditingProfile(!isEditingProfile)}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        {isEditingProfile ? 'Cancel' : 'Edit Profile'}
                      </button>
                    </div>

                    {isEditingProfile ? (
                      <form onSubmit={handleSubmit(handleProfileSave)} className="space-y-6">
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                          <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                              Name
                            </label>
                            <input
                              type="text"
                              {...register('name')}
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
                            />
                            {errors.name && (
                              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                            )}
                          </div>

                          <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                              Email
                            </label>
                            <input
                              type="email"
                              {...register('email')}
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
                            />
                            {errors.email && (
                              <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                            )}
                          </div>

                          <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                              Phone
                            </label>
                            <input
                              type="tel"
                              {...register('phone')}
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
                            />
                            {errors.phone && (
                              <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
                            )}
                          </div>

                          <div>
                            <label htmlFor="investmentExperience" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                              Investment Experience
                            </label>
                            <select
                              {...register('investmentExperience')}
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
                            >
                              <option value="">Select experience</option>
                              <option value="Beginner">Beginner (0-2 years)</option>
                              <option value="Intermediate">Intermediate (2-5 years)</option>
                              <option value="Advanced">Advanced (5+ years)</option>
                            </select>
                            {errors.investmentExperience && (
                              <p className="mt-1 text-sm text-red-600">{errors.investmentExperience.message}</p>
                            )}
                          </div>
                        </div>

                        <div>
                          <label htmlFor="bio" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Bio
                          </label>
                          <textarea
                            {...register('bio')}
                            rows={3}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
                          />
                          {errors.bio && (
                            <p className="mt-1 text-sm text-red-600">{errors.bio.message}</p>
                          )}
                        </div>

                        <div className="flex justify-end">
                          <button
                            type="submit"
                            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                          >
                            Save Changes
                          </button>
                        </div>
                      </form>
                    ) : (
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                          <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Name</p>
                            <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{profile.name}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</p>
                            <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{profile.email}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Phone</p>
                            <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{profile.phone}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Investment Experience</p>
                            <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{profile.investmentExperience}</p>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Bio</p>
                          <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{profile.bio}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Connection Details Modal */}
      {showConnectionDetails && selectedConnection && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                Connection Details
              </h3>
              <button
                onClick={() => setShowConnectionDetails(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0 h-12 w-12 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                  <span className="text-indigo-600 dark:text-indigo-300 text-lg font-medium">
                    {selectedConnection.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    {selectedConnection.name}
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Status: <span className={`font-medium ${
                      selectedConnection.status === 'approved' ? 'text-green-600' :
                      selectedConnection.status === 'pending' ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {selectedConnection.status.charAt(0).toUpperCase() + selectedConnection.status.slice(1)}
                    </span>
                  </p>
                </div>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <h5 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                  Project Information
                </h5>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Project Title</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {selectedConnection.projectTitle || 'Not specified'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Units</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {selectedConnection.units || 'Not specified'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <h5 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                  Connection Timeline
                </h5>
                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <div className="flex-shrink-0 h-2 w-2 rounded-full bg-green-400"></div>
                    <p className="ml-2 text-gray-500 dark:text-gray-400">
                      Connection requested on {new Date(selectedConnection.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  {selectedConnection.status === 'approved' && (
                    <div className="flex items-center text-sm">
                      <div className="flex-shrink-0 h-2 w-2 rounded-full bg-green-400"></div>
                      <p className="ml-2 text-gray-500 dark:text-gray-400">
                        Connection approved on {new Date(selectedConnection.updatedAt || Date.now()).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-4 flex justify-end space-x-3">
                {selectedConnection.status === 'pending' && (
                  <button
                    onClick={() => {
                      // TODO: Implement cancel request functionality
                      setShowConnectionDetails(false)
                      showNotification('Connection request cancelled', 'success')
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Cancel Request
                  </button>
                )}
                <button
                  onClick={() => setShowConnectionDetails(false)}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Connection Request Modal */}
      {showConnectionModal && selectedProject && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                Request Connection
              </h3>
              <button
                onClick={() => setShowConnectionModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-6">
              {/* Project Summary */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                  Project Details
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Project</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {selectedProject.title}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Developer</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {selectedProject.developer}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total Project Value</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {selectedProject.amount}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Expected ROI</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {selectedProject.roi}
                    </p>
                  </div>
                </div>
              </div>

              {/* Investment Details */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-4">
                  Investment Details
                </h4>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="units" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Number of Units
                    </label>
                    <div className="mt-1 flex rounded-md shadow-sm">
                      <input
                        type="number"
                        id="units"
                        value={selectedUnits}
                        onChange={handleUnitChange}
                        min={minUnits}
                        max={maxUnits}
                        step="1"
                        className="flex-1 min-w-0 block w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:text-gray-500 dark:disabled:text-gray-400"
                      />
                    </div>
                    {investmentError && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{investmentError}</p>
                    )}
                    <div className="mt-2 space-y-1">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Available units: {minUnits.toLocaleString()} - {maxUnits.toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Price per unit: ₦{unitPrice.toLocaleString('en-NG')}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Minimum units required by {selectedProject?.developer}: {minUnits.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Total Investment Amount
                    </label>
                    <p className="mt-1 text-lg font-medium text-gray-900 dark:text-gray-100">
                      {investmentAmount}
                    </p>
                  </div>

                  <div>
                    <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Additional Notes (Optional)
                    </label>
                    <textarea
                      id="notes"
                      rows={3}
                      value={investmentNotes}
                      onChange={(e) => setInvestmentNotes(e.target.value)}
                      className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      placeholder="Add any specific requirements or questions for the developer..."
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowConnectionModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRequestSubmit}
                  disabled={!!investmentError || isSendingRequest}
                  className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                    (!!investmentError || isSendingRequest) ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isSendingRequest ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sending...
                    </span>
                  ) : (
                    'Submit Request'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}