import mongoose from 'mongoose';

const InvestorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: function() { return !this.googleId; },
  },
  phone: {
    type: String,
    required: false,
  },
  bio: {
    type: String,
    required: false,
  },
  investmentInterests: {
    type: String,
    required: false,
  },
  googleId: {
    type: String,
    required: false,
  },
  isApproved: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const Investor = mongoose.models.Investor || mongoose.model('Investor', InvestorSchema); 