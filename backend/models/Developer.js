import mongoose from 'mongoose';

const developerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  company: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    trim: true
  },
  website: {
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
  isSubscribed: {
    type: Boolean,
    default: false
  },
  minUnits: {
    type: Number,
    default: 1
  },
  maxUnits: {
    type: Number,
    default: 1000000
  },
  unitPrice: {
    type: Number,
    default: 0
  },
  investmentFocus: [{
    type: String
  }],
  completedProjects: [{
    type: String
  }],
  yearsOfExperience: {
    type: Number,
    default: 0
  },
  certifications: [{
    type: String
  }],
  socialLinks: {
    type: Map,
    of: String,
    default: {}
  }
}, {
  timestamps: true
});

const Developer = mongoose.model('Developer', developerSchema);

export default Developer; 