import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Admin } from '../models/Admin.js';
import { auth, adminAuth } from '../middleware/auth.js';
import { Investment } from '../models/Investment.js';
import { Project } from '../models/Project.js';
import { Verification } from '../models/Verification.js';
import { User } from '../models/User.js';
import { Settings } from '../models/Settings.js';
import { Connection } from '../models/Connection.js';
import { Document } from '../models/Document.js';
import multer from 'multer';
import path from 'path';
import { Message } from '../models/Message.js';
import axios from 'axios';
import { Developer } from '../models/Developer.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Multer setup for file uploads (local storage)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(process.cwd(), 'uploads/documents'));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

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

// Update admin profile
router.put('/profile', upload.single('image'), async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    const decoded = jwt.verify(token, JWT_SECRET);
    const admin = await Admin.findById(decoded.id);
    if (!admin) {
      return res.status(404).json({ error: 'Admin not found' });
    }
    // Update fields
    if (req.body.name) admin.name = req.body.name;
    if (req.body.phone) admin.phone = req.body.phone;
    if (req.body.bio) admin.bio = req.body.bio;
    if (req.body.settings) {
      try {
        admin.settings = JSON.parse(req.body.settings);
      } catch (e) {
        // fallback: ignore settings if not valid JSON
      }
    }
    // Handle image upload
    if (req.file) {
      admin.imageUrl = `/uploads/documents/${req.file.filename}`;
    }
    await admin.save();
    res.json({
      id: admin._id,
      name: admin.name,
      email: admin.email,
      phone: admin.phone,
      bio: admin.bio,
      imageUrl: admin.imageUrl,
      settings: admin.settings || {}
    });
  } catch (error) {
    console.error('Update admin profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Get dashboard stats
router.get('/stats', adminAuth, async (req, res) => {
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
router.get('/recent-projects', adminAuth, async (req, res) => {
  try {
    const projects = await Project.find()
      .populate('developerId', 'name company')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json(projects);
  } catch (error) {
    console.error('Error fetching recent projects:', error);
    res.status(500).json({ error: 'Failed to fetch recent projects' });
  }
});

// Get recent investments
router.get('/recent-investments', adminAuth, async (req, res) => {
  try {
    console.log('Fetching recent investments...');
    const count = await Investment.countDocuments();
    console.log('Total investments in DB:', count);
    
    const investments = await Investment.find()
      .sort({ createdAt: -1 })
      .limit(5);
    
    console.log('Found investments:', investments.length);
    res.json(investments);
  } catch (error) {
    console.error('Error fetching recent investments:', error);
    res.status(500).json({ error: 'Failed to fetch recent investments', details: error.message });
  }
});

// Get all users
router.get('/users', adminAuth, async (req, res) => {
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

// Update user status
router.patch('/users/:id/status', adminAuth, async (req, res) => {
  try {
    const { isActive } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error updating user status:', error);
    res.status(500).json({ error: 'Failed to update user status' });
  }
});

// Create a new user
router.post('/users', adminAuth, async (req, res) => {
  try {
    const { name, email, password, role, phone, bio } = req.body;
    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: 'Name, email, password, and role are required' });
    }
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ error: 'Email already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      name,
      email,
      password: hashedPassword,
      role,
      phone,
      bio,
      isActive: true
    });
    await user.save();
    res.status(201).json(user);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Get all projects
router.get('/projects', adminAuth, async (req, res) => {
  try {
    const projects = await Project.find()
      .populate('developerId', 'name company')
      .sort({ createdAt: -1 });

    res.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

// Property CRUD endpoints (admin)

// Create a new project
router.post('/projects', adminAuth, upload.array('images', 10), async (req, res) => {
  try {
    const { title, description, location, type, developerId, status, unitsTotal, unitsAvailable, unitsPrice } = req.body;
    const imageUrls = req.files ? req.files.map(file => `/uploads/documents/${file.filename}`) : [];
    const project = new Project({
      title,
      description,
      location,
      type,
      imageUrls,
      developerId,
      status: status || 'planning',
      units: {
        total: unitsTotal,
        available: unitsAvailable,
        price: unitsPrice
      }
    });
    await project.save();
    res.status(201).json(project);
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ error: 'Failed to create project' });
  }
});

// Get a single project by ID
router.get('/projects/:id', adminAuth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.json(project);
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({ error: 'Failed to fetch project' });
  }
});

// Update a project
router.put('/projects/:id', adminAuth, upload.array('images', 10), async (req, res) => {
  try {
    const { title, description, location, type, developerId, status, unitsTotal, unitsAvailable, unitsPrice } = req.body;
    const imageUrls = req.files ? req.files.map(file => `/uploads/documents/${file.filename}`) : undefined;
    const update = {
      title,
      description,
      location,
      type,
      developerId,
      status,
      'units.total': unitsTotal,
      'units.available': unitsAvailable,
      'units.price': unitsPrice
    };
    if (imageUrls && imageUrls.length > 0) update.imageUrls = imageUrls;
    const project = await Project.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.json(project);
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ error: 'Failed to update project' });
  }
});

// Delete a project
router.delete('/projects/:id', auth, async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.json({ message: 'Project deleted' });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ error: 'Failed to delete project' });
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

// --- CONNECTIONS ENDPOINTS ---

// Get all connections
router.get('/connections', auth, async (req, res) => {
  try {
    const connections = await Connection.find().sort({ createdAt: -1 });
    res.json(connections);
  } catch (error) {
    console.error('Error fetching connections:', error);
    res.status(500).json({ error: 'Failed to fetch connections' });
  }
});

// Get a single connection by ID
router.get('/connections/:id', auth, async (req, res) => {
  try {
    const connection = await Connection.findById(req.params.id);
    if (!connection) {
      return res.status(404).json({ error: 'Connection not found' });
    }
    res.json(connection);
  } catch (error) {
    console.error('Error fetching connection:', error);
    res.status(500).json({ error: 'Failed to fetch connection' });
  }
});

// Update connection status
router.patch('/connections/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    const connection = await Connection.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!connection) {
      return res.status(404).json({ error: 'Connection not found' });
    }
    res.json(connection);
  } catch (error) {
    console.error('Error updating connection status:', error);
    res.status(500).json({ error: 'Failed to update connection status' });
  }
});

// Delete a connection
router.delete('/connections/:id', auth, async (req, res) => {
  try {
    const connection = await Connection.findByIdAndDelete(req.params.id);
    if (!connection) {
      return res.status(404).json({ error: 'Connection not found' });
    }
    res.json({ message: 'Connection deleted' });
  } catch (error) {
    console.error('Error deleting connection:', error);
    res.status(500).json({ error: 'Failed to delete connection' });
  }
});

// --- DOCUMENTS ENDPOINTS ---

// Upload a document
router.post('/documents', auth, upload.single('file'), async (req, res) => {
  try {
    const { type, userId } = req.body;
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    const document = new Document({
      filename: req.file.filename,
      url: `/uploads/documents/${req.file.filename}`,
      type: type || 'other',
      uploadedBy: req.user._id,
      userId: userId || undefined
    });
    await document.save();
    res.status(201).json(document);
  } catch (error) {
    console.error('Error uploading document:', error);
    res.status(500).json({ error: 'Failed to upload document' });
  }
});

// List all documents
router.get('/documents', auth, async (req, res) => {
  try {
    const documents = await Document.find().sort({ createdAt: -1 });
    res.json(documents);
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
});

// Send a document to a user (associate and set sentAt)
router.post('/documents/:id/send', auth, async (req, res) => {
  try {
    const { userId } = req.body;
    const document = await Document.findByIdAndUpdate(
      req.params.id,
      { userId, sentAt: new Date() },
      { new: true }
    );
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }
    res.json(document);
  } catch (error) {
    console.error('Error sending document:', error);
    res.status(500).json({ error: 'Failed to send document' });
  }
});

// Delete a document
router.delete('/documents/:id', auth, async (req, res) => {
  try {
    const document = await Document.findByIdAndDelete(req.params.id);
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }
    res.json({ message: 'Document deleted' });
  } catch (error) {
    console.error('Error deleting document:', error);
    res.status(500).json({ error: 'Failed to delete document' });
  }
});

// --- MESSAGING ENDPOINTS ---

// List all messages (optionally filter by user)
router.get('/messages', auth, async (req, res) => {
  try {
    const { userId } = req.query;
    const filter = userId
      ? { $or: [
            { senderId: userId, senderType: 'User' },
            { recipientId: userId, recipientType: 'User' }
        ] }
      : {};
    const messages = await Message.find(filter).sort({ createdAt: -1 });
    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Send a message to a user
router.post('/messages', auth, async (req, res) => {
  try {
    const { recipientId, content } = req.body;
    const message = new Message({
      senderId: req.user._id,
      senderType: 'Admin',
      recipientId,
      recipientType: 'User',
      content
    });
    await message.save();
    res.status(201).json(message);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Mark a message as read
router.patch('/messages/:id/read', auth, async (req, res) => {
  try {
    const message = await Message.findByIdAndUpdate(
      req.params.id,
      { read: true },
      { new: true }
    );
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }
    res.json(message);
  } catch (error) {
    console.error('Error marking message as read:', error);
    res.status(500).json({ error: 'Failed to mark message as read' });
  }
});

// Delete a message
router.delete('/messages/:id', auth, async (req, res) => {
  try {
    const message = await Message.findByIdAndDelete(req.params.id);
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }
    res.json({ message: 'Message deleted' });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({ error: 'Failed to delete message' });
  }
});

// --- PAYSTACK VERIFICATION ENDPOINT ---

router.get('/paystack/verify/:reference', auth, async (req, res) => {
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

export { router as adminRouter }; 