# DocSpot Backend

Express.js server with MongoDB for the DocSpot appointment booking platform.

## Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Copy `.env.example` to `.env` and update:
```bash
cp .env.example .env
```

Edit `.env`:
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/docspot
JWT_SECRET=your_secret_key_here
```

### 3. Start MongoDB
Ensure MongoDB is running on `mongodb://localhost:27017/`

### 4. Seed Demo Data (Optional)
```bash
npm run seed
```

Creates demo admin, user, and doctor accounts.

### 5. Run Server
```bash
# Development (with auto-reload via nodemon)
npm run dev

# Production
npm start
```

Server runs on `http://localhost:5000`

## API Endpoints

See root `README.md` for full endpoint documentation.

## File Structure

```
backend/
├── config/
│   └── db.js              # MongoDB connection
├── controllers/
│   ├── appointmentController.js
│   ├── doctorController.js
│   └── userController.js
├── middlewares/
│   ├── authMiddleware.js  # JWT verification
│   └── roleMiddleware.js  # Role-based access
├── models/
│   ├── Appointment.js
│   ├── Doctor.js
│   └── User.js
├── routes/
│   ├── adminRoutes.js
│   ├── appointmentRoutes.js
│   ├── doctorRoutes.js
│   └── userRoutes.js
├── uploads/               # Uploaded documents
├── .env.example
├── index.js               # Main server file
├── seed.js                # Demo data seeder
└── package.json
```

## Key Features

- **JWT Authentication**: Secure endpoints with token-based auth
- **Role-Based Access Control**: Admin, Doctor, User roles
- **File Uploads**: Multer integration for appointment documents
- **MongoDB**: Flexible schema for users, doctors, appointments
- **CORS**: Cross-origin requests enabled for frontend

## Dependencies

- `express` — Web framework
- `mongoose` — MongoDB ODM
- `bcryptjs` — Password hashing
- `jsonwebtoken` — JWT auth
- `cors` — CORS middleware
- `multer` — File upload handling
- `dotenv` — Environment variables

## Dev Dependencies

- `nodemon` — Auto-reload on file changes

