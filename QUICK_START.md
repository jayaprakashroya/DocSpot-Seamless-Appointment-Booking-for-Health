# 🚀 QUICK START GUIDE - DocSpot

## Why Credentials Stop Working

**Before Fix:**
- Backend server crashes → Credentials disappear
- MongoDB stops → Can't access stored credentials
- No auto-reconnect → Permanent connection loss

**After Fix:**
- Backend auto-reconnects to MongoDB ✅
- Server logs all errors clearly ✅
- Credentials permanently stored ✅
- Easy startup scripts provided ✅

---

## ✅ STEP-BY-STEP: Starting DocSpot Properly

### STEP 1: Start MongoDB (First Priority!)

**Windows:**
```cmd
# Open Command Prompt as Administrator
cd C:\Program Files\MongoDB\Server\VERSION\bin
mongod
```
Window should show: `[initandlisten] waiting for connections`

**Mac:**
```bash
brew services start mongodb-community
```

**Linux:**
```bash
sudo systemctl start mongod
```

### STEP 2: Start Backend Server

**Windows (Easiest):**
1. Go to: `c:\Users\maner\Downloads\DocSpot...\backend\`
2. Double-click: `START_SERVER.bat`
3. Wait for setup to complete

**Or manually:**
```bash
cd backend
npm install  # Only first time
npm start
```

**Expected Output:**
```
✅ MongoDB Connected: localhost:27017
🚀 Server running on port 5000
API: http://localhost:5000/api
Health Check: http://localhost:5000/api/health
```

### STEP 3: Start Frontend (New Terminal)

```bash
cd frontend
npm install  # Only first time
npm start
```

**Expected Output:**
```
Compiled successfully!
Local: http://localhost:3000
```

✅ **All running? Great! You're ready to use DocSpot!**

---

## 🔑 Login with Doctor Account

```
Email:    liam.murphy@docspot.com
Password: awoawmnrqcm
```

**First time?** This should work immediately! ✅

**Not working?** Check:
1. Is MongoDB running? (See terminal window)
2. Is backend running? (See terminal with "Server running on port 5000")
3. Is frontend accessible? (Browser shows page, not blank)

---

## 🐛 Troubleshooting

### Problem: "Cannot reach server" / Login fails

**Cause:** Backend not running

**Fix:**
```
Windows: Double-click backend/START_SERVER.bat
Linux/Mac: Run: npm start (in backend folder)
```

### Problem: "Database unavailable"

**Cause:** MongoDB not running

**Fix:**
```
Windows: Open Command Prompt, run: mongod
Mac: brew services start mongodb-community
Linux: sudo systemctl start mongod
```

### Problem: Credentials were working, now not working

**Cause:** Server or DB crashed overnight

**Fix:**
1. Stop backend (Ctrl+C in terminal)
2. Restart MongoDB (close and re-run mongod/brew start)
3. Restart backend (double-click START_SERVER.bat)
4. Try login again

### Problem: Everything looks right but still won't work

**Diagnostic:**
1. Open browser console (F12)
2. Try to login
3. Check console for errors
4. Share the error message

**Emergency Reset:**
```bash
cd backend
npm run seed
```
This recreates all 21 doctors with original credentials.

---

## 📊 Server Status Check

### Check if Backend is Running

**In Browser, visit:**
```
http://localhost:5000/api/health
```

**Should show:**
```json
{
  "status": "ok",
  "timestamp": "2026-02-08T10:30:45.123Z",
  "uptime": 3245
}
```

### Check if Database is Connected

**In Browser, visit:**
```
http://localhost:5000/api/health/detailed
```

**Should show:**
```json
{
  "status": "ok",
  "database": {
    "connected": true,
    "host": "localhost",
    "state": "connected"
  }
}
```

If `"connected": false` → MongoDB is not running!

---

## 🔄 Daily Routine (Copy This!)

Every day before using DocSpot:

### Morning Checklist
- [ ] Start MongoDB
- [ ] Start Backend (double-click START_SERVER.bat)
- [ ] Start Frontend (npm start)
- [ ] Visit http://localhost:3000
- [ ] Try login to verify credentials work

### Daily Login Flow
1. Open browser → http://localhost:3000
2. Enter credentials: `liam.murphy@docspot.com` / `awoawmnrqcm`
3. Click Login
4. ✅ Should appear on dashboard

### Before Shutting Down
- [ ] Stop frontend (Ctrl+C in frontend terminal)
- [ ] Stop backend (Ctrl+C in backend terminal)
- [ ] Keep MongoDB running or stop it too
- [ ] Tomorrow morning, repeat morning checklist

---

## 🎯 Key Points to Remember

```
CREDENTIALS WORK FOREVER IF:
✅ Backend is running
✅ MongoDB is running
✅ Database not deleted
✅ Credentials not manually removed

CREDENTIALS STOP WORKING IF:
❌ Backend crashes (not restarted)
❌ MongoDB stops (connection lost)
❌ Database deleted
❌ Server shutdown without saving
```

---

## 📞 Common Questions

**Q: Do I need to restart MongoDB every day?**
A: No, MongoDB can run 24/7. But if you shutdown your PC, restart it tomorrow.

**Q: Will my credentials be saved permanently?**
A: Yes, they're saved in MongoDB. They only disappear if the database is deleted or corrupted.

**Q: How long does a login session last?**
A: 7 days. After 7 days, just login again with same credentials.

**Q: Can I use the same credentials on multiple devices?**
A: Yes! Credentials are stored centrally in MongoDB. Use them anywhere.

**Q: What if I forgot the password?**
A: Use the credentials from SETUP_COMPLETE.md file. All doctors' credentials are listed there.

---

## 🚨 CRITICAL - READ THIS

**These three must be running or nothing works:**

1. **MongoDB** - Stores all data (start with `mongod`)
2. **Backend** - API server (double-click START_SERVER.bat)
3. **Frontend** - Web app (npm start in frontend folder)

**Order matters:**
```
MongoDB (1st)
    ↓
Backend (2nd) - Wait for "Server running on port 5000"
    ↓
Frontend (3rd) - Opens browser automatically
```

If any are missing, login won't work!

---

## ✅ Verify Everything Works

1. Navigate to: `http://localhost:5000/api/health`
   - Should show: `{"status":"ok",...}`

2. Navigate to: `http://localhost:3000`
   - Should load login page

3. Login with: `liam.murphy@docspot.com` / `awoawmnrqcm`
   - Should work immediately ✅

**If all three work → Everything is configured correctly!**

---

**Still having issues?** Check `LOGIN_PERSISTENCE_FIX.md` for more detailed troubleshooting!
