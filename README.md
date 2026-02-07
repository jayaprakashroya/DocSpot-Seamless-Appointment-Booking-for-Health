# DocSpot — Seamless Appointment Booking for Health

A **production-ready MERN** application for online doctor appointment booking. Patients can browse doctors with advanced filtering, book appointments with real-time slot validation, and manage their bookings. Doctors apply for approval and manage their schedules. Admins oversee the platform with analytics dashboards.

## 🎯 Key Features (Interview-Ready)

### ✅ Real-World Business Logic
- **Appointment Slot Management**: Prevents double bookings, validates against doctor's working hours
- **Doctor Availability & Working Hours**: Doctors set available days and time ranges; appointments validate against this
- **Proper Appointment Status Flow**: Pending → Approved → Scheduled → Completed with timestamps
- **Doctor Profile Page**: Full bio, specialization, experience, fees, and ratings

### ✅ Advanced Architecture Patterns
- **Service Layer Pattern**: Clean separation of routes → controllers → services → models
- **Centralized Error Handling**: Custom AppError class with proper HTTP status codes
- **Role-Based Access Control**: Separate middleware for Admin, Doctor, User
- **JWT Authentication**: Secure endpoints with token-based auth

### ✅ User Experience
- **Search & Filtering**: Find doctors by name, specialization, fees
- **Pagination**: Efficient data loading with skip/limit
- **Appointment Reschedule**: Users can reschedule instead of only canceling
- **Admin Analytics Dashboard**: Total users, doctors, appointments, pending approvals with real-time stats

### ✅ Data Integrity
- **No Double Booking**: Prevents same-slot bookings for doctors
- **Working Hours Validation**: Appointments must fall within doctor's availability
- **Proper Schema Design**: References between users, doctors, appointments with audit trail

## Tech Stack

- **Frontend**: React 18, React Router, Axios, Bootstrap 5, Ant Design
- **Backend**: Node.js, Express.js, MongoDB (Mongoose)
- **Authentication**: JWT with bcrypt password hashing
- **File Upload**: Multer for document management
- **Error Handling**: Centralized error handler with proper HTTP codes

## Quick Start

### 1. Install All Dependencies
```bash
npm run install:all
```

### 2. Configure Environment
```bash
cd backend
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
```

### 3. Seed Demo Data
```bash
npm run backend:seed
```

Creates:
- **Admin**: System administrator account
- **Doctors**: 21 specialists from various medical fields
- **No demo users**: Seed only creates system admin and doctors

### 4. Run Both Servers
```bash
npm run dev:all
```

Frontend: `http://localhost:3000`
Backend: `http://localhost:5000`

## API Endpoints

### Users
- `POST /api/users/register` — Register new user
- `POST /api/users/login` — Login user

### Doctors
- `GET /api/doctors` — List approved doctors (paginated, searchable)
- `GET /api/doctors/:id` — Get doctor full profile
- `GET /api/doctors/availability/check` — Check if slot is available
- `POST /api/doctors/apply` — Apply as doctor
- `GET /api/doctors/:id/appointments` — Get doctor's appointments

### Appointments
- `POST /api/appointments/book` — Book appointment (with slot validation)
- `GET /api/appointments/me` — Get user's appointments (paginated)
- `GET /api/appointments/all` — Get all appointments (admin only, filterable)
- `PUT /api/appointments/status/:id` — Update status (admin/doctor only)
- `PUT /api/appointments/reschedule/:id` — Reschedule appointment

### Admin
- `GET /api/admin/stats` — Get platform statistics
- `GET /api/admin/pending-doctors` — List pending approvals
- `POST /api/admin/approve-doctor/:id` — Approve doctor
- `POST /api/admin/reject-doctor/:id` — Reject doctor

## Features in Detail

### 🔒 Appointment Slot Validation
```javascript
// Prevents double booking
const existingAppointment = await Appointment.findOne({
  doctorInfo: doctorId,
  date,
  time,
  status: { $in: ['scheduled', 'pending'] }
});

// Validates against working hours
if (apptTime < startTime || apptTime >= endTime) {
  throw new AppError('Doctor not available at this time', 400);
}
```

### 📊 Admin Analytics
```json
{
  "totalUsers": 50,
  "totalDoctors": 12,
  "totalAppointments": 200,
  "pendingDoctors": 3,
  "appointmentsByStatus": {
    "pending": 15,
    "scheduled": 150,
    "completed": 30,
    "cancelled": 5
  }
}
```

### 🔐 Role-Based Access
- **Admin**: Approve doctors, view all appointments, access analytics
- **Doctor**: Manage appointments, set availability
- **User**: Book appointments, view own appointments, reschedule

## Architecture Highlights

### Service Layer
Business logic is extracted into services for reusability and testing:
- `appointmentService.js` — Appointment operations
- `doctorService.js` — Doctor operations

### Error Handling
```javascript
// Centralized error handler catches all errors
app.use(errorHandler);

// Custom AppError class
throw new AppError('Slot already booked', 409);
```

### Database Schema
- **User**: Authentication, profile, type (admin/user/doctor)
- **Doctor**: Profile, availability, status (pending/approved/rejected)
- **Appointment**: References users/doctors, status, timestamps

## Project Structure

```
docspot/
├── backend/
│   ├── config/          # Database connection
│   ├── controllers/     # Request handlers
│   ├── middlewares/     # Auth, roles, error handling
│   ├── models/          # Mongoose schemas
│   ├── routes/          # API endpoints
│   ├── services/        # Business logic
│   ├── utils/           # Custom errors
│   ├── uploads/         # User documents
│   └── index.js         # Express server
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── admin/      # Admin dashboard with stats
│   │   │   ├── common/     # Auth, navbar
│   │   │   ├── doctor/     # Doctor dashboard
│   │   │   └── user/       # Booking, appointments
│   │   ├── utils/
│   │   └── App.js
│   └── package.json
├── package.json          # Root scripts
└── dev.js               # Concurrent dev server
```

## Interview Talking Points

1. **Appointment Slot Management**
   - "We prevent double bookings by checking existing appointments at the same time slot."
   - "Doctor availability is validated against their working hours to ensure data integrity."

2. **Clean Architecture**
   - "We use a service layer to separate business logic from routes and controllers."
   - "This makes the code testable and maintainable."

3. **Real-World Scenarios**
   - "Users can reschedule appointments instead of only canceling."
   - "Admin dashboard shows real-time statistics and metrics."

4. **Security**
   - "Passwords are hashed with bcrypt, never stored plain-text."
   - "JWT tokens are used for stateless authentication."
   - "Role-based middleware protects sensitive endpoints."

5. **Scalability**
   - "We use pagination to avoid loading all data at once."
   - "Search and filtering are optimized with MongoDB queries."
   - "Error handling is centralized for consistency."

## Development Commands

```bash
# Install all dependencies
npm run install:all

# Run both servers concurrently
npm run dev:all

# Run backend only
npm run backend:dev

# Run frontend only
npm run frontend:dev

# Seed database
npm run backend:seed
```

## Future Enhancements (For Interview Discussion)

- Email/SMS notifications for appointment confirmations
- Video consultation integration
- Payment gateway integration
- Appointment reminder system
- Doctor ratings and reviews
- Mobile app version
- API rate limiting
- Automated testing suite
- CI/CD pipeline

## Testing the App
### Admin Workflow
1. Login with admin credentials
2. View analytics dashboard
3. Approve pending doctors

### User Workflow
1. Register a new account
2. Browse available doctors with filters
3. Check appointment availability
4. Book appointment with required documents
5. View and manage appointments

### Doctor Workflow
1. Register and apply to become a doctor
2. Wait for admin approval
3. View and manage assigned appointments

## Dependencies

**Backend**
- express, mongoose, bcryptjs, jsonwebtoken, multer, cors

**Frontend**
- react, react-router-dom, axios, bootstrap, antd

## Notes

- MongoDB must be running locally or update `MONGO_URI` in `.env`
- Frontend is configured to proxy API calls to backend (see `package.json`)
- All timestamps are in UTC
- Uploaded documents are stored in `backend/uploads/`

## License

MIT - Free to use and modify


