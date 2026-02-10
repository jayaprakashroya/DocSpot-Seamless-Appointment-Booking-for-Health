# 🚀 DEPLOYMENT GUIDE: Taking MediConnect Online

## Overview

To deploy MediConnect online, you need to deploy 3 components:

```
Frontend (React)    → Vercel / Netlify / GitHub Pages
        ↓
Backend (Node.js)   → Railway / Render / Heroku / AWS
        ↓
Database (MongoDB)  → MongoDB Atlas (Cloud)
```

---

## QUICKEST OPTION (Recommended for Beginners)

### **Component 1: Frontend → Vercel (FREE)**

**Time: 5 minutes**

#### Step 1: Prepare Frontend
```bash
cd frontend
npm run build
```
This creates a `build/` folder ready for hosting.

#### Step 2: Deploy to Vercel

**Option A: Easy (Using Web UI)**
1. Go to https://vercel.com
2. Click "Sign Up" (use GitHub account for easier setup)
3. Click "Import Project"
4. Select your GitHub repo containing MediConnect
5. Configure:
   - Framework: React
   - Root Directory: `frontend`
6. Click "Deploy"

**Done!** Your frontend is live at a Vercel URL (e.g., `MediConnect-frontend.vercel.app`)

**Option B: Using CLI**
```bash
# Install Vercel CLI
npm install -g vercel

# Go to frontend folder
cd frontend

# Deploy
vercel
# Follow prompts, select "frontend" as root directory
```

#### Environment Variable Setup
After deployment, add environment variable in Vercel:
1. Project Settings → Environment Variables
2. Add:
   ```
   REACT_APP_API_URL = https://your-backend-url.com/api
   ```
   (You'll set the backend URL in next step)

---

### **Component 2: Backend → Railway (FREE Trial, then $5/month)**

**Time: 10 minutes**

#### Step 1: Prepare Backend Files

Create `.env.production` in backend folder:
```bash
PORT=5000
MONGO_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/MediConnect
JWT_SECRET=use_a_very_secure_random_string_here_min_32_chars
FRONTEND_ORIGIN=https://your-frontend-url.vercel.app
NODE_ENV=production
```

#### Step 2: Create MongoDB Atlas Account (FREE)

1. Go to https://www.mongodb.com/cloud/atlas
2. Click "Sign Up" → Create account
3. Create a free cluster:
   - Cluster Name: `MediConnect-cluster`
   - Provider: AWS
   - Region: Choose nearest to you
   - Click "Create"
4. Wait 5-10 minutes for cluster creation
5. Create Database User:
   - Username: `MediConnect_admin`
   - Password: Generate secure password
   - Save these credentials!
6. Get Connection String:
   - Click "Connect"
   - Choose "Connect your application"
   - Drivers: Node.js
   - Copy connection string
   - Replace `<username>` and `<password>` with your credentials
   - Replace `MediConnect` in URI with your database name
   - This becomes your `MONGO_URI` in .env

#### Step 3: Seed Database in Cloud

```bash
# First, update .env file with MONGO_URI from Atlas

cd backend

# Run seed on cloud database
npm run seed

# You should see: ✅ Database seeded successfully
```

#### Step 4: Deploy Backend to Railway

1. Go to https://railway.app
2. Sign up with GitHub
3. Create new project
4. Select "Deploy from GitHub repo"
5. Choose your MediConnect backend repository
6. Configure:
   - Add environment variables from `.env.production`
   - Add all variables: PORT, MONGO_URI, JWT_SECRET, etc.
7. Click "Deploy"

**Railway will give you a URL like:** `https://MediConnect-production-xxxx.railway.app`

#### Step 5: Update Frontend Environment Variable

Go back to Vercel and update:
```
REACT_APP_API_URL = https://MediConnect-production-xxxx.railway.app/api
```

Vercel will auto-redeploy with new variable.

---

### **Component 3: Connect Everything**

#### Test the Connection

1. **Backend Health Check:**
   ```
   https://your-backend-url.railway.app/api/health
   ```
   Should return: `{"status":"ok",...}`

2. **Frontend Login:**
   ```
   https://your-frontend-url.vercel.app
   ```
   Should load the login page

3. **Test Login:**
   Use credentials: `liam.murphy@MediConnect.com` / `awoawmnrqcm`
   (Database was seeded with these when you ran `npm run seed`)

✅ **If all three work → Your app is live!**

---

## ALTERNATIVE DEPLOYMENT OPTIONS

### Frontend Alternatives

| Platform | Cost | Pros | Cons |
|----------|------|------|------|
| **Vercel** | Free | Easy, fast, React-optimized | Limited free tier |
| **Netlify** | Free | CI/CD built-in, good UI | Similar to Vercel |
| **GitHub Pages** | Free | No cost ever | Static only, no API integration |
| **AWS S3** | $1-5/mo | Scalable, S3 storage cheap | More complex setup |

### Backend Alternatives

| Platform | Cost | Pros | Cons |
|----------|------|------|------|
| **Railway** | $5/mo | Simple, free trial, GitHub sync | Limited free tier |
| **Render** | $7/mo | User-friendly, good docs | Slightly more expensive |
| **Heroku** | Free tier removed* | Used to be easiest | No longer has free tier |
| **AWS EC2** | $1-20/mo | Most powerful, scalable | Complex setup |
| **DigitalOcean** | $4-6/mo | Simple droplets, good docs | Requires command line |

### Database Alternatives

| Platform | Cost | Pros | Cons |
|----------|------|------|------|
| **MongoDB Atlas** | Free tier | Easy setup, good free tier | Limited storage (512MB) |
| **Render PostgreSQL** | Free tier | Good free tier, SQL | Different database (need schema changes) |
| **AWS RDS** | $10+/mo | Powerful, scalable | Expensive for small projects |

---

## COMPLETE SETUP EXAMPLE: Full Guide

### Prerequisites
- GitHub account (to store code)
- Credit card (for free trial verification)
- Email address

### Estimated Time: 30 minutes
### Estimated Cost: $0 (using free tiers) → $5-7/month (after free tier ends)

---

### STEP-BY-STEP: Deploy Everything

#### Phase 1: Database Setup (5 min)

```bash
# 1. Create MongoDB Atlas account
# Visit: https://www.mongodb.com/cloud/atlas
# - Sign up
# - Create free cluster (AWS, nearest region)
# - Create user: MediConnect_admin / [secure_password]
# - Get connection string

# 2. Save connection string in backend/.env
MONGO_URI=mongodb+srv://MediConnect_admin:YOUR_PASSWORD@MediConnect-cluster.mongodb.net/MediConnect?retryWrites=true&w=majority

# 3. Seed cloud database
cd backend
npm install
npm run seed
# Check: All 21 doctors created
```

#### Phase 2: Backend Deployment (10 min)

```bash
# 1. Push backend code to GitHub
cd backend
git add .
git commit -m "Deploy to production"
git push origin main

# 2. Go to Railway.app
# - Sign up with GitHub
# - New Project → Import from GitHub
# - Select backend folder
# - Add environment variables:
#   - MONGO_URI (from Atlas)
#   - JWT_SECRET (generate random: openssl rand -hex 32)
#   - FRONTEND_ORIGIN (you'll have from step 3)
#   - NODE_ENV=production
# - Deploy button → Done

# 3. Note the deployment URL (e.g., railwayapp-xxxx.railway.app)
```

#### Phase 3: Frontend Deployment (5 min)

```bash
# 1. Update frontend .env with backend URL
# File: frontend/.env
REACT_APP_API_URL=https://railwayapp-xxxx.railway.app/api

# 2. Push to GitHub
cd frontend
git add .
git commit -m "Update API URL for production"
git push origin main

# 3. Go to Vercel.com
# - Sign up with GitHub
# - New Project → Import from GitHub
# - Select frontend folder
# - Add environment variable:
#   - REACT_APP_API_URL (your Railway backend URL)
# - Deploy → Done

# Note the Vercel URL (e.g., MediConnect-frontend.vercel.app)
```

#### Phase 4: Final Connections (5 min)

```bash
# 1. Update Backend FRONTEND_ORIGIN
# Go to Railway dashboard → Settings → Environment Variables
# Update: FRONTEND_ORIGIN=https://MediConnect-frontend.vercel.app

# 2. Test Everything
# - Browser: https://MediConnect-frontend.vercel.app
# - Should load login page
# - Login with: liam.murphy@MediConnect.com / awoawmnrqcm
# - Should show real-time NavBar data
# - Success! ✅
```

---

## CUSTOM DOMAIN (Optional, $12/year)

### Add Custom Domain

1. **Buy domain:**
   - GoDaddy, Namecheap, Route53 (~$12/year)
   - Example: `MediConnect-app.com`

2. **Frontend Custom Domain (Vercel):**
   - Vercel Dashboard → Settings → Domains
   - Add custom domain
   - Follow DNS setup instructions

3. **Backend Custom Domain (Optional):**
   - Most backends use auto-generated URLs
   - Can add custom domain but requires DNS setup
   - Skip if using Railway's default URL

---

## MONITORING & MAINTENANCE

### Monitor Backend Health
```bash
# Create a monitoring check
# Every 5 minutes, visit:
https://your-backend-url.railway.app/api/health

# Add to your phone calendar as reminder to check
```

### View Logs

**Railway Logs:**
1. Go to Railway Dashboard
2. Select project
3. Click "Logs" → See real-time logs

**Vercel Logs:**
1. Go to Vercel Dashboard
2. Select project
3. Click "Deployments" → View logs

### Backup Database

**MongoDB Atlas:**
1. Dashboard → Backup
2. Create automatic daily backups
3. Download backups if needed

---

## SCALING UP (Future)

When you have more users:

| Issue | Solution | Cost |
|-------|----------|------|
| Frontend slow | Upgrade Vercel plan | $20/mo |
| Backend slow | Add more Railway dynos | $15+/mo |
| Database slow | MongoDB cluster upgrade | $57+/mo |
| More storage | MongoDB paid tier | $57+/mo |
| Better uptime | AWS multi-region | $100+/mo |

---

## TROUBLESHOOTING DEPLOYMENT

### Problem: "Cannot reach backend" in deployed app

**Diagnosis:**
1. Check backend is running: `https://backend-url/api/health`
2. Check frontend has correct API URL in environment variables
3. Check CORS is enabled in backend

**Fix:**
```javascript
// backend/index.js - CORS already configured
app.use(cors()); // Should allow frontend domain
```

If still failing:
```javascript
// Update CORS in backend/index.js
app.use(cors({
  origin: ['https://your-frontend-url.vercel.app', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true
}));
```

### Problem: "Database connection refused"

**Diagnosis:**
1. Check MONGO_URI is correct in Railway environment
2. Check MongoDB Atlas IP whitelist allows Railway IP
3. Check database credentials are correct

**Fix:**
```bash
# MongoDB Atlas Settings
# - Network Access → IP Whitelist
# - Add 0.0.0.0/0 (allows all IPs - for testing only)
# - Or add Railway's specific IP
```

### Problem: "Login works locally but not in production"

**Diagnosis:**
1. Check JWT_SECRET is same in production
2. Check database has seeded users
3. Check token is being stored in localStorage

**Fix:**
```bash
# 1. Verify secret is same everywhere
echo $JWT_SECRET  # Should match what you set in Railway

# 2. Check database has users
# MongoDB Atlas UI → Collections → users → Should see doctors

# 3. Clear browser cache
# F12 → Application → Clear All
```

---

## SECURITY CHECKLIST

Before going live, verify:

- [ ] JWT_SECRET is strong (32+ characters, random)
- [ ] MONGO_URI requires password authentication
- [ ] MongoDB IP whitelist configured (restrict to Railway IP if possible)
- [ ] Frontend has HTTPS enabled
- [ ] Backend has HTTPS enabled
- [ ] Environment variables not committed to GitHub
- [ ] .env file in .gitignore
- [ ] API keys not visible in frontend code
- [ ] CORS only allows frontend domain
- [ ] Rate limiting implemented for login

---

## AFTER DEPLOYMENT

### 1. Test Everything

```bash
# Test login flow
Visit: https://your-app.vercel.app
Login: liam.murphy@MediConnect.com / awoawmnrqcm

# Test appointments
- Book appointment as user
- Accept as doctor
- Check real-time updates

# Test admin
Login: sysadmin@MediConnect.local / SecureAdmin@2024MediConnect
Check admin dashboard
```

### 2. Share the URL

```
Frontend: https://MediConnect-frontend.vercel.app
Backend: https://your-backend-url.railway.app
Admin: https://MediConnect-frontend.vercel.app (login with sysadmin credentials)
```

### 3. Monitor First Week

- Check logs daily
- Monitor performance
- Fix any bugs quickly
- Get user feedback

---

## COST BREAKDOWN

| Component | Free Tier | Paid Tier | Best For |
|-----------|-----------|-----------|----------|
| **Vercel (Frontend)** | Yes | $20/mo | Production use |
| **Railway (Backend)** | 7-day trial | $5/mo | Reliabile backend |
| **MongoDB Atlas** | 512MB | $57/mo | Scalable database |
| **Custom Domain** | N/A | $12/year | Professional look |
| **TOTAL/MONTH** | **$0-5** | **$75-100** | Full production |

**Recommendation:** Start free, upgrade as you grow!

---

## NEXT STEPS

1. ✅ Set up MongoDB Atlas
2. ✅ Seed database to cloud
3. ✅ Deploy backend to Railway
4. ✅ Deploy frontend to Vercel
5. ✅ Test login on live app
6. ✅ Share URL with team
7. ✅ Monitor logs and feedback

**Your app will be live in 30 minutes!** 🚀

---

## QUICK REFERENCE COMMANDS

```bash
# Build frontend for production
cd frontend && npm run build

# Test build locally
npm install -g serve
serve -s build

# Run backend in production
NODE_ENV=production npm start

# Seed database
cd backend && npm run seed

# Check health
curl https://your-backend-url/api/health
```

---

**Now your MediConnect app is available to the world!** 🎉
