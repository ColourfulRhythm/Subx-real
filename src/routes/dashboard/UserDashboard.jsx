import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth, db } from '../../firebase';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, updateDoc, setDoc, collection, query, where, getDocs, addDoc, orderBy, limit } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { paystackKey } from '../../supabase';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';
import PaymentSuccessModal from '../../components/PaymentSuccessModal';
import { 
  getPlotDisplayName, 
  getPlotLocation,
  getPlotBranding,
  generateDocumentContent
} from '../../utils/plotNamingConsistency';

// Backend API functions
const API_BASE_URL = 'https://subxbackend-production.up.railway.app/api';
const IS_DEVELOPMENT = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

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
    title: 'Plot 84',
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
    title: 'Plot 87',
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
  const [projects, setProjects] = useState(mockProjects);
  const [userProperties, setUserProperties] = useState([]);
  const [activeTab, setActiveTab] = useState('opportunities');
  const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);
  const [paymentData, setPaymentData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showOwnershipModal, setShowOwnershipModal] = useState(false);
  const [showCoOwnersModal, setShowCoOwnersModal] = useState(false);
  const [loadingCoOwners, setLoadingCoOwners] = useState(false);
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
  const [expandedPlots, setExpandedPlots] = useState([]);

  // Forum state
  const [forumSearchQuery, setForumSearchQuery] = useState('');
  const [forumTopics, setForumTopics] = useState([]);
  const [forumReplies, setForumReplies] = useState([]);
  const [loadingForum, setLoadingForum] = useState(false);
  const [activeForum, setActiveForum] = useState('general');
  const [showNewTopicModal, setShowNewTopicModal] = useState(false);
  const [showTopicModal, setShowTopicModal] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [newTopicData, setNewTopicData] = useState({
    title: '',
    content: '',
    category: 'general'
  });
  const [newReply, setNewReply] = useState('');

  // Sync profile data with user data when userData changes
  useEffect(() => {
    if (userData) {
      setProfileData(prev => ({
        ...prev,
        name: userData.name || prev.name,
        email: userData.email || prev.email,
        phone: userData.phone || prev.phone,
        address: userData.address || prev.address,
        dateOfBirth: userData.dateOfBirth || prev.dateOfBirth,
        occupation: userData.occupation || prev.occupation
      }));
    }
  }, [userData]);

  useEffect(() => {
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    // Fetch forum topics and projects
    fetchForumTopics();
    fetchProjects();

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
      }
    };

    checkVerificationStatus();
    
    // Load data from backend
    const loadData = async () => {
      try {
        // First fetch properties, then fetch user data that depends on properties
        await fetchUserPropertiesNUCLEAR();
        await fetchProjects();
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setTimeout(() => setIsLoading(false), 1000);
      }
    };

    loadData();
    
    // Set up auto-refresh every 30 seconds to ensure real-time data
    const refreshInterval = setInterval(async () => {
      await fetchUserPropertiesNUCLEAR();
      // fetchUserData() will be triggered by the useEffect when userProperties changes
    }, 30000);
    
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
    
    // Cleanup function
    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, [navigate]);

  // Test useEffect to see if component is rendering
  useEffect(() => {
    console.log('🧪 TEST: Component mounted, useEffect is working');
  }, []);

  // Separate useEffect to update userData when userProperties changes
  useEffect(() => {
    console.log('🔍 useEffect triggered, userProperties.length:', userProperties.length);
    console.log('🔍 userProperties:', userProperties);
    
    if (userProperties.length > 0) {
      console.log('🔄 userProperties changed, updating userData...');
      fetchUserData();
    }
  }, [userProperties]);

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
      setUserProperties([]);
      
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

  const handleViewCoOwners = async (property) => {
    setSelectedProperty(property);
    setShowCoOwnersModal(true);
    setLoadingCoOwners(true);
    
    try {
      console.log('🚀 Starting co-owners fetch for property:', property);
      
      // UNIVERSAL APPROACH: Get all users who own ANY plot automatically
      const plotId = property.id || 1; // Use property.id if available, fallback to 1
      console.log('🎯 Fetching co-owners for plot ID:', plotId);
      
      const { data: ownershipData, error: ownershipError } = await supabase
        .from('plot_ownership')
        .select('*')
        .eq('plot_id', plotId);

      if (ownershipError) {
        console.error('❌ Plot ownership error:', ownershipError);
        throw ownershipError;
      }

      console.log('📊 Plot ownership data:', ownershipData);

      if (ownershipData && ownershipData.length > 0) {
        // Get user details for each owner
        const userIds = ownershipData.map(owner => owner.user_id);
        console.log('👥 User IDs found:', userIds);

        const { data: userData, error: userError } = await supabase
          .from('user_profiles')
          .select('id, full_name, email')
          .in('id', userIds);

        if (userError) {
          console.error('❌ User profiles error:', userError);
          throw userError;
        }

        console.log('👤 User profiles data:', userData);

        // Create co-owners with real data
        const coOwners = ownershipData.map(ownership => {
          const userProfile = userData.find(profile => profile.id === ownership.user_id);
          const sqmOwned = ownership.sqm_owned || 0;
          
          return {
            id: ownership.user_id,
            name: userProfile?.full_name || userProfile?.email || 'Unknown User',
            email: userProfile?.email || 'No email',
            sqm: sqmOwned,
            sqmOwned: sqmOwned,
            amountInvested: ownership.amount_paid || 0,
            joinDate: ownership.created_at || new Date().toISOString(),
            percentage: 0 // Will calculate below
          };
        });

        // Calculate percentages
        const totalSqm = coOwners.reduce((sum, owner) => sum + owner.sqm, 0);
        coOwners.forEach(owner => {
          owner.percentage = totalSqm > 0 ? parseFloat(((owner.sqm / totalSqm) * 100).toFixed(1)) : 0;
        });

        const totalInvestment = coOwners.reduce((sum, owner) => sum + owner.amountInvested, 0);

        console.log('✅ Final co-owners data:', { coOwners, totalSqm, totalInvestment });

        setSelectedProperty(prev => ({
          ...prev,
          coOwners: coOwners,
          totalOwners: coOwners.length,
          totalInvestment: totalInvestment
        }));

      } else {
        console.log('📭 No plot ownership data found');
        setSelectedProperty(prev => ({
          ...prev,
          coOwners: [],
          totalOwners: 0,
          totalInvestment: 0
        }));
      }

    } catch (error) {
      console.error('💥 Co-owners fetch error:', error);
      setSelectedProperty(prev => ({
        ...prev,
        coOwners: [],
        totalOwners: 0,
        totalInvestment: 0
      }));
    } finally {
      setLoadingCoOwners(false);
    }
  };

  const handleViewDocuments = (property) => {
    // Generate real documents based on the property data with correct plot information
    const plotId = property.plot_id || property.id;
    const sqmOwned = property.sqm || property.sqmOwned || 0;
    const plotName = getPlotDisplayName(plotId);
    
    const realDocuments = [
      {
        name: 'Ownership Receipt',
        type: 'receipt',
        url: '#',
        signed: true,
        description: `Receipt for ${sqmOwned} sqm purchase in ${plotName}`,
        date: property.dateInvested || new Date().toISOString(),
        sqmOwned: sqmOwned,
        plotName: plotName
      },
      {
        name: 'Deed of Assignment',
        type: 'deed',
        url: '#',
        signed: false,
        description: 'Legal document transferring land ownership rights',
        date: new Date().toISOString(),
        sqmOwned: sqmOwned,
        plotName: plotName
      },
      {
        name: 'Co-ownership Certificate',
        type: 'certificate',
        url: '#',
        signed: true,
        description: `Certificate confirming ownership of ${sqmOwned} sqm`,
        date: property.dateInvested || new Date().toISOString(),
        sqmOwned: sqmOwned,
        plotName: plotName
      },
      {
        name: 'Land Survey Report',
        type: 'survey',
        url: '#',
        signed: true,
        description: 'Official survey of the purchased land area',
        date: new Date().toISOString(),
        sqmOwned: sqmOwned,
        plotName: plotName
      }
    ];
    
    // Generate proper document content using the utility
    const enhancedDocuments = realDocuments.map(doc => 
      generateDocumentContent(doc, property, userData)
    );
    
    setSelectedProperty({
      ...property,
      documents: enhancedDocuments
    });
    setShowDocumentsModal(true);
  };

  const handleSignDeed = (document) => {
    setSelectedDocument(document);
    setShowDeedSignModal(true);
  };

  const togglePlotDocuments = (plotId) => {
    setExpandedPlots(prev => 
      prev.includes(plotId) 
        ? prev.filter(id => id !== plotId)
        : [...prev, plotId]
    );
  };

  const handleViewDocument = (document) => {
    // Show document content in modal instead of trying to open URL
    setSelectedDocument(document);
    setShowDocumentsModal(true);
  };

  const handleDownloadReceipt = (property, document) => {
    // Generate and download receipt
    const doc = new jsPDF();
    doc.setFontSize(20);
          doc.text('Subx Ownership Receipt', 20, 20);
    doc.setFontSize(12);
    doc.text(`Property: ${property.title}`, 20, 40);
    doc.text(`Document: ${document.name}`, 20, 50);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 60);
    doc.text(`User: ${userData.name}`, 20, 70);
    doc.text(`Email: ${userData.email}`, 20, 80);
    
    doc.save(`receipt-${property.title}-${document.name}.pdf`);
    toast.success('Receipt downloaded successfully!');
  };

  // Fetch real project data with dynamic available sq.m
  const fetchProjects = async () => {
    try {
      // Use static project data since API is not available
      const staticProjects = [
        {
          id: 1,
          title: '2 Seasons Plot',
          description: 'Premium land ownership opportunity in Gbako Village, Ogun State',
          location: '2 Seasons, Gbako Village, Ogun State',
          totalSqm: 500,
          availableSqm: 437, // 500 - 63 sqm already owned
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
          availableSqm: 500,
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
          availableSqm: 500,
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
          availableSqm: 500,
          pricePerSqm: 5000,
          image: '/2-seasons/2seasons-logo.jpg',
          status: 'active'
        },
        {
          id: 5,
          title: 'Plot 81',
          description: 'Premium land ownership opportunity in Gbako Village, Ogun State',
          location: '2 Seasons, Gbako Village, Ogun State',
          totalSqm: 500,
          availableSqm: 500,
          pricePerSqm: 5000,
          image: '/2-seasons/2seasons-logo.jpg',
          status: 'active'
        }
      ];
      
      setProjects(staticProjects);
      console.log('✅ Projects loaded from static data');
    } catch (error) {
      console.error('Error fetching projects:', error);
      // Keep mockProjects as fallback
      setProjects(mockProjects);
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

  // Forum functions
  const fetchForumTopics = async () => {
    setLoadingForum(true);
    try {
      // Fetch forum topics directly from Supabase instead of broken API
      const { data: topics, error } = await supabase
        .from('forum_topics')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) {
        console.error('Failed to fetch forum topics from Supabase:', error);
        // Use mock data as fallback
        setForumTopics([
          {
            id: 1,
            title: 'Welcome to Subx Community!',
            content: 'Join discussions about property ownership and ownership opportunities.',
            author: 'Subx Team',
            created_at: new Date().toISOString(),
            replies_count: 5
          }
        ]);
      } else {
        console.log('Forum topics fetched from Supabase:', topics);
        setForumTopics(topics || []);
      }
    } catch (error) {
      console.error('Failed to fetch forum topics:', error);
      setForumTopics([]);
    } finally {
      setLoadingForum(false);
    }
  };

  const fetchTopicReplies = async (topicId) => {
    try {
      // Fetch replies directly from Supabase instead of broken API
      const { data: replies, error } = await supabase
        .from('forum_replies')
        .select('*')
        .eq('topic_id', topicId)
        .order('created_at', { ascending: true });
      
      if (error) {
        console.error('Failed to fetch replies from Supabase:', error);
        setForumReplies([]);
      } else {
        console.log('Replies fetched from Supabase:', replies);
        setForumReplies(replies || []);
      }
    } catch (error) {
      console.error('Error fetching replies:', error);
      setForumReplies([]);
    }
  };

  const handleViewTopic = async (topic) => {
    setSelectedTopic(topic);
    setShowTopicModal(true);
    await fetchTopicReplies(topic.id);
  };

  const handleAddReply = async () => {
    if (!newReply.trim() || !selectedTopic) return;
    
    try {
      // Add reply directly to Supabase instead of broken API
      const { data: reply, error } = await supabase
        .from('forum_replies')
        .insert({
      content: newReply,
          topic_id: selectedTopic.id,
          user_id: user.id,
          author: userData.name || user.email
        })
        .select()
        .single();
      
      if (error) {
        console.error('Failed to add reply to Supabase:', error);
        toast.error('Failed to add reply');
      } else {
        console.log('Reply added to Supabase:', reply);
    setNewReply('');
        await fetchTopicReplies(selectedTopic.id);
      toast.success('Reply added successfully!');
      }
    } catch (error) {
      console.error('Error adding reply:', error);
      toast.error('Failed to add reply');
    }
  };

  const handleCreateTopic = async () => {
    if (!newTopicData.title.trim() || !newTopicData.content.trim()) return;
    
    try {
      // Create topic directly in Supabase instead of broken API
      const { data: topic, error } = await supabase
        .from('forum_topics')
        .insert({
      title: newTopicData.title,
      content: newTopicData.content,
          category: newTopicData.category || 'general',
          user_id: user.id,
          author: userData.name || user.email
        })
        .select()
        .single();
    
      if (error) {
        console.error('Failed to create topic in Supabase:', error);
        toast.error('Failed to create channel');
      } else {
        console.log('Topic created in Supabase:', topic);
    setNewTopicData({ title: '', content: '', category: 'general' });
    setShowNewTopicModal(false);
        // Add a small delay to ensure the modal closes before refreshing
        setTimeout(async () => {
          await fetchForumTopics();
        }, 100);
        toast.success('Channel created successfully!');
      }
    } catch (error) {
      console.error('Error creating topic:', error);
      toast.error('Failed to create channel');
    }
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

  // Generate PDF Receipt
  const generateReceipt = (investmentData) => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.text('PAYMENT RECEIPT', 105, 20, { align: 'center' });
    
    // Company Info
    doc.setFontSize(12);
    doc.text('Subx Real Estate Ownership Platform', 105, 35, { align: 'center' });
    doc.text('Focal Point Property Development and Management Services Ltd.', 105, 42, { align: 'center' });
    doc.text('Date: ' + new Date().toLocaleDateString(), 20, 55);
    doc.text('Receipt No: ' + investmentData.paymentReference, 20, 62);
    
    // Payment Details
    doc.setFontSize(14);
    doc.text('Payment Details', 20, 80);
    doc.setFontSize(12);
    doc.text('Investor Name: ' + userData.name, 20, 90);
    doc.text('Email: ' + userData.email, 20, 97);
    doc.text('Project: ' + investmentData.projectTitle, 20, 104);
    doc.text('Location: ' + investmentData.location, 20, 111);
    doc.text('Land Area: ' + investmentData.sqm + ' sq.m', 20, 118);
    doc.text('Amount Paid: ₦' + investmentData.amount.toLocaleString(), 20, 125);
    doc.text('Payment Reference: ' + investmentData.paymentReference, 20, 132);
    
    // Footer
    doc.setFontSize(10);
    doc.text('Thank you for your ownership!', 105, 180, { align: 'center' });
    doc.text('This receipt serves as proof of your ownership.', 105, 187, { align: 'center' });
    
    return doc;
  };

  // Generate Certificate of Ownership
  const generateCertificate = (investmentData) => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(24);
    doc.text('CERTIFICATE OF OWNERSHIP', 105, 25, { align: 'center' });
    
    // Certificate Number
    doc.setFontSize(12);
    doc.text('Certificate No: ' + investmentData.paymentReference, 105, 35, { align: 'center' });
    doc.text('Date Issued: ' + new Date().toLocaleDateString(), 105, 42, { align: 'center' });
    
    // Main Content
    doc.setFontSize(14);
    doc.text('This is to certify that:', 20, 60);
    doc.setFontSize(12);
    doc.text(userData.name, 20, 70);
    doc.text('Email: ' + userData.email, 20, 77);
    
    doc.text('is the legal owner of:', 20, 90);
    doc.text(investmentData.sqm + ' square meters', 20, 100);
    doc.text('in the property known as:', 20, 107);
    doc.text(investmentData.projectTitle, 20, 117);
    doc.text('Located at: ' + investmentData.location, 20, 124);
    
    doc.text('Total Ownership Value: ₦' + investmentData.amount.toLocaleString(), 20, 140);
    
    // Legal Statement
    doc.setFontSize(10);
    doc.text('This certificate is issued by Focal Point Property Development and Management Services Ltd.', 20, 160);
    doc.text('and serves as legal proof of ownership in the above-mentioned property.', 20, 167);
    
    // Signature
    doc.text('Authorized Signature: _________________', 20, 190);
    doc.text('Date: ' + new Date().toLocaleDateString(), 20, 197);
    
    return doc;
  };

    

  // Download Certificate
  const handleDownloadCertificate = () => {
    if (!paymentData) return;
    
    const doc = generateCertificate(paymentData);
    doc.save(`certificate-${paymentData.paymentReference}.pdf`);
    toast.success('Certificate downloaded successfully!');
  };

  // Sign Deed of Assignment from Payment Success
  const handleSignDeedFromPayment = () => {
    setShowPaymentSuccess(false);
    setShowDeedSignModal(true);
    toast.info('Please sign your Deed of Assignment');
  };

  // Backend integration functions
  const fetchUserData = async () => {
    console.log('🚀 fetchUserData called from:', new Error().stack?.split('\n')[2] || 'unknown location');
    try {
      const user = auth.currentUser;
      if (!user) return;

      // CRITICAL FIX: Clear localStorage data when switching users
      const currentUserId = user.uid;
      const lastUserId = localStorage.getItem('lastUserId');
      
      if (lastUserId && lastUserId !== currentUserId) {
        // Different user logged in - clear all cached data
        console.log('Different user detected, clearing cached data');
        localStorage.removeItem('userProfileData');
        localStorage.removeItem('userName');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('lastUserId');
      }
      
      // Store current user ID
      localStorage.setItem('lastUserId', currentUserId);

      // Firebase backend is available, using Firebase data
      console.log('Firebase backend available, using Firebase data');

      // Calculate totals from userProperties state instead of fetching from view
      const totalSqm = userProperties.reduce((sum, property) => sum + (property.sqmOwned || 0), 0);
      const totalAmount = userProperties.reduce((sum, property) => sum + (property.amountInvested || 0), 0);
      const totalPlots = userProperties.length;

      console.log('📊 Calculating totals from userProperties:', { 
        userPropertiesLength: userProperties.length,
        totalSqm, 
        totalAmount, 
        totalPlots 
      });

      // Load profile data from Firebase user_profiles collection
      let profileData = null;
      try {
        const profileRef = doc(db, 'user_profiles', user.uid);
        const profileSnap = await getDoc(profileRef);
        
        if (profileSnap.exists()) {
          profileData = profileSnap.data();
          console.log('✅ Profile loaded from Firebase:', profileData);
        }
      } catch (profileError) {
        console.log('No profile found in Firebase, using auth metadata');
      }

      // Create complete userData with real investment info and profile data
      const completeUserData = {
        name: profileData?.full_name || user?.displayName || user?.email?.split('@')[0] || 'User',
        email: profileData?.email || user?.email || '',
        phone: profileData?.phone || user?.phoneNumber || null,
        address: profileData?.address || null,
        dateOfBirth: profileData?.date_of_birth || null,
        occupation: profileData?.occupation || null,
        avatar: '/subx-logo/default-avatar.png',
        portfolioValue: `₦${totalAmount.toLocaleString()}`,
        totalLandOwned: `${totalSqm} sqm`,
        totalInvestments: totalPlots,
        recentActivity: [
          {
            id: 1,
            title: 'Plot 77 Ownership',
            amount: `${totalSqm} sqm purchased`,
            date: new Date().toLocaleDateString(),
            status: 'completed'
          }
        ]
      };
      
      setUserData(completeUserData);
      console.log('✅ Updated userData with real portfolio info and profile data:', { totalSqm, totalAmount, totalPlots, profileData });
    } catch (error) {
      console.error('Failed to fetch user data:', error);
      // Load from localStorage as fallback
      const savedData = localStorage.getItem('userProfileData');
      if (savedData) {
        try {
          setUserData(JSON.parse(savedData));
        } catch (e) {
          console.log('Failed to parse saved data');
        }
      }
    }
  };

  const updateUserProfile = async (profileData) => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('No authenticated user');

      // Update local state immediately for better UX
      const updatedUserData = {
        ...userData,
        name: profileData.name || userData.name,
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
      
      // Save to Firebase database (primary method)
      try {
        // First, ensure user profile exists in user_profiles collection
        const profileRef = doc(db, 'user_profiles', user.uid);
        const profileSnap = await getDoc(profileRef);

        let profileUpdateResult;
        
        if (profileSnap.exists()) {
          // Update existing profile
          await updateDoc(profileRef, {
            full_name: profileData.name || null,
            email: profileData.email || null,
            phone: profileData.phone || null,
            address: profileData.address || null,
            date_of_birth: profileData.dateOfBirth && profileData.dateOfBirth.trim() !== '' ? profileData.dateOfBirth : null,
            occupation: profileData.occupation || null,
            updated_at: new Date().toISOString()
          });
          
          const updatedSnap = await getDoc(profileRef);
          profileUpdateResult = updatedSnap.data();
        } else {
          // Create new profile
          await setDoc(profileRef, {
            user_id: user.uid,
            full_name: profileData.name || null,
            email: profileData.email || null,
            phone: profileData.phone || null,
            address: profileData.address || null,
            date_of_birth: profileData.dateOfBirth && profileData.dateOfBirth.trim() !== '' ? profileData.dateOfBirth : null,
            occupation: profileData.occupation || null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
          
          const newSnap = await getDoc(profileRef);
          profileUpdateResult = newSnap.data();
        }
        
        console.log('✅ Profile updated in Firebase:', profileUpdateResult);
        
        // Firebase Auth doesn't support custom metadata updates like Supabase
        // Profile data is stored in Firestore instead
        
      } catch (firebaseError) {
        console.error('Failed to save to Firebase:', firebaseError);
        // Fallback to localStorage only
        console.log('Profile saved to localStorage only due to Firebase error');
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
      console.log('Document saved to backend:', response);

      toast.success('Document signed successfully!');
      return { success: true };
    } catch (error) {
      console.error('Failed to save document:', error);
      toast.error('Failed to save document');
      throw error;
    }
  };

  // NUCLEAR RESET - COMPLETELY NEW FUNCTION
  const fetchUserPropertiesNUCLEAR = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      console.log('🔥 NUCLEAR RESET - Fetching plot ownership for user:', user.email);
      
      // Fetch from Firebase plot_ownership collection instead of Supabase
      const plotOwnershipRef = collection(db, 'plot_ownership');
      const q = query(plotOwnershipRef, where('user_id', '==', user.uid));
      const querySnapshot = await getDocs(q);
      
      const plotOwnership = [];
      querySnapshot.forEach((doc) => {
        plotOwnership.push({ id: doc.id, ...doc.data() });
      });
      
      console.log('🔥 NUCLEAR RESET - Plot ownership query result:', plotOwnership);
      
      if (plotOwnership && plotOwnership.length > 0) {
        // Transform the data to match expected format with consistent naming
        const transformedProperties = plotOwnership.map(ownership => {
          const plotId = ownership.plot_id;
          const plotName = getPlotDisplayName(plotId);
          const location = getPlotLocation(plotId);
          
          return {
            id: plotId,
            plot_id: plotId, // Add plot_id for consistent naming
            projectTitle: plotName,
            title: plotName,
            location: location,
            sqmOwned: ownership.sqm_owned || 0,
            amountInvested: ownership.amount_paid || 0,
            dateInvested: ownership.created_at || new Date().toISOString(),
            status: 'completed',
            documents: [
              { name: 'Receipt', type: 'pdf', url: '#', signed: true },
              { name: 'Deed of Sale (per owner)', type: 'pdf', url: '#', signed: false },
              { name: 'Co-ownership Certificate', type: 'pdf', url: '#', signed: true }
            ]
          };
        });
        
        setUserProperties(transformedProperties);
        console.log('🔥 NUCLEAR RESET - User properties set from plot ownership:', transformedProperties);
        return;
      }
      
      // If we get here, no plot ownership found
      console.log(' NUCLEAR RESET - No plot ownership found');
      setUserProperties([]);
    } catch (error) {
      console.error('🔥 NUCLEAR RESET - Failed to fetch properties:', error);
      setUserProperties([]);
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

      // Initialize Paystack payment
      const amount = selectedSqm * 5000 * 100; // Convert to kobo
      const email = userData.email || user.email;
      const name = userData.name || user.displayName || 'User';
      const reference = 'SUBX-' + Math.floor(Math.random() * 1000000000);
      
      console.log('Payment details:', { amount, email, name, reference, selectedSqm });
      
      if (!window.PaystackPop) {
        console.error('PaystackPop not available');
        toast.error('Payment gateway not loaded. Please refresh the page and try again.');
        return;
      }

      console.log('Setting up Paystack handler...');
      
            try {
        const handler = window.PaystackPop.setup({
          key: paystackKey,
          email: email,
          amount: amount,
          currency: 'NGN',
          ref: reference,
          label: name,
          callback: function(response) {
            // Handle payment success
            console.log('Payment successful:', response);
            
            // Create investment record
            const investmentData = {
              investorId: user.email || user.uid,
              projectTitle: getPlotDisplayName(selectedProject.plot_id || selectedProject.id),
              projectId: selectedProject.id,
              sqm: selectedSqm,
              amount: selectedSqm * 5000,
              location: getPlotLocation(selectedProject.plot_id || selectedProject.id),
              description: selectedProject.description,
              paymentReference: response.reference,
              status: 'completed',
              documents: [
                { name: 'Group Purchase Agreement', type: 'pdf', url: '#', signed: true },
                { name: 'Deed of Sale (per owner)', type: 'pdf', url: '#', signed: false },
                { name: 'Co-ownership Certificate', type: 'pdf', url: '#', signed: false }
              ]
            };
            
            // Save investment to backend
            apiCall('/investments', {
              method: 'POST',
              body: JSON.stringify(investmentData),
            })
            .then((response) => {
              console.log('Investment saved successfully:', response);
              
              // Update available SQM in backend
              return apiCall(`/projects/${selectedProject.id}/update-sqm`, {
                method: 'PUT',
                body: JSON.stringify({ 
                  purchasedSqm: selectedSqm,
                  availableSqm: Math.max(0, selectedProject.availableSqm - selectedSqm)
                }),
              });
            })
            .then(() => {
              // Refresh user data and projects
              return Promise.all([
                fetchUserPropertiesNUCLEAR(),
                fetchProjects()
              ]);
            })
            .then(() => {
              // Update available SQM in frontend
              updateAvailableSqm(selectedProject.id, selectedSqm);
              
              // Show success modal with document options
              setPaymentData(investmentData);
              setShowOwnershipModal(false);
              setShowPaymentSuccess(true);
              toast.success('Payment successful! Download your documents below.');
            })
            .catch((error) => {
              console.error('Failed to save investment to backend:', error);
              toast.error('Payment successful but failed to save investment. Please contact support.');
            });
          },
          onClose: function() {
            toast.error('Payment cancelled');
          }
        });
      
      console.log('Opening Paystack iframe...');
      handler.openIframe();
      
    } catch (paystackError) {
      console.error('Paystack setup error:', paystackError);
      toast.error('Failed to setup payment. Please try again.');
    }
    
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
            { id: 'investments', label: 'My Properties', icon: 'chart-bar' },
            { id: 'documents', label: 'Documents', icon: 'document' },
            { id: 'forum', label: 'Community', icon: 'users' },
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
                  <button 
                    onClick={() => {
                      fetchUserPropertiesNUCLEAR();
                      toast.success('Data refreshed!');
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                    title="Refresh data"
                  >
                    <svg className="h-4 w-4 mr-2 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Refresh
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

          {activeTab === 'investments' && (
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
                      fetchUserPropertiesNUCLEAR();
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
                          <p className="font-medium text-gray-900">{new Date(property.dateInvested).toLocaleDateString()}</p>
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
                                      onClick={() => handleViewDocument(document)}
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
                                    onClick={() => handleViewDocument(document)}
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
                <p className="font-medium text-gray-900">
                  {userData.createdAt ? new Date(userData.createdAt).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long' 
                  }) : 'Recently'}
                </p>
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

          {activeTab === 'forum' && (
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
                    <input
                      type="number"
                      min="1"
                      max="500"
                      value={selectedSqm}
                      onChange={(e) => {
                        const value = parseInt(e.target.value);
                        if (value && value >= 1 && value <= 500) {
                          handleSqmChange(value);
                        }
                      }}
                      onBlur={(e) => {
                        const value = parseInt(e.target.value);
                        if (!value || value < 1) {
                          handleSqmChange(1);
                        } else if (value > 500) {
                          handleSqmChange(500);
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
                <div className="flex justify-between items-start mb-4 sm:mb-6">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Co-owners - {getPlotDisplayName(selectedProperty.plot_id || selectedProperty.id)}</h2>
                  <button onClick={() => setShowCoOwnersModal(false)} className="text-gray-400 hover:text-gray-600">
                    <svg className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                {/* Summary Statistics */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                  <div className="bg-indigo-50 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-indigo-600">{selectedProperty.totalOwners || 0}</p>
                    <p className="text-sm text-gray-600">Total Co-owners</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4 text-center">
                                            <p className="text-2xl font-bold text-green-600">₦{(selectedProperty.totalInvestment || 0).toLocaleString()}</p>
                        <p className="text-sm text-gray-600">Total Ownership Value</p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-purple-600">{selectedProperty.coOwners?.reduce((sum, owner) => sum + owner.sqm, 0) || 0}</p>
                    <p className="text-sm text-gray-600">Total Sq.m Owned</p>
                  </div>
                </div>
                
                {loadingCoOwners ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                      <p className="text-gray-600">Loading co-owners data...</p>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Ownership Distribution</h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="w-48 h-48 mx-auto mb-4 relative">
                        {/* Functional Pie Chart */}
                        <svg className="w-full h-full" viewBox="0 0 100 100">
                          {selectedProperty.coOwners?.map((owner, index) => {
                            const totalOwners = selectedProperty.coOwners.length;
                            const startAngle = (index / totalOwners) * 360;
                            const endAngle = ((index + 1) / totalOwners) * 360;
                            const radius = 40;
                            const colors = ['#3B82F6', '#8B5CF6', '#EC4899', '#10B981', '#F59E0B', '#EF4444'];
                            
                            const x1 = 50 + radius * Math.cos((startAngle - 90) * Math.PI / 180);
                            const y1 = 50 + radius * Math.sin((startAngle - 90) * Math.PI / 180);
                            const x2 = 50 + radius * Math.cos((endAngle - 90) * Math.PI / 180);
                            const y2 = 50 + radius * Math.sin((endAngle - 90) * Math.PI / 180);
                            
                            const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;
                            
                            return (
                              <path
                                key={index}
                                d={`M 50 50 L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`}
                                fill={colors[index % colors.length]}
                                className="hover:opacity-80 transition-opacity cursor-pointer"
                                title={`${owner.name}: ${owner.percentage}%`}
                              />
                            );
                          })}
                          <circle cx="50" cy="50" r="15" fill="white" />
                        </svg>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {selectedProperty.coOwners?.map((owner, index) => {
                          const colors = ['#3B82F6', '#8B5CF6', '#EC4899', '#10B981', '#F59E0B', '#EF4444'];
                          return (
                            <div key={index} className="flex items-center space-x-2">
                              <div 
                                className="w-3 h-3 rounded-full" 
                                style={{ backgroundColor: colors[index % colors.length] }}
                              ></div>
                              <span className="truncate">{owner.name}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Co-owners List</h3>
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {selectedProperty.coOwners?.length > 0 ? (
                        selectedProperty.coOwners.map((owner, index) => (
                          <div key={index} className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                            <div className="flex items-center space-x-3 min-w-0 flex-1">
                              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <span className="text-xs sm:text-sm font-medium text-indigo-600">
                                  {owner.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                                </span>
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="font-medium text-gray-900 text-sm sm:text-base truncate">{owner.name}</p>
                                <p className="text-xs sm:text-sm text-gray-500 truncate">{owner.email}</p>
                                {owner.phone && (
                                  <p className="text-xs sm:text-sm text-gray-500 truncate">{owner.phone}</p>
                                )}
                              </div>
                            </div>
                            <div className="text-right flex-shrink-0 ml-2">
                              <p className="font-semibold text-indigo-600 text-sm sm:text-base">{owner.percentage}%</p>
                              <p className="text-xs sm:text-sm text-gray-500">{owner.sqm} sq.m</p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8">
                          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          <p className="mt-2 text-sm text-gray-500">No co-owners found</p>
                          <p className="text-xs text-gray-400">This property is currently owned by you only</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                )}
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
                      {selectedDocument.name === 'Ownership Receipt' && (
                        <>
                          <strong>PAYMENT RECEIPT</strong><br/><br/>
                          <strong>Date:</strong> {new Date().toLocaleDateString()}<br/>
                          <strong>Receipt No:</strong> SUBX-{Math.floor(Math.random() * 1000000)}<br/><br/>
                          <strong>PAYMENT DETAILS:</strong><br/>
                          • Property: {selectedProperty?.plotName || selectedProperty?.projectTitle || getPlotDisplayName(selectedProperty?.plot_id)}<br/>
                          • Location: 2 Seasons, Gbako Village, Ogun State<br/>
                          • Square Meters: {selectedDocument?.sqmOwned || selectedProperty?.sqm || '[SQM]'} sqm<br/>
                          • Amount Paid: ₦{((selectedDocument?.sqmOwned || selectedProperty?.sqm || 0) * 5000).toLocaleString()}<br/>
                          • Payment Method: Paystack<br/>
                          • Status: Completed<br/><br/>
                          <strong>BUYER:</strong> {userData.name}<br/>
                          <strong>EMAIL:</strong> {userData.email}<br/><br/>
                          <strong>This receipt confirms successful payment for the above property.</strong>
                        </>
                      )}
                      {selectedDocument.name === 'Deed of Assignment' && (
                        <>
                      <strong>DEED OF ASSIGNMENT</strong><br/><br/>
                          This Deed of Assignment is made on {new Date().toLocaleDateString()} between:<br/><br/>
                      <strong>ASSIGNOR:</strong> Focal Point Property Development and Management Services Ltd.<br/>
                      <strong>ASSIGNEE:</strong> {userData.name}<br/><br/>
                          For the assignment of land rights in 2 Seasons Estate, Gbako Village, Via Kobape Obafemi-Owode Lga, Ogun state.<br/><br/>
                      <strong>PROPERTY DETAILS:</strong><br/>
                      • Location: 2 Seasons Estate, Gbako Village, Via Kobape Obafemi-Owode Lga, Ogun state<br/>
                          • Plot Number: {selectedProperty?.plotName || getPlotDisplayName(selectedProperty?.plot_id)}<br/>
                      • Square Meters: {selectedDocument?.sqmOwned || selectedProperty?.sqm || '[SQM]'} sqm<br/>
                      • Assignment Value: ₦{((selectedDocument?.sqmOwned || selectedProperty?.sqm || 0) * 5000).toLocaleString()}<br/><br/>
                      <strong>TERMS AND CONDITIONS:</strong><br/>
                      1. The Assignor hereby transfers land ownership rights to the Assignee<br/>
                      2. The Assignee acknowledges receipt of the property rights and agrees to all terms<br/>
                      3. This deed is legally binding and enforceable under Nigerian law<br/><br/>
                      <strong>SIGNATURE SECTION:</strong><br/>
                      Assignee Signature: _________________<br/>
                      Date: _________________
                        </>
                      )}
                      {selectedDocument.name === 'Co-ownership Certificate' && (
                        <>
                          <strong>CO-OWNERSHIP CERTIFICATE</strong><br/><br/>
                          <strong>Certificate No:</strong> COC-{Math.floor(Math.random() * 1000000)}<br/>
                          <strong>Date Issued:</strong> {new Date().toLocaleDateString()}<br/><br/>
                          <strong>This certifies that:</strong><br/>
                          <strong>{userData.name}</strong><br/>
                          <strong>Email:</strong> {userData.email}<br/><br/>
                          <strong>Is a verified co-owner of:</strong><br/>
                          • Property: {selectedProperty?.plotName || getPlotDisplayName(selectedProperty?.plot_id)}<br/>
                          • Location: 2 Seasons Estate, Gbako Village, Ogun State<br/>
                          • Square Meters: {selectedDocument?.sqmOwned || selectedProperty?.sqm || '[SQM]'} sqm<br/>
                          • Ownership Percentage: {selectedDocument?.ownershipPercentage || ((selectedDocument?.sqmOwned || selectedProperty?.sqm || 0) / 500 * 100).toFixed(2)}%<br/><br/>
                          <strong>This certificate confirms legal co-ownership status.</strong><br/><br/>
                          <strong>Issued by:</strong> Subx Real Estate Platform<br/>
                          <strong>Date:</strong> {new Date().toLocaleDateString()}
                        </>
                      )}
                      {selectedDocument.name === 'Land Survey Report' && (
                        <>
                          <strong>LAND SURVEY REPORT</strong><br/><br/>
                          <strong>Report No:</strong> LSR-{Math.floor(Math.random() * 1000000)}<br/>
                          <strong>Date:</strong> {new Date().toLocaleDateString()}<br/><br/>
                          <strong>PROPERTY SURVEY DETAILS:</strong><br/>
                          • Property: {selectedProperty?.plotName || getPlotDisplayName(selectedProperty?.plot_id)}<br/>
                          • Location: 2 Seasons Estate, Gbako Village, Via Kobape Obafemi-Owode Lga, Ogun State<br/>
                          • Total Plot Size: 500 sqm<br/>
                          • Owner's Portion: {selectedDocument?.sqmOwned || selectedProperty?.sqm || '[SQM]'} sqm<br/>
                          • Survey Date: {new Date().toLocaleDateString()}<br/><br/>
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

      {/* New Topic Modal */}
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

      {/* Topic View Modal */}
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
    </div>
  );
} 