# 🔧 TROUBLESHOOTING CHECKLIST

Use this when login stops working after initial setup.

---

## ❌ SYMPTOM: Login credentials don't work (Day 2 or later)

### Quick Fix (Try These FIRST)

- [ ] **Restart Backend**
  ```bash
  # Stop: Ctrl+C in backend terminal
  # Then re-run: double-click START_SERVER.bat (Windows)
  # Or: npm start (Mac/Linux)
  ```

- [ ] **Restart MongoDB**
  ```bash
  # Windows: Close mongod window, re-run mongod
  # Mac: brew services restart mongodb-community
  # Linux: sudo systemctl restart mongod
  ```

- [ ] **Refresh Browser**
  ```
  Press: Ctrl+F5 (or Cmd+Shift+R on Mac)
  ```

- [ ] **Clear Browser Cache**
  - Press F12 to open DevTools
  - Application → Session Storage → Clear All

✅ **Worked?** Great! You're done.

❌ **Still not working?** Continue below...

---

## 🔍 DIAGNOSTIC TESTS

### Test 1: Is Backend Running?

**Action:** Open browser, visit:
```
http://localhost:5000/api/health
```

**Expected Result:**
```json
{
  "status": "ok",
  "timestamp": "...",
  "uptime": 12345
}
```

**Result:**
- ✅ **Shown**: Backend is running → Go to Test 2
- ❌ **Connection refused**: Backend crashed → Start it
- ❌ **Blank page**: Backend not running → Start it

**Fix if Failed:**
```bash
cd backend
npm start
# Wait for: "🚀 Server running on port 5000"
```

### Test 2: Is MongoDB Connected?

**Action:** Open browser, visit:
```
http://localhost:5000/api/health/detailed
```

**Expected Result:**
```json
{
  "database": {
    "connected": true,
    "host": "localhost",
    "state": "connected"
  }
}
```

**Result:**
- ✅ **"connected": true**: Database is connected → Go to Test 3
- ❌ **"connected": false**: MongoDB crashed → Restart it
- ❌ **"state": "disconnecting"**: Connection lost → Restart MongoDB

**Fix if Failed:**
```bash
# Windows: Close mongod window, re-run: mongod
# Mac: brew services restart mongodb-community
# Linux: sudo systemctl restart mongod
```

### Test 3: Can You Reach Frontend?

**Action:** Open browser, visit:
```
http://localhost:3000
```

**Expected Result:**
- Login page appears exactly

**Result:**
- ✅ **Login page shown**: Frontend is running → Go to Test 4
- ❌ **Blank page**: Frontend not running → Start it
- ❌ **"Cannot reach"**: Frontend crashed → Restart it

**Fix if Failed:**
```bash
cd frontend
npm start
# Wait for: "Compiled successfully!"
```

### Test 4: Are Credentials in Database?

**Action:** Open MongoDB CLI and check:
```bash
# Windows: mongosh (or mongo for older version)
# Mac/Linux: mongosh

# Then run these commands:
use MediConnect
db.users.findOne({ email: "liam.murphy@MediConnect.com" })
```

**Expected Result:**
```javascript
{
  _id: ObjectId(...),
  email: "liam.murphy@MediConnect.com",
  name: "Dr. Liam Murphy",
  password: "$2a$10$...",  // Long hashed string
  type: "doctor",
  ...
}
```

**Result:**
- ✅ **Doctor found**: Credentials exist → Try login now
- ❌ **No results**: Doctor not in database → Restore with seed

**Fix if Failed:**
```bash
cd backend
npm run seed
# Wait for: "✅ Database seeded successfully"
# Then try login again
```

### Test 5: Try Login Now

**Action:** Navigate to http://localhost:3000

**Enter:**
```
Email:    liam.murphy@MediConnect.com
Password: awoawmnrqcm
```

**Click Login**

**Result:**
- ✅ **Redirected to dashboard**: SUCCESS! Issue fixed.
- ❌ **Still showing error**: Go to Advanced Troubleshooting below

---

## 🚨 ADVANCED TROUBLESHOOTING

### If Tests 1-5 Pass But Login Still Fails

**Check Browser Console for Errors:**
1. Press F12
2. Click "Console" tab
3. Try login
4. Look for red error messages

**Common Error Messages:**

| Error | Meaning | Fix |
|-------|---------|-----|
| `Network Error` | Server unreachable | Restart backend |
| `401 Unauthorized` | Invalid credentials | Credentials wrong - check case sensitivity |
| `Cannot GET /api...` | Backend route doesn't exist | Backend crashed - restart |
| `ECONNREFUSED` | Connection refused | Backend not running on port 5000 |
| `ENOTFOUND` | Cannot find server | Backend not running |

**Solution:**
1. Copy the error message
2. Check Backend Terminal for more details
3. Restart backend: `npm start`
4. Try login again

---

## 🔥 NUCLEAR OPTION (Full Reset)

**When everything else fails:**

```bash
# Step 1: Stop everything
# - Close frontend terminal (Ctrl+C)
# - Close backend terminal (Ctrl+C)
# - Close MongoDB terminal (Ctrl+C)

# Step 2: Wait 5 seconds

# Step 3: Delete node_modules (optional but recommended)
cd frontend
rmdir /s node_modules  # Windows
rm -rf node_modules     # Mac/Linux

cd ../backend
rmdir /s node_modules  # Windows
rm -rf node_modules     # Mac/Linux

# Step 4: Reinstall dependencies
cd ../backend
npm install

cd ../frontend
npm install

# Step 5: Reseed database
cd ../backend
npm run seed

# Step 6: Start fresh
# Terminal 1:
mongod

# Terminal 2:
npm start  # in backend folder

# Terminal 3:
npm start  # in frontend folder

# Terminal 4:
# Try login in browser at http://localhost:3000
```

---

## 📋 VERIFICATION CHECKLIST

After completing any fix, verify:

- [ ] Check `http://localhost:5000/api/health` → Shows `"status": "ok"`
- [ ] Check `http://localhost:5000/api/health/detailed` → `"connected": true`
- [ ] Navigate to `http://localhost:3000` → Login page appears
- [ ] Enter credentials → Login successful
- [ ] Check MongoDb → Doctor still exists `db.users.find()`
- [ ] Logout and login again → Works second time

✅ **All checked?** Issue is resolved!

---

## 🆘 EMERGENCY CONTACTS

**If nothing works, collect this info:**

1. **Terminal Output From Backend:**
   - Copy all text from terminal where `npm start` was run
   - Look for ❌ or ⚠️ messages

2. **Browser Console Errors:**
   - Press F12
   - Copy any red error messages

3. **Your MongoDB Status:**
   - Is mongod window running?
   - Any error messages in mongod terminal?

4. **Your System Info:**
   - Windows/Mac/Linux?
   - MongoDB version: `mongod --version`
   - Node version: `node --version`
   - npm version: `npm --version`

5. **Steps You Tried:**
   - List all fixes you attempted
   - Which ones worked/didn't work

---

## ✅ SUCCESS INDICATORS

**You know it's working when:**

1. ✅ Browser shows login page at http://localhost:3000
2. ✅ You can type email and password
3. ✅ When you click "Login", you see loading spinner
4. ✅ Page redirects to dashboard/appointments
5. ✅ NavBar shows doctor name and live data
6. ✅ Real-time appointment counts update
7. ✅ Availability slots display correctly

If all 7 are true → **Everything is working perfectly!** 🎉

---

## 📞 STILL NEED HELP?

Check these files for more info:
- `QUICK_START.md` - Basic setup
- `LOGIN_PERSISTENCE_FIX.md` - Detailed explanation
- `SETUP_COMPLETE.md` - Credentials reference
- `README.md` - General project info

---

**Remember:** The 3 critical services that must run:
1. ✅ MongoDB
2. ✅ Backend  
3. ✅ Frontend

**No MongoDB?** No credentials storage → Login fails
**No Backend?** No API → Login fails  
**No Frontend?** No UI → Can't see anything

**Keep all three running and credentials work forever!**
