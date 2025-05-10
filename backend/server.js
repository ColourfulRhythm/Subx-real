import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
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

// In-memory storage (replace with database later)
let developers = [];
let investors = [];
let projects = [];
let connections = [];

// Developer routes
app.post('/api/developers', upload.single('logo'), (req, res) => {
  try {
    const { 
      name, 
      company, 
      email, 
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

  const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

  const developer = {
    id: Date.now().toString(),
    name,
    company,
    email,
    phone,
    website,
    bio,
    imageUrl,
    isSubscribed: isSubscribed === 'true',
      minUnits: parseInt(minUnits) || 1,
      maxUnits: parseInt(maxUnits) || 1000000,
      unitPrice: parseInt(unitPrice) || 0,
      investmentFocus: investmentFocus ? JSON.parse(investmentFocus) : [],
      completedProjects: completedProjects ? JSON.parse(completedProjects) : [],
      yearsOfExperience: parseInt(yearsOfExperience) || 0,
      certifications: certifications ? JSON.parse(certifications) : [],
      socialLinks: socialLinks ? JSON.parse(socialLinks) : {},
    createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
  };

  developers.push(developer);
    res.json({ message: 'Developer created successfully', developer });
  } catch (error) {
    console.error('Error creating developer:', error);
    res.status(500).json({ error: 'Failed to create developer' });
  }
});

app.get('/api/developers', (req, res) => {
  try {
  res.json(developers);
  } catch (error) {
    console.error('Error fetching developers:', error);
    res.status(500).json({ error: 'Failed to fetch developers' });
  }
});

app.get('/api/developers/:id', (req, res) => {
  try {
    const developer = developers.find(d => d.id === req.params.id);
    if (!developer) {
      return res.status(404).json({ error: 'Developer not found' });
    }
    res.json(developer);
  } catch (error) {
    console.error('Error fetching developer:', error);
    res.status(500).json({ error: 'Failed to fetch developer' });
  }
});

app.put('/api/developers/:id', upload.single('logo'), (req, res) => {
  try {
    console.log('Received update request for developer:', req.params.id);
    console.log('Request body:', req.body);
    console.log('Request file:', req.file);

    const developerIndex = developers.findIndex(d => d.id === req.params.id);
    if (developerIndex === -1) {
      return res.status(404).json({ error: 'Developer not found' });
    }

    const { 
      name, 
      company, 
      email, 
      phone, 
      website, 
      bio, 
      isSubscribed,
      minUnits,
      maxUnits,
      unitPrice,
      investmentFocus,
      yearsOfExperience
    } = req.body;

    // Parse JSON fields
    let parsedInvestmentFocus;
    try {
      parsedInvestmentFocus = investmentFocus ? JSON.parse(investmentFocus) : developers[developerIndex].investmentFocus;
    } catch (error) {
      console.error('Error parsing investment focus:', error);
      parsedInvestmentFocus = developers[developerIndex].investmentFocus;
    }

    // Parse numeric fields
    const parsedMinUnits = minUnits ? parseInt(minUnits) : developers[developerIndex].minUnits;
    const parsedMaxUnits = maxUnits ? parseInt(maxUnits) : developers[developerIndex].maxUnits;
    const parsedUnitPrice = unitPrice ? parseInt(unitPrice) : developers[developerIndex].unitPrice;
    const parsedYearsOfExperience = yearsOfExperience ? parseInt(yearsOfExperience) : developers[developerIndex].yearsOfExperience;

    const imageUrl = req.file ? `/uploads/${req.file.filename}` : developers[developerIndex].imageUrl;

    const updatedDeveloper = {
      ...developers[developerIndex],
      name: name || developers[developerIndex].name,
      company: company || developers[developerIndex].company,
      email: email || developers[developerIndex].email,
      phone: phone || developers[developerIndex].phone,
      website: website || developers[developerIndex].website,
      bio: bio || developers[developerIndex].bio,
      imageUrl,
      isSubscribed: isSubscribed ? isSubscribed === 'true' : developers[developerIndex].isSubscribed,
      minUnits: parsedMinUnits,
      maxUnits: parsedMaxUnits,
      unitPrice: parsedUnitPrice,
      investmentFocus: parsedInvestmentFocus,
      yearsOfExperience: parsedYearsOfExperience,
      updatedAt: new Date().toISOString()
    };

    developers[developerIndex] = updatedDeveloper;
    console.log('Updated developer:', updatedDeveloper);
    
    res.json({ 
      message: 'Developer updated successfully', 
      developer: updatedDeveloper 
    });
  } catch (error) {
    console.error('Error updating developer:', error);
    res.status(500).json({ 
      error: 'Failed to update developer: ' + error.message,
      details: error.stack
    });
  }
});

app.delete('/api/developers/:id', (req, res) => {
  try {
    const developerIndex = developers.findIndex(d => d.id === req.params.id);
    if (developerIndex === -1) {
      return res.status(404).json({ error: 'Developer not found' });
    }

    developers.splice(developerIndex, 1);
    res.json({ message: 'Developer deleted successfully' });
  } catch (error) {
    console.error('Error deleting developer:', error);
    res.status(500).json({ error: 'Failed to delete developer' });
  }
});

// Project routes
app.post('/api/projects', upload.array('images', 5), (req, res) => {
  try {
  const { title, description, location, type, developerId } = req.body;
  const imageUrls = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];

  const project = {
    id: Date.now().toString(),
    title,
    description,
    location,
    type,
    imageUrls,
    developerId,
    createdAt: new Date().toISOString(),
  };

  projects.push(project);
    res.json({ message: 'Project created successfully', project });
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ error: 'Failed to create project' });
  }
});

app.get('/api/projects', (req, res) => {
  try {
  res.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

app.get('/api/projects/:developerId', (req, res) => {
  try {
  const developerProjects = projects.filter(
    (project) => project.developerId === req.params.developerId
  );
  res.json(developerProjects);
  } catch (error) {
    console.error('Error fetching developer projects:', error);
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