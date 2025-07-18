import mongoose from 'mongoose';

const connectionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    trim: true
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  status: {
    type: String,
    enum: ['new', 'in_progress', 'resolved', 'archived'],
    default: 'new'
  }
}, {
  timestamps: true
});

const Connection = mongoose.model('Connection', connectionSchema);

export default Connection; 