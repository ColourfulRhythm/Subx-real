import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import OpenAI from 'openai';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import nodemailer from 'nodemailer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Supabase client
const supabase = createClient(
  'https://hclguhbswctxfahhzrrr.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjbGd1aGJzd2N0eGZhaGh6cnJyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDc2NTY4NywiZXhwIjoyMDcwMzQxNjg3fQ.ai07Fz6gadARMscOv8WzWvL-PX5F-tKHP5ZFyym27i0'
);

// Debug logging
console.log('🔧 Environment variables:');
console.log('SUPABASE_URL:', process.env.SUPABASE_URL || 'NOT SET');
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET (length: ' + process.env.SUPABASE_SERVICE_ROLE_KEY.length + ')' : 'NOT SET');
console.log('PORT:', process.env.PORT || 'NOT SET');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(helmet());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// File upload configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage });

// Authentication middleware
const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Authentication failed' });
  }
};

// Routes

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Supabase backend is running' });
});

// Get user count for landing page
app.get('/api/users/count', async (req, res) => {
  try {
    const { count, error } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });
    
    if (error) throw error;
    res.json({ count: count || 0 });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get available spots count
app.get('/api/spots-available', async (req, res) => {
  try {
    const { data, error } = await supabase.rpc('get_available_spots');
    if (error) throw error;
    res.json({ spotsAvailable: data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user profile
app.get('/api/users/:userId', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Try to find user by ID first, then by email
    let { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (!user && userId.includes('@')) {
      // Try by email
      const { data: userByEmail, error: emailError } = await supabase
        .from('users')
        .select('*')
        .eq('email', userId)
        .single();
      
      if (emailError) throw emailError;
      user = userByEmail;
    }

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update user profile
app.put('/api/users/:userId', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    const updateData = req.body;

    // Verify user owns this profile
    if (req.user.id !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const { data, error } = await supabase
      .from('users')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user properties/investments
app.get('/api/users/:userId/properties', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Verify user owns this data
    if (req.user.id !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const { data, error } = await supabase
      .from('ownership_units')
      .select(`
        *,
        properties (
          id,
      name,
          description,
          location,
          images
        )
      `)
      .eq('owner_id', userId);

    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all properties
app.get('/api/properties', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('status', 'active');

    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get property details
app.get('/api/properties/:propertyId', async (req, res) => {
  try {
    const { propertyId } = req.params;
    
    const { data, error } = await supabase
      .from('properties')
      .select(`
        *,
        ownership_units (
          id,
          size_sqm,
          owner_id,
          users!ownership_units_owner_id_fkey (
            id,
            full_name,
            email
          )
        )
      `)
      .eq('id', propertyId)
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create investment
app.post('/api/investments', authMiddleware, async (req, res) => {
  try {
    const { propertyId, amount, paymentReference } = req.body;
    const userId = req.user.id;

    // Get property details
    const { data: property, error: propError } = await supabase
      .from('properties')
      .select('*')
      .eq('id', propertyId)
      .single();

    if (propError || !property) {
      return res.status(404).json({ error: 'Property not found' });
    }

    const sqm = amount / property.price_per_sqm;
    
    if (sqm > property.available_sqm) {
      return res.status(400).json({ error: 'Insufficient sqm available' });
    }

    // Create transaction record
    const { data: transaction, error: transError } = await supabase
      .from('transactions')
      .insert({
        user_id: userId,
        property_id: propertyId,
        amount: amount,
        payment_reference: paymentReference,
        status: 'pending'
      })
      .select()
      .single();

    if (transError) throw transError;

    res.json({ 
      message: 'Investment created successfully',
      transaction: transaction
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Verify Paystack payment
app.get('/api/verify-paystack/:reference', async (req, res) => {
  try {
    const { reference } = req.params;
    const secretKey = process.env.PAYSTACK_SECRET_KEY;

    if (!secretKey) {
      return res.status(500).json({ error: 'Paystack secret key not configured' });
    }

    const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: {
        'Authorization': `Bearer ${secretKey}`
      }
    });

    const data = await response.json();
    
    if (data.status && data.data.status === 'success') {
      // Finalize purchase in Supabase
      const { error } = await supabase.rpc('finalize_purchase', { p_payment_ref: reference });
      if (error) throw error;
      
      res.json({ success: true, data: data.data });
    } else {
      res.json({ success: false, data: data.data });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Forum routes
app.get('/api/forum/categories', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('forum_categories')
      .select('*')
      .order('name');

    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/forum/topics', async (req, res) => {
  try {
    const { categoryId } = req.query;
    let query = supabase
      .from('forum_topics')
      .select(`
        *,
        users!forum_topics_author_id_fkey (
          id,
          full_name,
          email
        ),
        forum_categories!forum_topics_category_id_fkey (
          name,
          slug
        )
      `)
      .order('created_at', { ascending: false });

    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }

    const { data, error } = await query;
    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/forum/topics', authMiddleware, async (req, res) => {
  try {
    const { title, content, categoryId } = req.body;
    const authorId = req.user.id;

    const { data, error } = await supabase
      .from('forum_topics')
      .insert({
        title,
        content,
        category_id: categoryId,
        author_id: authorId
      })
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/forum/topics/:topicId/replies', async (req, res) => {
  try {
    const { topicId } = req.params;

    const { data, error } = await supabase
      .from('forum_replies')
      .select(`
        *,
        users!forum_replies_author_id_fkey (
          id,
          full_name,
          email
        )
      `)
      .eq('topic_id', topicId)
      .order('created_at');

    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/forum/replies', authMiddleware, async (req, res) => {
  try {
    const { content, topicId, parentReplyId } = req.body;
    const authorId = req.user.id;

    const { data, error } = await supabase
      .from('forum_replies')
      .insert({
        content,
        topic_id: topicId,
        author_id: authorId,
        parent_reply_id: parentReplyId || null
      })
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Generate deed/certificate
app.post('/api/documents/generate', authMiddleware, async (req, res) => {
  try {
    const { ownershipUnitId, documentType } = req.body;
    const userId = req.user.id;

    // Verify ownership
    const { data: unit, error: unitError } = await supabase
      .from('ownership_units')
      .select('*, properties(*)')
      .eq('id', ownershipUnitId)
      .eq('owner_id', userId)
      .single();

    if (unitError || !unit) {
      return res.status(404).json({ error: 'Ownership unit not found' });
    }

    // Call Supabase Edge Function
    const { data, error } = await supabase.functions.invoke('generate_deed', {
      body: { ownership_unit_id: ownershipUnitId, document_type: documentType }
    });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Supabase backend server running on port ${PORT}`);
});
