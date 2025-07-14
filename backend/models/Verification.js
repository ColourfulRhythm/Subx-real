import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['id', 'proof_of_address', 'source_of_funds', 'tax_document', 'other'],
    required: true
  },
  url: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  rejectionReason: String,
  uploadedAt: {
    type: Date,
    default: Date.now
  },
  verifiedAt: Date
});

const verificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'userType',
    required: true
  },
  userType: {
    type: String,
    enum: ['User', 'Investor', 'Developer'],
    required: true
  },
  status: {
    type: String,
    enum: ['not_started', 'in_progress', 'pending_review', 'approved', 'rejected'],
    default: 'not_started'
  },
  documents: [documentSchema],
  personalInfo: {
    dateOfBirth: Date,
    nationality: String,
    address: {
      street: String,
      city: String,
      state: String,
      country: String,
      postalCode: String
    },
    occupation: String,
    employer: String,
    annualIncome: Number
  },
  riskLevel: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  amlChecks: {
    pep: {
      isPEP: Boolean,
      details: String
    },
    sanctions: {
      isSanctioned: Boolean,
      details: String
    },
    adverseMedia: {
      hasAdverseMedia: Boolean,
      details: String
    }
  },
  notes: String,
  rejectionReason: String,
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  verifiedAt: Date,
  expiresAt: Date
}, {
  timestamps: true
});

// Add indexes for efficient querying
verificationSchema.index({ userId: 1, userType: 1 });
verificationSchema.index({ status: 1 });
verificationSchema.index({ 'documents.status': 1 });

const Verification = mongoose.model('Verification', verificationSchema);

export default Verification; 