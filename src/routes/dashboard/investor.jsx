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

export default function InvestorDashboard() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [expandedCard, setExpandedCard] = useState(null)
  const [connections, setConnections] = useState([])
  
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
      handleToast('Developer profile not found', 'error')
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
      
      // Since we don't have a backend server yet, simulate a successful request
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
      
      // Add the connection to the local state
      const newConnection = {
        id: Date.now(),
        developerId: selectedProject.developerId,
        developer: selectedProject.developer,
        projectId: selectedProject.id,
        projectTitle: selectedProject.title,
        units: selectedUnits,
        amount: investmentAmount,
        status: 'pending',
        createdAt: new Date().toISOString(),
        notes: investmentNotes
      };

      // Update connections list
      setConnections(prev => [...prev, newConnection]);
      
      // Reset all states
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
      
      // Show success message
      handleToast(
        `Request Sent! We've notified ${selectedProject.developer} about your interest in ${selectedUnits} unit(s) (${investmentAmount}).`
      );

      // Switch to discover tab
      setActiveTab('discover');
      
    } catch (error) {
      console.error('Error sending connection request:', error);
      handleToast(
        'Failed to send connection request. Please try again later.',
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
    setExpandedCard(project.id)
  }

  // Find the section where project cards are rendered and modify it to include AI Analysis
  const renderProjectCards = () => {
    return mockProjects.map((project) => (
      <motion.div
        key={project.id}
        className="bg-white rounded-lg shadow-md overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="relative">
          <img
            src={project.images[0]}
            alt={project.title}
            className="w-full h-48 object-cover"
          />
          <div className="absolute top-4 right-4 bg-blue-600 text-white px-3 py-1 rounded-full text-sm">
            {project.status}
          </div>
        </div>
        
        <div className="p-6">
          <h3 className="text-xl font-semibold mb-2">{project.title}</h3>
          <p className="text-gray-600 mb-4">{project.description}</p>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-sm text-gray-500">Location</p>
              <p className="font-medium">{project.location}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Type</p>
              <p className="font-medium">{project.type}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Amount</p>
              <p className="font-medium">{project.amount}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">ROI</p>
              <p className="font-medium">{project.roi}</p>
            </div>
          </div>

          <button
            onClick={() => toggleCardExpansion(project.id)}
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            {expandedCard === project.id ? 'Show Less' : 'View Details'}
          </button>

          {expandedCard === project.id && (
            <div className="mt-4 space-y-4">
              <div className="bg-gray-50 rounded-lg p-6">
                <h4 className="text-lg font-semibold mb-4">Project Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-gray-600 mb-4">{project.detailedDescription}</p>
                    <div className="mb-4">
                      <h5 className="font-medium mb-2">Amenities</h5>
                      <ul className="list-disc list-inside text-gray-600">
                        {project.amenities.map((amenity, index) => (
                          <li key={index}>{amenity}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h5 className="font-medium mb-2">Documents</h5>
                      <ul className="space-y-2">
                        {project.documents.map((doc, index) => (
                          <li key={index}>
                            <a href={doc.url} className="text-blue-600 hover:underline">
                              {doc.name}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <div>
                    <AIAnalysis developmentId={project.id} />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    ));
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
            {['dashboard', 'discover', 'connections', 'profile'].map((tab) => (
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
                {/* Dashboard Tab */}
                {activeTab === 'dashboard' && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <h2 className="text-2xl font-bold">Investment Opportunities</h2>
                      <div className="flex space-x-4">
                        <select
                          className="border rounded-md px-3 py-2"
                          onChange={(e) => handleFilterChange('location', e.target.value)}
                        >
                          {locationOptions.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                        <select
                          className="border rounded-md px-3 py-2"
                          onChange={(e) => handleFilterChange('type', e.target.value)}
                        >
                          {typeOptions.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {renderProjectCards()}
                    </div>
                  </div>
                )}

                {/* Discover Tab */}
                {activeTab === 'discover' && (
                  <div className="space-y-6">
                    {/* Search and Filters */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6"
                    >
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <div>
                          <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Location
                          </label>
                          <motion.select
                            whileHover={{ scale: 1.02 }}
                            id="location"
                            value={filters.location}
                            onChange={(e) => handleFilterChange('location', e.target.value)}
                            className="mt-1 block w-full rounded-xl border-gray-300 dark:border-gray-600 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                          >
                            {locationOptions.map((option) => (
                              <option key={option} value={option}>{option}</option>
                            ))}
                          </motion.select>
                        </div>
                        {/* Similar motion.select for type filter */}
                      </div>
                    </motion.div>

                    {/* Project Grid */}
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                      {filteredProjects.map((project) => (
                        <motion.div
                          key={project.id}
                          whileHover={{ scale: 1.02 }}
                          className="bg-white dark:bg-gray-800 shadow-lg rounded-xl overflow-hidden"
                        >
                          <div className="relative">
                            <img
                              src={project.images[0]}
                              alt={project.title}
                              className="w-full h-48 object-cover"
                            />
                            <div className="absolute top-4 right-4">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                project.status === 'Active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                                'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                              }`}>
                                {project.status}
                              </span>
                            </div>
                          </div>
                          <div className="p-6">
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
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => handleConnectionRequest(project)}
                              className="mt-4 w-full flex justify-center py-2 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                              Request Connection
                            </motion.button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Connections Tab */}
                {activeTab === 'connections' && (
                  <div className="space-y-6">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6"
                    >
                      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                        Your Connections
                      </h3>
                      <div className="space-y-4">
                        {analytics.connectionRequests.developers.map((developer) => (
                          <motion.div
                            key={developer.name}
                            whileHover={{ scale: 1.02 }}
                            className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl"
                          >
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center">
                                <span className="text-white font-medium">
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
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleViewConnectionDetails(developer)}
                              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full shadow-sm text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                              View Details
                            </motion.button>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  </div>
                )}

                {/* Profile Tab */}
                {activeTab === 'profile' && (
                  <div className="space-y-6">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6"
                    >
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                          Profile Information
                        </h3>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setIsEditingProfile(!isEditingProfile)}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full shadow-sm text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          {isEditingProfile ? 'Cancel' : 'Edit Profile'}
                        </motion.button>
                      </div>

                      {/* Profile Form or View */}
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
                    </motion.div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          )}
        </main>
      </div>

      {/* Connection Details Modal */}
      <AnimatePresence>
        {showConnectionDetails && selectedConnection && (
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
                        handleToast('Connection request cancelled', 'success')
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
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Connection Request Modal */}
      <AnimatePresence>
        {showConnectionModal && selectedProject && (
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
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    Request Connection
                  </h3>
                  <p className="mt-2 text-gray-600 dark:text-gray-400">
                    Connect with {selectedProject.developer} to invest in {selectedProject.title}
                  </p>
                </motion.div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowConnectionModal(false)}
                  className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </motion.button>
              </div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="space-y-6"
              >
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/50 dark:to-purple-900/50 rounded-xl p-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Project</p>
                      <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-gray-100">{selectedProject.title}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Location</p>
                      <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-gray-100">{selectedProject.location}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Unit Price</p>
                      <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-gray-100">
                        ₦{unitPrice.toLocaleString('en-NG')}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Available Units</p>
                      <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-gray-100">
                        {minUnits} - {maxUnits.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label htmlFor="units" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Number of Units
                    </label>
                    <motion.div 
                      whileHover={{ scale: 1.02 }}
                      className="mt-1"
                    >
                      <input
                        type="number"
                        id="units"
                        value={selectedUnits}
                        onChange={handleUnitChange}
                        min={minUnits}
                        max={maxUnits}
                        className={`block w-full rounded-xl border-gray-300 dark:border-gray-600 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white sm:text-sm ${
                          investmentError ? 'border-red-300 dark:border-red-500' : ''
                        }`}
                      />
                    </motion.div>
                    {investmentError && (
                      <motion.p 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-2 text-sm text-red-600 dark:text-red-400"
                      >
                        {investmentError}
                      </motion.p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="investmentAmount" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Total Investment Amount
                    </label>
                    <motion.div 
                      whileHover={{ scale: 1.02 }}
                      className="mt-1"
                    >
                      <input
                        type="text"
                        id="investmentAmount"
                        value={investmentAmount}
                        readOnly
                        className="block w-full rounded-xl border-gray-300 dark:border-gray-600 shadow-sm bg-gray-50 dark:bg-gray-700 dark:text-white sm:text-sm"
                      />
                    </motion.div>
                  </div>

                  <div>
                    <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Additional Notes (Optional)
                    </label>
                    <motion.div 
                      whileHover={{ scale: 1.02 }}
                      className="mt-1"
                    >
                      <textarea
                        id="notes"
                        rows={3}
                        value={investmentNotes}
                        onChange={(e) => setInvestmentNotes(e.target.value)}
                        className="block w-full rounded-xl border-gray-300 dark:border-gray-600 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                        placeholder="Add any additional information or questions..."
                      />
                    </motion.div>
                  </div>
                </div>

                <div className="flex justify-end space-x-4 pt-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowConnectionModal(false)}
                    className="px-6 py-3 text-base font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleRequestSubmit}
                    disabled={!!investmentError || isSendingRequest}
                    className={`px-6 py-3 text-base font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                      (!!investmentError || isSendingRequest) ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {isSendingRequest ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Sending Request...
                      </span>
                    ) : (
                      'Submit Request'
                    )}
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirmation && selectedProject && (
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
              className="bg-white dark:bg-gray-800 rounded-2xl max-w-lg w-full p-8 shadow-xl"
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Confirm Your Request
                  </h3>
                  <p className="mt-2 text-gray-600 dark:text-gray-400">
                    Please review your connection request details before proceeding.
                  </p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowConfirmation(false)}
                  className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </motion.button>
              </div>

              <div className="space-y-6">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    Request Summary
                  </h4>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Project:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{selectedProject.title}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Developer:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{selectedProject.developer}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Units:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{selectedUnits}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Investment Amount:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{investmentAmount}</span>
                    </div>
                    {investmentNotes && (
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Notes:</span>
                        <span className="font-medium text-gray-900 dark:text-white">{investmentNotes}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end space-x-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowConfirmation(false)}
                    className="px-6 py-3 text-base font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={submitConnectionRequest}
                    disabled={isSendingRequest}
                    className={`px-6 py-3 text-base font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                      isSendingRequest ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {isSendingRequest ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Sending Request...
                      </span>
                    ) : (
                      'Confirm Request'
                    )}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
  )
}