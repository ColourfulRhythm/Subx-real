import { Activity } from '../models/Activity.js';

export const trackActivity = (activityType, description, metadata = {}) => {
  return async (req, res, next) => {
    try {
      // Store the original send function
      const originalSend = res.send;
      
      // Override the send function to track activity after response
      res.send = function(data) {
        // Call the original send function
        originalSend.call(this, data);
        
        // Track activity if user is authenticated
        if (req.user || req.admin) {
          const activityData = {
            userId: req.user?._id || req.admin?._id,
            userType: req.user?.role || 'admin',
            activityType,
            description,
            metadata: {
              ...metadata,
              responseStatus: res.statusCode,
              endpoint: req.originalUrl,
              method: req.method
            },
            ipAddress: req.ip || req.connection.remoteAddress,
            userAgent: req.get('User-Agent')
          };
          
          // Create activity asynchronously (don't block response)
          Activity.create(activityData).catch(err => {
            console.error('Error tracking activity:', err);
          });
        }
      };
      
      next();
    } catch (error) {
      console.error('Activity tracker error:', error);
      next();
    }
  };
};

// Helper function to track activities manually
export const logActivity = async (userId, userType, activityType, description, metadata = {}) => {
  try {
    await Activity.create({
      userId,
      userType,
      activityType,
      description,
      metadata
    });
  } catch (error) {
    console.error('Error logging activity:', error);
  }
}; 