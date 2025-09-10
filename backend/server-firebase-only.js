/**
 * PURE FIREBASE BACKEND - NO MONGODB
 * Complete Firebase-only backend implementation
 */

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import OpenAI from 'openai';
import axios from 'axios';
import nodemailer from 'nodemailer';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// =====================================================
// FIREBASE ADMIN INITIALIZATION
// =====================================================

// Initialize Firebase Admin (only if not already initialized)
if (!getApps().length) {
  try {
    // Try to use service account key if available
    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
      initializeApp({
        credential: cert(serviceAccount),
        projectId: 'subx-825e9'
      });
    } else {
      // Use default credentials (for production)
      initializeApp({
        projectId: 'subx-825e9'
      });
    }
    console.log('✅ Firebase Admin initialized successfully');
  } catch (error) {
    console.error('❌ Firebase Admin initialization failed:', error);
    process.exit(1);
  }
}

// Get Firebase services
const db = getFirestore();
const auth = getAuth();

// =====================================================
// EXPRESS APP SETUP
// =====================================================

const app = express();
const port = process.env.PORT || 30002;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'", "https://js.paystack.co"],
      connectSrc: ["'self'", "https://api.paystack.co", "https://subxbackend-production.up.railway.app"]
    }
  }
}));

// Apply rate limiting to all routes
app.use(limiter);

// Middleware
app.use(cors({
  origin: [
    'https://www.subxhq.com',
    'https://subxhq.com',
    'https://subx-real-ish3bi357-colourfulrhythms-projects.vercel.app',
    'https://subx-real-eveinv7gn-colourfulrhythms-projects.vercel.app',
    'http://localhost:5173',
    'http://localhost:3000'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// =====================================================
// EMAIL SERVICE
// =====================================================

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com',
    pass: process.env.EMAIL_PASS || 'your-app-password'
  }
});

// =====================================================
// FIREBASE API ENDPOINTS
// =====================================================

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Firebase backend is running',
    timestamp: new Date().toISOString(),
    database: 'Firebase Firestore'
  });
});

// User count endpoint
app.get('/api/users/count', async (req, res) => {
  try {
    const usersSnapshot = await db.collection('users').get();
    const userProfilesSnapshot = await db.collection('user_profiles').get();
    const totalUsers = Math.max(usersSnapshot.size, userProfilesSnapshot.size);
    
    res.json({ 
      totalUsers,
      message: `Total registered users: ${totalUsers}`,
      database: 'Firebase Firestore'
    });
  } catch (error) {
    console.error('Error getting user count:', error);
    res.status(500).json({ error: 'Failed to get user count' });
  }
});

// Get user by ID
app.get('/api/users/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Try to find user by ID or email
    let userDoc = await db.collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      // Try to find by email
      const userQuery = await db.collection('users').where('email', '==', userId).get();
      if (!userQuery.empty) {
        userDoc = userQuery.docs[0];
      }
    }
    
    if (!userDoc.exists) {
      return res.json({
        name: 'User',
        email: '',
        avatar: '',
        portfolioValue: '₦0',
        totalLandOwned: '0 sqm',
        totalInvestments: 0,
        recentActivity: []
      });
    }
    
    const userData = userDoc.data();
    
    // Get user's investments
    const investmentsSnapshot = await db.collection('investments').where('user_id', '==', userId).get();
    const userInvestments = investmentsSnapshot.docs.map(doc => doc.data());
    const totalInvested = userInvestments.reduce((sum, inv) => sum + (inv.amount || 0), 0);
    const totalSqm = userInvestments.reduce((sum, inv) => sum + (inv.sqm_purchased || 0), 0);
    
    res.json({
      name: userData.name || userData.displayName || 'User',
      email: userData.email,
      avatar: userData.avatar || '',
      portfolioValue: `₦${totalInvested.toLocaleString()}`,
      totalLandOwned: `${totalSqm} sqm`,
      totalInvestments: userInvestments.length,
      recentActivity: userInvestments.map(inv => ({
        id: inv.id,
        title: inv.projectTitle || 'Investment',
        sqm: inv.sqm_purchased || 0,
        amount: `₦${inv.amount?.toLocaleString() || 0}`,
        date: inv.created_at?.toDate().toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
        status: 'owned',
        location: inv.location || 'Nigeria'
      }))
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user data' });
  }
});

// Get user properties
app.get('/api/users/:userId/properties', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const investmentsSnapshot = await db.collection('investments').where('user_id', '==', userId).get();
    const userInvestments = investmentsSnapshot.docs.map(doc => doc.data());
    
    const properties = userInvestments.map(inv => ({
      id: inv.id,
      title: inv.projectTitle || 'Investment',
      sqm: inv.sqm_purchased || 0,
      amount: `₦${inv.amount?.toLocaleString() || 0}`,
      date: inv.created_at?.toDate().toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
      status: 'owned',
      location: inv.location || 'Nigeria',
      description: inv.description || 'Property investment',
      documents: [
        { name: 'Investment Certificate', type: 'pdf', url: '#', signed: true },
        { name: 'Ownership Deed', type: 'pdf', url: '#', signed: false }
      ],
      coOwners: [],
      amenities: ['Investment Property'],
      nextPayment: '₦0',
      paymentDate: '',
      propertyValue: `₦${inv.amount?.toLocaleString() || 0}`
    }));
    
    res.json(properties);
  } catch (error) {
    console.error('Error fetching user properties:', error);
    res.status(500).json({ error: 'Failed to fetch user properties' });
  }
});

// Create investment
app.post('/api/investments', async (req, res) => {
  try {
    const investmentData = req.body;
    
    // Find investor by ID or email
    let investorDoc = await db.collection('users').doc(investmentData.investorId).get();
    
    if (!investorDoc.exists) {
      const investorQuery = await db.collection('users').where('email', '==', investmentData.investorId).get();
      if (!investorQuery.empty) {
        investorDoc = investorQuery.docs[0];
      }
    }
    
    if (!investorDoc.exists) {
      return res.status(404).json({ error: 'Investor not found' });
    }
    
    // Create new investment
    const investmentRef = await db.collection('investments').add({
      user_id: investorDoc.id,
      user_email: investorDoc.data().email,
      projectTitle: investmentData.projectTitle,
      projectId: investmentData.projectId,
      sqm_purchased: investmentData.sqm,
      amount: investmentData.amount,
      location: investmentData.location,
      description: investmentData.description,
      payment_reference: investmentData.paymentReference,
      status: investmentData.status || 'successful',
      created_at: new Date(),
      updated_at: new Date()
    });
    
    console.log('Investment created successfully:', investmentRef.id);
    
    res.json({ 
      success: true, 
      message: 'Investment created successfully',
      investmentId: investmentRef.id
    });
  } catch (error) {
    console.error('Error creating investment:', error);
    res.status(500).json({ error: 'Failed to create investment' });
  }
});

// Paystack verification endpoint - CRITICAL FOR PAYMENTS
app.get('/api/verify-paystack/:reference', async (req, res) => {
  try {
    const { reference } = req.params;
    
    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
        }
      }
    );
    
    if (response.data.status && response.data.data.status === 'success') {
      res.json({ 
        success: true, 
        data: response.data.data,
        message: 'Payment verified successfully'
      });
    } else {
      res.status(400).json({ 
        success: false, 
        message: 'Payment not successful',
        data: response.data.data
      });
    }
  } catch (error) {
    console.error('Paystack verification error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Payment verification failed',
      error: error.message 
    });
  }
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Subx Firebase Backend API',
    version: '2.0.0',
    database: 'Firebase Firestore',
    status: 'running',
    endpoints: {
      health: '/api/health',
      users: {
        count: '/api/users/count',
        getById: '/api/users/:userId',
        properties: '/api/users/:userId/properties'
      },
      investments: {
        create: '/api/investments'
      },
      payments: {
        verify: '/api/verify-paystack/:reference'
      }
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
const startServer = async () => {
  try {
    const server = app.listen(port, () => {
      console.log(`🚀 Firebase Backend running at http://localhost:${port}`);
      console.log(`📊 Database: Firebase Firestore`);
      console.log(`🔐 Authentication: Firebase Auth`);
      console.log(`✅ No MongoDB dependencies`);
    });

    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`Port ${port} is in use. Please free up the port or use a different one.`);
        process.exit(1);
      } else {
        console.error('Error starting server:', error);
        process.exit(1);
      }
    });
  } catch (error) {
    console.error('Error starting server:', error);
    process.exit(1);
  }
};

// Start server
startServer();

export default app;
