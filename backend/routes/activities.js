import express from 'express';
import { Activity } from '../models/Activity.js';
import { User } from '../models/User.js';
import { Project } from '../models/Project.js';
import { Investment } from '../models/Investment.js';
import { adminAuth, auth } from '../middleware/auth.js';

const router = express.Router();

// Get all activities with pagination and filtering
router.get('/admin/activities', adminAuth, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 50, 
      userType, 
      activityType, 
      userId,
      startDate,
      endDate,
      search 
    } = req.query;

    const filter = {};
    
    if (userType) filter.userType = userType;
    if (activityType) filter.activityType = activityType;
    if (userId) filter.userId = userId;
    
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;
    
    const activities = await Activity.find(filter)
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Activity.countDocuments(filter);

    res.json({
      activities,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        totalRecords: total
      }
    });
  } catch (error) {
    console.error('Error fetching activities:', error);
    res.status(500).json({ error: 'Failed to fetch activities' });
  }
});

// Get activity analytics
router.get('/admin/analytics', adminAuth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
    }

    // Activity type distribution
    const activityTypes = await Activity.aggregate([
      { $match: dateFilter },
      { $group: { _id: '$activityType', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // User type distribution
    const userTypes = await Activity.aggregate([
      { $match: dateFilter },
      { $group: { _id: '$userType', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Daily activity trend (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const dailyTrend = await Activity.aggregate([
      { 
        $match: { 
          createdAt: { $gte: thirtyDaysAgo },
          ...dateFilter
        } 
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Most active users
    const activeUsers = await Activity.aggregate([
      { $match: dateFilter },
      { $group: { _id: '$userId', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $project: {
          userId: '$_id',
          name: '$user.name',
          email: '$user.email',
          activityCount: '$count'
        }
      }
    ]);

    // Recent activities (last 10)
    const recentActivities = await Activity.find(dateFilter)
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      activityTypes,
      userTypes,
      dailyTrend,
      activeUsers,
      recentActivities
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// Get user-specific activities
router.get('/admin/users/:userId/activities', adminAuth, async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    
    const skip = (page - 1) * limit;
    
    const activities = await Activity.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Activity.countDocuments({ userId });

    res.json({
      activities,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        totalRecords: total
      }
    });
  } catch (error) {
    console.error('Error fetching user activities:', error);
    res.status(500).json({ error: 'Failed to fetch user activities' });
  }
});

// Get real-time activity feed (WebSocket endpoint for future implementation)
router.get('/admin/activity-feed', adminAuth, async (req, res) => {
  try {
    const recentActivities = await Activity.find()
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .limit(20);

    res.json({ activities: recentActivities });
  } catch (error) {
    console.error('Error fetching activity feed:', error);
    res.status(500).json({ error: 'Failed to fetch activity feed' });
  }
});

// Track user activity (for frontend)
router.post('/track', auth, async (req, res) => {
  try {
    const { activityType, description, metadata } = req.body;
    const userId = req.user._id;
    const userType = req.user.role;

    const activity = new Activity({
      userId,
      userType,
      activityType,
      description,
      metadata: {
        ...metadata,
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent')
      }
    });

    await activity.save();
    res.json({ success: true });
  } catch (error) {
    console.error('Error tracking activity:', error);
    res.status(500).json({ error: 'Failed to track activity' });
  }
});

export { router as activitiesRouter }; 