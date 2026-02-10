# MediConnect Testing & QA Guide

## Overview

This guide covers manual testing workflows, test scenarios, and how to verify that MediConnect works as expected in all user roles.

---

## Manual Testing Workflows

### Workflow 1: User Registration & Login

**Steps:**
1. Visit frontend home page
2. Click "Register"
3. Fill form:
   - Name: Test User
   - Email: testuser@example.com
   - Password: TestPass123!
   - Phone: 9876543210
4. Submit form
5. Should redirect to login page
6. Enter email and password
7. Should redirect to user dashboard
8. Verify navigation shows user name and role

**Expected Results:**
- ✅ Registration creates user in database
- ✅ Email is unique (reject duplicates)
- ✅ Password is hashed (check in MongoDB)
- ✅ JWT token stored in localStorage
- ✅ User name displays in NavBar
- ✅ Logout clears token and redirects

**Test Cases:**
- Register with duplicate email → "Email already registered"
- Register with weak password → "Password too weak"
- Register with missing fields → "Field required"
- Login with wrong password → "Invalid credentials"
- Login with non-existent email → "User not found"

---

### Workflow 2: Doctor Application & Approval

**Doctor Side - Apply:**
1. Register as new user
2. During registration, select "Apply as Doctor" option (or navigate to /apply)
3. Fill doctor info:
   - Specialization: Cardiology
   - Experience: 5 years
   - Fees: 1500
   - Working Hours: 10:00 - 18:00
   - About: [bio text]
   - Certificate: [upload file]
4. Submit
5. Should see "Application pending approval" message

**Admin Side - Approve:**
1. Login as admin (`admin@MediConnect.test` / `adminpass`)
2. Navigate to `/admin`
3. View "Pending Doctor Approvals" section
4. Click "Approve" on doctor card
5. Confirmation dialog appears
6. Confirm approval
7. Toast shows "Doctor approved successfully!"
8. Doctor removed from pending list
9. "Pending Approvals" stat card decreases by 1

**Database Verification:**
```bash
# Check doctor status changed from pending to approved
db.doctors.findOne({ email: "testdoctor@example.com" })
# Should show: status: "approved"
```

**Test Cases:**
- Apply twice with same email → Reject duplicate application
- Approve doctor → Status changes to "approved"
- Reject doctor → Status changes to "rejected"
- Doctor cannot see patients until approved
- Rejected doctor cannot see appointment list

---

### Workflow 3: Browse & Search Doctors

**User Side - Browse:**
1. Login as regular user
2. Navigate to `/doctors` (or "Book Appointment" button)
3. See list of approved doctors

**Search by Name:**
1. Enter "smith" in search box
2. List filters to show Dr. Smith only
3. Clear search → show all doctors again
4. Test case-insensitive search (SMITH, smith, Smith all work)

**Filter by Specialization:**
1. Select "Cardiology" from dropdown
2. List shows only cardiologists
3. Combine with search: "smith" + "Cardiology" → Dr. Smith (Cardiology)

**Filter by Fees:**
1. Set Min Fees: 500
2. Set Max Fees: 1500
3. Show doctors with fees between 500-1500
4. Test edge cases:
   - Doctor with 500 fees → shown ✅
   - Doctor with 1500 fees → shown ✅
   - Doctor with 400 fees → hidden ✅
   - Doctor with 1600 fees → hidden ✅

**Pagination:**
1. If more than 10 doctors, see "Page 2" button
2. Click page 2 → load next 10 doctors
3. Check pagination metadata:
   - Total doctors count
   - Current page highlights
   - Previous/Next buttons available

**Empty State:**
1. Search for "xyz123" (non-existent)
2. See message: "No doctors found. Try adjusting filters."
3. Clear filters → doctors reappear

**Test Cases:**
- Search: "john" → returns doctors with "john" in name ✅
- Filter: min=1000, max=2000 → returns doctors with fees in range ✅
- Combine search + 3 filters → results accurate ✅
- Pagination shows correct page numbers ✅
- Loading spinner shows while fetching ✅

---

### Workflow 4: Book Appointment (Slot Validation)

**Happy Path:**
1. Browse and find available doctor
2. Click "Book Now"
3. Redirected to booking form with doctor pre-filled
4. Fill form:
   - Date: 2024-02-20 (must be future)
   - Time: 14:30 (within doctor's working hours)
   - Reason: "General checkup"
   - Consultation: "In-person"
   - Document: [optional PDF]
5. Submit
6. Success: "Appointment booked successfully!"
7. Redirected to UserDashboard
8. Appointment appears in list with status "pending"

**Validation Tests:**

**Test: Past Date Rejection**
- Try to book for 2024-01-01 (past)
- Error: "Appointment must be in future"
- Submit button disabled

**Test: Outside Working Hours**
- Doctor works 10:00-18:00
- Try to book at 09:00
- Error: "Doctor not available at this time"
- Try to book at 18:30
- Error: "Doctor not available at this time"
- Book at 10:00 → Success ✅

**Test: Double Booking Prevention**
1. Book Dr. Smith on 2024-02-20 at 14:30
2. Success ✅
3. Try to book another appointment (different user or same) at same slot
4. Error: "Slot already booked. Please choose another time."
5. Try adjacent time 14:45 → Success ✅

**Test: Field Validation**
- Empty reason → "Reason required"
- Empty date → "Date required"
- Invalid time format → "Invalid time format"
- File too large (>10MB) → "File too large"

**Database Verification:**
```bash
# Check appointment created
db.appointments.findOne({ reason: "General checkup" })
# Should show status: "pending"
```

---

### Workflow 5: Manage Appointments (User)

**View Appointments:**
1. User login → Navigate to "My Appointments"
2. See list of all personal appointments
3. Each appointment shows:
   - Doctor name
   - Date and time
   - Status badge (colored)
   - Reason

**Filter by Status:**
1. Click "Scheduled" tab
2. Show only appointments with status "scheduled"
3. Click "Completed" tab
4. Show only completed appointments
5. Click "All" tab
6. Show all appointments

**Reschedule:**
1. Find "scheduled" appointment
2. Click "Reschedule" button
3. Modal opens with date/time picker
4. Select new date/time:
   - Must be future date
   - Must be within doctor's working hours
   - Must not conflict with existing bookings
5. Submit
6. Success: "Appointment rescheduled"
7. Appointment updated in list

**Reschedule Error Cases:**
- Can't reschedule "completed" appointment
- Can't reschedule "cancelled" appointment
- Can't reschedule to past date
- Can't reschedule to outside working hours
- Can't reschedule to already-booked slot

**Cancel:**
1. Find appointment
2. Click "Cancel" button
3. Status changes to "cancelled"
4. Cannot reschedule cancelled appointments

**Test Cases:**
- View pending appointments ✅
- View scheduled appointments ✅
- View completed appointments ✅
- Pagination works for long list ✅
- Reschedule to future date/time ✅
- Cannot reschedule completed ✅
- Cannot cancel completed ✅

---

### Workflow 6: Manage Appointments (Doctor)

**View Patient Appointments:**
1. Approved doctor login
2. Navigate to Doctor Dashboard
3. See list of appointments:
   - Patient name
   - Date/time
   - Reason
   - Status

**Update Status:**
1. Find pending appointment
2. Click dropdown "Change Status"
3. Options: pending → scheduled, scheduled → completed, scheduled → cancelled
4. Select "scheduled"
5. Status updates immediately
6. Patient receives notification (if implemented)

**View Patient Info:**
1. Click on appointment
2. See patient profile:
   - Name
   - Email
   - Phone
   - Medical history (if any)

**Test Cases:**
- View only own appointments ✅
- Cannot access other doctor's appointments ✅
- Update status available only for valid transitions ✅
- Status change persists in database ✅

---

### Workflow 7: Admin Dashboard & Analytics

**Login:**
1. Login as admin
2. Navigate to `/admin`
3. See full dashboard

**Stat Cards:**
- Total Users: Shows count from `/api/admin/stats`
- Total Doctors: Count of approved + rejected + pending doctors
- Total Appointments: All appointments across platform
- Pending Approvals: Doctors awaiting admin decision

**Verify Stat Accuracy:**
```bash
# Backend: Run these queries and compare with dashboard

# Total users
db.users.countDocuments()

# Total doctors (all statuses)
db.doctors.countDocuments()

# Total approved doctors
db.doctors.countDocuments({ status: "approved" })

# Pending doctors
db.doctors.countDocuments({ status: "pending" })

# Total appointments
db.appointments.countDocuments()

# Appointments by status
db.appointments.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }])
```

**Status Summary Table:**
- Shows appointment counts grouped by status
- Pending: [count]
- Scheduled: [count]
- Completed: [count]
- Cancelled: [count]

**Pending Doctor Approvals:**
- Cards show pending doctors
- Each card displays:
  - Name
  - Email
  - Specialization
  - Experience
  - Fees
  - Address
- Approve button with confirmation
- Reject button with confirmation

**Approve/Reject Flow:**
1. Click "Approve" on doctor card
2. Confirmation modal: "Are you sure?"
3. Click "Confirm"
4. Toast: "Doctor approved successfully!"
5. Doctor removed from list
6. "Pending Approvals" stat decreases
7. Doctor now visible in doctor listing for users

**Test Cases:**
- Stats cards update after new user/appointment ✅
- Pending doctors list loads correctly ✅
- Approve button changes status ✅
- Reject button declines application ✅
- Stat cards are read-only (no editing) ✅
- Pagination works for pending doctors ✅

---

## API Testing

### Test Tools
- **Postman** or **Insomnia** for manual API testing
- **curl** for command-line testing
- Backend logs to verify request/response

### Test Cases by Endpoint

#### 1. User Endpoints

**POST /api/users/register**
```bash
curl -X POST http://localhost:5000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "JohnPass123!",
    "phone": "9876543210"
  }'

# Expected: 201 Created
# Response: { success: true, message: "User registered", user: {...} }
```

**Negative Tests:**
```bash
# Duplicate email
curl -X POST ... -d '{ "email": "john@example.com", ... }'
# Expected: 400 Bad Request { message: "Email already registered" }

# Missing password
curl -X POST ... -d '{ "name": "Jane", "email": "jane@example.com" }'
# Expected: 400 Bad Request { message: "Password is required" }
```

**POST /api/users/login**
```bash
curl -X POST http://localhost:5000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "JohnPass123!"
  }'

# Expected: 200 OK
# Response: { success: true, token: "eyJhbGc...", user: {...} }
```

#### 2. Doctor Endpoints

**GET /api/doctors**
```bash
curl http://localhost:5000/api/doctors?page=1&limit=10

# Expected: 200 OK
# Response: {
#   doctors: [...],
#   pagination: { total: 50, pages: 5, currentPage: 1 }
# }
```

**With Filters:**
```bash
curl "http://localhost:5000/api/doctors?search=smith&specialization=cardiology&minFees=500&maxFees=2000&page=1&limit=10"

# Expected: 200 OK with filtered results
```

**GET /api/doctors/:id**
```bash
curl http://localhost:5000/api/doctors/60d5ec49f1234567890abcde

# Expected: 200 OK
# Response: { success: true, doctor: {...full details...} }
```

**Invalid ID:**
```bash
curl http://localhost:5000/api/doctors/invalid_id

# Expected: 404 Not Found { message: "Doctor not found" }
```

**GET /api/doctors/availability/check**
```bash
curl "http://localhost:5000/api/doctors/availability/check?doctorId=60d5ec49f1234567890abcde&date=2024-02-20&time=14:30"

# Success: { available: true, doctor: {...} }
# Slot taken: { success: false, message: "Slot already booked" } (409)
# Outside hours: { success: false, message: "Doctor not available at this time" } (400)
```

#### 3. Appointment Endpoints

**POST /api/appointments/book** (with Auth)
```bash
curl -X POST http://localhost:5000/api/appointments/book \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "doctorId=60d5ec49f1234567890abcde" \
  -F "date=2024-02-20" \
  -F "time=14:30" \
  -F "reason=General checkup" \
  -F "document=@/path/to/file.pdf"

# Success: 201 Created { appointment: {...} }
# Slot taken: 409 Conflict { message: "Slot already booked" }
# Past date: 400 Bad Request { message: "Invalid date" }
```

**GET /api/appointments/me** (with Auth)
```bash
curl http://localhost:5000/api/appointments/me?page=1&limit=10 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Expected: 200 OK
# Response: { appointments: [...], pagination: {...} }
```

**PUT /api/appointments/reschedule/:id** (with Auth)
```bash
curl -X PUT http://localhost:5000/api/appointments/reschedule/60d5ec49f1234567890abcde \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2024-02-21",
    "time": "15:00"
  }'

# Success: 200 OK { appointment: {...updated...} }
# Slot taken: 409 Conflict { message: "Slot already booked" }
# Completed: 400 Bad Request { message: "Cannot reschedule completed appointment" }
```

#### 4. Admin Endpoints

**GET /api/admin/stats** (Admin Auth Required)
```bash
curl http://localhost:5000/api/admin/stats \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"

# Expected: 200 OK
# Response: {
#   totalUsers: 50,
#   totalDoctors: 12,
#   totalAppointments: 200,
#   pendingDoctors: 3,
#   appointmentsByStatus: {
#     pending: 15,
#     scheduled: 150,
#     completed: 30,
#     cancelled: 5
#   }
# }
```

**GET /api/admin/pending-doctors** (Admin Auth Required)
```bash
curl http://localhost:5000/api/admin/pending-doctors?page=1&limit=10 \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"

# Expected: 200 OK
# Response: { doctors: [...], pagination: {...} }
```

**POST /api/admin/approve-doctor/:id** (Admin Auth Required)
```bash
curl -X POST http://localhost:5000/api/admin/approve-doctor/60d5ec49f1234567890abcde \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"

# Success: 200 OK { doctor: {...status: "approved"...} }
# Not found: 404 { message: "Doctor not found" }
```

---

## Error Handling Tests

### Test All Error Scenarios

**Missing Authentication:**
```bash
curl http://localhost:5000/api/appointments/me
# Expected: 401 Unauthorized { message: "No token provided" }
```

**Invalid Token:**
```bash
curl http://localhost:5000/api/appointments/me \
  -H "Authorization: Bearer invalid_token"
# Expected: 401 Unauthorized { message: "Invalid token" }
```

**Insufficient Permissions:**
```bash
# Regular user trying to approve doctor
curl -X POST http://localhost:5000/api/admin/approve-doctor/id \
  -H "Authorization: Bearer USER_TOKEN"
# Expected: 403 Forbidden { message: "Admin access required" }
```

**Database Errors:**
- Simulate MongoDB connection loss
- Check error response: 500 { message: "Database error" } (no sensitive details)

---

## Performance Testing

### Load Test Endpoint (Optional)

```bash
# Using Apache Bench
ab -n 100 -c 10 http://localhost:5000/api/doctors

# Response should handle 100 concurrent requests
# Check response time, failed requests
```

---

## Test Summary Checklist

### Authentication ✅
- [ ] Register new user
- [ ] Login with correct credentials
- [ ] Reject login with wrong password
- [ ] Reject duplicate email registration
- [ ] Token persists in localStorage
- [ ] Token sent with API requests

### Doctor Operations ✅
- [ ] Apply as doctor
- [ ] Admin approves doctor
- [ ] Admin rejects doctor
- [ ] Doctor status changes properly
- [ ] Doctor visible in listing after approval

### Appointment Booking ✅
- [ ] Book appointment with valid data
- [ ] Reject past date
- [ ] Reject time outside working hours
- [ ] Prevent double booking
- [ ] File upload works
- [ ] Appointment status starts as "pending"

### Reschedule ✅
- [ ] Reschedule to future date
- [ ] Reject reschedule to past date
- [ ] Reject reschedule outside working hours
- [ ] Reject reschedule to taken slot
- [ ] Cannot reschedule completed/cancelled

### Search & Filter ✅
- [ ] Search by doctor name
- [ ] Filter by specialization
- [ ] Filter by fees range
- [ ] Pagination works
- [ ] Empty state shows

### Admin Dashboard ✅
- [ ] Stat cards display correct numbers
- [ ] Pending doctors list loads
- [ ] Approve button works
- [ ] Reject button works
- [ ] Stat updates after approval
- [ ] Only admin can access

### Error Handling ✅
- [ ] Invalid input returns 400
- [ ] Not found returns 404
- [ ] Conflict returns 409
- [ ] Unauthorized returns 401/403
- [ ] Error messages are user-friendly

---

## Bug Report Template

When testing, if you find a bug, document it:

```
TITLE: [Component] Brief description
SEVERITY: Critical / High / Medium / Low
STEPS TO REPRODUCE:
1. [Step 1]
2. [Step 2]
3. [Step 3]

EXPECTED RESULT:
[What should happen]

ACTUAL RESULT:
[What actually happened]

BROWSER/OS:
[Chrome 120 on Windows 10]

SCREENSHOTS:
[If applicable]
```

---

## Conclusion

Comprehensive testing ensures MediConnect works reliably across all features and user roles. Follow this guide for:
- Manual testing workflows
- API endpoint validation
- Error scenario verification
- Performance baseline

This demonstrates QA competence in interviews! 🧪
