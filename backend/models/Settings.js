import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
  minInvestmentAmount: {
    type: Number,
    required: true,
    default: 0
  },
  maxInvestmentAmount: {
    type: Number,
    required: true,
    default: 0
  },
  platformFee: {
    type: Number,
    required: true,
    default: 0,
    min: 0,
    max: 100
  },
  verificationRequired: {
    type: Boolean,
    required: true,
    default: true
  },
  autoApproveProjects: {
    type: Boolean,
    required: true,
    default: false
  },
  emailNotifications: {
    type: Boolean,
    required: true,
    default: true
  },
  pushNotifications: {
    type: Boolean,
    required: true,
    default: true
  }
}, {
  timestamps: true
});

export const Settings = mongoose.model('Settings', settingsSchema); 