import 'dotenv/config';
import connectDB from '../config/db.js';
import Admin from '../models/Admin.js';
import bcrypt from 'bcryptjs';

const createDefaultAdmin = async () => {
  try {
    await connectDB();

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: 'admin@subx.com' });
    if (existingAdmin) {
      console.log('Default admin already exists');
      process.exit(0);
    }

    // Create default admin
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const admin = new Admin({
      name: 'Admin User',
      email: 'admin@subx.com',
      password: hashedPassword,
      role: 'super_admin'
    });

    await admin.save();
    console.log('Default admin created successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error creating default admin:', error);
    process.exit(1);
  }
};

createDefaultAdmin(); 