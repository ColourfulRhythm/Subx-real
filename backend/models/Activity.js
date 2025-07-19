import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userType: {
    type: String,
    enum: ['investor', 'developer', 'admin'],
    required: true
  },
  activityType: {
    type: String,
    enum: [
      'login',
      'logout',
      'profile_update',
      'investment_made',
      'project_viewed',
      'document_downloaded',
      'connection_request',
      'payment_made',
      'verification_submitted',
      'forum_post',
      'message_sent',
      'project_created',
      'project_updated',
      'project_deleted'
    ],
    required: true
  },
  description: {
    type: String,
    required: true
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  ipAddress: {
    type: String
  },
  userAgent: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient querying
activitySchema.index({ userId: 1, createdAt: -1 });
activitySchema.index({ activityType: 1, createdAt: -1 });
activitySchema.index({ userType: 1, createdAt: -1 });

export const Activity = mongoose.model('Activity', activitySchema); 