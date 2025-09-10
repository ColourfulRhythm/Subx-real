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
// FIREBASE DATA MODELS
// =====================================================

class FirebaseModel {
  constructor(collectionName) {
    this.collection = db.collection(collectionName);
  }

  async create(data) {
    try {
      const docRef = await this.collection.add({
        ...data,
        created_at: new Date(),
        updated_at: new Date()
      });
      return { id: docRef.id, ...data };
    } catch (error) {
      console.error(`Error creating document in ${this.collection.id}:`, error);
      throw error;
    }
  }

  async getById(id) {
    try {
      const doc = await this.collection.doc(id).get();
      if (!doc.exists) {
        return null;
      }
      return { id: doc.id, ...doc.data() };
    } catch (error) {
      console.error(`Error getting document ${id} from ${this.collection.id}:`, error);
      throw error;
    }
  }

  async getByField(field, value) {
    try {
      const snapshot = await this.collection.where(field, '==', value).get();
      if (snapshot.empty) {
        return null;
      }
      const doc = snapshot.docs[0];
      return { id: doc.id, ...doc.data() };
    } catch (error) {
      console.error(`Error getting document by ${field} from ${this.collection.id}:`, error);
      throw error;
    }
  }

  async getAll(limitCount = 100) {
    try {
      const snapshot = await this.collection.limit(limitCount).get();
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error(`Error getting all documents from ${this.collection.id}:`, error);
      throw error;
    }
  }

  async update(id, data) {
    try {
      await this.collection.doc(id).update({
        ...data,
        updated_at: new Date()
      });
      return { id, ...data };
    } catch (error) {
      console.error(`Error updating document ${id} in ${this.collection.id}:`, error);
      throw error;
    }
  }

  async delete(id) {
    try {
      await this.collection.doc(id).delete();
      return { success: true };
    } catch (error) {
      console.error(`Error deleting document ${id} from ${this.collection.id}:`, error);
      throw error;
    }
  }

  async count() {
    try {
      const snapshot = await this.collection.get();
      return snapshot.size;
    } catch (error) {
      console.error(`Error counting documents in ${this.collection.id}:`, error);
      throw error;
    }
  }
}

// Create model instances
const Developer = new FirebaseModel('developers');
const Project = new FirebaseModel('projects');
const Admin = new FirebaseModel('admins');
const Investment = new FirebaseModel('investments');
const Investor = new FirebaseModel('investors');
const Connection = new FirebaseModel('connections');

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
// AUTHENTICATION MIDDLEWARE
// =====================================================

const verifyFirebaseToken = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decodedToken = await auth.verifyIdToken(token);
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      name: decodedToken.name
    };
    next();
  } catch (error) {
    console.error('Firebase token verification error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
};

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

const sendWelcomeEmail = async (user) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER || 'noreply@subx.com',
      to: user.email,
      subject: 'Welcome to Subx - Start Your Property Investment Journey!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 28px;">Welcome to Subx!</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px;">Your property investment journey starts now</p>
          </div>
          
          <div style="padding: 40px; background: #f8f9fa;">
            <h2 style="color: #333; margin-bottom: 20px;">Hello ${user.name},</h2>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              Welcome to Subx! We're excited to have you join our community of property investors. 
              You're now part of a platform that's revolutionizing how people invest in real estate.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://subx-825e9.web.app/dashboard/investor" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; display: inline-block; font-weight: bold;">
                Go to Your Dashboard
              </a>
            </div>
            
            <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px;">
              <p style="color: #999; font-size: 14px; margin: 0;">
                Best regards,<br>
                The Subx Team
              </p>
            </div>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`Welcome email sent to ${user.email}`);
  } catch (error) {
    console.error('Error sending welcome email:', error);
  }
};

// =====================================================
// API ROUTES
// =====================================================

// Health check
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
    const investorCount = await Investor.count();
    const developerCount = await Developer.count();
    const totalUsers = investorCount + developerCount;
    
    res.json({ 
      totalUsers,
      investors: investorCount,
      developers: developerCount,
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
    
    // Try to find investor by ID or email
    let investor = await Investor.getById(userId);
    
    if (!investor) {
      investor = await Investor.getByField('email', userId);
    }
    
    if (!investor) {
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
    
    // Get user's investments
    const investments = await Investment.getAll();
    const userInvestments = investments.filter(inv => inv.user_id === investor.id);
    const totalInvested = userInvestments.reduce((sum, inv) => sum + (inv.amount || 0), 0);
    const totalSqm = userInvestments.reduce((sum, inv) => sum + (inv.sqm || 0), 0);
    
    res.json({
      name: investor.name,
      email: investor.email,
      avatar: investor.avatar || '',
      portfolioValue: `₦${totalInvested.toLocaleString()}`,
      totalLandOwned: `${totalSqm} sqm`,
      totalInvestments: userInvestments.length,
      recentActivity: userInvestments.map(inv => ({
        id: inv.id,
        title: inv.projectTitle || 'Investment',
        sqm: inv.sqm || 0,
        amount: `₦${inv.amount?.toLocaleString() || 0}`,
        date: inv.created_at?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
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
    
    let investor = await Investor.getById(userId);
    if (!investor) {
      investor = await Investor.getByField('email', userId);
    }
    
    if (!investor) {
      return res.json([]);
    }
    
    const investments = await Investment.getAll();
    const userInvestments = investments.filter(inv => inv.user_id === investor.id);
    
    const properties = userInvestments.map(inv => ({
      id: inv.id,
      title: inv.projectTitle || 'Investment',
      sqm: inv.sqm || 0,
      amount: `₦${inv.amount?.toLocaleString() || 0}`,
      date: inv.created_at?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
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
    let investor = await Investor.getById(investmentData.investorId);
    if (!investor) {
      investor = await Investor.getByField('email', investmentData.investorId);
    }
    
    if (!investor) {
      return res.status(404).json({ error: 'Investor not found' });
    }
    
    // Create new investment
    const investment = await Investment.create({
      user_id: investor.id,
      projectTitle: investmentData.projectTitle,
      projectId: investmentData.projectId,
      sqm: investmentData.sqm,
      amount: investmentData.amount,
      location: investmentData.location,
      description: investmentData.description,
      paymentReference: investmentData.paymentReference,
      status: investmentData.status || 'active',
      documents: investmentData.documents || []
    });
    
    console.log('Investment created successfully:', investment);
    
    res.json({ 
      success: true, 
      message: 'Investment created successfully',
      investment 
    });
  } catch (error) {
    console.error('Error creating investment:', error);
    res.status(500).json({ error: 'Failed to create investment' });
  }
});

// Paystack verification
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
