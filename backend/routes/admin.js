import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { supabase } from '../supabase.js';

const router = express.Router();

// Middleware to verify admin JWT token
const verifyAdminToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.admin = decoded;
    next();
  } catch (error) {
    res.status(400).json({ error: 'Invalid token.' });
  }
};

// Admin Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists in Supabase
    const { data: { user }, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (authError || !user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check if user has admin role (you can customize this logic)
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return res.status(403).json({ error: 'User profile not found' });
    }

    // For now, let's allow any authenticated user to access admin
    // You can add role-based checks here later
    const adminToken = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        role: 'admin' 
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      token: adminToken,
      user: {
        id: user.id,
        email: user.email,
        full_name: profile.full_name || user.email
      }
    });

  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Get Admin Profile
router.get('/profile', verifyAdminToken, async (req, res) => {
  try {
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', req.admin.id)
      .single();

    if (error || !profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    res.json({
      success: true,
      profile: {
        id: profile.id,
        full_name: profile.full_name,
        email: req.admin.email,
        role: 'admin'
      }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
});

// Get Dashboard Stats
router.get('/stats', verifyAdminToken, async (req, res) => {
  try {
    // Get total users
    const { count: totalUsers } = await supabase
      .from('user_profiles')
      .select('*', { count: 'exact', head: true });

    // Get total projects
    const { count: totalProjects } = await supabase
      .from('projects')
      .select('*', { count: 'exact', head: true });

    // Get total investments
    const { count: totalInvestments } = await supabase
      .from('investments')
      .select('*', { count: 'exact', head: true });

    // Get total amount invested
    const { data: investments } = await supabase
      .from('investments')
      .select('amount')
      .eq('status', 'completed');

    const totalAmount = investments?.reduce((sum, inv) => sum + (inv.amount || 0), 0) || 0;

    res.json({
      success: true,
      stats: {
        totalUsers: totalUsers || 0,
        totalProjects: totalProjects || 0,
        totalInvestments: totalInvestments || 0,
        totalAmount: totalAmount,
        pendingVerifications: 0 // You can implement this later
      }
    });

  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to get stats' });
  }
});

// Get All Users
router.get('/users', verifyAdminToken, async (req, res) => {
  try {
    const { data: users, error } = await supabase
      .from('user_profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      users: users || []
    });

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to get users' });
  }
});

// Get All Projects
router.get('/projects', verifyAdminToken, async (req, res) => {
  try {
    const { data: projects, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      projects: projects || []
    });

  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ error: 'Failed to get projects' });
  }
});

// Get All Investments
router.get('/investments', verifyAdminToken, async (req, res) => {
  try {
    const { data: investments, error } = await supabase
      .from('investments')
      .select(`
        *,
        user_profiles!inner(full_name, phone),
        projects!inner(title, total_sqm)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      investments: investments || []
    });

  } catch (error) {
    console.error('Get investments error:', error);
    res.status(500).json({ error: 'Failed to get investments' });
  }
});

// Get Recent Activities
router.get('/activities', verifyAdminToken, async (req, res) => {
  try {
    // Get recent investments
    const { data: recentInvestments, error: invError } = await supabase
      .from('investments')
      .select(`
        *,
        user_profiles!inner(full_name),
        projects!inner(title)
      `)
      .order('created_at', { ascending: false })
      .limit(10);

    // Get recent forum activities
    const { data: recentTopics, error: topicError } = await supabase
      .from('forum_topics')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    res.json({
      success: true,
      activities: {
        recentInvestments: recentInvestments || [],
        recentTopics: recentTopics || []
      }
    });

  } catch (error) {
    console.error('Get activities error:', error);
    res.status(500).json({ error: 'Failed to get activities' });
  }
});

export { router as adminRouter };
