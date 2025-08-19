import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { supabase } from './supabase.js';

const app = express();
const port = process.env.PORT || 30002;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// In-memory admin users (in production, use a database)
const ADMIN_USERS = [
  {
    email: 'admin@subxhq.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // 'password'
    role: 'super_admin',
    full_name: 'Subx Administrator'
  }
];

// Middleware to verify admin JWT token
const verifyAdminToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    // Verify this is actually an admin user
    const adminUser = ADMIN_USERS.find(admin => admin.email === decoded.email);
    if (!adminUser) {
      return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
    }
    
    req.admin = decoded;
    next();
  } catch (error) {
    res.status(400).json({ error: 'Invalid token.' });
  }
};

// Admin Login - ONLY for dedicated admin accounts
app.post('/api/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find admin user
    const adminUser = ADMIN_USERS.find(admin => admin.email === email);
    if (!adminUser) {
      return res.status(401).json({ error: 'Invalid admin credentials' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, adminUser.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid admin credentials' });
    }

    // Generate admin token
    const adminToken = jwt.sign(
      { 
        email: adminUser.email, 
        role: adminUser.role,
        full_name: adminUser.full_name
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      token: adminToken,
      user: {
        email: adminUser.email,
        role: adminUser.role,
        full_name: adminUser.full_name
      }
    });

  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Get Admin Profile
app.get('/api/admin/profile', verifyAdminToken, async (req, res) => {
  try {
    res.json({
      success: true,
      profile: {
        email: req.admin.email,
        role: req.admin.role,
        full_name: req.admin.full_name
      }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
});

// Update Admin Profile
app.put('/api/admin/profile', verifyAdminToken, async (req, res) => {
  try {
    const { full_name, email } = req.body;
    
    // Update admin user in memory (in production, update database)
    const adminUser = ADMIN_USERS.find(admin => admin.email === req.admin.email);
    if (adminUser) {
      adminUser.full_name = full_name || adminUser.full_name;
      adminUser.email = email || adminUser.email;
    }

    res.json({
      success: true,
      message: 'Profile updated successfully'
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Get Dashboard Stats
app.get('/api/admin/stats', verifyAdminToken, async (req, res) => {
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

    // Count developers and investors (assuming user_type field exists)
    const { data: allUsers } = await supabase
      .from('user_profiles')
      .select('user_type');

    const totalDevelopers = allUsers?.filter(u => u.user_type === 'developer').length || 0;
    const totalInvestors = allUsers?.filter(u => u.user_type === 'investor').length || 0;

    res.json({
      success: true,
      stats: {
        totalUsers: totalUsers || 0,
        totalDevelopers: totalDevelopers,
        totalInvestors: totalInvestors,
        totalProjects: totalProjects || 0,
        totalInvestments: totalInvestments || 0,
        totalAmount: totalAmount,
        pendingVerifications: 0
      }
    });

  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to get stats' });
  }
});

// Get Recent Projects
app.get('/api/admin/recent-projects', verifyAdminToken, async (req, res) => {
  try {
    const { data: projects, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      projects: projects || []
    });

  } catch (error) {
    console.error('Get recent projects error:', error);
    res.status(500).json({ error: 'Failed to get recent projects' });
  }
});

// Get Recent Investments
app.get('/api/admin/recent-investments', verifyAdminToken, async (req, res) => {
  try {
    const { data: investments, error } = await supabase
      .from('investments')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      investments: investments || []
    });

  } catch (error) {
    console.error('Get recent investments error:', error);
    res.status(500).json({ error: 'Failed to get recent investments' });
  }
});

// Get All Users
app.get('/api/admin/users', verifyAdminToken, async (req, res) => {
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

// Update User Status
app.patch('/api/admin/users/:userId/status', verifyAdminToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const { isActive } = req.body;

    // Update user status in the user_profiles table
    const { error } = await supabase
      .from('user_profiles')
      .update({ is_active: isActive })
      .eq('id', userId);

    if (error) {
      console.error('Database update error:', error);
      throw error;
    }

    res.json({
      success: true,
      message: 'User status updated successfully',
      userId,
      isActive
    });

  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({ error: 'Failed to update user status' });
  }
});

// Create User
app.post('/api/admin/users', verifyAdminToken, async (req, res) => {
  try {
    const { full_name, email, phone, user_type } = req.body;

    // Create user in Supabase Auth first
    const { data: { user }, error: authError } = await supabase.auth.admin.createUser({
      email,
      password: 'temporary123', // Set a temporary password
      email_confirm: true
    });

    if (authError) {
      throw authError;
    }

    // Create user profile
    const { error: profileError } = await supabase
      .from('user_profiles')
      .insert({
        id: user.id,
        full_name,
        phone,
        user_type,
        is_active: true
      });

    if (profileError) {
      throw profileError;
    }

    res.json({
      success: true,
      message: 'User created successfully',
      user: { id: user.id, email, full_name }
    });

  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Get All Projects
app.get('/api/admin/projects', verifyAdminToken, async (req, res) => {
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

// Create Project
app.post('/api/admin/projects', verifyAdminToken, async (req, res) => {
  try {
    const { title, description, location, total_sqm, price_per_sqm, amenities, image_urls } = req.body;

    const { data: project, error } = await supabase
      .from('projects')
      .insert({
        title,
        description,
        location,
        total_sqm: parseInt(total_sqm),
        price_per_sqm: parseFloat(price_per_sqm),
        amenities: amenities || [],
        image_urls: image_urls || [],
        available_sqm: parseInt(total_sqm)
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      message: 'Project created successfully',
      project
    });

  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ error: 'Failed to create project' });
  }
});

// Update Project
app.put('/api/admin/projects/:id', verifyAdminToken, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const { data: project, error } = await supabase
      .from('projects')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      message: 'Project updated successfully',
      project
    });

  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({ error: 'Failed to update project' });
  }
});

// Delete Project
app.delete('/api/admin/projects/:id', verifyAdminToken, async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      message: 'Project deleted successfully'
    });

  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

// Update Project Status
app.patch('/api/admin/projects/:projectId/status', verifyAdminToken, async (req, res) => {
  try {
    const { projectId } = req.params;
    const { status } = req.body;

    const { error } = await supabase
      .from('projects')
      .update({ status })
      .eq('id', projectId);

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      message: 'Project status updated successfully'
    });

  } catch (error) {
    console.error('Update project status error:', error);
    res.status(500).json({ error: 'Failed to update project status' });
  }
});

// Get All Investments
app.get('/api/admin/investments', verifyAdminToken, async (req, res) => {
  try {
    const { data: investments, error } = await supabase
      .from('investments')
      .select('*')
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

// Get Connections
app.get('/api/admin/connections', verifyAdminToken, async (req, res) => {
  try {
    // This would typically get user connections/relationships
    // For now, return empty array
    res.json({
      success: true,
      connections: []
    });

  } catch (error) {
    console.error('Get connections error:', error);
    res.status(500).json({ error: 'Failed to get connections' });
  }
});

// Get Documents
app.get('/api/admin/documents', verifyAdminToken, async (req, res) => {
  try {
    // This would typically get documents from a documents table
    // For now, return empty array
    res.json({
      success: true,
      documents: []
    });

  } catch (error) {
    console.error('Get documents error:', error);
    res.status(500).json({ error: 'Failed to get documents' });
  }
});

// Upload Document
app.post('/api/admin/documents', verifyAdminToken, async (req, res) => {
  try {
    // This would handle document upload
    // For now, return success
    res.json({
      success: true,
      message: 'Document uploaded successfully'
    });

  } catch (error) {
    console.error('Upload document error:', error);
    res.status(500).json({ error: 'Failed to upload document' });
  }
});

// Send Document to User
app.post('/api/admin/documents/:docId/send', verifyAdminToken, async (req, res) => {
  try {
    const { docId } = req.params;
    const { userId } = req.body;

    // This would send document to user
    // For now, return success
    res.json({
      success: true,
      message: 'Document sent successfully'
    });

  } catch (error) {
    console.error('Send document error:', error);
    res.status(500).json({ error: 'Failed to send document' });
  }
});

// Delete Document
app.delete('/api/admin/documents/:docId', verifyAdminToken, async (req, res) => {
  try {
    const { docId } = req.params;

    // This would delete document
    // For now, return success
    res.json({
      success: true,
      message: 'Document deleted successfully'
    });

  } catch (error) {
    console.error('Delete document error:', error);
    res.status(500).json({ error: 'Failed to delete document' });
  }
});

// Get Messages
app.get('/api/admin/messages', verifyAdminToken, async (req, res) => {
  try {
    const { userId } = req.query;

    // This would get messages
    // For now, return empty array
    res.json({
      success: true,
      messages: []
    });

  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Failed to get messages' });
  }
});

// Send Message
app.post('/api/admin/messages', verifyAdminToken, async (req, res) => {
  try {
    const { recipientId, content } = req.body;

    // This would send message
    // For now, return success
    res.json({
      success: true,
      message: 'Message sent successfully'
    });

  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Verify Paystack Payment
app.get('/api/admin/paystack/verify/:reference', verifyAdminToken, async (req, res) => {
  try {
    const { reference } = req.params;

    // This would verify Paystack payment
    // For now, return success
    res.json({
      success: true,
      message: 'Payment verified successfully',
      reference
    });

  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({ error: 'Failed to verify payment' });
  }
});

// Get Recent Activities
app.get('/api/admin/activities', verifyAdminToken, async (req, res) => {
  try {
    // Get recent investments
    const { data: recentInvestments, error: invError } = await supabase
      .from('investments')
      .select('*')
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

// Get Admin Analytics
app.get('/api/activities/admin/analytics', verifyAdminToken, async (req, res) => {
  try {
    // Get analytics data
    const { data: investments } = await supabase
      .from('investments')
      .select('amount, created_at')
      .eq('status', 'completed');

    const { data: users } = await supabase
      .from('user_profiles')
      .select('created_at');

    // Calculate monthly trends
    const monthlyData = {};
    const currentDate = new Date();
    
    // Last 6 months
    for (let i = 5; i >= 0; i--) {
      const month = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthKey = month.toISOString().slice(0, 7);
      monthlyData[monthKey] = {
        investments: 0,
        users: 0,
        revenue: 0
      };
    }

    // Process investments
    investments?.forEach(inv => {
      const month = new Date(inv.created_at).toISOString().slice(0, 7);
      if (monthlyData[month]) {
        monthlyData[month].investments++;
        monthlyData[month].revenue += inv.amount || 0;
      }
    });

    // Process users
    users?.forEach(user => {
      const month = new Date(user.created_at).toISOString().slice(0, 7);
      if (monthlyData[month]) {
        monthlyData[month].users++;
      }
    });

    res.json({
      success: true,
      analytics: {
        monthlyData: Object.values(monthlyData),
        totalUsers: users?.length || 0,
        totalInvestments: investments?.length || 0,
        totalRevenue: investments?.reduce((sum, inv) => sum + (inv.amount || 0), 0) || 0
      }
    });

  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ error: 'Failed to get analytics' });
  }
});

// Get Admin Activities with Pagination
app.get('/api/activities/admin/activities', verifyAdminToken, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    // Get recent investments
    const { data: recentInvestments, error: invError } = await supabase
      .from('investments')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Get recent forum activities
    const { data: recentTopics, error: topicError } = await supabase
      .from('forum_topics')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (invError) throw invError;
    if (topicError) throw topicError;

    res.json({
      success: true,
      activities: {
        recentInvestments: recentInvestments || [],
        recentTopics: recentTopics || [],
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          hasMore: (recentInvestments?.length || 0) === parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Get activities error:', error);
    res.status(500).json({ error: 'Failed to get activities' });
  }
});

// Get Admin Settings
app.get('/api/admin/settings', verifyAdminToken, async (req, res) => {
  try {
    // This would get admin settings
    // For now, return default settings
    res.json({
      success: true,
      settings: {
        siteName: 'Subx',
        contactEmail: 'admin@subxhq.com',
        maintenanceMode: false
      }
    });

  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ error: 'Failed to get settings' });
  }
});

// Get Pending Verifications
app.get('/api/verification/admin/pending', verifyAdminToken, async (req, res) => {
  try {
    // This would get pending verifications
    // For now, return empty array
    res.json({
      success: true,
      verifications: []
    });

  } catch (error) {
    console.error('Get pending verifications error:', error);
    res.status(500).json({ error: 'Failed to get pending verifications' });
  }
});

// Update Admin Settings
app.put('/api/admin/settings', verifyAdminToken, async (req, res) => {
  try {
    const settings = req.body;

    // This would update admin settings
    // For now, return success
    res.json({
      success: true,
      message: 'Settings updated successfully',
      settings
    });

  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Admin server running' });
});

// Start server
app.listen(port, () => {
  console.log(`Admin server running on port ${port}`);
  console.log(`Health check: http://localhost:${port}/api/health`);
  console.log(`Admin login: admin@subxhq.com / password`);
});
