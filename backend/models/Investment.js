import mongoose from 'mongoose';

const investmentSchema = new mongoose.Schema({
  investorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  amount: { type: Number, required: true },
  units: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

export const Investment = mongoose.model('Investment', investmentSchema); 