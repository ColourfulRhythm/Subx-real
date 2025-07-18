# Subx - Real Estate Investment Platform

A comprehensive real estate investment platform built with React, Node.js, and MongoDB. The platform connects investors with property developers and provides a complete investment management system.

## 🏗️ Project Structure

```
Subx-real/
├── backend/                 # Node.js/Express API server
├── admin-frontend/          # React admin dashboard
├── src/                     # React user frontend
├── firebase.json           # Firebase configuration
└── README.md               # This file
```

## 🚀 Features

### User Frontend (Investor Dashboard)
- **Property Discovery**: Browse available real estate investments
- **Investment Management**: Track portfolio and returns
- **Document Management**: Download receipts, certificates, and deeds
- **Analytics**: Investment performance and market insights
- **Connections**: Connect with property developers
- **Forum**: Community discussions and insights

### Admin Dashboard
- **User Management**: Manage investors and developers
- **Project Management**: Create and manage property listings
- **Analytics**: Platform statistics and insights
- **Document Management**: Handle legal documents and certificates
- **Verification System**: KYC and AML compliance

### Backend API
- **Authentication**: JWT and Firebase Auth
- **File Upload**: Document and image management
- **Email Notifications**: SendGrid integration
- **Payment Processing**: Paystack integration
- **Database**: MongoDB with Mongoose ODM

## 🛠️ Tech Stack

### Frontend
- **React 18** with Vite
- **React Router DOM** for navigation
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **Axios** for API calls

### Backend
- **Node.js** with Express
- **MongoDB** with Mongoose
- **Firebase Admin SDK** for authentication and storage
- **SendGrid** for email notifications
- **Paystack** for payment processing
- **Multer** for file uploads

### Development Tools
- **ESLint** for code linting
- **Prettier** for code formatting
- **Nodemon** for development server
- **Vite** for fast development builds

## 📦 Installation

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or cloud)
- Firebase project
- SendGrid account
- Paystack account

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd Subx-real/backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create environment file:**
   ```bash
   cp .env.example .env
   ```

4. **Configure environment variables:**
   ```env
   MONGODB_URI=mongodb://localhost:27017/subx
   JWT_SECRET=your-secret-key
   FIREBASE_PROJECT_ID=your-firebase-project-id
   FIREBASE_PRIVATE_KEY=your-firebase-private-key
   FIREBASE_CLIENT_EMAIL=your-firebase-client-email
   SENDGRID_API_KEY=your-sendgrid-api-key
   FROM_EMAIL=your-email@domain.com
   PAYSTACK_SECRET_KEY=your-paystack-secret-key
   OPENAI_API_KEY=your-openai-api-key
   ```

5. **Start the backend server:**
   ```bash
   npm run dev
   ```

### User Frontend Setup

1. **Navigate to project root:**
   ```bash
   cd Subx-real
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

### Admin Frontend Setup

1. **Navigate to admin frontend directory:**
   ```bash
   cd Subx-real/admin-frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

## 🌐 Access Points

- **User Frontend**: http://localhost:5173
- **Admin Dashboard**: http://localhost:3002
- **Backend API**: http://localhost:30001

## 🔐 Default Admin Credentials

- **Email**: admin@subx.com
- **Password**: admin123

## 📁 Key Files and Directories

### Backend
- `server.js` - Main server file
- `models/` - MongoDB schemas
- `routes/` - API endpoints
- `middleware/` - Authentication and validation
- `config/` - Database and Firebase configuration

### Frontend
- `src/App.jsx` - Main app component
- `src/routes/` - Page components
- `src/components/` - Reusable components
- `src/hooks/` - Custom React hooks
- `src/api/` - API service functions

### Admin Frontend
- `src/App.jsx` - Admin app component
- `src/pages/` - Admin page components
- `src/components/` - Admin components
- `src/hooks/` - Admin hooks
- `src/api/` - Admin API services

## 🔧 Development

### Running in Development Mode

1. **Start all services:**
   ```bash
   # Terminal 1 - Backend
   cd Subx-real/backend && npm run dev

   # Terminal 2 - User Frontend
   cd Subx-real && npm run dev

   # Terminal 3 - Admin Frontend
   cd Subx-real/admin-frontend && npm run dev
   ```

2. **Access the applications:**
   - User Frontend: http://localhost:5173
   - Admin Dashboard: http://localhost:3002
   - Backend API: http://localhost:30001

### Database Seeding

To populate the database with sample data:

```bash
cd Subx-real/backend
node scripts/seedData.js
```

### Creating Admin User

To create an admin user:

```bash
cd Subx-real/backend
node scripts/createAdmin.js
```

## 🚀 Deployment

### Firebase Hosting (Frontend)

1. **Build the applications:**
   ```bash
   # User frontend
   cd Subx-real && npm run build

   # Admin frontend
   cd Subx-real/admin-frontend && npm run build
   ```

2. **Deploy to Firebase:**
   ```bash
   firebase deploy
   ```

### Backend Deployment

The backend can be deployed to:
- **Heroku**
- **Railway**
- **DigitalOcean**
- **AWS EC2**

## 📝 API Documentation

### Authentication Endpoints
- `POST /api/admin/login` - Admin login
- `POST /api/developers/register` - Developer registration

### Admin Endpoints
- `GET /api/admin/stats` - Dashboard statistics
- `GET /api/admin/users` - List all users
- `GET /api/admin/projects` - List all projects
- `PUT /api/admin/profile` - Update admin profile

### User Endpoints
- `GET /api/verification/status/:id` - Get verification status
- `POST /api/documents/upload` - Upload documents

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Contact the development team

## 🔄 Version History

- **v1.0.0** - Initial release with core features
- **v1.1.0** - Added document management and email notifications
- **v1.2.0** - Enhanced admin dashboard and analytics
