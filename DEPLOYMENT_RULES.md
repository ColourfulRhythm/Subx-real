# 🚀 Subx Deployment Rules

## ⚠️ MANDATORY DEPLOYMENT WORKFLOW

### Rule #1: ALWAYS BUILD BEFORE DEPLOY
```bash
# ❌ NEVER DO THIS:
firebase deploy

# ✅ ALWAYS DO THIS:
npm run build
firebase deploy --project subx-825e9

# OR use the deployment script:
./deploy.sh
```

### Rule #2: Site URL Configuration
- **Production Site**: https://subxhq.com
- **Firebase Project**: subx-825e9
- **Backup Site**: https://subxhq-com.web.app

## 🔧 Deployment Commands

### Option 1: Use Deployment Script (Recommended)
```bash
./deploy.sh
```
This script automatically:
1. Installs dependencies
2. Runs `npm run build`
3. Verifies build output
4. Deploys to Firebase
5. Shows deployment status

### Option 2: Manual Deployment
```bash
# Step 1: Build (MANDATORY)
npm run build

# Step 2: Deploy
firebase deploy --project subx-825e9
```

### Option 3: NPM Script
```bash
npm run deploy:firebase
```

## 🚨 Common Issues & Solutions

### Issue: "Objects are not valid as a React child"
**Solution**: Always run `npm run build` before deployment to catch React errors

### Issue: HMR (Hot Module Reload) Errors
**Solution**: 
1. Stop dev server
2. Run `npm run build`
3. Restart dev server with `npm run dev`

### Issue: Site URL not updating
**Solution**: Check `src/config/environment.js` and ensure siteUrl is set to `https://subxhq.com`

## 📋 Pre-Deployment Checklist

- [ ] Code changes committed to git
- [ ] `npm run build` runs without errors
- [ ] Site URL is set to `https://subxhq.com`
- [ ] Firebase project is `subx-825e9`
- [ ] All environment variables are correct

## 🌐 Post-Deployment Verification

After deployment, verify:
- [ ] Site loads at https://subxhq.com
- [ ] User authentication works
- [ ] Dashboard renders without errors
- [ ] All features function properly

## 🔄 Development vs Production

### Development
- URL: http://localhost:5173
- Mode: development
- Hot reloading enabled

### Production
- URL: https://subxhq.com
- Mode: production
- Optimized build
- No hot reloading

---

**Remember: Build first, deploy second! 🚀**
