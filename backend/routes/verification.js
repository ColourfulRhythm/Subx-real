import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { Verification } from '../models/Verification.js';
import { auth } from '../middleware/auth.js';
import { adminAuth } from '../middleware/auth.js';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for document uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads/verification'))
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG and PDF are allowed.'));
    }
  }
});

// Start verification process
router.post('/start', auth, async (req, res) => {
  try {
    const { userType } = req.body;
    const userId = req.user._id;

    // Check if verification already exists
    const existingVerification = await Verification.findOne({ userId, userType });
    if (existingVerification) {
      return res.status(400).json({ 
        error: 'Verification process already exists',
        verificationId: existingVerification._id
      });
    }

    // Create new verification
    const verification = new Verification({
      userId,
      userType,
      status: 'in_progress'
    });

    await verification.save();

    res.status(201).json({
      message: 'Verification process started',
      verificationId: verification._id
    });
  } catch (error) {
    console.error('Error starting verification:', error);
    res.status(500).json({ error: 'Failed to start verification process' });
  }
});

// Upload verification document
router.post('/upload/:verificationId', auth, upload.single('document'), async (req, res) => {
  try {
    const { verificationId } = req.params;
    const { type } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const verification = await Verification.findOne({
      _id: verificationId,
      userId: req.user._id
    });

    if (!verification) {
      return res.status(404).json({ error: 'Verification not found' });
    }

    // Add document to verification
    verification.documents.push({
      type,
      url: `/uploads/verification/${file.filename}`,
      status: 'pending'
    });

    // Update verification status if this is the first document
    if (verification.documents.length === 1) {
      verification.status = 'pending_review';
    }

    await verification.save();

    res.status(200).json({
      message: 'Document uploaded successfully',
      document: verification.documents[verification.documents.length - 1]
    });
  } catch (error) {
    console.error('Error uploading document:', error);
    res.status(500).json({ error: 'Failed to upload document' });
  }
});

// Submit personal information
router.post('/personal-info/:verificationId', auth, async (req, res) => {
  try {
    const { verificationId } = req.params;
    const personalInfo = req.body;

    const verification = await Verification.findOne({
      _id: verificationId,
      userId: req.user._id
    });

    if (!verification) {
      return res.status(404).json({ error: 'Verification not found' });
    }

    verification.personalInfo = personalInfo;
    await verification.save();

    res.status(200).json({
      message: 'Personal information submitted successfully',
      verification
    });
  } catch (error) {
    console.error('Error submitting personal information:', error);
    res.status(500).json({ error: 'Failed to submit personal information' });
  }
});

// Get verification status (for users)
router.get('/status/:verificationId', auth, async (req, res) => {
  try {
    const { verificationId } = req.params;

    const verification = await Verification.findOne({
      _id: verificationId,
      userId: req.user._id
    });

    if (!verification) {
      return res.status(404).json({ error: 'Verification not found' });
    }

    res.status(200).json({
      status: verification.status,
      documents: verification.documents,
      personalInfo: verification.personalInfo,
      riskLevel: verification.riskLevel
    });
  } catch (error) {
    console.error('Error getting verification status:', error);
    res.status(500).json({ error: 'Failed to get verification status' });
  }
});

// Admin routes

// Get all pending verifications
router.get('/admin/pending', adminAuth, async (req, res) => {
  try {
    const verifications = await Verification.find({
      status: 'pending_review'
    }).populate('userId', 'name email');

    res.status(200).json(verifications);
  } catch (error) {
    console.error('Error getting pending verifications:', error);
    res.status(500).json({ error: 'Failed to get pending verifications' });
  }
});

// Review document
router.post('/admin/review-document/:verificationId/:documentId', adminAuth, async (req, res) => {
  try {
    const { verificationId, documentId } = req.params;
    const { status, rejectionReason } = req.body;

    const verification = await Verification.findById(verificationId);
    if (!verification) {
      return res.status(404).json({ error: 'Verification not found' });
    }

    const document = verification.documents.id(documentId);
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    document.status = status;
    if (status === 'rejected') {
      document.rejectionReason = rejectionReason;
    }
    document.verifiedAt = new Date();

    await verification.save();

    res.status(200).json({
      message: 'Document reviewed successfully',
      document
    });
  } catch (error) {
    console.error('Error reviewing document:', error);
    res.status(500).json({ error: 'Failed to review document' });
  }
});

// Complete verification review
router.post('/admin/complete-review/:verificationId', adminAuth, async (req, res) => {
  try {
    const { verificationId } = req.params;
    const { status, riskLevel, amlChecks, notes, rejectionReason } = req.body;

    const verification = await Verification.findById(verificationId);
    if (!verification) {
      return res.status(404).json({ error: 'Verification not found' });
    }

    // Check if all documents are reviewed
    const pendingDocuments = verification.documents.filter(doc => doc.status === 'pending');
    if (pendingDocuments.length > 0) {
      return res.status(400).json({ 
        error: 'All documents must be reviewed before completing verification',
        pendingDocuments
      });
    }

    verification.status = status;
    verification.riskLevel = riskLevel;
    verification.amlChecks = amlChecks;
    verification.notes = notes;
    verification.rejectionReason = rejectionReason;
    verification.verifiedBy = req.admin._id;
    verification.verifiedAt = new Date();
    verification.expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1 year validity

    await verification.save();

    res.status(200).json({
      message: 'Verification review completed',
      verification
    });
  } catch (error) {
    console.error('Error completing verification review:', error);
    res.status(500).json({ error: 'Failed to complete verification review' });
  }
});

export { router as verificationRouter }; 