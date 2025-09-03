import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';
import { Developer } from './models/Developer.js';
import { Project } from './models/Project.js';
import { Admin } from './models/Admin.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Investment } from './models/Investment.js';
import OpenAI from 'openai';
import { adminRouter } from './routes/admin.js';
import { notificationsRouter } from './routes/notifications.js';
import { verificationRouter } from './routes/verification.js';
import { activitiesRouter } from './routes/activities.js';
import axios from 'axios';
import { documentsRouter } from './routes/documents.js';
import { forumRouter } from './routes/forum.js';
import { referralRouter } from './routes/referral.js';
import emailRouter from './routes/email.js';
import { Investor } from './models/Investor.js';
import { Connection } from './models/Connection.js';
import nodemailer from 'nodemailer';
import telegramBot from './services/telegramBot.js';
// Supabase authentication service
import { supabase } from './supabase.js';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize OpenAI client
const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
}) : null;

// Email transporter setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com',
    pass: process.env.EMAIL_PASS || 'your-app-password'
  }
});

// Send welcome email function
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
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
              <h3 style="color: #333; margin-top: 0;">What you can do now:</h3>
              <ul style="color: #666; line-height: 1.8;">
                <li>Browse available property investment opportunities</li>
                <li>Connect with developers and other investors</li>
                <li>Track your investment portfolio</li>
                <li>Receive notifications about new listings</li>
                <li>Join our community forum</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://subx-825e9.web.app/dashboard/investor" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; display: inline-block; font-weight: bold;">
                Go to Your Dashboard
              </a>
            </div>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              We'll keep you updated with the latest investment opportunities and market insights. 
              If you have any questions, feel free to reach out to our support team.
            </p>
            
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

const app = express();
const port = process.env.PORT || 30002;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Connect to MongoDB
connectDB();

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
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
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

// Input validation middleware
app.use((req, res, next) => {
  // Check request size
  const contentLength = parseInt(req.headers['content-length'] || '0');
  if (contentLength > 10 * 1024 * 1024) { // 10MB limit
    return res.status(413).json({ error: 'Request entity too large' });
  }
  
  // Sanitize request body
  if (req.body) {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        req.body[key] = req.body[key].trim().replace(/[<>]/g, '');
      }
    });
  }
  
  // Sanitize query parameters
  if (req.query) {
    Object.keys(req.query).forEach(key => {
      if (typeof req.query[key] === 'string') {
        req.query[key] = req.query[key].trim().replace(/[<>]/g, '');
      }
    });
  }
  
  next();
});

// Mount routes
app.use('/api/admin', adminRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/verification', verificationRouter);
app.use('/api/activities', activitiesRouter);
app.use('/api/documents', documentsRouter);
app.use('/api/forum', forumRouter);
app.use('/api/referral', referralRouter);
app.use('/api/email', emailRouter);

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, 'uploads'));
  },
  filename: (req, file, cb) => {
    // Sanitize filename to prevent path traversal
    const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, `${Date.now()}-${sanitizedName}`);
  }
});

const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    // Allow only specific file types
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and PDF files are allowed.'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 1 // Only 1 file per request
  }
});

// Supabase token verification middleware
const supabaseAuthMiddleware = async (req, res, next) => {
  try {
    const header = req.header('Authorization') || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data?.user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Normalize to existing shape
    req.user = {
      uid: data.user.id,
      email: data.user.email,
    };

    next();
  } catch (err) {
    console.error('Supabase auth error:', err);
    res.status(500).json({ error: 'Authentication failed' });
  }
};

// Admin authentication middleware
const adminAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    // Verify Supabase JWT token
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data?.user) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    const decodedToken = data.user;

    // Check if user is admin in database
    const admin = await Admin.findOne({ email: decodedToken.email });
    if (!admin) {
      return res.status(401).json({ error: 'Not authorized as admin' });
    }

    req.admin = admin;
    req.user = {
      uid: decodedToken.id,
      email: decodedToken.email,
      role: 'admin'
    };
    next();
  } catch (error) {
    console.error('Admin auth middleware error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Investor authentication middleware
const investorAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    // Verify Supabase JWT token
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data?.user) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    const decodedToken = data.user;

    // Check if user is investor in database
    const investor = await Investor.findOne({ email: decodedToken.email });
    if (!investor) {
      return res.status(401).json({ error: 'Not authorized as investor' });
    }

    req.investor = investor;
    req.user = {
      uid: decodedToken.id,
      email: decodedToken.email,
      role: 'investor'
    };
    next();
  } catch (error) {
    console.error('Investor auth middleware error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Developer routes
app.post('/api/developers/register', upload.single('logo'), async (req, res) => {
  try {
    console.log('Received registration request:', req.body);
    
    const { 
      name, 
      company, 
      email, 
      password,
      phone, 
      website, 
      bio, 
      isSubscribed,
      minUnits,
      maxUnits,
      unitPrice,
      investmentFocus,
      completedProjects,
      yearsOfExperience,
      certifications,
      socialLinks
    } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['name', 'email', 'password']
      });
    }

    // Check if developer already exists
    const existingDeveloper = await Developer.findOne({ email });
    if (existingDeveloper) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    // Safely parse JSON fields
    const parseJsonField = (field, defaultValue = []) => {
      if (!field) return defaultValue;
      
      // If it's already an array, return it
      if (Array.isArray(field)) return field;
      
      // If it's already an object, return it
      if (typeof field === 'object') return field;
      
      // If it's a string, try to parse it
      if (typeof field === 'string') {
        try {
          // First try to parse as JSON
          return JSON.parse(field);
        } catch (error) {
          // If it's a comma-separated string, split it
          if (field.includes(',')) {
            return field.split(',').map(item => item.trim());
          }
          // Otherwise return as single item array
          return [field];
        }
      }
      
      return defaultValue;
    };

    // Parse fields with logging
    console.log('Parsing investment focus:', investmentFocus);
    const parsedInvestmentFocus = parseJsonField(investmentFocus);
    console.log('Parsed investment focus:', parsedInvestmentFocus);

    console.log('Parsing completed projects:', completedProjects);
    const parsedCompletedProjects = parseJsonField(completedProjects);
    console.log('Parsed completed projects:', parsedCompletedProjects);

    console.log('Parsing certifications:', certifications);
    const parsedCertifications = parseJsonField(certifications);
    console.log('Parsed certifications:', parsedCertifications);

    console.log('Parsing social links:', socialLinks);
    const parsedSocialLinks = parseJsonField(socialLinks, {});
    console.log('Parsed social links:', parsedSocialLinks);

    const developer = new Developer({
      name,
      company,
      email,
      password: hashedPassword,
      phone,
      website,
      bio,
      imageUrl,
      isSubscribed: isSubscribed === 'true',
      minUnits: parseInt(minUnits) || 1,
      maxUnits: parseInt(maxUnits) || 1000000,
      unitPrice: parseInt(unitPrice) || 0,
      investmentFocus: parsedInvestmentFocus,
      completedProjects: parsedCompletedProjects,
      yearsOfExperience: parseInt(yearsOfExperience) || 0,
      certifications: parsedCertifications,
      socialLinks: parsedSocialLinks
    });

    console.log('Creating developer:', developer);

    await developer.save();

    // Send welcome email (in background, don't wait for it)
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      sendWelcomeEmail(developer).catch(err => console.error('Welcome email error:', err));
    }

    // Generate token
    const token = jwt.sign({ id: developer._id }, JWT_SECRET);

    res.status(201).json({ 
      message: 'Developer registered successfully',
      developer,
      token
    });
  } catch (error) {
    console.error('Error registering developer:', error);
    res.status(500).json({ 
      error: 'Failed to register developer',
      details: error.message 
    });
  }
});

app.post('/api/developers/login', async (req, res) => {
  try {
    const { email } = req.body;
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'Supabase token required' });
    }

    // Verify Supabase token
    console.log('Received token length:', token ? token.length : 0);
    console.log('Token starts with:', token ? token.substring(0, 20) + '...' : 'null');
    
    const decodedToken = await auth.verifyIdToken(token);
    if (!decodedToken || decodedToken.email !== email) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Find developer
    const developer = await Developer.findOne({ email });
    if (!developer) {
      return res.status(401).json({ error: 'Developer not found' });
    }

    // Return success response
    res.json({
      message: 'Login successful',
      developer: {
        id: developer._id,
        name: developer.name,
        email: developer.email,
        company: developer.company,
        isSubscribed: developer.isSubscribed
      },
      token: token // Return the Supabase token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
});

app.get('/api/developers', async (req, res) => {
  try {
    const developers = await Developer.find().select('-password');
    res.json(developers);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch developers' });
  }
});

app.get('/api/developers/:id', async (req, res) => {
  try {
    const developer = await Developer.findById(req.params.id).select('-password');
    if (!developer) {
      return res.status(404).json({ error: 'Developer not found' });
    }
    res.json(developer);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch developer' });
  }
});

app.put('/api/developers/:id', adminAuth, upload.single('logo'), async (req, res) => {
  try {
    const updates = req.body;
    if (req.file) {
      updates.imageUrl = `/uploads/${req.file.filename}`;
    }

    const developer = await Developer.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    if (!developer) {
      return res.status(404).json({ error: 'Developer not found' });
    }

    res.json({ 
      message: 'Developer updated successfully',
      developer
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update developer' });
  }
});

app.delete('/api/developers/:id', adminAuth, async (req, res) => {
  try {
    const developer = await Developer.findByIdAndDelete(req.params.id);
    if (!developer) {
      return res.status(404).json({ error: 'Developer not found' });
    }
    res.json({ message: 'Developer deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete developer' });
  }
});

// Project routes
app.post('/api/projects', supabaseAuthMiddleware, upload.array('images', 5), async (req, res) => {
  try {
    const { title, description, location, type, units } = req.body;
    const imageUrls = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];

    const project = new Project({
      title,
      description,
      location,
      type,
      imageUrls,
      developerId: req.user.uid,
      units: JSON.parse(units)
    });

    await project.save();
    res.status(201).json({ message: 'Project created successfully', project });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create project' });
  }
});

app.get('/api/projects', async (req, res) => {
  try {
    // Fetch all projects from Supabase
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('*')
      .order('id');

    if (projectsError) {
      console.error('Error fetching projects:', projectsError);
      return res.status(500).json({ error: 'Failed to fetch projects' });
    }

    // Fetch investments for each project to calculate available sq.m
    const { data: investments, error: investmentsError } = await supabase
      .from('investments')
      .select('project_id, sqm_purchased')
      .eq('status', 'completed');

    if (investmentsError) {
      console.error('Error fetching investments:', investmentsError);
      // Don't fail if investments table is empty
    }

          // Calculate available sq.m for each project
      const projectsWithAvailableSqm = projects.map(project => {
        let availableSqm;
        
                // For all plots, calculate available SQM dynamically from investments
        const plotInvestments = investments ? investments.filter(inv => inv.project_id === project.id && inv.status === 'completed') : [];
        const totalPurchasedSqm = plotInvestments.reduce((sum, inv) => sum + (inv.sqm_purchased || 0), 0);
        availableSqm = Math.max(0, project.total_sqm - totalPurchasedSqm);
      
      return {
        id: project.id,
        title: project.title,
        description: project.description,
        location: project.location,
        totalSqm: project.total_sqm,
        availableSqm: availableSqm,
        price: `₦${project.price_per_sqm.toLocaleString()}/sq.m`,
        price_per_sqm: project.price_per_sqm,
        status: availableSqm > 0 ? 'Available' : 'Sold Out',
        amenities: project.amenities || [],
        imageUrls: project.image_urls || [],
        type: 'residential',
        propertyType: 'residential',
        priceRange: `₦${project.price_per_sqm.toLocaleString()} - ₦${project.price_per_sqm.toLocaleString()} per sqm`,
        targetMarket: 'Middle to high-income individuals',
        completionDate: '2025-12-31T00:00:00.000Z',
        roi: '15-20% annually',
        riskLevel: 'low',
        minInvestment: project.price_per_sqm,
        maxInvestment: project.total_sqm * project.price_per_sqm,
        soldUnits: project.total_sqm - availableSqm,
        startDate: '2024-01-01T00:00:00.000Z',
        expectedCompletion: '2025-12-31T00:00:00.000Z',
        investors: plotInvestments.length,
        totalInvestment: `₦${(project.total_sqm - availableSqm) * project.price_per_sqm}`,
        createdAt: project.created_at,
        updatedAt: project.updated_at
      };
    });

    res.json(projectsWithAvailableSqm);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/projects/:developerId', async (req, res) => {
  try {
    const projects = await Project.find({ developerId: req.params.developerId })
      .populate('developerId', 'name company');
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch developer projects' });
  }
});

// Investor routes
app.post('/api/investors', async (req, res) => {
  try {
    const { name, email, password, phone, bio, investmentInterests, googleId } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    // Check if email already exists
    const existing = await Investor.findOne({ email });
    if (existing) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    let hashedPassword = undefined;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    // For Google signup, allow missing password, phone, bio, investmentInterests
    const investor = new Investor({
      name,
      email,
      password: hashedPassword,
      phone,
      bio,
      investmentInterests,
      googleId
    });
    
    await investor.save();

    // Send welcome email (in background, don't wait for it)
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      sendWelcomeEmail(investor).catch(err => console.error('Welcome email error:', err));
    }

    // Send Telegram welcome notification (in background)
    try {
      // Get user's referral code from Supabase
      const { data: userProfile, error: profileError } = await supabase
        .from('user_profiles')
        .select('referral_code')
        .eq('user_id', investor.supabase_id)
        .single();
      
      const referralCode = userProfile?.referral_code || 'N/A';
      
      await telegramBot.sendWelcomeMessage({
        id: investor._id,
        email: investor.email,
        name: investor.name,
        referral_code: referralCode
      });
      console.log('Telegram welcome notification sent successfully');
    } catch (telegramError) {
      console.error('Failed to send Telegram welcome notification:', telegramError);
      // Don't fail the request if Telegram notification fails
    }

    res.status(201).json({ 
      message: 'Investor created successfully', 
      investor: { ...investor.toObject(), password: undefined } 
    });
  } catch (error) {
    console.error('Error creating investor:', error);
    res.status(500).json({ error: 'Failed to create investor' });
  }
});

app.get('/api/investors', (req, res) => {
  try {
  res.json(investors);
  } catch (error) {
    console.error('Error fetching investors:', error);
    res.status(500).json({ error: 'Failed to fetch investors' });
  }
});

// Investor login via Supabase token
app.post('/api/investors/login', async (req, res) => {
  try {
    const header = req.header('Authorization') || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) {
      return res.status(401).json({ error: 'Supabase token required' });
    }

    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data?.user) {
      return res.status(401).json({ error: 'Invalid Supabase token' });
    }

    const supaUser = data.user;

    // Find or create investor using Supabase user id/email
    let investor = await Investor.findOne({
      $or: [
        { supabase_id: supaUser.id }, // Updated to use Supabase ID
        { email: supaUser.email }
      ]
    });

    if (!investor) {
      investor = new Investor({
        supabase_id: supaUser.id,
        name: supaUser.user_metadata?.name || (supaUser.email?.split('@')[0]) || 'User',
        email: supaUser.email || '',
        password: 'supabase-auth',
        phone: '',
        bio: '',
        investmentInterests: 'Real estate',
        isApproved: true
      });
      await investor.save();
      
      // Send Telegram welcome notification for new user (in background)
      try {
        // Get user's referral code from Supabase
        const { data: userProfile, error: profileError } = await supabase
          .from('user_profiles')
          .select('referral_code')
          .eq('user_id', supaUser.id)
          .single();
        
        const referralCode = userProfile?.referral_code || 'N/A';
        
        await telegramBot.sendWelcomeMessage({
          id: investor._id,
          email: investor.email,
          name: investor.name,
          referral_code: referralCode
        });
        console.log('Telegram welcome notification sent for new login user');
      } catch (telegramError) {
        console.error('Failed to send Telegram welcome notification:', telegramError);
        // Don't fail the request if Telegram notification fails
      }
    } else if (!investor.supabase_id) {
      investor.supabase_id = supaUser.id;
      await investor.save();
    }

    res.json({
      message: 'Login successful',
      user: {
        id: investor._id,
        name: investor.name,
        email: investor.email,
        supabase_id: investor.supabase_id
      },
      token
    });
  } catch (error) {
    console.error('Supabase investor login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
});

// Phone lookup for login
app.post('/api/phone-lookup', async (req, res) => {
  try {
    const { phone } = req.body;
    
    if (!phone) {
      return res.status(400).json({ error: 'Phone number is required' });
    }
    
    // Look up investor by phone number
    const investor = await Investor.findOne({ phone });
    
    if (!investor) {
      return res.status(404).json({ error: 'Phone number not found' });
    }
    
    // Return the Supabase email associated with this phone number
    // For phone signups, we stored a unique email in tempUserEmail format
    res.json({ 
              email: investor.email, // This should be the Supabase email used during signup
      userId: investor._id 
    });
  } catch (error) {
    console.error('Phone lookup error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Investment routes
app.post('/api/investments/request', supabaseAuthMiddleware, async (req, res) => {
  try {
    const { projectId, units, notes } = req.body;
    const investorId = req.user.uid; // Assuming auth middleware sets req.user

    // Validate required fields
    if (!projectId || !units) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['projectId', 'units']
      });
    }

    // Get project details
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Validate units
    if (units < 1) {
      return res.status(400).json({ error: 'Minimum 1 unit required' });
    }

    if (units > project.units.available) {
      return res.status(400).json({ error: 'Requested units exceed available units' });
    }

    // Calculate investment amount
    const amount = units * project.units.price;

    // Create investment request
    const investment = new Investment({
      projectId,
      developerId: project.developerId,
      investorId,
      units,
      amount,
      notes
    });

    await investment.save();

    // Update project available units
    project.units.available -= units;
    await project.save();

    res.status(201).json({
      message: 'Investment request submitted successfully',
      investment
    });
  } catch (error) {
    console.error('Error submitting investment request:', error);
    res.status(500).json({
      error: 'Failed to submit investment request',
      details: error.message
    });
  }
});

// Connection routes
app.post('/api/connections/request', async (req, res) => {
  try {
    const { investorId, developerId, projectId, units, investmentAmount, notes } = req.body;
    
    // Validate required fields
    if (!investorId || !developerId || !projectId || !units || !investmentAmount) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['investorId', 'developerId', 'projectId', 'units', 'investmentAmount']
      });
    }

    // Create connection request
    const connectionRequest = {
      id: Date.now().toString(),
      investorId,
      developerId,
      projectId,
      units: parseInt(units),
      investmentAmount: parseInt(investmentAmount),
      notes: notes || '',
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    connections.push(connectionRequest);
    res.json({ 
      message: 'Connection request sent successfully',
      request: connectionRequest
    });
  } catch (error) {
    console.error('Error creating connection request:', error);
    res.status(500).json({ error: 'Failed to create connection request' });
  }
});

app.get('/api/connections/:investorId', (req, res) => {
  try {
    const { investorId } = req.params;
    const investorConnections = connections.filter(
      (connection) => connection.investorId === investorId
    );
    res.json(investorConnections);
  } catch (error) {
    console.error('Error fetching connections:', error);
    res.status(500).json({ error: 'Failed to fetch connections' });
  }
});

// Admin routes
// Admin dashboard routes
app.get('/api/admin/dashboard', adminAuth, async (req, res) => {
  try {
    const totalDevelopers = await Developer.countDocuments();
    const totalInvestors = await Investor.countDocuments();
    const totalProjects = await Project.countDocuments();
    const totalInvestments = await Investment.countDocuments();

    const recentProjects = await Project.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('developer', 'name company');

    const recentInvestments = await Investment.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('investor', 'name')
      .populate('project', 'title');

    res.json({
      stats: {
        totalDevelopers,
        totalInvestors,
        totalProjects,
        totalInvestments
      },
      recentProjects,
      recentInvestments
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Project approval routes
app.put('/api/admin/projects/:id/approve', adminAuth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    project.status = 'approved';
    await project.save();

    res.json({ message: 'Project approved successfully', project });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/admin/projects/:id/reject', adminAuth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    project.status = 'rejected';
    project.rejectionReason = req.body.reason;
    await project.save();

    res.json({ message: 'Project rejected successfully', project });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// User management routes
app.get('/api/admin/users', adminAuth, async (req, res) => {
  try {
    const developers = await Developer.find().select('-password');
    const investors = await Investor.find().select('-password');
    
    res.json({ developers, investors });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/admin/users/:id/status', adminAuth, async (req, res) => {
  try {
    const { type, status } = req.body;
    let user;

    if (type === 'developer') {
      user = await Developer.findById(req.params.id);
    } else if (type === 'investor') {
      user = await Investor.findById(req.params.id);
    } else {
      return res.status(400).json({ error: 'Invalid user type' });
    }

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.status = status;
    await user.save();

    res.json({ message: 'User status updated successfully', user });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// AI Analysis endpoint for developments
app.post('/api/developments/analyze', supabaseAuthMiddleware, async (req, res) => {
  try {
    const { developmentId } = req.body;
    
    // Find the development
    const development = await Project.findById(developmentId);
    if (!development) {
      return res.status(404).json({ error: 'Development not found' });
    }

    // Perform AI analysis
    const analysis = {
      marketAnalysis: await analyzeMarket(development),
      riskAssessment: await assessRisks(development),
      investmentPotential: await evaluateInvestmentPotential(development),
      recommendations: await generateRecommendations(development)
    };

    res.json(analysis);
  } catch (error) {
    console.error('AI Analysis error:', error);
    res.status(500).json({ error: 'Failed to analyze development' });
  }
});

// AI Analysis helper functions
async function analyzeMarket(development) {
  try {
    const prompt = `Analyze the real estate market for a ${development.propertyType} property in ${development.location}. 
    Consider the following details:
    - Property Type: ${development.propertyType}
    - Location: ${development.location}
    - Price Range: ${development.priceRange}
    - Target Market: ${development.targetMarket}
    - Amenities: ${development.amenities?.join(', ')}
    
    Provide a detailed market analysis focusing on:
    1. Current market trends
    2. Demand and supply dynamics
    3. Price trends
    4. Growth potential
    5. Market challenges and opportunities`;

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a real estate market analysis expert. Provide detailed, data-driven analysis."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 500
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('Market analysis error:', error);
    return 'Unable to perform market analysis at this time.';
  }
}

async function assessRisks(development) {
  try {
    const prompt = `Assess the risks associated with a ${development.propertyType} property in ${development.location}. 
    Consider the following details:
    - Property Type: ${development.propertyType}
    - Location: ${development.location}
    - Construction Status: ${development.constructionStatus}
    - Timeline: ${development.timeline}
    - Investment Amount: ${development.investmentAmount}
    
    Provide a comprehensive risk assessment covering:
    1. Market risks
    2. Construction risks
    3. Financial risks
    4. Regulatory risks
    5. Risk mitigation strategies`;

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a real estate risk assessment expert. Provide detailed risk analysis and mitigation strategies."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 500
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('Risk assessment error:', error);
    return 'Unable to perform risk assessment at this time.';
  }
}

async function evaluateInvestmentPotential(development) {
  try {
    const prompt = `Evaluate the investment potential of a ${development.propertyType} property in ${development.location}. 
    Consider the following details:
    - Property Type: ${development.propertyType}
    - Location: ${development.location}
    - Expected ROI: ${development.expectedROI}
    - Investment Amount: ${development.investmentAmount}
    - Market Conditions: ${development.marketConditions}
    
    Provide a detailed investment potential analysis covering:
    1. Expected returns
    2. Investment timeline
    3. Market opportunities
    4. Competitive advantages
    5. Investment recommendations`;

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a real estate investment expert. Provide detailed investment potential analysis and recommendations."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 500
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('Investment potential evaluation error:', error);
    return 'Unable to evaluate investment potential at this time.';
  }
}

async function generateRecommendations(development) {
  try {
    const prompt = `Generate investment recommendations for a ${development.propertyType} property in ${development.location}. 
    Consider the following details:
    - Property Type: ${development.propertyType}
    - Location: ${development.location}
    - Investment Amount: ${development.investmentAmount}
    - Target Market: ${development.targetMarket}
    - Market Conditions: ${development.marketConditions}
    
    Provide comprehensive recommendations covering:
    1. Investment strategy
    2. Risk management
    3. Portfolio diversification
    4. Market timing
    5. Exit strategies`;

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a real estate investment advisor. Provide detailed investment recommendations and strategies."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 500
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('Recommendations generation error:', error);
    return 'Unable to generate recommendations at this time.';
  }
}

// Admin profile routes
app.get('/api/admin/profile', adminAuth, async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin._id).select('-password');
    res.json(admin);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/admin/profile', adminAuth, async (req, res) => {
  try {
    const { name, phone, bio, settings } = req.body;
    const admin = await Admin.findById(req.admin._id);
    
    if (name) admin.name = name;
    if (phone) admin.phone = phone;
    if (bio) admin.bio = bio;
    if (settings) admin.settings = { ...admin.settings, ...settings };
    
    await admin.save();
    res.json({ message: 'Profile updated successfully', admin });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

app.put('/api/admin/settings', adminAuth, async (req, res) => {
  try {
    const { emailNotifications, pushNotifications, darkMode, language } = req.body;
    const admin = await Admin.findById(req.admin._id);
    
    admin.settings = {
      emailNotifications: emailNotifications ?? admin.settings.emailNotifications,
      pushNotifications: pushNotifications ?? admin.settings.pushNotifications,
      darkMode: darkMode ?? admin.settings.darkMode,
      language: language ?? admin.settings.language
    };
    
    await admin.save();
    res.json({ message: 'Settings updated successfully', settings: admin.settings });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/admin/profile/image', adminAuth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const admin = await Admin.findById(req.admin._id);
    admin.imageUrl = `/uploads/${req.file.filename}`;
    await admin.save();

    res.json({ message: 'Profile image updated successfully', imageUrl: admin.imageUrl });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Investor profile endpoint (returns current investor by token)
app.get('/api/investors/profile', investorAuth, async (req, res) => {
  try {
    const investor = await Investor.findById(req.investor._id).select('-password');
    if (!investor) {
      return res.status(404).json({ error: 'Investor not found' });
    }
    res.json(investor);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch investor profile' });
  }
});

// Public user count endpoint (place BEFORE dynamic :userId to avoid route shadowing)
app.get('/api/users/count', async (req, res) => {
  try {
    const investorCount = await Investor.countDocuments();
    const developerCount = await Developer.countDocuments();
    const totalUsers = investorCount + developerCount;
    res.json({
      totalUsers,
      investors: investorCount,
      developers: developerCount,
      message: `Total registered users: ${totalUsers}`
    });
  } catch (error) {
    console.error('Error getting user count:', error);
    res.status(500).json({ error: 'Failed to get user count' });
  }
});

// Get user by ID (for dashboard)
app.get('/api/users/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Try to find investor by Supabase ID first, then by email
    let investor = await Investor.findOne({ 
      $or: [
        { supabase_id: userId },
        { email: userId }
      ]
    });
    
    if (!investor) {
      // Return basic user info if not found in database
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
    
    // Calculate portfolio stats
    const investments = await Investment.find({ investorId: investor._id });
    const totalInvested = investments.reduce((sum, inv) => sum + (inv.amount || 0), 0);
    const totalSqm = investments.reduce((sum, inv) => sum + (inv.sqm || 0), 0);
    
    console.log('User data found:', {
      name: investor.name,
      email: investor.email,
      investments: investments.length,
      totalInvested,
      totalSqm
    });
    
    res.json({
      name: investor.name,
      email: investor.email,
      avatar: investor.avatar || '',
      portfolioValue: `₦${totalInvested.toLocaleString()}`,
      totalLandOwned: `${totalSqm} sqm`,
      totalInvestments: investments.length,
      recentActivity: investments.map(inv => ({
        id: inv._id,
        title: inv.projectTitle || 'Investment',
        sqm: inv.sqm || 0,
        amount: `₦${inv.amount?.toLocaleString() || 0}`,
        date: inv.createdAt?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
        status: 'owned',
        location: inv.location || 'Nigeria'
      }))
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user data' });
  }
});

// Get user properties (investments)
app.get('/api/users/:userId/properties', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Try to find investor by Supabase ID first, then by email
    let investor = await Investor.findOne({ 
      $or: [
        { supabase_id: userId },
        { email: userId }
      ]
    });
    
    if (!investor) {
      return res.json([]);
    }
    
    // Get investor's investments
    const investments = await Investment.find({ investorId: investor._id });
    
    console.log('User properties found:', {
      investorId: investor._id,
      investments: investments.length
    });
    
    const properties = investments.map(inv => ({
      id: inv._id,
      title: inv.projectTitle || 'Investment',
      sqm: inv.sqm || 0,
      amount: `₦${inv.amount?.toLocaleString() || 0}`,
      date: inv.createdAt?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
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

// Update user profile
app.put('/api/users/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const updateData = req.body;
    
    // Try to find investor by Supabase ID first, then by email
    let investor = await Investor.findOne({ 
      $or: [
        { supabase_id: userId },
        { email: userId }
      ]
    });

    // If still not found, try by provided email in payload
    if (!investor && updateData?.email) {
      investor = await Investor.findOne({ email: updateData.email });
      if (investor && !investor.supabase_id && !userId.includes('@')) {
        investor.supabase_id = userId;
      }
    }
    
    if (!investor) {
      // Create new investor if they don't exist
      console.log('Creating new investor for:', userId);
      investor = new Investor({
        supabase_id: userId.includes('@') ? undefined : userId,
        name: updateData.name || 'User',
        email: updateData.email || userId,
        password: 'supabase-auth', // Required field
        phone: updateData.phone || '',
        bio: updateData.bio || '',
        investmentInterests: 'Real estate',
        isApproved: true
      });
    } else {
      // Update existing investor data
      Object.assign(investor, updateData);
    }
    
    await investor.save();
    
    console.log('Profile updated successfully:', {
      id: investor._id,
      name: investor.name,
      email: investor.email
    });
    
    res.json({ message: 'Profile updated successfully', investor });
  } catch (error) {
    console.error('Error updating user:', error);
    if (error.code === 11000) {
      return res.status(409).json({ error: 'Email already exists' });
    }
    res.status(500).json({ error: 'Failed to update user profile' });
  }
});

// Create investment endpoint
app.post('/api/investments', async (req, res) => {
  try {
    const investmentData = req.body;
    
    // Find investor by Supabase ID first, then by email
    let investor = await Investor.findOne({ supabase_id: investmentData.investorId });
    
    if (!investor) {
      // If not found by Supabase ID, try by email (for real users)
      investor = await Investor.findOne({ email: investmentData.investorId });
    }
    
    if (!investor) {
      return res.status(404).json({ error: 'Investor not found' });
    }
    
    // Create new investment
    const investment = new Investment({
      investorId: investor._id,
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
    
    await investment.save();
    
    console.log('Investment created successfully:', {
      investorId: investor._id,
      projectTitle: investmentData.projectTitle,
      amount: investmentData.amount,
      paymentReference: investmentData.paymentReference
    });

    // Sync investment to Supabase for payment webhook
    try {
      const { error: supabaseError } = await supabase.rpc('sync_investment_to_supabase', {
        p_user_id: investor.supabase_id,
        p_project_id: investmentData.projectId,
        p_sqm_purchased: investmentData.sqm,
        p_amount: investmentData.amount,
        p_payment_reference: investmentData.paymentReference,
        p_project_title: investmentData.projectTitle,
        p_location: investmentData.location
      });
      
      if (supabaseError) {
        console.error('Failed to sync investment to Supabase:', supabaseError);
      } else {
        console.log('Investment synced to Supabase successfully');
      }
    } catch (syncError) {
      console.error('Error syncing to Supabase:', syncError);
    }

    // Send Telegram notification for successful purchase
    try {
      await telegramBot.sendPurchaseNotification(investmentData, {
        email: investor.email,
        name: investor.name
      });
      console.log('Telegram notification sent successfully');
    } catch (telegramError) {
      console.error('Failed to send Telegram notification:', telegramError);
      // Don't fail the request if Telegram notification fails
    }
    
    res.json({ 
      success: true, 
      message: 'Investment created successfully',
      investment 
    });
  } catch (error) {
    console.error('Error creating investment:', error);
    
    // Send error notification to Telegram (in background)
    try {
      await telegramBot.sendErrorNotification(error, 'Investment Creation');
    } catch (telegramError) {
      console.error('Failed to send Telegram error notification:', telegramError);
    }
    
    res.status(500).json({ error: 'Failed to create investment' });
  }
});



// Paystack verification endpoint
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

// Test Telegram bot endpoint
app.post('/api/test-telegram', async (req, res) => {
  try {
    const { type, data } = req.body;
    
    switch (type) {
      case 'purchase':
        await telegramBot.sendPurchaseNotification(data, {
          email: data.investorId,
          name: 'Test User'
        });
        break;
      case 'welcome':
        await telegramBot.sendWelcomeMessage(data);
        break;
      case 'error':
        await telegramBot.sendErrorNotification(new Error(data.message), data.context);
        break;
      default:
        await telegramBot.sendMessage('🧪 Test message from Subx backend!');
    }
    
    res.json({ success: true, message: 'Telegram test message sent successfully' });
  } catch (error) {
    console.error('Telegram test error:', error);
    res.status(500).json({ error: 'Failed to send test message' });
  }
});

// Public user count endpoint (no authentication required)
app.get('/api/users/count', async (req, res) => {
  try {
    const investorCount = await Investor.countDocuments();
    const developerCount = await Developer.countDocuments();
    const totalUsers = investorCount + developerCount;
    
    res.json({ 
      totalUsers,
      investors: investorCount,
      developers: developerCount,
      message: `Total registered users: ${totalUsers}`
    });
  } catch (error) {
    console.error('Error getting user count:', error);
    res.status(500).json({ error: 'Failed to get user count' });
  }
});

// Root path handler
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Subx API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      developers: {
        register: '/api/developers/register',
        login: '/api/developers/login',
        list: '/api/developers',
        getById: '/api/developers/:id'
      },
      projects: {
        list: '/api/projects',
        getByDeveloper: '/api/projects/:developerId'
      }
    }
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Add error handling for port in use
const startServer = async () => {
  try {
    const server = app.listen(port, () => {
      console.log(`Server running at http://localhost:${port}`);
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

// Start server after MongoDB connection
startServer(); 

// Paystack payment verification endpoint
app.get('/api/verify-paystack/:reference', async (req, res) => {
  const { reference } = req.params;
  try {
    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
        }
      }
    );
    if (response.data.status && response.data.data.status === 'success') {
      res.json({ success: true, data: response.data.data });
    } else {
      res.status(400).json({ success: false, message: 'Payment not successful' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Verification failed', error: error.message });
  }
});

// Paystack webhook handler for referral rewards
app.post('/api/webhook/paystack', async (req, res) => {
  try {
    const { event, data } = req.body;
    
    // Verify webhook signature (you should implement this for security)
    // const signature = req.headers['x-paystack-signature'];
    // if (!verifyWebhookSignature(signature, req.body)) {
    //   return res.status(400).json({ error: 'Invalid signature' });
    // }
    
    if (event === 'charge.success') {
      const { reference, amount, customer } = data;
      
      // Find the investment/purchase record
      const { data: investment, error: investmentError } = await supabase
        .from('investments')
        .select('*')
        .eq('payment_reference', reference)
        .single();
      
      if (investmentError || !investment) {
        console.error('Investment not found for reference:', reference);
        return res.status(404).json({ error: 'Investment not found' });
      }
      
      // Process referral reward
      try {
        const { data: rewardProcessed, error: rewardError } = await supabase
          .rpc('process_referral_reward', {
            p_referred_user_id: investment.user_id,
            p_purchase_id: investment.id,
            p_purchase_amount: amount / 100 // Convert from kobo to naira
          });
        
        if (rewardError) {
          console.error('Error processing referral reward:', rewardError);
        } else if (rewardProcessed) {
          console.log('Referral reward processed successfully for user:', investment.user_id);
        }
      } catch (rewardError) {
        console.error('Error in referral reward processing:', rewardError);
      }
    }
    
    res.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// Co-owners endpoint - Get co-owners for a specific property
app.get('/api/co-owners/:propertyId', async (req, res) => {
  try {
    const { propertyId } = req.params;
    
    // Find all investments for this property
    const investments = await Investment.find({ 
      projectId: propertyId,
      status: 'completed'
    }).populate('investorId', 'name email phone');
    
    if (!investments || investments.length === 0) {
      return res.json({ 
        success: true, 
        coOwners: [],
        message: 'No co-owners found for this property' 
      });
    }
    
    // Calculate total investment amount for this property
    const totalAmount = investments.reduce((sum, inv) => sum + inv.amount, 0);
    
    // Create co-owners list with percentages
    const coOwners = investments.map(investment => {
      const percentage = ((investment.amount / totalAmount) * 100).toFixed(1);
      return {
        id: investment.investorId._id,
        name: investment.investorId.name,
        email: investment.investorId.email,
        phone: investment.investorId.phone,
        sqm: investment.sqm,
        amount: investment.amount,
        percentage: parseFloat(percentage),
        purchaseDate: investment.createdAt
      };
    });
    
    // Sort by percentage (highest first)
    coOwners.sort((a, b) => b.percentage - a.percentage);
    
    res.json({
      success: true,
      coOwners,
      totalOwners: coOwners.length,
      totalInvestment: totalAmount,
      message: `Found ${coOwners.length} co-owner(s) for this property`
    });
    
  } catch (error) {
    console.error('Error fetching co-owners:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch co-owners',
      message: error.message 
    });
  }
}); 