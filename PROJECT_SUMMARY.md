# DocSpot — Project Summary (Consolidated)

This document consolidates key information about the DocSpot project: purpose, architecture, setup, runtime commands, API endpoints, sample credentials for testing, and useful notes. It replaces legacy credential/summary files so there's a single canonical reference.

---

## Project Overview

DocSpot is a MERN (MongoDB, Express, React, Node) application that provides online appointment booking for healthcare. It supports three roles: User (patient), Doctor, and Admin. Key flows include doctor application & admin approval, appointment booking with slot validation, rescheduling, and admin analytics.

## Tech Stack

- Frontend: React 18, React Router, Axios, Bootstrap, Ant Design
- Backend: Node.js, Express.js, Mongoose (MongoDB)
- Auth: JWT + bcrypt
- File uploads: Multer
- Real-time: Socket.IO (JWT handshake)
- Background jobs: Bull (Redis) for email queue

## Important Files / Structure

- `backend/` — Express API, routes, controllers, services, queues, workers
- `frontend/` — React app, components, styles
- `PROJECT_SUMMARY.md` — This consolidated document
- `README.md` — Full project README (kept)

## Quick Setup

1. Install dependencies

```bash
# backend
cd backend
npm install

# frontend
cd ../frontend
npm install
```

2. Environment

- Create `backend/.env` from `.env.example` and set at least:
  - `MONGO_URI` — MongoDB connection string
  - `JWT_SECRET` — JWT secret
  - `SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS` (optional) for email
  - `REDIS_HOST` / `REDIS_PORT` or `REDIS_URL` for Bull queue

3. Seed data (optional)

```bash
cd backend
npm run seed
```

4. Start services

```bash
# Start backend (dev)
cd backend
npm run dev

# Start worker (email queue processor) in another terminal
npm run worker

# Start frontend
cd ../frontend
npm start
```

---

## Runtime Notes

- Redis must be reachable for email queue to function.
- JWT tokens are stored in `localStorage.token`; Socket.IO sends token in handshake `auth.token`.
- Uploaded documents stored in `backend/uploads/`.

---

## API Endpoints (short)

- `POST /api/users/register` — Register user
- `POST /api/users/login` — Login (returns token)
- `GET /api/doctors` — List approved doctors
- `GET /api/doctors/:id` — Doctor profile
- `GET /api/doctors/availability/check` — Slot availability
- `POST /api/appointments/book` — Book appointment (multipart/form-data)
- `GET /api/appointments/me` — List user's appointments
- `PUT /api/appointments/reschedule/:id` — Reschedule
- `PUT /api/appointments/status/:id` — Update status (doctor/admin)
- `GET /api/admin/stats` — Admin stats

Refer to `README.md` for full API examples and usage.

---

## Sample / Demo Login Credentials

These are intended for local development/testing. Do **not** use in production.

Admin (seeded / demo)
- Email: admin@docspot.test
- Password: adminpass

Alternative admin (from other quick files)
- Email: sysadmin@docspot.local
- Password: SecureAdmin@2024DocSpot

Test User (example)
- Email: testuser@example.com
- Password: TestPass123!

Sample Doctor (example)
- Email: testdoctor@example.com
- Password: Doctor@123

Notes:
- The seed script may set different demo credentials; check `backend/seed.js` when you run `npm run seed`.
- After seeding, you can list users/doctors in the database to confirm credentials.

---

## Project Features Summary

- Appointment booking with double-booking prevention and working-hours validation
- Doctor registration & admin approval workflow
- File/document upload for doctor certificates and appointment attachments
- User dashboard with appointment filters (status, date range, doctor search)
- Doctor dashboard for managing appointments
- Admin dashboard with analytics and pending approvals
- Email notifications queued via Bull with a separate worker process
- Real-time updates via Socket.IO (JWT handshake)

---

## Testing & QA Notes

- See `TESTING.md` for a full QA guide and test cases.
- Quick tests:
  - Register → Login → Book appointment → Admin approve doctor flows
  - Reschedule and cancel flows
  - API endpoints with Postman or curl

---



If you need any specific excerpt from the removed docs, let me know and I can restore or extract it into a separate archival file.

---

If you'd like, I can also:
- Add a `CONTRIBUTING.md` or `MAINTENANCE.md` with deploy and operational runbooks
- Create a backup/archive folder containing the removed files instead of deleting them permanently

---

Generated: 2026-02-07
