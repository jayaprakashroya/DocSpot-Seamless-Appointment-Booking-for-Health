# MongoDB Setup & Usage Guide for MediConnect

## ✅ Current Status

Your MongoDB is now **fully connected and running**! Here's what's set up:

- **Database**: `MediConnect` (local MongoDB)
- **Backend Server**: Running on `http://localhost:5000` ✅
- **Frontend Server**: Running on `http://localhost:3000` ✅
- **MongoDB Connection**: `mongodb://localhost:27017/MediConnect` ✅

---

## How MongoDB Works with MediConnect

### 1. Connection Flow

```
React Frontend (port 3000)
           ↓
    Axios HTTP Requests
           ↓
Node.js Backend (port 5000)
           ↓
    Mongoose ODM
           ↓
MongoDB Database (port 27017)
```

### 2. Database Configuration

Your `.env` file in the backend folder:

```
PORT=5000
MONGO_URI=mongodb://localhost:27017/MediConnect
JWT_SECRET=change_this_secret
```

### 3. MongoDB Collections Created Automatically

When the backend starts, Mongoose creates these collections:

```
MediConnect/
├── users           (Patients/Admins)
├── doctors         (Doctor profiles)
├── appointments    (Appointments)
```

---

## What the Code Does

### Backend Connection (`backend/config/db.js`)

```javascript
const connectDB = async () => {
  const conn = await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  console.log(`MongoDB Connected: ${conn.connection.host}`);
};
```

This connects your Express backend to MongoDB when the server starts.

### Using MongoDB Compass

You can view your data in **MongoDB Compass** (already open):

1. **Click "Add new connection"** button
2. **Connection String**: `mongodb://localhost:27017`
3. Click **Connect**

You'll see the `MediConnect` database appear with collections:
- `users` → All registered users
- `doctors` → Doctor profiles (pending/approved)
- `appointments` → All bookings

---

## Seed Demo Data

The project includes a seed script to populate demo data:

```bash
cd backend
npm run seed
```

This creates:
- **Admin user**: System administrator account
- **Sample doctors**: 21 specialists from various medical fields
- **No demo users**: Only admin and doctors are seeded

---

## How Data Flows

### Example: Book an Appointment

**Frontend (React)**
```javascript
// User clicks "Book Appointment"
const data = {
  doctorId: "60d5...",
  date: "2024-02-20",
  time: "14:30",
  reason: "General checkup"
};

axios.post('/api/appointments/book', data);
```

**Backend (Express + Mongoose)**
```javascript
// API endpoint receives request
POST /api/appointments/book

// Service layer checks slot availability
await doctorService.checkSlotAvailability(doctorId, date, time);

// Prevents double booking:
const existing = await Appointment.findOne({
  doctorInfo: doctorId,
  date: { $gte: startOfDay, $lt: endOfDay },
  time: "14:30",
  status: { $in: ['scheduled', 'pending'] }
});

// Creates appointment in MongoDB
const appointment = await Appointment.create({...});
```

**MongoDB (Database)**
```javascript
// New document added to appointments collection:
{
  _id: ObjectId("60d5..."),
  doctorInfo: ObjectId("60d5..."),
  userInfo: ObjectId("60d5..."),
  date: ISODate("2024-02-20"),
  time: "14:30",
  reason: "General checkup",
  status: "pending",
  createdAt: ISODate("2024-01-31..."),
  updatedAt: ISODate("2024-01-31...")
}
```

**Response to Frontend**
```javascript
{
  success: true,
  appointment: {
    id: "60d5...",
    doctorInfo: {...},
    userInfo: {...},
    date: "2024-02-20",
    time: "14:30",
    status: "pending"
  }
}
```

---

## Key MongoDB Features Used

### 1. **Document Validation** (Preventing Double Booking)

When booking an appointment:
```javascript
// Check if slot is already taken
db.appointments.findOne({
  doctorInfo: ObjectId(doctorId),
  date: { $gte: startOfDay, $lt: endOfDay },
  time: "HH:MM",
  status: { $in: ["scheduled", "pending"] }
})
```

If exists → Error 409 (Conflict)
If not → Create appointment

### 2. **Relationships** (via References)

```javascript
// Doctor document
{
  _id: ObjectId(...),
  userId: ObjectId("ref to User"),  // Reference
  fullname: "Dr. Smith",
  ...
}

// Appointment document
{
  _id: ObjectId(...),
  doctorInfo: ObjectId("ref to Doctor"),  // Reference
  userInfo: ObjectId("ref to User"),      // Reference
  ...
}
```

### 3. **Indexing** (for Performance)

```javascript
// Backend indexes collections for faster queries
appointmentSchema.index({ doctorInfo: 1, date: 1, time: 1 });
doctorSchema.index({ status: 1 });
```

### 4. **Aggregation** (for Admin Stats)

```javascript
// Get statistics by status
db.appointments.aggregate([
  { $group: { _id: "$status", count: { $sum: 1 } } }
])

// Result:
[
  { _id: "pending", count: 15 },
  { _id: "scheduled", count: 150 },
  { _id: "completed", count: 30 },
  { _id: "cancelled", count: 5 }
]
```

---

## Commands Reference

### Start Backend
```bash
cd backend
npm run dev    # With nodemon (auto-restart on file change)
# OR
node index.js  # Direct run
```

### Start Frontend
```bash
cd frontend
npm start      # Runs on http://localhost:3000
```

### Seed Database
```bash
cd backend
npm run seed   # Creates demo users and doctor
```

### View MongoDB Data
1. Open **MongoDB Compass** (already on your system)
2. Connect to `mongodb://localhost:27017`
3. Browse collections in `MediConnect` database

### Test APIs
```bash
# Get all doctors
curl http://localhost:5000/api/doctors

# Register new user
curl -X POST http://localhost:5000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "Test123!",
    "phone": "9876543210"
  }'

# Get admin stats
curl http://localhost:5000/api/admin/stats \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Data Models

### Users Collection

```javascript
{
  _id: ObjectId,
  name: "John Doe",
  email: "john@example.com",
  password: "bcrypt_hashed_password",
  phone: "9876543210",
  type: "customer",  // or "admin"
  isDoctor: false,
  createdAt: ISODate,
  updatedAt: ISODate
}
```

### Doctors Collection

```javascript
{
  _id: ObjectId,
  userId: ObjectId("ref to User"),
  fullname: "Dr. John Smith",
  email: "john.smith@example.com",
  specialization: "Cardiology",
  experience: 10,
  fees: 1500,
  address: "123 Medical Center",
  timings: {
    startTime: "10:00",
    endTime: "18:00"
  },
  status: "approved",  // or "pending", "rejected"
  rating: 4.5,
  totalReviews: 42,
  createdAt: ISODate,
  updatedAt: ISODate
}
```

### Appointments Collection

```javascript
{
  _id: ObjectId,
  doctorInfo: ObjectId("ref to Doctor"),
  userInfo: ObjectId("ref to User"),
  date: ISODate("2024-02-20"),
  time: "14:30",
  reason: "General checkup",
  consultationType: "in-person",  // or "online"
  status: "pending",  // or "scheduled", "completed", "cancelled"
  document: "filename.pdf",
  prescription: "Take aspirin daily",
  followUpRequired: false,
  notes: "Patient complained of chest pain",
  createdAt: ISODate,
  updatedAt: ISODate
}
```

---

## Troubleshooting

### "MongoDB Connection Refused"

**Problem**: Backend shows `Error: The uri parameter must be a string`

**Solution**:
1. Make sure MongoDB daemon is running:
   ```bash
   mongod --version  # Check if installed
   ```
2. Check `.env` file has `MONGO_URI=mongodb://localhost:27017/MediConnect`
3. Verify backend config/db.js uses `process.env.MONGO_URI`

### "Collection Not Found"

**Problem**: App crashes when accessing appointments

**Solution**:
1. Collections are created automatically when you first insert data
2. Run the seed script: `npm run seed`
3. Or create data via the UI (register user, book appointment)

### "Cannot Connect from Compass"

**Problem**: MongoDB Compass can't connect

**Solution**:
1. In Compass, use connection string: `mongodb://localhost:27017`
2. No authentication required for local MongoDB
3. Click "Connect"
4. Click on `MediConnect` database to view collections

### "Port 5000 Already in Use"

**Problem**: Backend won't start, port 5000 in use

**Solution**:
```bash
# Find and kill process on port 5000
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

Or change PORT in `.env`:
```
PORT=5001
```

---

## Next Steps

### 1. Test the App
- Go to `http://localhost:3000`
- Register as a new user
- Browse doctors
- Book an appointment
- View in MongoDB Compass

### 2. Explore Data
- Open MongoDB Compass
- Click on `MediConnect` database
- View `users`, `doctors`, `appointments` collections
- See your bookings in real-time

### 3. Try Admin Features
- Login with admin credentials
- View analytics dashboard
- Approve pending doctors

### 4. Review Code
- See API endpoints in `backend/routes/`
- See business logic in `backend/services/`
- See database schemas in `backend/models/`

---

## Performance Tips

### Add Indexes for Speed

```javascript
// In backend/models/Appointment.js
appointmentSchema.index({ doctorInfo: 1, date: 1, time: 1 });
appointmentSchema.index({ userInfo: 1 });

// In backend/models/Doctor.js
doctorSchema.index({ status: 1 });
doctorSchema.index({ fullname: 'text' });
```

### Use Pagination

```javascript
// Backend automatically paginates API responses
GET /api/doctors?page=1&limit=10
→ Returns 10 doctors per page, max 100
```

### Lean Queries

```javascript
// Use .lean() for read-only data (faster)
Doctor.find().lean()  // Returns plain JS objects
```

---

## MongoDB Resources

- [MongoDB Documentation](https://docs.mongodb.com/)
- [Mongoose Guide](https://mongoosejs.com/)
- [MongoDB Compass Guide](https://docs.mongodb.com/compass/)
- [MongoDB Atlas (Cloud)](https://www.mongodb.com/cloud/atlas)

---

## Summary

✅ **MongoDB is connected and ready!**

| Component | Status | URL |
|-----------|--------|-----|
| Backend API | Running | `http://localhost:5000` |
| Frontend UI | Running | `http://localhost:3000` |
| MongoDB | Connected | `mongodb://localhost:27017/MediConnect` |
| MongoDB Compass | Ready | View data live |

**You can now use the full MediConnect application with real data persistence!** 🎉
