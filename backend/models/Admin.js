import mongoose from 'mongoose';

const adminSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['admin', 'super_admin'],
    default: 'admin'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  phone: {
    type: String,
    trim: true
  },
  bio: {
    type: String,
    trim: true
  },
  imageUrl: {
    type: String
  },
  lastLogin: {
    type: Date
  },
  settings: {
    emailNotifications: {
      type: Boolean,
      default: true
    },
    pushNotifications: {
      type: Boolean,
      default: true
    },
    darkMode: {
      type: Boolean,
      default: false
    },
    language: {
      type: String,
      default: 'en'
    }
  }
}, {
  timestamps: true
});

export const Admin = mongoose.model('Admin', adminSchema); 