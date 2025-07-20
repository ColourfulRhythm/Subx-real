import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import nodemailer from 'nodemailer';

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://Subx:uWEBfCPegIA9d7J5@subx.oy3bj9c.mongodb.net/subx?retryWrites=true&w=majority&appName=Subx';
const JWT_SECRET = process.env.JWT_SECRET || '56f4cc835db321638d941e37c5998155e959f7aaa228004fdc6480467587b5f7cdb91092af31803e750c912830795c19c282c1b2a610c666074b68e259e791d1';

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Investor Schema with enhanced fields
const investorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, required: true },
  bio: String,
  investmentInterests: String,
  investmentExperience: String,
  preferredInvestmentAmount: Number,
  preferredLocations: [String],
  riskTolerance: String,
  investmentGoals: [String],
  profileImage: String,
  isEmailVerified: { type: Boolean, default: false },
  emailNotifications: { type: Boolean, default: true },
  pushNotifications: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  lastLogin: { type: Date, default: Date.now }
});

const Investor = mongoose.model('Investor', investorSchema);

// Email configuration (you can add your email service credentials)
const transporter = nodemailer.createTransport({
  service: 'gmail', // or your preferred email service
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

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Get user count endpoint
app.get('/api/users/count', async (req, res) => {
  try {
    const count = await Investor.countDocuments();
    res.json({ 
      totalUsers: count,
      message: `Total registered users: ${count}`
    });
  } catch (error) {
    console.error('Error getting user count:', error);
    res.status(500).json({ error: 'Failed to get user count' });
  }
});

// Get all users (for admin purposes)
app.get('/api/users', async (req, res) => {
  try {
    const users = await Investor.find({}, { password: 0 }).sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    console.error('Error getting users:', error);
    res.status(500).json({ error: 'Failed to get users' });
  }
});

// Investor signup endpoint with welcome email
app.post('/api/investors', async (req, res) => {
  try {
    const { name, email, password, phone, bio, investmentInterests } = req.body;

    // Check if investor already exists
    const existingInvestor = await Investor.findOne({ email });
    if (existingInvestor) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new investor
    const investor = new Investor({
      name,
      email,
      password: hashedPassword,
      phone,
      bio,
      investmentInterests
    });

    await investor.save();

    // Send welcome email (in background, don't wait for it)
    sendWelcomeEmail(investor).catch(err => console.error('Welcome email error:', err));

    // Generate JWT token
    const token = jwt.sign(
      { id: investor._id, type: 'investor' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Investor created successfully',
      token,
      investor: {
        id: investor._id,
        name: investor.name,
        email: investor.email,
        phone: investor.phone,
        bio: investor.bio,
        investmentInterests: investor.investmentInterests,
        createdAt: investor.createdAt
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Failed to create investor' });
  }
});

// Investor login endpoint
app.post('/api/investors/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find investor
    const investor = await Investor.findOne({ email });
    if (!investor) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, investor.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Update last login
    investor.lastLogin = new Date();
    await investor.save();

    // Generate JWT token
    const token = jwt.sign(
      { id: investor._id, type: 'investor' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      investor: {
        id: investor._id,
        name: investor.name,
        email: investor.email,
        phone: investor.phone,
        bio: investor.bio,
        investmentInterests: investor.investmentInterests,
        createdAt: investor.createdAt,
        lastLogin: investor.lastLogin
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Failed to login' });
  }
});

// Get investor profile
app.get('/api/investors/profile', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const investor = await Investor.findById(decoded.id, { password: 0 });
    
    if (!investor) {
      return res.status(404).json({ error: 'Investor not found' });
    }

    res.json(investor);
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
});

// Update investor profile
app.put('/api/investors/profile', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const investor = await Investor.findById(decoded.id);
    
    if (!investor) {
      return res.status(404).json({ error: 'Investor not found' });
    }

    // Update allowed fields
    const { name, phone, bio, investmentInterests, investmentExperience, preferredInvestmentAmount, preferredLocations, riskTolerance, investmentGoals, emailNotifications, pushNotifications } = req.body;
    
    if (name) investor.name = name;
    if (phone) investor.phone = phone;
    if (bio) investor.bio = bio;
    if (investmentInterests) investor.investmentInterests = investmentInterests;
    if (investmentExperience) investor.investmentExperience = investmentExperience;
    if (preferredInvestmentAmount) investor.preferredInvestmentAmount = preferredInvestmentAmount;
    if (preferredLocations) investor.preferredLocations = preferredLocations;
    if (riskTolerance) investor.riskTolerance = riskTolerance;
    if (investmentGoals) investor.investmentGoals = investmentGoals;
    if (emailNotifications !== undefined) investor.emailNotifications = emailNotifications;
    if (pushNotifications !== undefined) investor.pushNotifications = pushNotifications;

    await investor.save();

    res.json({
      message: 'Profile updated successfully',
      investor: {
        id: investor._id,
        name: investor.name,
        email: investor.email,
        phone: investor.phone,
        bio: investor.bio,
        investmentInterests: investor.investmentInterests,
        investmentExperience: investor.investmentExperience,
        preferredInvestmentAmount: investor.preferredInvestmentAmount,
        preferredLocations: investor.preferredLocations,
        riskTolerance: investor.riskTolerance,
        investmentGoals: investor.investmentGoals,
        emailNotifications: investor.emailNotifications,
        pushNotifications: investor.pushNotifications,
        createdAt: investor.createdAt,
        lastLogin: investor.lastLogin
      }
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Subx API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      users: {
        count: 'GET /api/users/count',
        list: 'GET /api/users'
      },
      investors: {
        signup: 'POST /api/investors',
        login: 'POST /api/investors/login',
        profile: 'GET /api/investors/profile',
        updateProfile: 'PUT /api/investors/profile'
      }
    }
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
}); 