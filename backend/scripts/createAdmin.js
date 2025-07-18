import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { Admin } from '../models/Admin.js';
import { connectDB } from '../config/db.js';

const createAdmin = async () => {
  try {
    await connectDB();

    const adminData = {
      name: 'Admin User',
      email: process.env.ADMIN_EMAIL || 'admin@subx.com',
      password: await bcrypt.hash(process.env.ADMIN_PASSWORD || 'admin123', 10),
      role: 'super_admin'
    };

    const existingAdmin = await Admin.findOne({ email: adminData.email });
    if (existingAdmin) {
      console.log('Admin user already exists');
      process.exit(0);
    }

    const admin = new Admin(adminData);
    await admin.save();

    console.log('Admin user created successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  }
};

createAdmin(); 