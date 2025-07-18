import mongoose from 'mongoose';

const verificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  documentType: { type: String, required: true },
  documentUrl: { type: String, required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  submittedAt: { type: Date, default: Date.now },
  reviewedAt: { type: Date }
});

export const Verification = mongoose.model('Verification', verificationSchema); 