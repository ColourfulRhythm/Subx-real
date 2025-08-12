import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, default: 'pdf' },
  url: { type: String, default: '#' },
  signed: { type: Boolean, default: false }
}, { _id: false });

const investmentSchema = new mongoose.Schema({
  investorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Investor', required: true },
  projectTitle: { type: String, required: true },
  projectId: { type: String, required: true },
  sqm: { type: Number, required: true },
  amount: { type: Number, required: true },
  location: { type: String, required: true },
  description: { type: String, default: 'Property investment' },
  paymentReference: { type: String, required: true },
  status: { type: String, enum: ['pending', 'active', 'completed', 'approved', 'rejected'], default: 'active' },
  documents: { type: [documentSchema], default: [] },
  createdAt: { type: Date, default: Date.now }
});

export const Investment = mongoose.model('Investment', investmentSchema); 