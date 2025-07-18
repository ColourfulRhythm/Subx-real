import jwt from 'jsonwebtoken';
import { auth as firebaseAuth } from '../firebase.js';
import { getAuth } from 'firebase-admin/auth';
import { Admin } from '../models/Admin.js';
import { User } from '../models/User.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      throw new Error('No token provided');
    }

    // Verify Firebase ID token
    const decodedToken = await getAuth().verifyIdToken(token);
    if (!decodedToken) {
      throw new Error('Invalid token');
    }

    // Set user info from Firebase token
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      role: decodedToken.role || 'user'
    };
    
    req.token = token;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ error: 'Please authenticate' });
  }
};

export const adminAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      throw new Error();
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const admin = await Admin.findOne({ _id: decoded.id });
    
    if (!admin) {
      throw new Error();
    }

    req.admin = admin;
    req.token = token;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Please authenticate as admin' });
  }
}; 