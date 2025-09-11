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
  
  // Referral system state
  const [referralCode, setReferralCode] = useState('');
  const [showReferralModal, setShowReferralModal] = useState(false);
  const [showReferralSuccess, setShowReferralSuccess] = useState(false);
  const [showReferralError, setShowReferralError] = useState(false);
  const [referralError, setReferralError] = useState('');
  const [showReferralInfo, setShowReferralInfo] = useState(false);
  const [showReferralHistory, setShowReferralHistory] = useState(false);
  const [referralHistory, setReferralHistory] = useState([]);
  
  // Referral withdrawal state
  const [showReferralWithdrawal, setShowReferralWithdrawal] = useState(false);
  const [referralWithdrawalAmount, setReferralWithdrawalAmount] = useState('');
  const [referralWithdrawalError, setReferralWithdrawalError] = useState('');
  const [showReferralWithdrawalSuccess, setShowReferralWithdrawalSuccess] = useState(false);
  const [showReferralWithdrawalInfo, setShowReferralWithdrawalInfo] = useState(false);
  const [showReferralWithdrawalHistory, setShowReferralWithdrawalHistory] = useState(false);
  const [referralWithdrawalHistory, setReferralWithdrawalHistory] = useState([]);
  
  // Referral withdrawal modal state
  const [showReferralWithdrawalModal, setShowReferralWithdrawalModal] = useState(false);
  const [referralWithdrawalModalAmount, setReferralWithdrawalModalAmount] = useState('');
  const [referralWithdrawalModalError, setReferralWithdrawalModalError] = useState('');
  const [showReferralWithdrawalModalSuccess, setShowReferralWithdrawalModalSuccess] = useState(false);
  const [showReferralWithdrawalModalInfo, setShowReferralWithdrawalModalInfo] = useState(false);
  const [showReferralWithdrawalModalHistory, setShowReferralWithdrawalModalHistory] = useState(false);
  const [referralWithdrawalModalHistory, setReferralWithdrawalModalHistory] = useState([]);
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
    try {
      // Get detailed plot ownership data
      const plotOwnership = await firebaseService.getUserPlotOwnership();
      setUserInvestments(plotOwnership);
      
      // Update analytics based on plot ownership
      if (plotOwnership.length > 0) {
        const totalSqm = plotOwnership.reduce((sum, plot) => sum + (plot.sqm_owned || 0), 0);
        // FIXED: Exclude referral bonuses from total value calculation
        const totalValue = plotOwnership.reduce((sum, plot) => {
          if (plot.referral_bonus === true) {
            console.log('🔍 Skipping referral bonus from portfolio calculation:', plot.project_title, plot.amount_paid);
            return sum;
          }
          return sum + (plot.amount_paid || 0);
        }, 0);
        
        setAnalytics(prev => ({
          ...prev,
          totalLandOwned: totalSqm,
          portfolioValue: totalValue,
          activeLandUnits: plotOwnership.length
        }));
      }
      
      console.log('✅ User investments loaded:', plotOwnership);
    } catch (error) {
      console.error('❌ Error fetching user investments:', error);
      setUserInvestments([]);
    }
  };
  
  const fetchAnalytics = async () => {
    try {
      // Get portfolio data
      const portfolio = await firebaseService.getUserPortfolio();
      
      if (portfolio.plots && portfolio.plots.length > 0) {
        const totalSqm = portfolio.total_sqm;
        const totalValue = portfolio.total_investment_amount;
        
        setAnalytics(prev => ({
          ...prev,
          totalLandOwned: totalSqm,
          portfolioValue: totalValue,
          activeLandUnits: portfolio.plot_count,
          landDistribution: {
            residential: totalSqm > 0 ? 100 : 0,
            commercial: 0,
            agricultural: 0,
            mixed: 0
          }
        }));
        
        console.log('✅ Analytics updated from portfolio:', { totalSqm, totalValue });
      }
    } catch (error) {
      console.error('❌ Error fetching analytics:', error);
    }
  };
  
  const loadUserBadgesAndAchievements = () => {
    // Implementation would go here
  };
  
  const fetchProfile = async () => {
    try {
      const userProfile = await firebaseService.getCurrentUserProfile();
      setProfile(userProfile);
      console.log('✅ User profile loaded:', userProfile);
    } catch (error) {
      console.error('❌ Error fetching profile:', error);
    }
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
          <>
            {/* Portfolio Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Land Owned</h3>
                <p className="text-3xl font-bold text-indigo-600">{analytics.totalLandOwned} sqm</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Portfolio Value</h3>
                <p className="text-3xl font-bold text-green-600">₦{analytics.portfolioValue?.toLocaleString() || 0}</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Active Plots</h3>
                <p className="text-3xl font-bold text-blue-600">{analytics.activeLandUnits || 0}</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Growth Rate</h3>
                <p className="text-3xl font-bold text-purple-600">+{analytics.growthRate || 0}%</p>
              </div>
            </div>

            {/* Plot Ownership Details */}
            {userInvestments && userInvestments.length > 0 && (
              <div className="mt-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Your Land Investments</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {userInvestments.map((plot, index) => (
                    <div key={plot.id || index} className="bg-white p-6 rounded-lg shadow border-l-4 border-indigo-500">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">{plot.project_title}</h3>
                        <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                          {plot.status || 'Active'}
                        </span>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">SQM Owned:</span>
                          <span className="font-semibold text-gray-900">{plot.sqm_owned} sqm</span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-gray-600">Amount Paid:</span>
                          <span className="font-semibold text-green-600">₦{plot.amount_paid?.toLocaleString() || 0}</span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-gray-600">Plot Type:</span>
                          <span className="font-semibold text-gray-900">{plot.plot_type || 'Residential'}</span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-gray-600">Location:</span>
                          <span className="font-semibold text-gray-900">{plot.location || 'Ogun State'}</span>
                        </div>
                        
                        {plot.referral_bonus && (
                          <div className="mt-3 p-2 bg-yellow-100 rounded">
                            <span className="text-yellow-800 text-sm font-medium">🎁 Referral Bonus Applied</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* No Investments Message */}
            {(!userInvestments || userInvestments.length === 0) && (
              <div className="mt-8 text-center">
                <div className="bg-white p-8 rounded-lg shadow">
                  <div className="text-gray-400 mb-4">
                    <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Land Investments Yet</h3>
                  <p className="text-gray-600 mb-4">Start your land ownership journey by exploring available plots.</p>
                  <button className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors">
                    Browse Available Plots
                  </button>
                </div>
              </div>
            )}

            {/* Recent Activity */}
            <div className="mt-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
              <div className="bg-white rounded-lg shadow">
                <div className="p-6">
                  <p className="text-gray-600">Your investment activity will appear here.</p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
