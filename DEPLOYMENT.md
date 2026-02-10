# MediConnect Deployment Guide

## Production Deployment Checklist

Deploy MediConnect to the cloud with confidence. This guide covers backend (Node.js), database (MongoDB Atlas), and frontend (Vercel/Netlify).

---

## Prerequisites

- [ ] GitHub account with code pushed
- [ ] MongoDB Atlas account (free tier available)
- [ ] Vercel or Netlify account (for frontend)
- [ ] Render, Railway, or Heroku account (for backend)
- [ ] Domain name (optional but recommended)

---

## Part 1: Database Setup (MongoDB Atlas)

### Step 1: Create MongoDB Atlas Account

1. Go to [mongodb.com/cloud/atlas](https://mongodb.com/cloud/atlas)
2. Sign up with email
3. Create new organization and project

### Step 2: Create Cluster

1. Click "Build a Cluster"
2. Choose **M0 Sandbox** (free tier, sufficient for MVP)
3. Select region closest to your users
4. Click "Create Cluster"

### Step 3: Create Database User

1. Go to "Database Access"
2. Click "Add New Database User"
3. Username: `MediConnect_admin`
4. Password: Generate secure password (save it!)
5. Database User Privileges: **Read and write to any database**
6. Click "Add User"

### Step 4: Configure Network Access

1. Go to "Network Access"
2. Click "Add IP Address"
3. Select "Allow access from anywhere" (or restrict to your IP)
4. Click "Confirm"

### Step 5: Get Connection String

1. Cluster Overview → Click "Connect"
2. Select "Connect your application"
3. Choose Node.js and version 3.0+
4. Copy connection string:

```
mongodb+srv://MediConnect_admin:<PASSWORD>@cluster0.xxx.mongodb.net/MediConnect?retryWrites=true&w=majority
```

Replace `<PASSWORD>` with your database user password.

---

## Part 2: Backend Deployment (Node.js)

### Option A: Render.com (Recommended for MERN)

#### Step 1: Prepare Backend

```bash
cd backend

# Create .env for production
cat > .env.production << EOF
PORT=5000
MONGO_URI=mongodb+srv://MediConnect_admin:<PASSWORD>@cluster0.xxx.mongodb.net/MediConnect?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long
NODE_ENV=production
FRONTEND_URL=https://your-frontend-domain.com
EOF

# Update backend/package.json
# Make sure these scripts exist:
"start": "node index.js",
"dev": "nodemon index.js"
```

#### Step 2: Push to GitHub

```bash
git add .
git commit -m "Production ready"
git push origin main
```

#### Step 3: Deploy on Render

1. Go to [render.com](https://render.com)
2. Sign up with GitHub
3. Click "New Web Service"
4. Connect your GitHub repository
5. **Name**: MediConnect-api
6. **Environment**: Node
7. **Build Command**: `npm install`
8. **Start Command**: `npm start`
9. **Plan**: Free (or Paid for always-on)

#### Step 4: Add Environment Variables

On Render dashboard:
1. Go to "Settings" → "Environment"
2. Add these variables:
   - `PORT`: 5000
   - `MONGO_URI`: (from MongoDB Atlas)
   - `JWT_SECRET`: (generate long random string)
   - `NODE_ENV`: production
   - `FRONTEND_URL`: https://your-MediConnect.vercel.app

3. Click "Save"
4. Service will auto-restart

#### Step 5: Test Backend

```bash
# Get your Render URL from dashboard
# It will be something like: https://MediConnect-api.onrender.com

curl https://MediConnect-api.onrender.com/api/health

# Response:
# { "status": "ok" }
```

### Option B: Railway.app

1. Go to [railway.app](https://railway.app)
2. Create new project
3. Deploy from GitHub
4. Add MongoDB URI and JWT_SECRET in Variables
5. Get deployed URL

### Option C: Heroku (Legacy - Being Phased Out)

Consider Render or Railway instead as Heroku is discontinuing free tier.

---

## Part 3: Frontend Deployment (React)

### Option A: Vercel (Recommended for Next.js-like apps)

#### Step 1: Prepare Frontend

```bash
cd frontend

# Create .env.production
cat > .env.production << EOF
REACT_APP_API_URL=https://MediConnect-api.onrender.com/api
EOF

# In src/utils/api.js, update:
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api'
});
```

#### Step 2: Deploy on Vercel

1. Go to [vercel.com](https://vercel.com)
2. Import GitHub repository
3. Select the `frontend` folder as root directory
4. Add environment variable:
   - `REACT_APP_API_URL`: https://MediConnect-api.onrender.com/api
5. Click "Deploy"

#### Step 3: Configure CORS on Backend

Your backend needs to allow requests from your Vercel domain:

```javascript
// backend/index.js
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'https://your-MediConnect.vercel.app'
  ],
  credentials: true
};
app.use(cors(corsOptions));
```

Then redeploy backend.

#### Step 4: Test Frontend

Visit your Vercel URL and test:
- Register/Login
- Browse doctors
- Book appointment
- View admin dashboard

### Option B: Netlify

1. Go to [netlify.com](https://netlify.com)
2. Connect GitHub
3. Build command: `npm run build`
4. Publish directory: `build`
5. Add environment variable same as Vercel
6. Deploy

---

## Part 4: Custom Domain Setup (Optional)

### Using Vercel

1. In Vercel dashboard → Settings → Domains
2. Add custom domain
3. Update DNS records at your domain registrar
4. Wait for DNS propagation (5-48 hours)

### Using Render

1. In Render dashboard → Settings → Custom Domain
2. Add domain
3. Update DNS records

---

## Part 5: Post-Deployment Testing

### Test Backend APIs

```bash
# Replace with your Render URL
BACKEND_URL="https://MediConnect-api.onrender.com/api"

# Health check
curl $BACKEND_URL/health

# Register user
curl -X POST $BACKEND_URL/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "phone": "9876543210"
  }'

# Login
curl -X POST $BACKEND_URL/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'

# Get doctors
curl $BACKEND_URL/doctors

# Get admin stats (requires token)
curl $BACKEND_URL/admin/stats \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Test Frontend

1. Visit your Vercel/Netlify URL
2. Register new account
3. Login
4. Browse doctors
5. Book appointment
6. Check UserDashboard
7. Logout

### Database Verification

Connect to MongoDB Atlas to verify data:

```bash
# Using MongoDB Compass
# Connection string: mongodb+srv://MediConnect_admin:PASSWORD@cluster0.xxx.mongodb.net/MediConnect

# Or using mongosh CLI
mongosh "mongodb+srv://MediConnect_admin:<PASSWORD>@cluster0.xxx.mongodb.net/MediConnect"

# Show collections
show collections

# Check users
db.users.findOne()

# Check appointments
db.appointments.findOne()
```

---

## Part 6: Monitoring & Maintenance

### Enable Logs

**Render Backend:**
1. Dashboard → Logs tab
2. View real-time logs
3. Check for errors and performance issues

**Vercel Frontend:**
1. Deployments → Select deployment
2. Logs → Runtime logs
3. Monitor API calls and errors

### Setup Error Tracking (Optional)

Add Sentry for production error monitoring:

```bash
# Backend
npm install @sentry/node

# frontend
npm install @sentry/react
```

### Monitor Database

MongoDB Atlas provides:
- Connection stats
- Query performance
- Disk usage
- Memory usage

Monitor from Dashboard → Metrics

---

## Part 7: Environment Variables Checklist

### Backend (.env or Platform Variables)

```
PORT=5000
NODE_ENV=production
MONGO_URI=mongodb+srv://MediConnect_admin:PASSWORD@cluster0.xxx.mongodb.net/MediConnect
JWT_SECRET=generate_a_long_random_string_here
FRONTEND_URL=https://your-MediConnect.vercel.app
```

### Frontend (.env.production or Platform Variables)

```
REACT_APP_API_URL=https://MediConnect-api.onrender.com/api
```

---

## Part 8: Troubleshooting

### "Can't connect to database"
- Check MongoDB Atlas IP whitelist includes Render IP
- Verify connection string has correct password
- Check MONGO_URI has database name (`/MediConnect`)

### "CORS error in browser"
- Add your frontend domain to CORS whitelist in backend
- Redeploy backend
- Clear browser cache

### "Token expired immediately"
- Check JWT_SECRET is same across deployments
- Verify NODE_ENV is set to "production"
- Check system time sync on servers

### "Emails not working"
- Set up SendGrid or Gmail credentials
- Add email service environment variables
- Implement email sending in backend

### "Images not uploading"
- Ensure Multer upload directory is writable
- Use cloud storage (AWS S3, Cloudinary) for production
- Add cloud storage credentials to environment

---

## Part 9: Scaling Beyond MVP

### Database Scaling
```
Free Tier → M2 Tier (2GB RAM)
↓
M5 Tier (10GB RAM)
↓
M10+ Tier (40GB+ RAM)
```

### Backend Scaling
- Add caching layer (Redis)
- Implement API rate limiting
- Use CDN for static assets
- Load balancing across instances

### Frontend Optimization
- Code splitting
- Image optimization
- Bundle size analysis
- Lazy loading routes

---

## Part 10: Continuous Integration (Optional)

### GitHub Actions for Auto-Deployment

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Render
        run: |
          curl -X POST https://api.render.com/deploy/srv-YOUR_SERVICE_ID \
            -H "Authorization: Bearer ${{ secrets.RENDER_API_KEY }}"
```

---

## Summary

| Component | Recommended | Alternative |
|-----------|-------------|-------------|
| Database | MongoDB Atlas (Free) | AWS RDS, Azure CosmosDB |
| Backend | Render.com | Railway, Fly.io |
| Frontend | Vercel | Netlify, GitHub Pages |
| Domain | Vercel DNS | GoDaddy, Namecheap |
| Monitoring | Sentry | Datadog, LogRocket |

---

## Final Checklist

- [ ] MongoDB Atlas cluster created
- [ ] Database user created with password
- [ ] Backend deployed on Render
- [ ] Backend environment variables set
- [ ] Frontend deployed on Vercel
- [ ] Frontend API URL configured
- [ ] CORS whitelist updated
- [ ] Domain configured (optional)
- [ ] SSL certificate active
- [ ] All API endpoints tested
- [ ] User workflow tested
- [ ] Error handling verified
- [ ] Logs monitored
- [ ] Database backups enabled

---

## Useful Resources

- [MongoDB Atlas Docs](https://docs.atlas.mongodb.com/)
- [Render Deployment Docs](https://render.com/docs)
- [Vercel Deployment Docs](https://vercel.com/docs)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [CORS Documentation](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)

---

## Getting Help

- Check platform documentation
- Review logs for error messages
- Test APIs with curl or Postman
- Verify environment variables
- Check database connectivity

**Congratulations!** Your MediConnect app is now live in production! 🚀
