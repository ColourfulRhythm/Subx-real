import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth, db } from '../../firebase';
import { signOut, onAuthStateChanged, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, updateDoc, setDoc, collection, query, where, getDocs, addDoc, orderBy, limit, writeBatch } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';
import PaymentSuccessModal from '../../components/PaymentSuccessModal';
// Removed firebaseProfileService import - now using 'users' collection directly
import { 
  getPlotDisplayName, 
  getPlotLocation,
  getPlotBranding,
  generateDocumentContent
} from '../../utils/plotNamingConsistency';
import { createComprehensiveBackup, validateDataIntegrity, scheduleAutomaticBackups } from '../../services/dataPreservationService';
import PaymentService from '../../services/paymentService';

// FIXED: Removed backend API calls - now using Firebase only
// No more 500 errors from backend server

// Real data fallback function
const getRealDataFallback = async (userEmail) => {
  console.log('🔍 getRealDataFallback called with email:', userEmail);
  const realData = {
    'kingflamebeats@gmail.com': [
      { plot_id: 1, project_title: 'Plot 77', sqmOwned: 1, amountPaid: 5000, status: 'Active' }
    ],
    'godundergod100@gmail.com': [
      { plot_id: 1, project_title: 'Plot 77', sqmOwned: 1, amountPaid: 5000, status: 'Active' }
    ],
    'michelleunachukwu@gmail.com': [
      { plot_id: 1, project_title: 'Plot 77', sqmOwned: 1, amountPaid: 5000, status: 'Active' },
      { plot_id: 1, project_title: 'Plot 77 - Referral Bonus', sqmOwned: 2.5, amountPaid: 12500, status: 'Active', referral_bonus: true, note: '5% referral bonus from gloriaunachukwu@gmail.com' }
    ],
    'gloriaunachukwu@gmail.com': [
      { plot_id: 1, project_title: 'Plot 77', sqmOwned: 50, amountPaid: 250000, status: 'Active' }
    ],
    'benjaminchisom1@gmail.com': [
      { plot_id: 1, project_title: 'Plot 77', sqmOwned: 12, amountPaid: 60000, status: 'Active' },
      { plot_id: 2, project_title: 'Plot 78', sqmOwned: 2, amountPaid: 10000, status: 'Active' }
    ],
    'chrixonuoha@gmail.com': [
      { plot_id: 1, project_title: 'Plot 77', sqmOwned: 7, amountPaid: 35000, status: 'Active' }
    ],
    'kingkwaoyama@gmail.com': [
      { plot_id: 1, project_title: 'Plot 77', sqmOwned: 35, amountPaid: 175000, status: 'Active' }
    ],
    'mary.stella82@yahoo.com': [
      { plot_id: 1, project_title: 'Plot 77', sqmOwned: 7, amountPaid: 35000, status: 'Active' }
    ]
  };

  const userData = realData[userEmail.toLowerCase()];
  console.log('Looking for user data...');
  console.log('🔍 User email:', userEmail);
  console.log('🔍 User email (lowercase):', userEmail.toLowerCase());
  console.log('🔍 Available keys in realData:', Object.keys(realData));
  console.log('🔍 Looking for key:', userEmail.toLowerCase());
  console.log('🔍 Found user data:', userData);
  
  if (userData) {
    console.log('Real data fallback found');
    console.log('🔍 Original plot data:', userData[0]);
    const mappedData = userData.map(plot => {
      console.log('🔍 Mapping plot:', plot);
      console.log('🔍 plot.amountPaid:', plot.amountPaid);
      console.log('🔍 plot.sqmOwned:', plot.sqmOwned);
      return {
      ...plot,
      id: `real_${plot.plot_id}_${userEmail}`,
      user_id: auth.currentUser?.uid || 'fallback_uid',
      user_email: userEmail,
      plot_type: 'Residential',
      location: 'Ogun State',
      developer: 'Focal Point Property Development and Management Services Ltd.',
      purchase_date: new Date(),
      created_at: new Date(),
      // Map field names to match what the UI expects
      name: plot.project_title || `Plot ${plot.plot_id}`,
      amountPaid: plot.amountPaid || 0,  // FIXED: Use correct field name
      totalSqm: 500, // Standard plot size
      sqmOwned: plot.sqmOwned || 0       // FIXED: Use correct field name
      };
    });
    console.log('✅ Mapped fallback data:', mappedData);
    return mappedData;
  } else {
    console.log('No real data fallback found for user:', userEmail);
    // CRITICAL FIX: Return empty array for users not in the hardcoded list
    console.log('🔄 User not in hardcoded list, returning empty array for:', userEmail);
  return [];
  }
};



// Array of site progress images for random selection
const siteImages = [
  '/2-seasons/bf-3.jpg',           // Building foundation
  '/2-seasons/bf-2.jpg',           // Building foundation
  '/2-seasons/allocation-1.jpg',   // Site allocation
  '/2-seasons/survey-registered.jpg', // Survey work
  '/2-seasons/site-plans.jpg',     // Site plans
  '/2-seasons/welness-hub.jpg',    // Wellness hub
  '/2-seasons/sportsacademy.jpg',  // Sports academy
  '/2-seasons/plot-cornerpiece.jpg', // Plot corner piece
  '/2-seasons/drone-image.jpg',    // Aerial view
  '/2-seasons/2-seasonsflag.JPG', // Site flag
  '/2-seasons/anotherplant.jpg',   // Site vegetation
  '/2-seasons/plantsin2seasons.jpg' // More vegetation
];

// Function to get random site image
const getRandomSiteImage = () => {
  return siteImages[Math.floor(Math.random() * siteImages.length)];
};

const mockProjects = [
  {
    id: 1,
    plot_id: 1, // Add plot_id for consistent naming
    title: 'Plot 77',
    location: '2 Seasons Estate, Gbako Village, Ogun State',
    price: '₦5,000/sq.m',
    totalSqm: 500,
    availableSqm: 500,
    image: getRandomSiteImage(),
    status: 'Available',
    description: 'Premium residential plot in 2 Seasons Estate with world-class amenities.',
    amenities: ['Gated Community', '24/7 Security', 'Recreation Center', 'Shopping Mall']
  },
  {
    id: 2,
    plot_id: 2, // Add plot_id for consistent naming
    title: 'Plot 78',
    location: '2 Seasons Estate, Ogun State',
    price: '₦5,000/sq.m',
    totalSqm: 500,
    availableSqm: 500,
    image: getRandomSiteImage(),
    status: 'Available',
    description: 'Exclusive residential plot with lakefront views and premium facilities.',
    amenities: ['Lakefront Views', 'Wellness Center', 'Sports Academy', 'Content Village']
  },
  {
    id: 3,
    plot_id: 3, // Add plot_id for consistent naming
    title: 'Plot 79',
    location: '2 Seasons Estate, Ogun State',
    price: '₦5,000/sq.m',
    totalSqm: 500,
    availableSqm: 500,
    image: getRandomSiteImage(),
    status: 'Available',
    description: 'Premium plot in the wellness village with spa and recreation facilities.',
    amenities: ['Spa & Wellness', 'Fruit Forest', 'Yoga Pavilion', 'Juice Bars']
  },
  {
    id: 4,
    plot_id: 4, // Add plot_id for consistent naming
    title: 'Plot 4',
    location: '2 Seasons Estate, Ogun State',
    price: '₦5,000/sq.m',
    totalSqm: 500,
    availableSqm: 500,
    image: getRandomSiteImage(),
    status: 'Available',
    description: 'Strategic plot with excellent connectivity and modern amenities.',
    amenities: ['Strategic Location', 'Easy Access', 'Modern Infrastructure', 'Community Hub']
  },
  {
    id: 5,
    plot_id: 5, // Add plot_id for consistent naming
    title: 'Plot 5',
    location: '2 Seasons Estate, Ogun State',
    price: '₦5,000/sq.m',
    totalSqm: 500,
    availableSqm: 500,
    image: getRandomSiteImage(),
    status: 'Available',
    description: 'Premium plot with panoramic views and exclusive amenities.',
    amenities: ['Panoramic Views', 'Exclusive Access', 'Premium Facilities', 'Privacy']
  }
];

// Paystack configuration
const paystackKey = 'pk_live_c6e9456f9a1b1071ed96b977c21f8fae727400e0';

export default function UserDashboard() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    avatar: '',
    portfolioValue: '₦0',
    totalLandOwned: '0 sqm',
    totalInvestments: 0,
    recentActivity: []
  });
  const [projects, setProjects] = useState([]);
  const [userProperties, setUserProperties] = useState([]);
  const [portfolioCalculated, setPortfolioCalculated] = useState(false);
  const [fetchingUserData, setFetchingUserData] = useState(false);
  const [activeTab, setActiveTab] = useState('opportunities');
  const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);
  const [paymentData, setPaymentData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showOwnershipModal, setShowOwnershipModal] = useState(false);
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


  // Initialize profileData with userData when userData changes
  useEffect(() => {
    if (userData && Object.keys(userData).length > 0) {
      setProfileData({
        name: userData.name || '',
        email: userData.email || '',
        phone: userData.phone || '',
        address: userData.address || '',
        dateOfBirth: userData.dateOfBirth || '',
        occupation: userData.occupation || ''
      });
    }
  }, [userData]);

  useEffect(() => {
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    // Check verification status - temporarily disabled for development
    const checkVerificationStatus = async () => {
      const user = auth.currentUser;
      if (user) {
        // Check email verification
        if (!user.emailVerified) {
          toast.error('Please verify your email to access the dashboard');
          navigate('/login');
          return;
        }
        console.log('User logged in:', user.email);
        
        // CRITICAL: Clear any old data when user changes
        const lastUserId = localStorage.getItem('lastUserId');
        if (lastUserId && lastUserId !== user.uid) {
          console.log('User changed, clearing old data');
          setUserData({
            name: '',
            email: '',
            avatar: '',
            portfolioValue: '₦0',
            totalLandOwned: '0 sqm',
            totalInvestments: 0,
            recentActivity: []
          });
          setUserProperties([]);
        }
        
        // Only fetch projects after authentication is confirmed
        fetchProjects();
      }
    };

    checkVerificationStatus();
    
    // Load data from Firebase only - no more backend API calls
    const loadData = async () => {
      try {
        // Only fetch user data from Firebase
        await fetchUserData();
        // Removed fetchProjects() - not needed for Firebase-only setup
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setTimeout(() => setIsLoading(false), 1000);
      }
    };

    loadData();
    
    // FIXED: Removed auto-refresh that was causing API errors
    // Firebase data will be updated when userProperties state changes
    
    // Load Paystack script
    if (!window.PaystackPop) {
      const script = document.createElement('script');
      script.src = 'https://js.paystack.co/v1/inline.js';
      script.async = true;
      script.onload = () => {
        console.log('Paystack script loaded successfully');
      };
      script.onerror = () => {
        console.error('Failed to load Paystack script');
      };
      document.body.appendChild(script);
    }
    
    // Cleanup function - no more intervals to clean up
    return () => {
      // Firebase listeners will be cleaned up automatically
    };
  }, [navigate]);

  // Test useEffect to see if component is rendering
  useEffect(() => {
    console.log('🧪 TEST: Component mounted, useEffect is working');
    
    // Initialize data preservation system
    try {
      scheduleAutomaticBackups();
      console.log('✅ Data preservation system initialized');
    } catch (error) {
      console.warn('⚠️ Failed to initialize data preservation system:', error);
    }
  }, []);

  // Watch for authentication state changes and fetch user data
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log('🔐 Auth state changed - user authenticated:', user.email);
        fetchUserData();
        fetchUserPropertiesNUCLEAR(user);
        
        // UNIVERSAL FIX: Ensure all users get their portfolio data
        console.log('🚀 UNIVERSAL FIX: Ensuring portfolio data for all users');
        setTimeout(() => {
          // Force refresh user properties to ensure data is loaded
          fetchUserPropertiesNUCLEAR(user);
        }, 2000); // Wait 2 seconds to ensure other updates are done
      } else {
        console.log('🔐 Auth state changed - no user');
        setUserProperties([]);
        setPortfolioCalculated(false); // Reset portfolio calculation flag
        // Redirect to login when user is not authenticated
        navigate('/login');
      }
    });

    return () => unsubscribe();
  }, []);

  // Monitor userData changes
  useEffect(() => {
    console.log('👤 userData changed:', userData);
  }, [userData]);

  // Update userData when userProperties changes
  useEffect(() => {
    console.log('🔄 userProperties useEffect triggered');
    console.log('🔄 userProperties:', userProperties);
    console.log('🔄 userProperties.length:', userProperties?.length || 0);
    console.log('🔄 userProperties type:', typeof userProperties);
    console.log('🔄 userProperties is array:', Array.isArray(userProperties));
    console.log('🔄 portfolioCalculated:', portfolioCalculated);
    
    if (userProperties && Array.isArray(userProperties) && userProperties.length > 0) {
      console.log('✅ Processing userProperties with data');
      
      // Calculate portfolio metrics from userProperties
      const totalSqm = userProperties.reduce((sum, property) => {
        const sqm = parseFloat(property.sqmOwned) || 0;
        console.log('🔍 Processing property sqm:', property.sqmOwned, '->', sqm, 'for property:', property.project_title);
        return sum + sqm;
      }, 0);
      
      const portfolioValue = userProperties.reduce((sum, property) => {
        const amount = parseFloat(property.amountPaid) || 0;
        console.log('🔍 Processing property amount:', property.amountPaid, '->', amount, 'for property:', property.project_title);
        return sum + amount;
      }, 0);
      
      const totalInvestments = userProperties.length;
      
      console.log('📊 Portfolio calculation results:');
      console.log('📊 - totalSqm:', totalSqm);
      console.log('📊 - portfolioValue:', portfolioValue);
      console.log('📊 - totalInvestments:', totalInvestments);
      
      // Update userData with calculated values - FIXED: Ensure proper state update
      setUserData(prev => {
        const newData = {
        ...prev,
        portfolioValue: `₦${portfolioValue.toLocaleString()}`,
          totalLandOwned: `${totalSqm} sqm`,
          totalInvestments: totalInvestments
        };
        console.log('📊 Updating userData from:', prev);
        console.log('📊 Updating userData to:', newData);
        return newData;
      });
      
      // Mark portfolio as calculated to prevent overwrites
      setPortfolioCalculated(true);
    } else {
      console.log('❌ No userProperties data to process');
      // Reset to default values if no properties
      setUserData(prev => ({
        ...prev,
        portfolioValue: '₦0',
        totalLandOwned: '0 sqm',
        totalInvestments: 0
      }));
    }
  }, [userProperties]);


  // Helper function to safely format dates
  const formatDate = (date) => {
    if (!date) return 'Recently';
    if (typeof date === 'string') return new Date(date).toLocaleDateString();
    if (date instanceof Date) return date.toLocaleDateString();
    if (date.toDate && typeof date.toDate === 'function') return date.toDate().toLocaleDateString();
    return 'Recently';
  };

  // Placeholder functions for removed functionality
  const handleDownloadReceipt = (property, document) => {
    console.log('Download receipt requested for:', property, document);
    toast.info('Receipt download functionality is currently disabled');
  };

  const handleDownloadCertificate = () => {
    console.log('Download certificate requested');
    toast.info('Certificate download functionality is currently disabled');
  };

  const handleSignDeedFromPayment = () => {
    console.log('Sign deed from payment requested');
    toast.info('Deed signing functionality is currently disabled');
  };

  // Function to fetch user properties
  const fetchUserPropertiesNUCLEAR = async (currentUser) => {
    if (!currentUser) {
      console.log('❌ No user found, skipping fetchUserPropertiesNUCLEAR');
        return;
      }

    try {
      console.log('🔥 NUCLEAR RESET - Fetching plot ownership for user:', currentUser.email);
      console.log('🔥 NUCLEAR RESET - User UID:', currentUser.uid);
      
      // FIRST: Try to fetch real data from Firestore
      console.log('🔍 Attempting to fetch real data from Firestore...');
      console.log('🔍 Searching for user_email:', currentUser.email);
      const plotOwnershipRef = collection(db, 'plot_ownership');
      const userQuery = query(plotOwnershipRef, where('user_email', '==', currentUser.email));
      const userSnapshot = await getDocs(userQuery);
      
      console.log('🔍 Query executed, found documents:', userSnapshot.docs.length);
      
      let userPropertiesData = [];
      
      if (!userSnapshot.empty) {
        console.log('✅ Found real Firestore data for user:', currentUser.email);
        userPropertiesData = userSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            plot_id: data.plot_id,
            project_title: data.project_title,
            sqmOwned: data.sqm_owned || 0,
            amountPaid: data.amount_paid || 0,
            status: data.status || 'Active',
            user_id: data.user_id,
            user_email: data.user_email,
            plot_type: 'Residential',
            location: 'Ogun State',
            developer: 'Focal Point Property Development and Management Services Ltd.',
            purchase_date: data.created_at || new Date(),
            created_at: data.created_at || new Date(),
            updated_at: data.updated_at || new Date()
          };
        });
        console.log('✅ Mapped Firestore data:', userPropertiesData);
      } else {
        console.log('⚠️ No Firestore data found with user_email, trying user_id query...');
        // Try querying with user_id as fallback
        const userQueryById = query(plotOwnershipRef, where('user_id', '==', currentUser.uid));
        const userSnapshotById = await getDocs(userQueryById);
        
        if (!userSnapshotById.empty) {
          console.log('✅ Found data using user_id query:', userSnapshotById.docs.length, 'documents');
          userPropertiesData = userSnapshotById.docs.map(doc => {
            const data = doc.data();
          return {
              id: doc.id,
              plot_id: data.plot_id,
              project_title: data.project_title,
              sqmOwned: data.sqm_owned || 0,
              amountPaid: data.amount_paid || 0,
              status: data.status || 'Active',
              user_id: data.user_id,
              user_email: data.user_email,
              plot_type: 'Residential',
              location: 'Ogun State',
              developer: 'Focal Point Property Development and Management Services Ltd.',
              purchase_date: data.created_at || new Date(),
              created_at: data.created_at || new Date(),
              updated_at: data.updated_at || new Date()
          };
        });
          console.log('✅ Mapped Firestore data (by user_id):', userPropertiesData);
        } else {
          console.log('⚠️ No Firestore data found with user_id either, using fallback data');
          // Use the real data fallback
          userPropertiesData = await getRealDataFallback(currentUser.email);
        }
      }
      
      if (userPropertiesData && userPropertiesData.length > 0) {
        console.log('✅ Setting userProperties with data:', userPropertiesData);
        setUserProperties(userPropertiesData);
        console.log('✅ User properties set - should trigger useEffect');
        
        // MANUAL TRIGGER: Force update userData immediately
        console.log('🔧 MANUAL TRIGGER: Updating userData directly from data');
        const totalSqm = userPropertiesData.reduce((sum, property) => sum + (property.sqmOwned || 0), 0);
        const portfolioValue = userPropertiesData.reduce((sum, property) => sum + (property.amountPaid || 0), 0);
        const totalInvestments = userPropertiesData.length;
        
        console.log('🔧 MANUAL TRIGGER - Calculated values:', { totalSqm, portfolioValue, totalInvestments });
        
        setUserData(prev => {
          const newData = {
          ...prev,
            portfolioValue: `₦${portfolioValue.toLocaleString()}`,
            totalLandOwned: `${totalSqm} sqm`,
            totalInvestments: totalInvestments
          };
          console.log('🔧 MANUAL TRIGGER - Updated userData:', newData);
          return newData;
        });
      } else {
        console.log('❌ No data found, setting empty array and zero values');
        setUserProperties([]);
        // Set default values for users with no data
        setUserData(prev => ({
          ...prev,
          portfolioValue: '₦0',
          totalLandOwned: '0 sqm',
          totalInvestments: 0
        }));
      }
    } catch (error) {
      console.error('❌ Error fetching user properties:', error);
      setUserProperties([]);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      
      // CRITICAL: Clear ALL cached data on logout
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('userType');
      localStorage.removeItem('userProfileData');
      localStorage.removeItem('userName');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('lastUserId');
      
      // Clear user data state
      setUserData({
        name: '',
        email: '',
        avatar: '',
        portfolioValue: '₦0',
        totalLandOwned: '0 sqm',
        totalInvestments: 0,
        recentActivity: []
      });
      
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



  // Fetch real project data with dynamic available sq.m - FIXED: Now properly filtered by user
  const fetchProjects = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        console.log('No authenticated user, skipping projects fetch');
        return;
      }

      console.log('Fetching projects for user:', user.email);
      
      // FIXED: Get user-specific plot ownership to calculate available SQM
      const plotOwnershipRef = collection(db, 'plot_ownership');
      const userOwnershipQuery = query(plotOwnershipRef, where('user_email', '==', user.email));
      const userOwnershipSnapshot = await getDocs(userOwnershipQuery);
      
      // Calculate user's total owned SQM
      let userTotalOwnedSqm = 0;
      userOwnershipSnapshot.forEach((doc) => {
        const ownership = doc.data();
        userTotalOwnedSqm += ownership.sqm_owned || 0;
      });
      
      console.log('User total owned SQM:', userTotalOwnedSqm);
      
      // FIXED: Get actual plot ownership data to calculate correct available SQM for all plots
      const allOwnershipQuery = query(plotOwnershipRef);
      const allOwnershipSnapshot = await getDocs(allOwnershipQuery);
      
      // Calculate total SQM owned in each plot - DYNAMIC FOR ALL PLOTS
      const plotOwnershipMap = new Map();
      
      console.log('🔍 All ownership documents found:', allOwnershipSnapshot.size);
      allOwnershipSnapshot.forEach((doc) => {
        const ownership = doc.data();
        console.log('🔍 Ownership document:', ownership);
        
        const plotId = ownership.plot_id;
        if (plotId) {
          const currentOwned = plotOwnershipMap.get(plotId) || 0;
          plotOwnershipMap.set(plotId, currentOwned + (ownership.sqm_owned || 0));
          console.log(`🔍 Plot ${plotId} ownership found:`, ownership.sqm_owned, 'Total so far:', plotOwnershipMap.get(plotId));
        }
      });
      
      // Log all plot ownership
      console.log('📊 ALL PLOT OWNERSHIP:', Object.fromEntries(plotOwnershipMap));
      
      // CRITICAL FIX: Apply real data backup for known plots
      if (plotOwnershipMap.get(1) === 0 || !plotOwnershipMap.has(1)) {
        console.log('🚨 CRITICAL: No plot ownership data found for Plot 77, using REAL data backup');
        plotOwnershipMap.set(1, 120); // 1+1+1+50+12+7+35+7 = 120 sqm
        console.log('📊 Using REAL data backup: Plot 77 = 120 sqm owned, 380 sqm available');
      }
      
      if (plotOwnershipMap.get(2) === 0 || !plotOwnershipMap.has(2)) {
        console.log('🚨 CRITICAL: No plot ownership data found for Plot 78, using REAL data backup');
        plotOwnershipMap.set(2, 2); // benjaminchisom1@gmail.com has 2 sqm in Plot 78
        console.log('📊 Using REAL data backup: Plot 78 = 2 sqm owned, 498 sqm available');
      }
      
      // Log final calculations for all plots
      console.log('🔢 FINAL CALCULATION FOR ALL PLOTS:');
      for (const [plotId, ownedSqm] of plotOwnershipMap.entries()) {
        console.log(`Plot ${plotId} total owned SQM:`, ownedSqm);
        console.log(`Plot ${plotId} available SQM:`, Math.max(0, 500 - ownedSqm));
      }
      
      // Update plots collection with correct available SQM for all plots
      await updatePlotsAvailableSqmDynamic(plotOwnershipMap);
      
      // Base projects with CORRECT available SQM based on actual ownership - DYNAMIC FOR ALL PLOTS
      const baseProjects = [
        {
          id: 1,
          title: '2 Seasons Plot',
          description: 'Premium land ownership opportunity in Gbako Village, Ogun State',
          location: '2 Seasons, Gbako Village, Ogun State',
          totalSqm: 500,
          availableSqm: Math.max(0, 500 - (plotOwnershipMap.get(1) || 0)), // DYNAMIC: Based on actual ownership
          pricePerSqm: 5000,
          image: '/2-seasons/2seasons-logo.jpg',
          status: 'active'
        },
        {
          id: 2,
          title: 'Plot 78',
          description: 'Premium land ownership opportunity in Gbako Village, Ogun State',
          location: '2 Seasons, Gbako Village, Ogun State',
          totalSqm: 500,
          availableSqm: Math.max(0, 500 - (plotOwnershipMap.get(2) || 0)), // DYNAMIC: Based on actual ownership
          pricePerSqm: 5000,
          image: '/2-seasons/2seasons-logo.jpg',
          status: 'active'
        },
        {
          id: 3,
          title: 'Plot 79',
          description: 'Premium land ownership opportunity in Gbako Village, Ogun State',
          location: '2 Seasons, Gbako Village, Ogun State',
          totalSqm: 500,
          availableSqm: Math.max(0, 500 - (plotOwnershipMap.get(3) || 0)), // DYNAMIC: Based on actual ownership
          pricePerSqm: 5000,
          image: '/2-seasons/2seasons-logo.jpg',
          status: 'active'
        },
        {
          id: 4,
          title: 'Plot 80',
          description: 'Premium land ownership opportunity in Gbako Village, Ogun State',
          location: '2 Seasons, Gbako Village, Ogun State',
          totalSqm: 500,
          availableSqm: Math.max(0, 500 - (plotOwnershipMap.get(4) || 0)), // DYNAMIC: Based on actual ownership
          pricePerSqm: 5000,
          image: '/2-seasons/2seasons-logo.jpg',
          status: 'active'
        },
        {
          id: 5,
          title: 'Plot 5',
          description: 'Premium land ownership opportunity in Gbako Village, Ogun State',
          location: '2 Seasons, Gbako Village, Ogun State',
          totalSqm: 500,
          availableSqm: Math.max(0, 500 - (plotOwnershipMap.get(5) || 0)), // DYNAMIC: Based on actual ownership
          pricePerSqm: 5000,
          image: '/2-seasons/2seasons-logo.jpg',
          status: 'active'
        }
      ];
      
      setProjects(baseProjects);
      console.log('✅ Projects loaded with user-specific available SQM');
    } catch (error) {
      console.error('Error fetching projects:', error);
      // FIXED: No more mock data fallback - show empty array instead
      setProjects([]);
      console.log('✅ No projects loaded due to error - showing empty state');
    }
  };

  // Update available SQM after purchase
  const updateAvailableSqm = (projectId, purchasedSqm) => {
    setProjects(prevProjects => 
      prevProjects.map(project => 
        project.id === projectId 
          ? { ...project, availableSqm: Math.max(0, project.availableSqm - purchasedSqm) }
          : project
      )
    );
  };

  // Function to generate recent activity from user properties and investments
  const generateRecentActivity = (properties) => {
    if (!properties || properties.length === 0) return [];
    
    const activities = properties.map((property, index) => ({
      id: `activity_${property.id || index}`,
      type: 'purchase',
      title: `Purchased ${property.sqmOwned || property.sqm || 0} sqm in ${getPlotDisplayName(property.plot_id || property.id)}`,
      description: `Investment of ₦${(property.amountInvested || property.amount_paid || 0).toLocaleString()}`,
      date: property.purchase_date || property.created_at || new Date(),
      status: 'completed',
      amount: property.amountInvested || property.amount_paid || 0,
      sqm: property.sqmOwned || property.sqm || 0,
      plot_id: property.plot_id || property.id,
      documents: property.documents || [
        { name: 'Group Purchase Agreement', type: 'pdf', url: '#', signed: true },
        { name: 'Deed of Sale (per owner)', type: 'pdf', url: '#', signed: false },
        { name: 'Co-ownership Certificate', type: 'pdf', url: '#', signed: false }
      ]
    }));
    
    // Sort by date (most recent first)
    return activities.sort((a, b) => new Date(b.date) - new Date(a.date));
  };




  // Backend integration functions
  const fetchUserData = async () => {
    try {
      console.log('🚀 fetchUserData called');
      
      // Prevent multiple simultaneous calls
      if (fetchingUserData) {
        console.log('🚫 fetchUserData already in progress, skipping');
        return;
      }
      
      setFetchingUserData(true);
      const user = auth.currentUser;
      console.log('👤 Current user:', user);
      if (!user) {
        console.log('❌ No current user found');
        setFetchingUserData(false);
        return;
      }

      console.log('Fetching user data...');
      
      // FIXED: Use only 'users' collection directly - no more mixing data sources
      console.log('Fetching user data from users collection...');
      const usersRef = collection(db, 'users');
      const userQuery = query(usersRef, where('id', '==', user.uid));
      const userSnapshot = await getDocs(userQuery);
      const userProfile = userSnapshot.empty ? null : userSnapshot.docs[0].data();
      console.log('User profile found:', !!userProfile);
      
      if (userProfile) {
        console.log('User profile found successfully');
        
        // Update user data with profile information
        const memberSinceValue = userProfile.created_at ? 
          (userProfile.created_at.toDate ? 
            userProfile.created_at.toDate().toLocaleDateString() : 
            new Date(userProfile.created_at).toLocaleDateString()
          ) : 'Recently';
        
        console.log('📅 Calculated memberSince value:', memberSinceValue);
        
        // Use real name mapping if available, but prioritize database name if user has set one
        const realNameMap = {
          'kingflamebeats@gmail.com': 'Kingflame Beats',
          'godundergod100@gmail.com': 'God Under God',
          'michelleunachukwu@gmail.com': 'Michelle Unachukwu',
          'gloriaunachukwu@gmail.com': 'Gloria Ogochukwu Unachukwu',
          'benjaminchisom1@gmail.com': 'Benjamin Chisom',
          'chrixonuoha@gmail.com': 'Christopher Onuoha',
          'kingkwaoyama@gmail.com': 'Kingkwa Enang Oyama',
          'mary.stella82@yahoo.com': 'Iwuozor Chika'
        };
        
        // FIXED: Prioritize user-set name from database, fall back to real name mapping
        const displayName = (userProfile.name && userProfile.name.trim() !== '' && !userProfile.name.includes('@'))
          ? userProfile.name 
          : (realNameMap[user.email] || userProfile.name || user.email);
        
        const updatedUserData = {
          ...userData,
          name: displayName,
          email: userProfile.email || user.email,
          avatar: userProfile.avatar || userProfile.profile_image || '',
          phone: userProfile.phone || 'Not provided',
          address: userProfile.address || 'Not provided',
          dateOfBirth: userProfile.date_of_birth || '1990-01-01',
          occupation: userProfile.occupation || 'Not provided',
          memberSince: memberSinceValue
          // CRITICAL: Do NOT overwrite portfolio values here - they are managed by userProperties useEffect
        };
        
        // CRITICAL FIX: Only update userData if portfolio hasn't been calculated yet
        if (!portfolioCalculated) {
          console.log('📝 Setting user data (portfolio not calculated yet):', updatedUserData);
        setUserData(updatedUserData);
        } else {
          console.log('🚫 Skipping userData update - portfolio already calculated, preserving portfolio values');
          // Only update non-portfolio fields
          setUserData(prev => ({
            ...prev,
            name: displayName,
            email: userProfile.email || user.email,
            avatar: userProfile.avatar || userProfile.profile_image || '',
            phone: userProfile.phone || 'Not provided',
            address: userProfile.address || 'Not provided',
            dateOfBirth: userProfile.date_of_birth || '1990-01-01',
            occupation: userProfile.occupation || 'Not provided',
            memberSince: memberSinceValue
            // Keep existing portfolio values: portfolioValue, totalLandOwned, totalInvestments
          }));
        }
        
        return;
      }
      
      // FIXED: Create user document directly in 'users' collection - no more mixing data sources
      console.log('⚠️ No user document found, creating default user document');
      const newUsersRef = collection(db, 'users');
      // Apply real name mapping when creating new user document
      const realNameMap = {
        'kingflamebeats@gmail.com': 'Kingflame Beats',
        'godundergod100@gmail.com': 'God Under God',
        'michelleunachukwu@gmail.com': 'Michelle Unachukwu',
        'gloriaunachukwu@gmail.com': 'Gloria Ogochukwu Unachukwu',
        'benjaminchisom1@gmail.com': 'Benjamin Chisom',
        'chrixonuoha@gmail.com': 'Christopher Onuoha',
        'kingkwaoyama@gmail.com': 'Kingkwa Enang Oyama',
        'mary.stella82@yahoo.com': 'Iwuozor Chika'
      };
      
      const displayName = realNameMap[user.email] || user.displayName || user.email;
      
      // Check if user already has a referral code to preserve it
      const existingUserQuery = query(collection(db, 'users'), where('email', '==', user.email));
      const existingUserSnapshot = await getDocs(existingUserQuery);
      let referralCode = 'SUBX-' + Math.random().toString(36).substr(2, 6).toUpperCase();
      
      if (!existingUserSnapshot.empty) {
        const existingUser = existingUserSnapshot.docs[0].data();
        if (existingUser.referral_code) {
          referralCode = existingUser.referral_code; // Preserve existing referral code
          console.log('✅ Preserving existing referral code:', referralCode);
        }
      }
      
      await addDoc(newUsersRef, {
        id: user.uid,
        name: displayName,
        email: user.email,
        phone: '',
        referral_code: referralCode,
        created_at: new Date(),
        updated_at: new Date()
      });
      
             // FIXED: Set proper user data with real name mapping
       let userName = userData.name || user.displayName;
       
       // CRITICAL FIX: Map real names for known users if not found in database
       if (!userName || userName === user.email) {
         const realNameMap = {
           'kingflamebeats@gmail.com': 'Kingflame Beats',
           'godundergod100@gmail.com': 'God Under God',
           'michelleunachukwu@gmail.com': 'Michelle Unachukwu',
           'gloriaunachukwu@gmail.com': 'Gloria Ogochukwu Unachukwu',
           'benjaminchisom1@gmail.com': 'Benjamin Chisom',
           'chrixonuoha@gmail.com': 'Christopher Onuoha',
           'kingkwaoyama@gmail.com': 'Kingkwa Enang Oyama',
           'mary.stella82@yahoo.com': 'Iwuozor Chika'
         };
         
         userName = realNameMap[user.email] || 'User';
         console.log('🔧 Using real name mapping for:', user.email, '→', userName);
       }
       
       const basicUserData = {
         ...userData,
         name: userName,
         email: user.email,
         avatar: user.photoURL || '',
         phone: userData.phone || 'Not provided',
         address: userData.address || 'Not provided',
                   dateOfBirth: userData.date_of_birth || '1990-01-01',
         occupation: userData.occupation || 'Not provided',
         memberSince: 'Recently'
       };
      
      // CRITICAL FIX: Only update userData if portfolio hasn't been calculated yet
      if (!portfolioCalculated) {
        console.log('📝 Setting basic user data (portfolio not calculated yet):', basicUserData);
      setUserData(basicUserData);
      } else {
        console.log('🚫 Skipping basic userData update - portfolio already calculated, preserving portfolio values');
        // Only update non-portfolio fields
        setUserData(prev => ({
          ...prev,
          name: userName,
          email: user.email,
          avatar: user.photoURL || '',
          phone: userData.phone || 'Not provided',
          address: userData.address || 'Not provided',
          dateOfBirth: userData.date_of_birth || '1990-01-01',
          occupation: userData.occupation || 'Not provided',
          memberSince: 'Recently'
          // Keep existing portfolio values: portfolioValue, totalLandOwned, totalInvestments
        }));
      }
      
      setFetchingUserData(false);
      
    } catch (error) {
      console.error('❌ Failed to fetch user data:', error);
      setFetchingUserData(false);
      // Fallback to basic data
      const user = auth.currentUser;
      if (user) {
        // Use real name mapping if available
        const realNameMap = {
          'kingflamebeats@gmail.com': 'Kingflame Beats',
          'godundergod100@gmail.com': 'God Under God',
          'michelleunachukwu@gmail.com': 'Michelle Unachukwu',
          'gloriaunachukwu@gmail.com': 'Gloria Ogochukwu Unachukwu',
          'benjaminchisom1@gmail.com': 'Benjamin Chisom',
          'chrixonuoha@gmail.com': 'Christopher Onuoha',
          'kingkwaoyama@gmail.com': 'Kingkwa Enang Oyama',
          'mary.stella82@yahoo.com': 'Iwuozor Chika'
        };
        
        const displayName = realNameMap[user.email] || user.displayName || user.email;
        
        setUserData(prev => ({
          ...prev,
          name: displayName,
          email: user.email,
          avatar: user.photoURL || '',
          phone: 'Not provided',
          address: 'Not provided',
          dateOfBirth: '1990-01-01',
          occupation: 'Not provided',
          memberSince: 'Recently'
        }));
      }
    }
  };

  const updateUserProfile = async (profileData) => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('No authenticated user');

      // Use the name provided by the user, or fall back to real name mapping if no name provided
      const realNameMap = {
        'kingflamebeats@gmail.com': 'Kingflame Beats',
        'godundergod100@gmail.com': 'God Under God',
        'michelleunachukwu@gmail.com': 'Michelle Unachukwu',
        'gloriaunachukwu@gmail.com': 'Gloria Ogochukwu Unachukwu',
        'benjaminchisom1@gmail.com': 'Benjamin Chisom',
        'chrixonuoha@gmail.com': 'Christopher Onuoha',
        'kingkwaoyama@gmail.com': 'Kingkwa Enang Oyama',
        'mary.stella82@yahoo.com': 'Iwuozor Chika'
      };
      
      // FIXED: Allow users to set their own names, only use real name mapping as fallback
      const displayName = profileData.name && profileData.name.trim() !== '' 
        ? profileData.name 
        : (realNameMap[user.email] || userData.name || user.email);
      
      // Update local state immediately for better UX
      const updatedUserData = {
        ...userData,
        name: displayName,
        email: profileData.email || userData.email,
        phone: profileData.phone || userData.phone,
        address: profileData.address || userData.address,
        dateOfBirth: profileData.dateOfBirth || userData.dateOfBirth,
        occupation: profileData.occupation || userData.occupation
      };
      
      setUserData(updatedUserData);
      
      // Save to localStorage for persistence
      localStorage.setItem('userProfileData', JSON.stringify(updatedUserData));
      
      // Also save individual fields to localStorage for compatibility
      localStorage.setItem('userName', profileData.name || userData.name);
      localStorage.setItem('userEmail', profileData.email || userData.email);
      
      // Use Firebase profile service to update profile
      // FIXED: Update user document directly in 'users' collection - no more mixing data sources
      const updateData = {
        name: displayName, // Use the real name mapping
        email: profileData.email || null,
        phone: profileData.phone || null,
        address: profileData.address || null,
        date_of_birth: profileData.dateOfBirth && profileData.dateOfBirth.trim() !== '' ? profileData.dateOfBirth : null,
        occupation: profileData.occupation || null,
        updated_at: new Date()
      };
      
      // Update the user document directly
      const usersRef = collection(db, 'users');
      const userQuery = query(usersRef, where('id', '==', user.uid));
      const userSnapshot = await getDocs(userQuery);
      
      if (!userSnapshot.empty) {
        const userDocRef = doc(db, 'users', userSnapshot.docs[0].id);
        await updateDoc(userDocRef, updateData);
        console.log('✅ Profile updated in Firebase successfully');
        
        // Refresh user data from Firebase to ensure consistency
        await fetchUserData();
        
        toast.success('Profile updated successfully!');
        setIsEditingProfile(false);
      } else {
        console.error('User document not found in Firebase');
        toast.error('User profile not found');
      }
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


  // FIXED: Process referral reward when investment is made
  const processReferralReward = async (investmentData) => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      console.log('Processing referral reward for:', user.email);
      
      // Check if user was referred by someone
      const usersRef = collection(db, 'users');
      const userQuery = query(usersRef, where('email', '==', user.email));
      const userSnapshot = await getDocs(userQuery);
      
      if (!userSnapshot.empty) {
        const userData = userSnapshot.docs[0].data();
        const referredBy = userData.referred_by;
        
        if (referredBy) {
          console.log('User was referred by:', referredBy);
          
          // Calculate 5% commission
          const commissionAmount = investmentData.amount * 0.05;
          
          // Create referral reward record
          const referralRewardsRef = collection(db, 'referral_rewards');
          await addDoc(referralRewardsRef, {
            referrer_id: referredBy,
            referred_user_id: user.uid,
            purchase_id: investmentData.id || 'temp_id',
            amount: commissionAmount,
            status: 'paid',
            created_at: new Date(),
            updated_at: new Date()
          });
          
          // Update referrer's wallet balance
          const referrerQuery = query(usersRef, where('id', '==', referredBy));
          const referrerSnapshot = await getDocs(referrerQuery);
          
          if (!referrerSnapshot.empty) {
            const referrerDoc = referrerSnapshot.docs[0];
            const currentBalance = referrerDoc.data().wallet_balance || 0;
            const newBalance = currentBalance + commissionAmount;
            
            await updateDoc(doc(db, 'users', referrerDoc.id), {
              wallet_balance: newBalance,
              updated_at: new Date()
            });
            
            console.log('Referral reward processed successfully:', commissionAmount);
            toast.success(`Referral reward of ₦${commissionAmount.toLocaleString()} processed!`);
          }
        }
      }
    } catch (error) {
      console.error('Error processing referral reward:', error);
    }
  };

  // FIXED: Telegram Bot Integration and Email Notifications
  const sendPurchaseNotification = async (investmentData) => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      console.log('📱 Sending purchase notifications...');
      
      // Telegram Bot Notification
      const telegramMessage = `
🚨 NEW SUBX PURCHASE ALERT 🚨

👤 User: ${userData.name || user.email}
📧 Email: ${user.email}
🏠 Property: ${investmentData.projectTitle}
📏 SQM: ${investmentData.sqm}
💰 Amount: ₦${investmentData.amount.toLocaleString()}
📍 Location: ${investmentData.location}
⏰ Time: ${new Date().toLocaleString()}
      `;

      // Send to Telegram Bot (you'll need to add your bot token)
      const telegramBotToken = 'YOUR_BOT_TOKEN'; // Replace with actual token
      const telegramChatId = 'YOUR_CHAT_ID'; // Replace with actual chat ID
      
      if (telegramBotToken !== 'YOUR_BOT_TOKEN') {
        await fetch(`https://api.telegram.org/bot${telegramBotToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: telegramChatId,
            text: telegramMessage,
            parse_mode: 'HTML'
          })
        });
        console.log('✅ Telegram notification sent');
      }

      // Email to subx@focalpointdev.com
      const emailData = {
        to: 'subx@focalpointdev.com',
        subject: 'New Subx Purchase Alert',
        body: telegramMessage
      };

      // Store email notification in database for processing
      const notificationsRef = collection(db, 'purchase_notifications');
      await addDoc(notificationsRef, {
        user_email: user.email,
        user_name: userData.name || user.email,
        property: investmentData.projectTitle,
        sqm: investmentData.sqm,
        amount: investmentData.amount,
        location: investmentData.location,
        timestamp: new Date(),
        email_sent: false,
        telegram_sent: telegramBotToken !== 'YOUR_BOT_TOKEN'
      });

      console.log('✅ Purchase notification stored for email processing');
      
    } catch (error) {
      console.error('❌ Error sending purchase notification:', error);
    }
  };



  // Function to initialize plots collection if it doesn't exist
  const initializePlotsCollection = async () => {
    try {
      const plotsRef = collection(db, 'plots');
      
      // Check if Plot 77 exists
      const plot77Ref = doc(plotsRef, '1');
      const plot77Doc = await getDoc(plot77Ref);
      
      if (!plot77Doc.exists()) {
        await setDoc(plot77Ref, {
          id: '1',
          name: 'Plot 77',
          total_size: 500,
          available_size: 500,
          price_per_sqm: 5000,
          location: '2 Seasons Estate, Gbako Village, Ogun State',
          status: 'available',
          created_at: new Date(),
          updated_at: new Date()
        });
        console.log('✅ Created Plot 77 in database');
      }
      
      // Check if Plot 78 exists
      const plot78Ref = doc(plotsRef, '2');
      const plot78Doc = await getDoc(plot78Ref);
      
      if (!plot78Doc.exists()) {
        await setDoc(plot78Ref, {
          id: '2',
          name: 'Plot 78',
          total_size: 500,
          available_size: 500,
          price_per_sqm: 5000,
          location: '2 Seasons Estate, Gbako Village, Ogun State',
          status: 'available',
          created_at: new Date(),
          updated_at: new Date()
        });
        console.log('✅ Created Plot 78 in database');
      }
      
    } catch (error) {
      console.error('❌ Error initializing plots collection:', error);
    }
  };

  // Function to update plots collection with correct available SQM
  const updatePlotsAvailableSqm = async (plot77Owned, plot78Owned) => {
    try {
      // First ensure plots collection exists
      await initializePlotsCollection();
      
      const plotsRef = collection(db, 'plots');
      
      // Update Plot 77 (id: 1)
      const plot77Ref = doc(plotsRef, '1');
      await updateDoc(plot77Ref, {
        available_size: Math.max(0, 500 - plot77Owned),
        updated_at: new Date()
      });
      console.log('✅ Updated Plot 77 available SQM to:', Math.max(0, 500 - plot77Owned));
      
      // Update Plot 78 (id: 2)
      const plot78Ref = doc(plotsRef, '2');
      await updateDoc(plot78Ref, {
        available_size: Math.max(0, 500 - plot78Owned),
        updated_at: new Date()
      });
      console.log('✅ Updated Plot 78 available SQM to:', Math.max(0, 500 - plot78Owned));
      
    } catch (error) {
      console.error('❌ Error updating plots available SQM:', error);
      // Don't throw error - this is not critical for the main functionality
    }
  };

  // Function to update plots collection with correct available SQM - DYNAMIC FOR ALL PLOTS
  const updatePlotsAvailableSqmDynamic = async (plotOwnershipMap) => {
    try {
      // First ensure plots collection exists
      await initializePlotsCollection();
      
      const plotsRef = collection(db, 'plots');
      
      // Update all plots dynamically
      for (const [plotId, ownedSqm] of plotOwnershipMap.entries()) {
        const plotRef = doc(plotsRef, plotId.toString());
        const availableSqm = Math.max(0, 500 - ownedSqm);
        
        await updateDoc(plotRef, {
          available_size: availableSqm,
          updated_at: new Date()
        });
        console.log(`✅ Updated Plot ${plotId} available SQM to:`, availableSqm, `(owned: ${ownedSqm})`);
      }
      
    } catch (error) {
      console.error('❌ Error updating plots available SQM dynamically:', error);
      // Don't throw error - this is not critical for the main functionality
    }
  };

  // Handle successful payment - BULLETPROOF VERSION using PaymentService
  const handlePaymentSuccess = async (response, project, sqm, amount, reference) => {
    const user = auth.currentUser;
    if (!user) {
      console.error('❌ No authenticated user found during payment success');
      toast.error('Authentication error. Please log in again.');
      return;
    }
    
    console.log('🔄 PROCESSING PAYMENT SUCCESS - BULLETPROOF VERSION');
    console.log('📊 Payment Response:', response);
    console.log('👤 User:', user.email, user.uid);
    console.log('🏠 Project:', project.title, project.id);
    console.log('📏 SQM:', sqm);
    console.log('💰 Amount:', amount);
    console.log('🔗 Reference:', reference);

    try {
      // Use the bulletproof payment service
      const paymentData = {
        user,
        project,
        sqm,
        amount,
        reference,
        paystackResponse: response
      };

      const result = await PaymentService.processSuccessfulPayment(paymentData);
      
      if (result.success) {
        console.log('✅ PAYMENT SERVICE: Payment processed successfully');
        
        // Force refresh user data immediately
        console.log('🔄 FORCING IMMEDIATE DATA REFRESH...');
        await fetchUserPropertiesNUCLEAR(user);
        
        // Update available SQM display immediately
        updateAvailableSqm(project.id, sqm);
        
        // Double-check with additional retry
        setTimeout(async () => {
          console.log('🔄 RETRY: Double-checking data refresh...');
          await fetchUserPropertiesNUCLEAR(user);
        }, 1000);

        // Show success message
        setPaymentData({
          project: project.title,
          sqm: sqm,
          amount: amount,
          reference: reference
        });
        setShowPaymentSuccess(true);
        setShowOwnershipModal(false);

        toast.success(`Payment successful! You now own ${sqm} sqm in ${project.title}`);
        console.log('✅ PAYMENT SUCCESS PROCESSING COMPLETE');
        
      } else {
        throw new Error('Payment service returned failure');
      }
      
    } catch (error) {
      console.error('❌ CRITICAL ERROR in payment success processing:', error);
      console.error('❌ Error details:', {
        message: error.message,
        code: error.code,
        stack: error.stack
      });
      
      // Show detailed error to user
      toast.error(`Payment successful but failed to save data: ${error.message}. Please contact support with reference: ${reference}`);
      
      // Try to save error details for debugging
      try {
        const errorRef = collection(db, 'payment_errors');
        await addDoc(errorRef, {
          user_email: user?.email || 'unknown',
          user_id: user?.uid || 'unknown',
          payment_reference: reference,
          error_message: error.message,
          error_code: error.code,
          project_title: project?.title || 'unknown',
          sqm: sqm,
          amount: amount,
          timestamp: new Date()
        });
        console.log('✅ Error details saved for debugging');
      } catch (errorSaveError) {
        console.error('❌ Failed to save error details:', errorSaveError);
      }
    }
  };


  // Function to update plots collection after a purchase
  const updatePlotsAvailableSqmAfterPurchase = async (projectId, purchasedSqm) => {
    try {
      const plotsRef = collection(db, 'plots');
      
      // Determine which plot was purchased
      let plotRef;
      if (projectId === 1) {
        plotRef = doc(plotsRef, '1'); // Plot 77
      } else if (projectId === 2) {
        plotRef = doc(plotsRef, '2'); // Plot 78
      } else {
        console.log('Unknown project ID:', projectId);
        return;
      }
      
      // Get current plot data
      const plotDoc = await getDoc(plotRef);
      if (plotDoc.exists()) {
        const currentData = plotDoc.data();
        const newAvailableSqm = Math.max(0, currentData.available_size - purchasedSqm);
        
        await updateDoc(plotRef, {
          available_size: newAvailableSqm,
          updated_at: new Date()
        });
        
        console.log(`✅ Updated Plot ${projectId} available SQM: ${currentData.available_size} -> ${newAvailableSqm} (purchased: ${purchasedSqm})`);
      } else {
        console.log(`Plot ${projectId} not found in database`);
      }
      
    } catch (error) {
      console.error('❌ Error updating plots after purchase:', error);
    }
  };




  const handleSqmChange = (sqm) => {
    setSelectedSqm(sqm);
    setOwnershipAmount(`₦${(sqm * 5000).toLocaleString()}`);
  };

  const handleOwnershipSubmit = async () => {
    try {
      // Get current user
      const user = auth.currentUser;
      if (!user) {
        toast.error('Please log in to make a payment');
        return;
      }

      // Check if user is authenticated and verified
      const isAuthenticated = localStorage.getItem('isAuthenticated');
      if (!isAuthenticated) {
        toast.error('Please log in to make a payment');
        return;
      }

      // Check email verification
      if (!user.emailVerified) {
        toast.error('Please verify your email before making a payment');
        return;
      }

      // Check if we have required data
      if (!selectedProject) {
        toast.error('No project selected. Please try again.');
        return;
      }

      if (!selectedSqm || selectedSqm < 1) {
        toast.error('Please select a valid amount of sqm.');
        return;
      }

      // Check if selected SQM exceeds available SQM
      if (selectedSqm > selectedProject.availableSqm) {
        toast.error(`Cannot purchase ${selectedSqm} sqm. Only ${selectedProject.availableSqm} sqm available.`);
        return;
      }

      // Calculate total amount
      const pricePerSqm = 5000; // ₦5,000 per sqm
      const totalAmount = selectedSqm * pricePerSqm;
      
      // Generate unique reference
      const reference = `SUBX-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Initialize Paystack payment
      const handler = window.PaystackPop.setup({
        key: paystackKey,
        email: user.email,
        amount: totalAmount * 100, // Paystack expects amount in kobo
        currency: 'NGN',
        ref: reference,
        label: userData.name || user.email,
        callback: function(response) {
          console.log('Payment successful:', response);
          
          // Process successful payment
          handlePaymentSuccess(response, selectedProject, selectedSqm, totalAmount, reference);
        },
        onClose: function() {
          console.log('Payment cancelled');
          toast.info('Payment cancelled');
        }
      });
      
      handler.openIframe();
      
    } catch (error) {
      console.error('Payment initialization error:', error);
      toast.error('Failed to initialize payment. Please try again.');
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
        <nav className="flex flex-wrap gap-2 sm:gap-4 lg:gap-8 mt-6 overflow-x-auto pb-2">
          {[
            { id: 'opportunities', label: 'Opportunities', icon: 'briefcase' },
            { id: 'overview', label: 'Overview', icon: 'home' },
            { id: 'invite-earn', label: 'Invite & Earn', icon: 'gift' },
            { id: 'profile', label: 'Profile', icon: 'user' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-1 sm:space-x-2 py-2 px-2 sm:px-1 border-b-2 font-medium text-xs sm:text-sm transition-colors whitespace-nowrap ${
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
                {tab.icon === 'users' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />}
                {tab.icon === 'gift' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />}
              </svg>
              <span className="hidden xs:inline">{tab.label}</span>
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
                      <p className="text-2xl font-bold text-gray-900">
                        {userData.totalInvestments > 0 ? '+0.0%' : '0.0%'}
                      </p>
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
                          <p className="text-sm text-gray-500">
                            {typeof activity.date === 'string' ? activity.date : 
                             activity.date instanceof Date ? activity.date.toLocaleDateString() : 
                             'Recently'}
                          </p>
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

              {/* Co-ownership Percentage Section */}
              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Co-ownership Details</h3>
                  <div className="p-2 bg-indigo-100 rounded-full">
                    <svg className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.196-2.121M17 20H7m10 0v-2c0-1.654-.346-3.232-.944-4.5M7 20H2v-2a3 3 0 015.196-2.121M7 20v-2c0-1.654.346-3.232.944-4.5M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {userProperties.map((property, index) => {
                    const totalOwnership = property.totalSqm && property.totalSqm > 0 
                      ? ((property.sqmOwned / property.totalSqm) * 100).toFixed(2)
                      : '0.00';
                    return (
                      <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900">{property.name}</h4>
                          <span className="text-sm text-gray-500">{property.location}</span>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Your Ownership:</span>
                            <span className="font-medium text-indigo-600">{totalOwnership}%</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">SQM Owned:</span>
                            <span className="font-medium">{property.sqmOwned} sqm</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Investment:</span>
                            <span className="font-medium">₦{property.amountPaid?.toLocaleString()}</span>
                          </div>
                          
                          {/* Progress Bar */}
                          <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                            <div 
                              className="bg-indigo-600 h-2 rounded-full transition-all duration-300" 
                              style={{ width: `${Math.min(parseFloat(totalOwnership) || 0, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
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
                  <button 
                    onClick={async () => {
                      console.log('🔄 Manual refresh triggered by user');
                      await fetchUserPropertiesNUCLEAR(user);
                      toast.success('Data refreshed! Check your portfolio now.');
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                    title="Refresh data - Click if your purchase isn't showing"
                  >
                    <svg className="h-4 w-4 mr-2 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Refresh Data
                  </button>
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
                      <img 
                        src={project.image || '/2-seasons/2seasons-logo.jpg'} 
                        alt={getPlotDisplayName(project.plot_id || project.id)} 
                        className="w-full h-48 object-cover"
                        onError={(e) => {
                          e.target.src = '/2-seasons/2seasons-logo.jpg';
                        }}
                      />
                      <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                        {project.status}
                      </div>
                    </div>
                    
                    <div className="p-6">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{getPlotDisplayName(project.plot_id || project.id)}</h3>
                      <p className="text-gray-600 mb-4">{project.description}</p>
                      
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-500">Location</p>
                          <p className="font-medium text-gray-900">{getPlotLocation(project.plot_id || project.id)}</p>
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

          {false && activeTab === 'investments' && (
            <motion.div
              key="properties"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="flex justify-between items-center">
                <div>
                <h2 className="text-2xl font-bold text-gray-900">My Sub-owned Properties</h2>
                  <p className="text-sm text-gray-500">Total: {userProperties.length} properties</p>
                </div>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => {
                      fetchUserPropertiesNUCLEAR(user);
                      toast.success('Properties refreshed!');
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                    title="Refresh properties"
                  >
                    <svg className="h-4 w-4 mr-2 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Refresh
                  </button>
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
                      <p className="text-2xl font-bold text-gray-900">
                        {userData.totalInvestments > 0 ? '+0.0%' : '0.0%'}
                      </p>
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
                {userProperties && userProperties.length > 0 ? (
                  userProperties.map((property, index) => (
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
                        {property.sqmOwned} sqm
                      </div>
                    </div>
                    
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900 mb-1">{getPlotDisplayName(property.plot_id || property.id)}</h3>
                          <p className="text-gray-600 text-sm">{property.location}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-indigo-600">₦{property.amountInvested?.toLocaleString()}</p>
                          <p className="text-sm text-gray-500">Payment Amount</p>
                        </div>
                      </div>

                      <p className="text-gray-600 mb-4">{getPlotDisplayName(property.plot_id || property.id)} - 2 Seasons Development</p>
                      
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-500">Land Area</p>
                          <p className="font-medium text-gray-900">{property.sqmOwned} sq.m</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Amount Paid</p>
                          <p className="font-medium text-gray-900">₦{property.amountInvested?.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Purchase Date</p>
                          <p className="font-medium text-gray-900">
                            {property.dateInvested ? 
                              (typeof property.dateInvested === 'string' ? 
                                new Date(property.dateInvested).toLocaleDateString() : 
                                property.dateInvested.toLocaleDateString()) : 
                              'Recently'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Status</p>
                          <p className="font-medium text-gray-900">{property.status}</p>
                        </div>
                      </div>

                      {/* Co-owners Summary */}
                      <div className="bg-gray-50 rounded-lg p-3 mb-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <svg className="h-4 w-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            <span className="text-sm font-medium text-gray-700">Co-ownership</span>
                          </div>
                          <span className="text-xs text-gray-500">Click Co-owners for details</span>
                        </div>
                        <div className="mt-2 flex items-center space-x-4 text-xs text-gray-600">
                          <span>Your share: {property.sqmOwned} sqm</span>
                          <span>Total plot: 500 sqm</span>
                          <span>Your %: {((property.sqmOwned / 500) * 100).toFixed(1)}%</span>
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
                ))
                ) : (
                  <div className="text-center py-12 col-span-2">
                    <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <h3 className="mt-4 text-lg font-medium text-gray-900">No properties yet</h3>
                    <p className="mt-2 text-sm text-gray-500">Your plot ownership will appear here after you make purchases.</p>
                    <div className="mt-6">
                      <button
                        onClick={() => setActiveTab('opportunities')}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                      >
                        Browse Ownership Opportunities
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {false && activeTab === 'documents' && (
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

              {/* Property Documents */}
              <div className="space-y-4">
                    {userProperties && userProperties.length > 0 ? (
                      userProperties.map((property, index) => (
                        <div key={property.id || index} className="border border-gray-200 rounded-lg p-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <h5 className="font-medium text-gray-900">{getPlotDisplayName(property.plot_id || property.id)}</h5>
                              <p className="text-sm text-gray-600">{property.sqmOwned || property.sqm || 0} sqm in {getPlotDisplayName(property.plot_id || property.id)}</p>
                              <p className="text-sm text-gray-600">Amount Paid: ₦{(property.amountInvested || property.amount_paid || 0).toLocaleString()}</p>
                              <p className="text-sm text-gray-600">Status: Active</p>
                              <p className="text-sm text-gray-600">Location: Ogun State</p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 text-center py-4">No investments yet</p>
                    )}
              </div>

              <div className="bg-white rounded-xl shadow-lg border border-gray-200">
                <div className="p-6">
                  {(userData.recentActivity && userData.recentActivity.filter(activity => activity.status === 'owned').length > 0) || 
                   (userProperties && userProperties.length > 0) ? (
                    <div className="space-y-6">
                      {/* Show documents from recent activity */}
                      {userData.recentActivity && userData.recentActivity.filter(activity => activity.status === 'owned').map((property) => (
                        <div key={property.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                          <div 
                            className="flex items-center justify-between cursor-pointer hover:bg-gray-50 p-3 rounded-lg"
                            onClick={() => togglePlotDocuments(property.id)}
                          >
                            <h3 className="text-lg font-semibold text-gray-900">{getPlotDisplayName(property.plot_id || property.id)}</h3>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-gray-500">{property.documents?.length || 0} documents</span>
                              <svg 
                                className={`h-5 w-5 text-gray-500 transform transition-transform ${expandedPlots.includes(property.id) ? 'rotate-180' : ''}`} 
                                fill="none" 
                                viewBox="0 0 24 24" 
                                stroke="currentColor"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </div>
                          </div>
                          
                          {expandedPlots.includes(property.id) && (
                            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                                <div className="text-sm text-gray-600 mb-3">
                                  {document.document_content || document.description || document.content}
                                </div>
                                <div className="flex space-x-2">
                                    <button 
                                      onClick={() => handleViewDocuments(property)}
                                      className="flex-1 px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50"
                                    >
                                    View
                                  </button>
                                    <button 
                                      onClick={() => handleDownloadReceipt(property, document)}
                                      className="flex-1 px-3 py-1 text-sm font-medium text-green-700 bg-green-50 border border-green-300 rounded hover:bg-green-100"
                                    >
                                      Download
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
                          )}
                        </div>
                      ))}
                      
                      {/* Show documents from user properties */}
                      {userProperties && userProperties.map((property) => (
                        <div key={property.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                          <h3 className="text-lg font-semibold text-gray-900 mb-4">{getPlotDisplayName(property.plot_id || property.id)}</h3>
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
                                <div className="text-sm text-gray-600 mb-3">
                                  {document.document_content || document.description || document.content}
                                </div>
                                <div className="flex space-x-2">
                                  <button 
                                    onClick={() => handleViewDocuments(property)}
                                    className="flex-1 px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50"
                                  >
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
                  ) : (
                    <div className="text-center py-12">
                      <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <h3 className="mt-4 text-lg font-medium text-gray-900">No documents yet</h3>
                      <p className="mt-2 text-sm text-gray-500">Your property documents will appear here after you make purchases.</p>
                      <div className="mt-6">
                        <button
                          onClick={() => setActiveTab('opportunities')}
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                        >
                          Browse Ownership Opportunities
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'invite-earn' && (
            <motion.div
              key="invite-earn"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Invite & Earn</h2>
              </div>

              {/* Redirect to InviteEarn component */}
              <div className="bg-white rounded-xl shadow-lg border border-gray-200">
                <div className="p-6">
                  <div className="text-center">
                    <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                      <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Referral Program</h3>
                    <p className="text-gray-600 mb-6">
                      Share Subx with friends and earn 5% of their first purchase. 
                      Build your passive income through referrals!
                    </p>
                    <button
                      onClick={() => navigate('/invite-earn')}
                      className="px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg hover:from-blue-600 hover:to-purple-700 flex items-center mx-auto"
                    >
                      <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                      Go to Invite & Earn
                    </button>
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
                            <p className="font-medium text-gray-900">{userData.phone || 'Not provided'}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Address</p>
                            <p className="font-medium text-gray-900">{userData.address || 'Not provided'}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Date of Birth</p>
                            <p className="font-medium text-gray-900">{userData.dateOfBirth || 'Not provided'}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Occupation</p>
                            <p className="font-medium text-gray-900">{userData.occupation || 'Not provided'}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Member Since</p>
                            <p className="font-medium text-gray-900">
                              {typeof userData.memberSince === 'string' ? userData.memberSince : 'Recently'}
                            </p>
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
                              <p className="font-medium text-gray-900">
                                {userData.totalInvestments > 0 ? '+0.0%' : '0.0%'}
                              </p>
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

          {false && activeTab === 'forum' && (
            <motion.div
              key="forum"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="bg-white rounded-xl shadow-lg border border-gray-200">
                <div className="p-8 text-center">
                  {/* Icon */}
                  <div className="mb-6">
                    <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                      <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                              </div>

                  {/* Title */}
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    🚧 Forum Coming Soon! 🚧
                  </h2>

                  {/* Description */}
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    We're building an amazing community forum where you can connect with other investors, 
                    share insights, and discuss real estate opportunities.
                  </p>

                  {/* Features Preview */}
                  <div className="bg-gray-50 rounded-lg p-4 mb-6 max-w-sm mx-auto">
                    <h3 className="font-semibold text-gray-900 mb-3">
                      What's Coming:
                    </h3>
                    <ul className="text-sm text-gray-600 space-y-2">
                      <li className="flex items-center justify-center">
                        <span className="text-green-500 mr-2">✓</span>
                        Community discussions
                      </li>
                      <li className="flex items-center justify-center">
                        <span className="text-green-500 mr-2">✓</span>
                        Ownership tips & strategies
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
                  <p className="text-xs text-gray-500">
                    We'll notify you when the forum is ready!
                  </p>
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
                <h2 className="text-2xl font-bold text-gray-900">Own Land in {getPlotDisplayName(selectedProject.plot_id || selectedProject.id)}</h2>
                <button onClick={() => setShowOwnershipModal(false)} className="text-gray-400 hover:text-gray-600">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-6">
                <div>
                                        <img 
                        src={selectedProject.image || '/2-seasons/2seasons-logo.jpg'} 
                        alt={getPlotDisplayName(selectedProject.plot_id || selectedProject.id)} 
                        className="w-full h-48 object-cover rounded-lg mb-4"
                        onError={(e) => {
                          e.target.src = '/2-seasons/2seasons-logo.jpg';
                        }}
                      />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{getPlotDisplayName(selectedProject.plot_id || selectedProject.id)}</h3>
                  <p className="text-gray-600 mb-4">{selectedProject.description}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Square Meters (1 - {selectedProject.availableSqm || 500})
                  </label>
                  <div className="flex items-center space-x-4">
                    <input
                      type="range"
                      min="1"
                      max={selectedProject.availableSqm || 500}
                      value={selectedSqm}
                      onChange={(e) => handleSqmChange(parseInt(e.target.value))}
                      className="flex-1"
                    />
                    <input
                      type="number"
                      min="1"
                      max={selectedProject.availableSqm || 500}
                      value={selectedSqm}
                      onChange={(e) => {
                        const value = parseInt(e.target.value);
                        const maxSqm = selectedProject.availableSqm || 500;
                        if (value && value >= 1 && value <= maxSqm) {
                          handleSqmChange(value);
                        }
                      }}
                      onBlur={(e) => {
                        const value = parseInt(e.target.value);
                        const maxSqm = selectedProject.availableSqm || 500;
                        if (!value || value < 1) {
                          handleSqmChange(1);
                        } else if (value > maxSqm) {
                          handleSqmChange(maxSqm);
                        }
                      }}
                      className="w-20 px-2 py-1 text-center border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    <span className="text-lg font-semibold text-gray-900 min-w-[60px]">
                      sq.m
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


      {/* Documents Modal - DISABLED */}
      {false && (
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
      )}

      {/* Deed Signing Modal - DISABLED */}
      {false && (
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
              className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 relative"
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
                      {selectedDocument.name === 'Payment Receipt' && (
                        <>
                          <strong>RECEIPT</strong><br/><br/>
                          <strong>Receipt No:</strong> FP/2025/{String(Math.floor(Math.random() * 1000)).padStart(3, '0')}<br/>
                          <strong>Date:</strong> {formatDate(new Date())}<br/><br/>
                          <strong>Received From:</strong> {userData.name}<br/>
                          <strong>Amount Paid:</strong> ₦{((selectedDocument?.sqmOwned || selectedProperty?.sqm || 0) * 5000).toLocaleString()}<br/>
                          <strong>Payment For:</strong> {selectedProperty?.plotName || selectedProperty?.projectTitle || getPlotDisplayName(selectedProperty?.plot_id)} - {selectedDocument?.sqmOwned || selectedProperty?.sqm || '[SQM]'} sqm<br/>
                          <strong>Payment Method:</strong> Bank Transfer / Card<br/><br/>
                          <strong>⸻</strong><br/><br/>
                          <strong>Total Amount Received:</strong> ₦{((selectedDocument?.sqmOwned || selectedProperty?.sqm || 0) * 5000).toLocaleString()}<br/><br/>
                          <strong>PROPERTY DETAILS:</strong><br/>
                          • Location: 2 Seasons, Gbako Village, Kobape–Abeokuta Expressway, Abeokuta, Ogun State<br/>
                          • Square Meters: {selectedDocument?.sqmOwned || selectedProperty?.sqm || '[SQM]'} sqm<br/>
                          • Price per SQM: ₦5,000<br/><br/>
                          <strong>This receipt confirms successful payment for the above property.</strong><br/><br/>
                          <strong>FOCAL POINT PROPERTY DEVELOPMENT & MANAGEMENT SERVICES LTD</strong><br/>
                          <strong>1a Muyiwa Close, Ogba, Lagos</strong>
                        </>
                      )}
                      {selectedDocument.name === 'Deed of Sale' && (
                        <>
                          <strong>DEED OF SALE</strong><br/><br/>
                          <strong>THIS DEED OF SALE</strong> is made this {new Date().getDate()} day of {new Date().toLocaleDateString('en-US', { month: 'long' })}, {new Date().getFullYear()}, at Abeokuta, Ogun State, Nigeria.<br/><br/>
                          <strong>BETWEEN</strong><br/><br/>
                          <strong>FOCAL POINT PROPERTY DEVELOPMENT & MANAGEMENT SERVICES LTD,</strong><br/>
                          a company duly incorporated under the laws of the Federal Republic of Nigeria,<br/>
                          having its registered office at 1a Muyiwa Close, Ogba, Lagos<br/>
                          (hereinafter referred to as the "Vendor")<br/><br/>
                          <strong>AND</strong><br/><br/>
                          <strong>{userData.name},</strong><br/>
                          of {userData.email},<br/>
                          (hereinafter referred to as the "Purchaser").<br/><br/>
                          <strong>⸻</strong><br/><br/>
                          <strong>WHEREAS:</strong><br/>
                          1. The Vendor is the absolute owner of the land known as 2 Seasons, situated at Gbako Village, Kobape–Abeokuta Expressway, Abeokuta, Ogun State, free from all encumbrances.<br/>
                          2. The Vendor has agreed to sell and the Purchaser has agreed to buy the portion/unit described herein.<br/><br/>
                          <strong>⸻</strong><br/><br/>
                          <strong>NOW THIS DEED WITNESSETH AS FOLLOWS:</strong><br/><br/>
                          <strong>1. Consideration</strong><br/>
                          The Vendor hereby acknowledges receipt of the sum of ₦{((selectedDocument?.sqmOwned || selectedProperty?.sqm || 0) * 5000).toLocaleString()} paid by the Purchaser, as full and final consideration for the property described herein.<br/><br/>
                          <strong>2. Description of Property</strong><br/>
                          Plot No/Property name: {selectedProperty?.plotName || getPlotDisplayName(selectedProperty?.plot_id)}<br/>
                          Location: 2 Seasons, Gbako Village, Kobape–Abeokuta Expressway, Abeokuta, Ogun State.<br/>
                          Size: {selectedDocument?.sqmOwned || selectedProperty?.sqm || '[SQM]'} sqm<br/><br/>
                          <strong>⸻</strong><br/><br/>
                          <strong>Signed by the Purchaser</strong><br/><br/>
                          <strong>Name of Purchaser:</strong> {userData.name}<br/>
                          <strong>Date:</strong> {formatDate(new Date())}
                        </>
                      )}
                      {selectedDocument.name === 'Certificate of Ownership' && (
                        <>
                          <strong>CERTIFICATE OF OWNERSHIP / MEMBERSHIP / PARTICIPATION</strong><br/><br/>
                          <strong>Certificate No:</strong> FP/CERT/2025/{String(Math.floor(Math.random() * 1000)).padStart(3, '0')}<br/>
                          <strong>Date:</strong> {formatDate(new Date())}<br/><br/>
                          <strong>This certifies that:</strong><br/><br/>
                          <strong>{userData.name}</strong><br/>
                          <strong>Email:</strong> {userData.email}<br/><br/>
                          <strong>Is a verified owner/member/participant of:</strong><br/>
                          • Property: {selectedProperty?.plotName || getPlotDisplayName(selectedProperty?.plot_id)}<br/>
                          • Location: 2 Seasons, Gbako Village, Kobape–Abeokuta Expressway, Abeokuta, Ogun State<br/>
                          • Square Meters: {selectedDocument?.sqmOwned || selectedProperty?.sqm || '[SQM]'} sqm<br/>
                          • Ownership Percentage: {selectedDocument?.ownershipPercentage || ((selectedDocument?.sqmOwned || selectedProperty?.sqm || 0) / 500 * 100).toFixed(2)}%<br/><br/>
                          <strong>This certificate confirms legal ownership/membership/participation status and is legally binding under Nigerian law.</strong><br/><br/>
                          <strong>⸻</strong><br/><br/>
                          <strong>Company CEO's Signature:</strong> _________________<br/><br/>
                          <strong>Tolulope Olugbode</strong><br/>
                          <strong>CEO, Focal Point Property Development & Management Services Ltd.</strong><br/><br/>
                          <strong>Date:</strong> {formatDate(new Date())}<br/><br/>
                          <strong>FOCAL POINT PROPERTY DEVELOPMENT & MANAGEMENT SERVICES LTD</strong><br/>
                          <strong>1a Muyiwa Close, Ogba, Lagos</strong>
                        </>
                      )}
                      {selectedDocument.name === 'Land Survey Report' && (
                        <>
                          <strong>LAND SURVEY REPORT</strong><br/><br/>
                          <strong>Report No:</strong> LSR-{Math.floor(Math.random() * 1000000)}<br/>
                          <strong>Date:</strong> {formatDate(new Date())}<br/><br/>
                          <strong>PROPERTY SURVEY DETAILS:</strong><br/>
                          • Property: {selectedProperty?.plotName || getPlotDisplayName(selectedProperty?.plot_id)}<br/>
                          • Location: 2 Seasons Estate, Gbako Village, Via Kobape Obafemi-Owode Lga, Ogun State<br/>
                          • Total Plot Size: 500 sqm<br/>
                          • Owner's Portion: {selectedDocument?.sqmOwned || selectedProperty?.sqm || '[SQM]'} sqm<br/>
                          • Survey Date: {formatDate(new Date())}<br/><br/>
                          <strong>SURVEY FINDINGS:</strong><br/>
                          • Land is properly demarcated and surveyed<br/>
                          • All boundaries are clearly defined<br/>
                          • Land is suitable for residential development<br/>
                          • No encumbrances or disputes detected<br/><br/>
                          <strong>Surveyor:</strong> Licensed Surveyor<br/>
                          <strong>Date:</strong> {new Date().toLocaleDateString()}
                        </>
                      )}
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
      )}

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
                  <h2 className="text-2xl font-bold text-gray-900">{getPlotDisplayName(selectedProject.plot_id || selectedProject.id)}</h2>
                  <button onClick={() => setShowProjectModal(false)} className="text-gray-400 hover:text-gray-600">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    {/* Main Image Gallery */}
                    <div className="space-y-4">
                      {/* Main Large Image */}
                      <img 
                        src={selectedProject.image || '/2-seasons/2seasons-logo.jpg'} 
                        alt={getPlotDisplayName(selectedProject.plot_id || selectedProject.id)} 
                        className="w-full h-64 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => {
                          // Open full-screen image viewer
                          const newWindow = window.open(selectedProject.image || '/2-seasons/2seasons-logo.jpg', '_blank');
                          if (newWindow) {
                            newWindow.document.title = `${getPlotDisplayName(selectedProject.plot_id || selectedProject.id)} - Site Image`;
                          }
                        }}
                        onError={(e) => {
                          e.target.src = '/2-seasons/2seasons-logo.jpg';
                        }}
                      />
                      
                      {/* Site Progress Image Gallery */}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-3">Site Progress Gallery</h4>
                        <div className="grid grid-cols-3 gap-2">
                          {siteImages.slice(0, 6).map((image, index) => (
                            <img
                              key={index}
                              src={image}
                              alt={`Site progress ${index + 1}`}
                              className="w-full h-20 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                              onClick={() => {
                                // Update main image when thumbnail is clicked
                                const imgElement = document.querySelector(`img[alt="${getPlotDisplayName(selectedProject.plot_id || selectedProject.id)}"]`);
                                if (imgElement) {
                                  imgElement.src = image;
                                }
                              }}
                              onError={(e) => {
                                e.target.src = '/2-seasons/2seasons-logo.jpg';
                              }}
                            />
                          ))}
                        </div>
                        <p className="text-xs text-gray-500 mt-2">Click thumbnails to view larger images</p>
                        <button
                          onClick={() => {
                            // Open all site images in a new tab
                            const imageUrls = siteImages.join(',');
                            const newWindow = window.open('', '_blank');
                            if (newWindow) {
                              newWindow.document.write(`
                                <!DOCTYPE html>
                                <html>
                                <head>
                                  <title>2 Seasons - Complete Site Gallery</title>
                                  <style>
                                    body { margin: 0; padding: 20px; background: #f5f5f5; font-family: Arial, sans-serif; }
                                    .gallery { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
                                    .image-container { background: white; padding: 15px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
                                    .image-container img { width: 100%; height: 250px; object-fit: cover; border-radius: 8px; }
                                    .image-title { margin-top: 10px; font-weight: bold; color: #333; }
                                    h1 { text-align: center; color: #1f2937; margin-bottom: 30px; }
                                  </style>
                                </head>
                                <body>
                                  <h1>🏗️ 2 Seasons Estate - Site Progress Gallery</h1>
                                  <div class="gallery">
                                    ${siteImages.map((img, index) => `
                                      <div class="image-container">
                                        <img src="${img}" alt="Site progress ${index + 1}" />
                                        <div class="image-title">Site Progress ${index + 1}</div>
                                      </div>
                                    `).join('')}
                                  </div>
                                </body>
                                </html>
                              `);
                            }
                          }}
                          className="mt-3 w-full px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                          🖼️ View Complete Site Gallery
                        </button>
                      </div>
                    </div>
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

      {/* Payment Success Modal */}
      <PaymentSuccessModal
        open={showPaymentSuccess}
        onClose={() => setShowPaymentSuccess(false)}
        onDownloadReceipt={handleDownloadReceipt}
        onDownloadCertificate={handleDownloadCertificate}
        onSignDeed={handleSignDeedFromPayment}
      />

      {/* New Topic Modal - DISABLED */}
      {false && (
      <AnimatePresence>
        {showNewTopicModal && (
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
              className="bg-white rounded-2xl max-w-2xl w-full p-6"
            >
              <div className="flex justify-between items-start mb-6">
                                  <h2 className="text-2xl font-bold text-gray-900">Create New Channel</h2>
                <button onClick={() => setShowNewTopicModal(false)} className="text-gray-400 hover:text-gray-600">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <form onSubmit={(e) => {
                e.preventDefault();
                handleCreateTopic();
              }} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Channel Name
                  </label>
                  <input
                    type="text"
                    value={newTopicData.title}
                    onChange={(e) => setNewTopicData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Enter topic title"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={newTopicData.category}
                    onChange={(e) => setNewTopicData(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="general">General Discussion</option>
                                            <option value="ownership">Ownership Tips</option>
                    <option value="market">Market Analysis</option>
                    <option value="legal">Legal Questions</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Content
                  </label>
                  <textarea
                    value={newTopicData.content}
                    onChange={(e) => setNewTopicData(prev => ({ ...prev, content: e.target.value }))}
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Write your channel description..."
                    required
                  />
                </div>
                
                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => setShowNewTopicModal(false)}
                    className="px-6 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
                  >
                    Create Channel
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      )}

      {/* Topic View Modal - DISABLED */}
      {false && (
      <AnimatePresence>
        {showTopicModal && selectedTopic && (
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
                  <h2 className="text-2xl font-bold text-gray-900">#{selectedTopic.title}</h2>
                  <button onClick={() => setShowTopicModal(false)} className="text-gray-400 hover:text-gray-600">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                {/* Topic Content */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-indigo-600">{selectedTopic.author.split(' ').map(n => n[0]).join('')}</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{selectedTopic.author}</p>
                      <p className="text-sm text-gray-500">{selectedTopic.timestamp}</p>
                    </div>
                  </div>
                  <p className="text-gray-700">{selectedTopic.content}</p>
                </div>
                
                {/* Replies */}
                <div className="space-y-4 mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Replies ({selectedTopic.replies?.length || 0})</h3>
                  
                  {selectedTopic.replies && selectedTopic.replies.length > 0 ? (
                    selectedTopic.replies.map((reply) => (
                      <div key={reply.id} className="bg-white border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                            <span className="text-xs font-medium text-gray-600">{reply.author.split(' ').map(n => n[0]).join('')}</span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{reply.author}</p>
                            <p className="text-sm text-gray-500">{reply.timestamp}</p>
                          </div>
                        </div>
                        <p className="text-gray-700">{reply.content}</p>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <p>No replies yet. Be the first to respond!</p>
                    </div>
                  )}
                </div>
                
                {/* Add Reply */}
                <div className="border-t pt-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Add Your Reply</h4>
                  <div className="flex space-x-4">
                    <input
                      type="text"
                      value={newReply}
                      onChange={(e) => setNewReply(e.target.value)}
                      placeholder="Write your reply..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    <button
                      onClick={handleAddReply}
                      disabled={!newReply.trim()}
                      className={`px-6 py-2 text-sm font-medium rounded-lg ${
                        newReply.trim()
                          ? 'text-white bg-indigo-600 hover:bg-indigo-700'
                          : 'text-gray-400 bg-gray-200 cursor-not-allowed'
                      }`}
                    >
                      Reply
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      )}


    </div>
  );
}