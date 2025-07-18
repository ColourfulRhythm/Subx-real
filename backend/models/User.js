import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['info', 'success', 'warning', 'error'], default: 'info' },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['investor', 'developer'], required: true },
  phone: { type: String, trim: true },
  bio: { type: String, trim: true },
  imageUrl: { type: String },
  isActive: { type: Boolean, default: true },
  lastLogin: { type: Date },
  notifications: [notificationSchema],
  settings: {
    emailNotifications: { type: Boolean, default: true },
    pushNotifications: { type: Boolean, default: true },
    darkMode: { type: Boolean, default: false },
    language: { type: String, default: 'en' }
  }
}, { timestamps: true });

export const User = mongoose.model('User', userSchema); 