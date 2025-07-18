import { connectDB } from '../config/db.js';
import { Project } from '../models/Project.js';
import { User } from '../models/User.js';
import { Investment } from '../models/Investment.js';
import { Developer } from '../models/Developer.js';
import bcrypt from 'bcryptjs';

const seedData = async () => {
  try {
    await connectDB();
    console.log('Connected to MongoDB');

    // Clear existing data
    await Project.deleteMany({});
    await User.deleteMany({ role: { $ne: 'admin' } });
    await Investment.deleteMany({});
    await Developer.deleteMany({});

    // Create sample developer
    const developer = new Developer({
      name: 'Focal Point Property Development',
      company: 'Focal Point Property Development and Management Services Ltd.',
      email: 'info@focalpoint.com',
      password: await bcrypt.hash('password123', 10),
      phone: '+234 801 234 5678',
      website: 'https://focalpoint.com',
      bio: 'Leading property development company in Nigeria',
      isSubscribed: true,
      minUnits: 1,
      maxUnits: 1000,
      unitPrice: 2500000,
      investmentFocus: ['Residential', 'Commercial', 'Mixed-use'],
      completedProjects: ['Luxury Apartments Lagos', 'Office Complex Abuja'],
      yearsOfExperience: 15,
      certifications: ['Nigerian Institute of Estate Surveyors', 'Real Estate Developers Association']
    });
    await developer.save();

    // Create sample users
    const users = [
      {
        name: 'John Doe',
        email: 'john@example.com',
        password: await bcrypt.hash('password123', 10),
        role: 'investor',
        phone: '+234 802 345 6789',
        bio: 'Real estate investor with 10 years experience',
        isActive: true
      },
      {
        name: 'Jane Smith',
        email: 'jane@example.com',
        password: await bcrypt.hash('password123', 10),
        role: 'investor',
        phone: '+234 803 456 7890',
        bio: 'Property portfolio manager',
        isActive: true
      },
      {
        name: 'Mike Johnson',
        email: 'mike@example.com',
        password: await bcrypt.hash('password123', 10),
        role: 'developer',
        phone: '+234 804 567 8901',
        bio: 'Independent property developer',
        isActive: true
      }
    ];

    const savedUsers = await User.insertMany(users);

    // Create sample projects
    const projects = [
      {
        title: '2 Seasons - Plot 76',
        description: 'Premium residential plot in prime location with modern amenities',
        location: 'Lekki, Lagos',
        type: 'Residential Plot',
        propertyType: 'residential',
        priceRange: '₦2M - ₦5M',
        targetMarket: 'High-end investors',
        completionDate: '2024-12-31',
        roi: '8-12% annually',
        riskLevel: 'low',
        minInvestment: 2000000,
        maxInvestment: 5000000,
        imageUrls: ['/uploads/projects/2seasons-76.jpg'],
        developerId: developer._id,
        status: 'in-progress',
        units: {
          total: 1,
          available: 1,
          price: 2500000
        },
        amenities: ['24/7 Security', 'Gated Community', 'Water Supply', 'Electricity', 'Road Access', 'Drainage System']
      },
      {
        title: '2 Seasons - Plot 77',
        description: 'Premium residential plot with excellent investment potential',
        location: 'Lekki, Lagos',
        type: 'Residential Plot',
        propertyType: 'residential',
        priceRange: '₦2M - ₦5M',
        targetMarket: 'High-end investors',
        completionDate: '2024-12-31',
        roi: '8-12% annually',
        riskLevel: 'low',
        minInvestment: 2000000,
        maxInvestment: 5000000,
        imageUrls: ['/uploads/projects/2seasons-77.jpg'],
        developerId: developer._id,
        status: 'in-progress',
        units: {
          total: 1,
          available: 1,
          price: 2500000
        },
        amenities: ['24/7 Security', 'Gated Community', 'Water Supply', 'Electricity', 'Road Access', 'Drainage System']
      },
      {
        title: '2 Seasons - Plot 78',
        description: 'Premium residential plot in growing neighborhood',
        location: 'Lekki, Lagos',
        type: 'Residential Plot',
        propertyType: 'residential',
        priceRange: '₦2M - ₦5M',
        targetMarket: 'High-end investors',
        completionDate: '2024-12-31',
        roi: '8-12% annually',
        riskLevel: 'low',
        minInvestment: 2000000,
        maxInvestment: 5000000,
        imageUrls: ['/uploads/projects/2seasons-78.jpg'],
        developerId: developer._id,
        status: 'in-progress',
        units: {
          total: 1,
          available: 1,
          price: 2500000
        },
        amenities: ['24/7 Security', 'Gated Community', 'Water Supply', 'Electricity', 'Road Access', 'Drainage System']
      },
      {
        title: '2 Seasons - Plot 79',
        description: 'Premium residential plot with future development potential',
        location: 'Lekki, Lagos',
        type: 'Residential Plot',
        propertyType: 'residential',
        priceRange: '₦2M - ₦5M',
        targetMarket: 'High-end investors',
        completionDate: '2024-12-31',
        roi: '8-12% annually',
        riskLevel: 'low',
        minInvestment: 2000000,
        maxInvestment: 5000000,
        imageUrls: ['/uploads/projects/2seasons-79.jpg'],
        developerId: developer._id,
        status: 'in-progress',
        units: {
          total: 1,
          available: 1,
          price: 2500000
        },
        amenities: ['24/7 Security', 'Gated Community', 'Water Supply', 'Electricity', 'Road Access', 'Drainage System']
      },
      {
        title: '2 Seasons - Plot 80',
        description: 'Premium residential plot in exclusive area',
        location: 'Lekki, Lagos',
        type: 'Residential Plot',
        propertyType: 'residential',
        priceRange: '₦2M - ₦5M',
        targetMarket: 'High-end investors',
        completionDate: '2024-12-31',
        roi: '8-12% annually',
        riskLevel: 'low',
        minInvestment: 2000000,
        maxInvestment: 5000000,
        imageUrls: ['/uploads/projects/2seasons-80.jpg'],
        developerId: developer._id,
        status: 'in-progress',
        units: {
          total: 1,
          available: 1,
          price: 2500000
        },
        amenities: ['24/7 Security', 'Gated Community', 'Water Supply', 'Electricity', 'Road Access', 'Drainage System']
      }
    ];

    const savedProjects = await Project.insertMany(projects);

    // Create sample investments
    const investments = [
      {
        investorId: savedUsers[0]._id, // John Doe
        projectId: savedProjects[0]._id, // Plot 76
        amount: 2500000,
        units: 1,
        status: 'approved',
        createdAt: new Date('2024-01-15')
      },
      {
        investorId: savedUsers[1]._id, // Jane Smith
        projectId: savedProjects[1]._id, // Plot 77
        amount: 2500000,
        units: 1,
        status: 'approved',
        createdAt: new Date('2024-01-20')
      },
      {
        investorId: savedUsers[0]._id, // John Doe
        projectId: savedProjects[2]._id, // Plot 78
        amount: 2500000,
        units: 1,
        status: 'pending',
        createdAt: new Date('2024-01-25')
      }
    ];

    await Investment.insertMany(investments);

    console.log('Sample data seeded successfully!');
    console.log(`Created ${savedUsers.length} users`);
    console.log(`Created ${savedProjects.length} projects`);
    console.log(`Created ${investments.length} investments`);

    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData(); 