# Backend Deployment Guide

## 🚀 Option 1: Deploy to Vercel (Recommended)

### Prerequisites
1. Install Vercel CLI: `npm i -g vercel`
2. MongoDB Atlas account (for production database)
3. Vercel account

### Steps:

1. **Set up MongoDB Atlas:**
   - Create a free cluster at https://mongodb.com/atlas
   - Get your connection string
   - Replace `localhost:27017/subx` with your Atlas connection string

2. **Deploy to Vercel:**
   ```bash
   cd Subx-real/backend
   vercel login
   vercel
   ```

3. **Set Environment Variables in Vercel:**
   - Go to your Vercel dashboard
   - Navigate to your project settings
   - Add environment variables:
     - `MONGODB_URI`: Your MongoDB Atlas connection string
     - `JWT_SECRET`: A secure random string for JWT tokens

4. **Update Frontend API URL:**
   - After deployment, Vercel will give you a URL like `https://your-app.vercel.app`
   - Update `src/services/api.ts` with your Vercel URL:
   ```typescript
   const API_BASE_URL = window.location.hostname === 'localhost' 
     ? 'http://localhost:30001/api' 
     : 'https://your-app.vercel.app/api';
   ```

## 🐳 Option 2: Deploy to Railway

### Steps:
1. Go to https://railway.app
2. Connect your GitHub repository
3. Select the backend folder
4. Add environment variables (MONGODB_URI, JWT_SECRET)
5. Deploy

## ☁️ Option 3: Deploy to Heroku

### Steps:
1. Install Heroku CLI
2. Create `Procfile` in backend directory:
   ```
   web: node server.js
   ```
3. Deploy:
   ```bash
   heroku create your-app-name
   heroku config:set MONGODB_URI=your_mongodb_uri
   heroku config:set JWT_SECRET=your_jwt_secret
   git push heroku main
   ```

## 🔧 Option 4: Deploy to DigitalOcean App Platform

### Steps:
1. Go to DigitalOcean App Platform
2. Connect your repository
3. Select Node.js environment
4. Set environment variables
5. Deploy

## 📝 Environment Variables Needed:

```bash
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/subx
JWT_SECRET=your-super-secret-jwt-key
OPENAI_API_KEY=your-openai-key (optional)
SENDGRID_API_KEY=your-sendgrid-key (optional)
```

## 🔄 Automatic Deployment Setup:

### GitHub Actions (Recommended):
Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy Backend
on:
  push:
    branches: [main]
    paths: ['Subx-real/backend/**']

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          working-directory: ./Subx-real/backend
```

## 🎯 Recommended Approach:

1. **Use Vercel** for the backend (free tier available)
2. **Use MongoDB Atlas** for the database (free tier available)
3. **Set up GitHub Actions** for automatic deployment
4. **Update frontend** to use the production API URL

## 🔗 After Deployment:

1. Test your API endpoints
2. Update the frontend API URL
3. Deploy the updated frontend to Firebase
4. Test the complete signup flow

## 💡 Benefits of Cloud Deployment:

- ✅ Always running (24/7 uptime)
- ✅ Automatic scaling
- ✅ No localhost dependencies
- ✅ Professional reliability
- ✅ SSL certificates included
- ✅ Global CDN
- ✅ Easy environment management 