import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';
import Developer from './models/Developer.js';
import Project from './models/Project.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, 'uploads'));
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage });

// Authentication middleware
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      throw new Error();
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const developer = await Developer.findOne({ _id: decoded.id });
    
    if (!developer) {
      throw new Error();
    }

    req.developer = developer;
    req.token = token;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Please authenticate' });
  }
};

// Developer routes
app.post('/api/developers/register', upload.single('logo'), async (req, res) => {
  try {
    console.log('Received registration request:', req.body);
    
    const { 
      name, 
      company, 
      email, 
      password,
      phone, 
      website, 
      bio, 
      isSubscribed,
      minUnits,
      maxUnits,
      unitPrice,
      investmentFocus,
      completedProjects,
      yearsOfExperience,
      certifications,
      socialLinks
    } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['name', 'email', 'password']
      });
    }

    // Check if developer already exists
    const existingDeveloper = await Developer.findOne({ email });
    if (existingDeveloper) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    // Safely parse JSON fields
    const parseJsonField = (field, defaultValue = []) => {
      if (!field) return defaultValue;
      
      // If it's already an array, return it
      if (Array.isArray(field)) return field;
      
      // If it's already an object, return it
      if (typeof field === 'object') return field;
      
      // If it's a string, try to parse it
      if (typeof field === 'string') {
        try {
          // First try to parse as JSON
          return JSON.parse(field);
        } catch (error) {
          // If it's a comma-separated string, split it
          if (field.includes(',')) {
            return field.split(',').map(item => item.trim());
          }
          // Otherwise return as single item array
          return [field];
        }
      }
      
      return defaultValue;
    };

    // Parse fields with logging
    console.log('Parsing investment focus:', investmentFocus);
    const parsedInvestmentFocus = parseJsonField(investmentFocus);
    console.log('Parsed investment focus:', parsedInvestmentFocus);

    console.log('Parsing completed projects:', completedProjects);
    const parsedCompletedProjects = parseJsonField(completedProjects);
    console.log('Parsed completed projects:', parsedCompletedProjects);

    console.log('Parsing certifications:', certifications);
    const parsedCertifications = parseJsonField(certifications);
    console.log('Parsed certifications:', parsedCertifications);

    console.log('Parsing social links:', socialLinks);
    const parsedSocialLinks = parseJsonField(socialLinks, {});
    console.log('Parsed social links:', parsedSocialLinks);

    const developer = new Developer({
      name,
      company,
      email,
      password: hashedPassword,
      phone,
      website,
      bio,
      imageUrl,
      isSubscribed: isSubscribed === 'true',
      minUnits: parseInt(minUnits) || 1,
      maxUnits: parseInt(maxUnits) || 1000000,
      unitPrice: parseInt(unitPrice) || 0,
      investmentFocus: parsedInvestmentFocus,
      completedProjects: parsedCompletedProjects,
      yearsOfExperience: parseInt(yearsOfExperience) || 0,
      certifications: parsedCertifications,
      socialLinks: parsedSocialLinks
    });

    console.log('Creating developer:', developer);

    await developer.save();

    // Generate token
    const token = jwt.sign({ id: developer._id }, JWT_SECRET);

    res.status(201).json({ 
      message: 'Developer registered successfully',
      developer,
      token
    });
  } catch (error) {
    console.error('Error registering developer:', error);
    res.status(500).json({ 
      error: 'Failed to register developer',
      details: error.message 
    });
  }
});

app.post('/api/developers/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find developer by email
    const developer = await Developer.findOne({ email });
    if (!developer) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, developer.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate token
    const token = jwt.sign({ id: developer._id }, JWT_SECRET);

    // Send response in the format expected by the frontend
    res.json({
      token,
      developer: {
        id: developer._id,
        name: developer.name,
        email: developer.email,
        company: developer.company
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

app.get('/api/developers', async (req, res) => {
  try {
    const developers = await Developer.find().select('-password');
    res.json(developers);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch developers' });
  }
});

app.get('/api/developers/:id', async (req, res) => {
  try {
    const developer = await Developer.findById(req.params.id).select('-password');
    if (!developer) {
      return res.status(404).json({ error: 'Developer not found' });
    }
    res.json(developer);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch developer' });
  }
});

app.put('/api/developers/:id', auth, upload.single('logo'), async (req, res) => {
  try {
    const updates = req.body;
    if (req.file) {
      updates.imageUrl = `/uploads/${req.file.filename}`;
    }

    const developer = await Developer.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    if (!developer) {
      return res.status(404).json({ error: 'Developer not found' });
    }

    res.json({ 
      message: 'Developer updated successfully',
      developer
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update developer' });
  }
});

app.delete('/api/developers/:id', auth, async (req, res) => {
  try {
    const developer = await Developer.findByIdAndDelete(req.params.id);
    if (!developer) {
      return res.status(404).json({ error: 'Developer not found' });
    }
    res.json({ message: 'Developer deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete developer' });
  }
});

// Project routes
app.post('/api/projects', auth, upload.array('images', 5), async (req, res) => {
  try {
    const { title, description, location, type, units } = req.body;
    const imageUrls = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];

    const project = new Project({
      title,
      description,
      location,
      type,
      imageUrls,
      developerId: req.developer._id,
      units: JSON.parse(units)
    });

    await project.save();
    res.status(201).json({ message: 'Project created successfully', project });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create project' });
  }
});

app.get('/api/projects', async (req, res) => {
  try {
    const projects = await Project.find().populate('developerId', 'name company');
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

app.get('/api/projects/:developerId', async (req, res) => {
  try {
    const projects = await Project.find({ developerId: req.params.developerId })
      .populate('developerId', 'name company');
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch developer projects' });
  }
});

// Investor routes
app.post('/api/investors', (req, res) => {
  try {
  const { name, email, phone, bio, investmentInterests } = req.body;

  const investor = {
    id: Date.now().toString(),
    name,
    email,
    phone,
    bio,
    investmentInterests,
    createdAt: new Date().toISOString(),
  };

  investors.push(investor);
    res.json({ message: 'Investor created successfully', investor });
  } catch (error) {
    console.error('Error creating investor:', error);
    res.status(500).json({ error: 'Failed to create investor' });
  }
});

app.get('/api/investors', (req, res) => {
  try {
  res.json(investors);
  } catch (error) {
    console.error('Error fetching investors:', error);
    res.status(500).json({ error: 'Failed to fetch investors' });
  }
});

// Connection routes
app.post('/api/connections/request', async (req, res) => {
  try {
    const { investorId, developerId, projectId, units, investmentAmount, notes } = req.body;
    
    // Validate required fields
    if (!investorId || !developerId || !projectId || !units || !investmentAmount) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['investorId', 'developerId', 'projectId', 'units', 'investmentAmount']
      });
    }

    // Create connection request
    const connectionRequest = {
      id: Date.now().toString(),
      investorId,
      developerId,
      projectId,
      units: parseInt(units),
      investmentAmount: parseInt(investmentAmount),
      notes: notes || '',
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    connections.push(connectionRequest);
    res.json({ 
      message: 'Connection request sent successfully',
      request: connectionRequest
    });
  } catch (error) {
    console.error('Error creating connection request:', error);
    res.status(500).json({ error: 'Failed to create connection request' });
  }
});

app.get('/api/connections/:investorId', (req, res) => {
  try {
    const { investorId } = req.params;
    const investorConnections = connections.filter(
      (connection) => connection.investorId === investorId
    );
    res.json(investorConnections);
  } catch (error) {
    console.error('Error fetching connections:', error);
    res.status(500).json({ error: 'Failed to fetch connections' });
  }
});

// Root path handler
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Subx API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      developers: {
        register: '/api/developers/register',
        login: '/api/developers/login',
        list: '/api/developers',
        getById: '/api/developers/:id'
      },
      projects: {
        list: '/api/projects',
        getByDeveloper: '/api/projects/:developerId'
      }
    }
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server with error handling
const startServer = (port) => {
  const server = app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
  }).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`Port ${port} is in use, trying ${port + 1}...`);
      startServer(port + 1);
    } else {
      console.error('Error starting server:', err);
      process.exit(1);
    }
  });

  // Handle graceful shutdown
  process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
      console.log('HTTP server closed');
      process.exit(0);
    });
  });
};

startServer(port); 