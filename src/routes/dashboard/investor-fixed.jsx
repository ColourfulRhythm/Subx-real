import React, { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { motion, AnimatePresence } from 'framer-motion'
import AIAnalysis from '../../components/AIAnalysis'
// Paystack configuration
const paystackKey = 'pk_live_c6e9456f9a1b1071ed96b977c21f8fae727400e0';
import PaymentSuccessModal from '../../components/PaymentSuccessModal'
import DeedSignatureModal from '../../components/DeedSignatureModal'
import { generateReceipt, generateOwnershipCertificate, generateDeedPDF } from '../../components/ReceiptDownload'
import jsPDF from 'jspdf'
import { getPlotDisplayName, getPlotLocation } from '../../utils/plotNamingConsistency'
// Firebase imports
import { auth, db } from '../../firebase'
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  updateDoc, 
  doc, 
  getDoc,
  orderBy,
  limit
} from 'firebase/firestore'
import { onAuthStateChanged } from 'firebase/auth'
import { firebaseService } from '../../services/firebaseService'

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
  phone: yup.string().matches(/^\+?[\d\s-()]{10,}$/, 'Invalid phone number'),
  bio: yup.string().max(500, 'Bio must be less than 500 characters'),
  ownershipInterests: yup.array().min(1, 'Select at least one interest'),
  ownershipExperience: yup.string().required('Ownership experience is required'),
  preferredLocations: yup.array().min(1, 'Select at least one preferred location'),
  preferredInvestmentAmount: yup.number().positive('Investment amount must be positive')
})

// Initial messages for new users
const initialMessages = [
  {
    id: 1,
    type: 'welcome',
    title: 'Welcome to Subx!',
    message: 'Start your land ownership journey by exploring available plots.',
    timestamp: new Date(),
    read: false
  }
]

export default function InvestorDashboard() {
  // Initialize navigate hook at the top
  const navigate = useNavigate();
  
  // Check authentication using Firebase Auth
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userType, setUserType] = useState(null);
  
  // All other state hooks must be at the top
  const [activeTab, setActiveTab] = useState('investments');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [expandedCard, setExpandedCard] = useState(null);
  const [connections, setConnections] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showConnectionModal, setShowConnectionModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [filters, setFilters] = useState({
    location: 'All',
    type: 'All',
    search: ''
  });
  const [unitPrice, setUnitPrice] = useState(0);
  const [minUnits, setMinUnits] = useState(1);
  const [maxUnits, setMaxUnits] = useState(100);
  const [selectedUnits, setSelectedUnits] = useState(1);
  const [investmentAmount, setInvestmentAmount] = useState('');
  const [investmentError, setInvestmentError] = useState('');
  const [investmentNotes, setInvestmentNotes] = useState('');
  const [isSendingRequest, setIsSendingRequest] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');
  const [showNewTopicModal, setShowNewTopicModal] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [forumSearchQuery, setForumSearchQuery] = useState('');
  const [forumTopics, setForumTopics] = useState([]);
  const [forums, setForums] = useState({
    general: {
      topics: []
    },
    projectForums: {}
  });
  const [userInvestments, setUserInvestments] = useState([]);
  const [analytics, setAnalytics] = useState({
    totalLandOwned: 0,
    activeLandUnits: 0,
    totalLandValue: 0,
    portfolioValue: 0,
    growthRate: 0,
    landDistribution: {
      residential: 0,
      commercial: 0,
      agricultural: 0,
      mixed: 0
    },
    expectedReturns: {
      threeMonths: 0,
      sixMonths: 0,
      oneYear: 0
    },
    recentTransactions: [],
    performanceMetrics: {
      monthlyReturn: 0,
      yearlyReturn: 0,
      riskScore: 0
    }
  });
  const [profile, setProfile] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [projectToShare, setProjectToShare] = useState(null);
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    darkMode: false,
    language: 'en'
  });
  const [showConnectionDetails, setShowConnectionDetails] = useState(false);
  const [selectedConnection, setSelectedConnection] = useState(null);
  const [showDocumentsModal, setShowDocumentsModal] = useState(false);
  const [activeForum, setActiveForum] = useState('general');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [newTopic, setNewTopic] = useState({
    title: '',
    content: '',
    category: 'general'
  });
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);
  const [showDeedModal, setShowDeedModal] = useState(false);
  const [receipts, setReceipts] = useState([]);
  const [messages, setMessages] = useState([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showDeedSignModal, setShowDeedSignModal] = useState(false);
  const [deedSignature, setDeedSignature] = useState('');
  const [showReferralModal, setShowReferralModal] = useState(false);
  const [referralCode, setReferralCode] = useState('');
  const [showReferralSuccess, setShowReferralSuccess] = useState(false);
  const [showReferralError, setShowReferralError] = useState(false);
  const [referralError, setReferralError] = useState('');
  const [showReferralInfo, setShowReferralInfo] = useState(false);
  const [showReferralHistory, setShowReferralHistory] = useState(false);
  const [referralHistory, setReferralHistory] = useState([]);
  const [showReferralWithdrawal, setShowReferralWithdrawal] = useState(false);
  const [referralWithdrawalAmount, setReferralWithdrawalAmount] = useState('');
  const [referralWithdrawalError, setReferralWithdrawalError] = useState('');
  const [showReferralWithdrawalSuccess, setShowReferralWithdrawalSuccess] = useState(false);
  const [showReferralWithdrawalError, setShowReferralWithdrawalError] = useState(false);
  const [showReferralWithdrawalInfo, setShowReferralWithdrawalInfo] = useState(false);
  const [showReferralWithdrawalHistory, setShowReferralWithdrawalHistory] = useState(false);
  const [referralWithdrawalHistory, setReferralWithdrawalHistory] = useState([]);
  const [showReferralWithdrawalModal, setShowReferralWithdrawalModal] = useState(false);
  const [referralWithdrawalModalAmount, setReferralWithdrawalModalAmount] = useState('');
  const [referralWithdrawalModalError, setReferralWithdrawalModalError] = useState('');
  const [showReferralWithdrawalModalSuccess, setShowReferralWithdrawalModalSuccess] = useState(false);
  const [showReferralWithdrawalModalError, setShowReferralWithdrawalModalError] = useState(false);
  const [showReferralWithdrawalModalInfo, setShowReferralWithdrawalModalInfo] = useState(false);
  const [showReferralWithdrawalModalHistory, setShowReferralWithdrawalModalHistory] = useState(false);
  const [referralWithdrawalModalHistory, setReferralWithdrawalModalHistory] = useState([]);
  const [showReferralWithdrawalModalModal, setShowReferralWithdrawalModalModal] = useState(false);
  const [referralWithdrawalModalModalAmount, setReferralWithdrawalModalModalAmount] = useState('');
  const [referralWithdrawalModalModalError, setReferralWithdrawalModalModalError] = useState('');
  const [showReferralWithdrawalModalModalSuccess, setShowReferralWithdrawalModalModalSuccess] = useState(false);
  const [showReferralWithdrawalModalModalError, setShowReferralWithdrawalModalModalError] = useState(false);
  const [showReferralWithdrawalModalModalInfo, setShowReferralWithdrawalModalModalInfo] = useState(false);
  const [showReferralWithdrawalModalModalHistory, setShowReferralWithdrawalModalModalHistory] = useState(false);
  const [referralWithdrawalModalModalHistory, setReferralWithdrawalModalModalHistory] = useState([]);
  const [deeds, setDeeds] = useState([]);
  const [showSqmModal, setShowSqmModal] = useState(false);
  
  // Check authentication on component mount
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // Get user profile to determine user type
          const userProfile = await firebaseService.getCurrentUserProfile();
          if (userProfile && userProfile.user_type === 'investor') {
            setIsAuthenticated(true);
            setUserType('investor');
          } else {
            // User exists but is not an investor
            navigate('/login', { replace: true });
          }
        } catch (error) {
          console.error('Error checking user type:', error);
          navigate('/login', { replace: true });
        }
      } else {
        setIsAuthenticated(false);
        setUserType(null);
        navigate('/login', { replace: true });
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  // Show loading while checking authentication
  if (!isAuthenticated || userType !== 'investor') {
    return (
      <div className="min-h-screen w-full bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }
  
  // Get user data from Firebase Auth only
  const user = auth.currentUser;
  const userId = user?.uid || '';
  
  // Create default user profile data (will be overridden by Firebase data)
  const userProfileData = {
    name: user?.displayName || 'User',
    email: user?.email || '',
    phone: '',
    bio: 'Welcome to your land sub-ownership dashboard!',
    ownershipExperience: 'Beginner',
    riskTolerance: 'Moderate',
    ownershipInterests: ['Residential'],
    preferredLocations: ['Ogun State'],
    ownershipGoals: ['Long-term Growth']
  };
  
  // Fetch profile and analytics data when user is authenticated
  useEffect(() => {
    // Only fetch data if user is authenticated and is an investor
    if (!isAuthenticated || userType !== 'investor') {
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    const loadData = async () => {
      try {
        // Initialize database with default data if needed
        await firebaseService.initializeDatabase();
        console.log('✅ Database initialized');
        
        // Fetch real user data from Firebase
        await fetchUserData();
        
        // Fetch profile data
        await fetchProfile();
        
        // Set projects from Firebase service
        const projects = await firebaseService.getAvailableProjects();
        setProjects(projects);
        console.log('✅ Projects loaded from Firebase:', projects);
        
        // Initialize empty messages for new users
        setMessages(initialMessages);
        
        // Load analytics data after user data is loaded
        await fetchAnalytics();
        
        console.log('✅ All data loaded successfully');
      } catch (error) {
        console.error('❌ Error loading data:', error);
        setError('Failed to load data. Please refresh the page.');
        setProjects([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [isAuthenticated, userType]);
  
  // Load Paystack script on mount
  useEffect(() => {
    if (!window.PaystackPop) {
      const script = document.createElement('script');
      script.src = 'https://js.paystack.co/v1/inline.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);
  
  // Fetch real user data from Firebase
  const fetchUserData = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      // Load user connections from Firebase
      const userConnections = await firebaseService.getUserConnections();
      setConnections(userConnections);

      // Load user investments from Firebase
      await fetchUserInvestments();

      // Load user analytics from Firebase
      await fetchAnalytics();
      
      // Load badges and achievements
      loadUserBadgesAndAchievements();

    } catch (error) {
      console.error('Error fetching user data:', error);
      setError('Failed to load user data. Please refresh the page.');
      // Set empty data if Firebase is not available
      setConnections([]);
      setUserInvestments([]);
      setAnalytics({
        totalLandOwned: 0,
        activeLandUnits: 0,
        totalLandValue: 0,
        portfolioValue: 0,
        growthRate: 0,
        landDistribution: {
          residential: 0,
          commercial: 0,
          agricultural: 0,
          mixed: 0
        },
        expectedReturns: {
          threeMonths: 0,
          sixMonths: 0,
          oneYear: 0
        },
        recentTransactions: [],
        performanceMetrics: {
          monthlyReturn: 0,
          yearlyReturn: 0,
          riskScore: 0
        }
      });
    }
  };
  
  // Placeholder functions - these would be implemented with the full component logic
  const fetchUserInvestments = async () => {
    // Implementation would go here
  };
  
  const fetchAnalytics = async () => {
    // Implementation would go here
  };
  
  const loadUserBadgesAndAchievements = () => {
    // Implementation would go here
  };
  
  const fetchProfile = async () => {
    // Implementation would go here
  };
  
  // Placeholder return - this would contain the full component JSX
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-900">Investor Dashboard</h1>
        <p className="text-gray-600">Welcome back, {user?.displayName || user?.email}</p>
        
        {isLoading && (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
          </div>
        )}
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        {!isLoading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Land Owned</h3>
              <p className="text-3xl font-bold text-indigo-600">{analytics.totalLandOwned} sqm</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Portfolio Value</h3>
              <p className="text-3xl font-bold text-green-600">₦{analytics.portfolioValue?.toLocaleString() || 0}</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Growth Rate</h3>
              <p className="text-3xl font-bold text-blue-600">+{analytics.growthRate || 0}%</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
