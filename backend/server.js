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
import { Investor } from './models/Investor.js';
import { Connection } from './models/Connection.js';
import nodemailer from 'nodemailer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize OpenAI client
const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
}) : null;

// Email transporter setup
const transporter = nodemailer.createTransporter({
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

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Mount routes
app.use('/api/admin', adminRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/verification', verificationRouter);
app.use('/api/activities', activitiesRouter);
app.use('/api/documents', documentsRouter);

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, 'uploads'));
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage });

// Authentication middleware
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      throw new Error();
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const developer = await Developer.findOne({ _id: decoded.id });
    
    if (!developer) {
      throw new Error();
    }

    req.developer = developer;
    req.token = token;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Please authenticate' });
  }
};

// Admin authentication middleware
const adminAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const admin = await Admin.findById(decoded.id);
    if (!admin) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    req.admin = admin;
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

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    if (decoded.type !== 'investor') {
      return res.status(401).json({ error: 'Invalid token type' });
    }

    const investor = await Investor.findById(decoded.id);
    if (!investor) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    req.investor = investor;
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
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find developer
    const developer = await Developer.findOne({ email });
    if (!developer) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, developer.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate token
    const token = jwt.sign({ id: developer._id }, JWT_SECRET);

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
      token
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

app.put('/api/developers/:id', auth, upload.single('logo'), async (req, res) => {
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

app.delete('/api/developers/:id', auth, async (req, res) => {
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
app.post('/api/projects', auth, upload.array('images', 5), async (req, res) => {
  try {
    const { title, description, location, type, units } = req.body;
    const imageUrls = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];

    const project = new Project({
      title,
      description,
      location,
      type,
      imageUrls,
      developerId: req.developer._id,
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
    const projects = await Project.find().populate('developerId', 'name company');
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch projects' });
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

// Investor login
app.post('/api/investors/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find investor by email
    const investor = await Investor.findOne({ email });
    if (!investor) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, investor.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: investor._id, type: 'investor' }, 
      process.env.JWT_SECRET || 'your-secret-key', 
      { expiresIn: '24h' }
    );

    res.json({
      token,
      investor: {
        id: investor._id,
        name: investor.name,
        email: investor.email,
        phone: investor.phone,
        bio: investor.bio,
        investmentInterests: investor.investmentInterests,
        isApproved: investor.isApproved
      }
    });
  } catch (error) {
    console.error('Investor login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Investment routes
app.post('/api/investments/request', auth, async (req, res) => {
  try {
    const { projectId, units, notes } = req.body;
    const investorId = req.user._id; // Assuming auth middleware sets req.user

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
app.post('/api/developments/analyze', auth, async (req, res) => {
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