import express from 'express';
import { User } from '../models/User.js';
import { adminAuth } from '../middleware/auth.js';

const router = express.Router();

// Get user notifications
router.get('/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user.notifications || []);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Mark notification as read
router.put('/:userId/read/:notificationId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const notification = user.notifications.id(req.params.notificationId);
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    notification.read = true;
    await user.save();

    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete notification
router.delete('/:userId/:notificationId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.notifications = user.notifications.filter(
      notification => notification._id.toString() !== req.params.notificationId
    );
    await user.save();

    res.json({ message: 'Notification deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin: Send notification to user
router.post('/admin/send', adminAuth, async (req, res) => {
  try {
    const { userId, title, message, type } = req.body;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.notifications.push({
      title,
      message,
      type,
      read: false,
      createdAt: new Date()
    });

    await user.save();
    res.json({ message: 'Notification sent successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router; 