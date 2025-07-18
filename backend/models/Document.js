import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: true
  },
  url: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['deed', 'receipt', 'agreement', 'other'],
    default: 'other'
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  sentAt: {
    type: Date
  }
}, {
  timestamps: true
});

export const Document = mongoose.model('Document', documentSchema); 