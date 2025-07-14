import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';
import { auth } from '../middleware/auth.js';
import { User } from '../models/User.js';
import { Project } from '../models/Project.js';
import { Investment } from '../models/Investment.js';
import { Verification } from '../models/Verification.js';
import { Settings } from '../models/Settings.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Admin login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find admin by email
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign({ id: admin._id }, JWT_SECRET, { expiresIn: '24h' });

    res.json({
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get admin profile
router.get('/profile', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const admin = await Admin.findById(decoded.id).select('-password');
    
    if (!admin) {
      return res.status(404).json({ error: 'Admin not found' });
    }

    res.json(admin);
  } catch (error) {
    console.error('Get admin profile error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get dashboard stats
router.get('/stats', auth, async (req, res) => {
  try {
    const [totalDevelopers, totalInvestors, totalProjects, totalInvestments, pendingVerifications] = await Promise.all([
      User.countDocuments({ role: 'developer' }),
      User.countDocuments({ role: 'investor' }),
      Project.countDocuments(),
      Investment.countDocuments(),
      Verification.countDocuments({ status: 'pending' })
    ]);

    res.json({
      totalDevelopers,
      totalInvestors,
      totalProjects,
      totalInvestments,
      pendingVerifications
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});

// Get recent projects
router.get('/recent-projects', auth, async (req, res) => {
  try {
    const projects = await Project.find()
      .populate('developer', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json(projects);
  } catch (error) {
    console.error('Error fetching recent projects:', error);
    res.status(500).json({ error: 'Failed to fetch recent projects' });
  }
});

// Get recent investments
router.get('/recent-investments', auth, async (req, res) => {
  try {
    const investments = await Investment.find()
      .populate('investor', 'name')
      .populate('project', 'title')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json(investments);
  } catch (error) {
    console.error('Error fetching recent investments:', error);
    res.status(500).json({ error: 'Failed to fetch recent investments' });
  }
});

// Get all users
router.get('/users', auth, async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 });

    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get all projects
router.get('/projects', auth, async (req, res) => {
  try {
    const projects = await Project.find()
      .populate('developer', 'name')
      .sort({ createdAt: -1 });

    res.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

// Update project status
router.patch('/projects/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json(project);
  } catch (error) {
    console.error('Error updating project status:', error);
    res.status(500).json({ error: 'Failed to update project status' });
  }
});

// Get all investments
router.get('/investments', auth, async (req, res) => {
  try {
    const investments = await Investment.find()
      .populate('investor', 'name')
      .populate('project', 'title')
      .sort({ createdAt: -1 });

    res.json(investments);
  } catch (error) {
    console.error('Error fetching investments:', error);
    res.status(500).json({ error: 'Failed to fetch investments' });
  }
});

// Get pending verifications
router.get('/verifications/pending', auth, async (req, res) => {
  try {
    const verifications = await Verification.find({ status: 'pending' })
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });

    res.json(verifications);
  } catch (error) {
    console.error('Error fetching pending verifications:', error);
    res.status(500).json({ error: 'Failed to fetch pending verifications' });
  }
});

// Review verification document
router.post('/verifications/:verificationId/documents/:documentId/review', auth, async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;
    const verification = await Verification.findById(req.params.verificationId);

    if (!verification) {
      return res.status(404).json({ error: 'Verification not found' });
    }

    const document = verification.documents.id(req.params.documentId);
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    document.status = status;
    if (status === 'rejected') {
      document.rejectionReason = rejectionReason;
    }

    await verification.save();
    res.json({ document });
  } catch (error) {
    console.error('Error reviewing document:', error);
    res.status(500).json({ error: 'Failed to review document' });
  }
});

// Complete verification review
router.post('/verifications/:verificationId/complete', auth, async (req, res) => {
  try {
    const { status, riskLevel, amlChecks, notes, rejectionReason } = req.body;
    const verification = await Verification.findById(req.params.verificationId);

    if (!verification) {
      return res.status(404).json({ error: 'Verification not found' });
    }

    verification.status = status;
    verification.riskLevel = riskLevel;
    verification.amlChecks = amlChecks;
    verification.notes = notes;
    verification.rejectionReason = rejectionReason;
    verification.reviewedAt = new Date();
    verification.reviewedBy = req.user._id;

    await verification.save();

    // Update user verification status
    await User.findByIdAndUpdate(verification.userId, {
      isVerified: status === 'approved'
    });

    res.json(verification);
  } catch (error) {
    console.error('Error completing verification review:', error);
    res.status(500).json({ error: 'Failed to complete verification review' });
  }
});

// Get admin settings
router.get('/settings', auth, async (req, res) => {
  try {
    const settings = await Settings.findOne() || new Settings();
    res.json(settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ message: 'Error fetching settings' });
  }
});

// Update admin settings
router.put('/settings', auth, async (req, res) => {
  try {
    const {
      minInvestmentAmount,
      maxInvestmentAmount,
      platformFee,
      verificationRequired,
      autoApproveProjects,
      emailNotifications,
      pushNotifications
    } = req.body;

    const settings = await Settings.findOne() || new Settings();
    
    settings.minInvestmentAmount = minInvestmentAmount;
    settings.maxInvestmentAmount = maxInvestmentAmount;
    settings.platformFee = platformFee;
    settings.verificationRequired = verificationRequired;
    settings.autoApproveProjects = autoApproveProjects;
    settings.emailNotifications = emailNotifications;
    settings.pushNotifications = pushNotifications;

    await settings.save();
    res.json(settings);
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ message: 'Error updating settings' });
  }
});

export default router; 