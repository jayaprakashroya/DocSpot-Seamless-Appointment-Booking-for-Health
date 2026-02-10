# mediconnect Frontend Architecture

## Overview

mediconnect frontend is built with **React 18** and **React Router v6**, following component-based architecture with clear separation of concerns. This document explains the structure and design patterns used.

## Core Principles

1. **Component-Based Architecture** — Reusable, composable components
2. **Role-Based Routing** — Different views for admin, doctor, user
3. **Protected Routes** — Sensitive pages require authentication and correct role
4. **Centralized State** — localStorage for auth, Context for app state (optional)
5. **API Layer** — Axios with centralized configuration
6. **Loading & Error States** — Every async operation shows appropriate UI

---

## Component Structure

### Directory Layout

```
frontend/src/
├── components/
│   ├── admin/
│   │   ├── AdminDashboard.jsx      # Stats cards, appointments, doctor approvals
│   │   └── index.js
│   ├── doctor/
│   │   ├── DoctorDashboard.jsx     # Doctor's appointment list
│   │   └── index.js
│   ├── user/
│   │   ├── DoctorList.jsx          # Browse doctors with filters
│   │   ├── DoctorProfile.jsx       # Doctor detail page (future)
│   │   ├── BookForm.jsx            # Appointment booking form
│   │   ├── UserDashboard.jsx       # User's appointments
│   │   └── index.js
│   ├── common/
│   │   ├── ProtectedRoute.jsx      # Role-based route guard
│   │   ├── NavBar.jsx              # Navigation header
│   │   ├── Login.jsx               # User login
│   │   ├── Register.jsx            # User registration
│   │   └── index.js
├── utils/
│   ├── api.js                      # Axios instance
│   └── index.js
├── App.js                          # Main app component
├── AppRouter.jsx                   # Route definitions
└── index.js                        # React entry point
```

---

## Key Components

### ProtectedRoute.jsx

```javascript
// Role-based route guard
<ProtectedRoute path="/admin/*" requiredRole="admin">
  <AdminDashboard />
</ProtectedRoute>

// How it works:
// 1. Checks localStorage for token
// 2. Parses JWT to extract role
// 3. Compares role with requiredRole
// 4. Shows component if authorized, redirects if not
```

**Features:**
- Checks JWT presence
- Extracts user role from token
- Compares against `requiredRole` prop
- Redirects to /login if no token
- Redirects to / if unauthorized

---

### NavBar.jsx

```javascript
// Dynamic navigation based on auth state

// Shows:
// - Logo
// - Links based on role (admin: /admin, doctor: /doctor, user: /user)
// - User name and role if logged in
// - Logout button

// Logout flow:
// - Removes token from localStorage
// - Removes user data
// - Redirects to /
```

---

### DoctorList.jsx (Search & Filter)

**Features:**
- Real-time search by doctor name
- Filter by specialization
- Filter by fees range (min/max)
- Pagination with smart page display
- Loading spinner while fetching
- Empty state message when no results

**State:**
```javascript
const [doctors, setDoctors] = useState([]);
const [pagination, setPagination] = useState({});
const [loading, setLoading] = useState(false);
const [filters, setFilters] = useState({
  search: '',
  specialization: '',
  minFees: '',
  maxFees: '',
  page: 1,
  limit: 10
});
```

**API Call:**
```javascript
GET /api/doctors?search=john&specialization=cardiology&minFees=500&maxFees=2000&page=1&limit=10
```

**Response Format:**
```json
{
  "doctors": [...],
  "pagination": {
    "total": 50,
    "pages": 5,
    "currentPage": 1
  }
}
```

---

### BookForm.jsx (Appointment Booking)

**Form Fields:**
- Doctor ID (from URL params or dropdown)
- Appointment Date (date picker, must be future date)
- Appointment Time (HH:MM format)
- Reason (text area)
- Document (file upload, optional)
- Consultation Type (online/in-person)

**Validation:**
```javascript
// Client-side (frontend)
if (!date || new Date(date) <= new Date()) {
  setError('Appointment date must be in future');
  return;
}
if (!time || !/^\d{2}:\d{2}$/.test(time)) {
  setError('Invalid time format');
  return;
}
if (!reason.trim()) {
  setError('Reason is required');
  return;
}
```

**API Call:**
```javascript
POST /api/appointments/book
{
  "doctorId": "...",
  "date": "2024-02-15",
  "time": "10:30",
  "reason": "General checkup",
  "document": File // Multer handles
}
```

**Response:**
```json
{
  "success": true,
  "appointment": {
    "id": "...",
    "doctorInfo": {...},
    "userInfo": {...},
    "date": "2024-02-15",
    "time": "10:30",
    "status": "pending"
  }
}
```

**Error Handling:**
```javascript
// If slot taken (409 Conflict)
"Slot already booked. Please choose another time."

// If doctor unavailable (400)
"Doctor not available at this time. Working hours: 10:00 - 18:00"

// If past date (400)
"Cannot book appointment in the past"
```

---

### AdminDashboard.jsx (Analytics)

**Displays:**
1. **Stat Cards** (4 cards)
   - Total Users (blue card)
   - Total Doctors (cyan card)
   - Total Appointments (green card)
   - Pending Doctor Approvals (yellow card)

2. **Appointment Status Summary**
   - Table showing counts by status (pending, scheduled, completed, cancelled)

3. **Pending Doctor Approvals**
   - List of doctors waiting for approval
   - Each card shows: name, email, specialization, experience, fees, address
   - "Approve" and "Reject" buttons

**API Calls:**
```javascript
// On component mount, fetch in parallel:
Promise.all([
  GET /api/admin/stats,
  GET /api/admin/pending-doctors?page=1&limit=10
])
```

**Stats Response:**
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

**Pending Doctors Response:**
```json
{
  "doctors": [
    {
      "id": "...",
      "fullname": "Dr. Sarah",
      "email": "sarah@...",
      "specialization": "Pediatrics",
      "experience": 5,
      "fees": 1200,
      "address": "..."
    }
  ],
  "pagination": { "total": 3, "pages": 1, "currentPage": 1 }
}
```

**Approval Flow:**
```javascript
// When "Approve" button clicked:
1. Show confirmation dialog
2. POST /api/admin/approve-doctor/:id
3. Show success toast: "Doctor approved successfully!"
4. Remove doctor from list or refresh page
```

---

### UserDashboard.jsx (My Appointments)

**Features:**
- List user's appointments with status
- Filter by status (pending, scheduled, completed, cancelled)
- Pagination support
- "Reschedule" button for scheduled appointments
- "Cancel" button for non-completed appointments

**API Call:**
```javascript
GET /api/appointments/me?page=1&limit=10&status=scheduled
```

**Response:**
```json
{
  "appointments": [
    {
      "id": "...",
      "doctorInfo": { "fullname": "Dr. Smith", ... },
      "date": "2024-02-15",
      "time": "10:30",
      "reason": "General checkup",
      "status": "scheduled"
    }
  ],
  "pagination": { "total": 5, "pages": 1, "currentPage": 1 }
}
```

---

### DoctorDashboard.jsx (Doctor View)

**Features:**
- List appointments assigned to doctor
- Filter by status
- Update appointment status
- View patient information

**API Call:**
```javascript
GET /api/doctors/:doctorId/appointments?page=1&limit=10
```

---

## Data Flow Examples

### Example 1: Book Appointment

```
User fills BookForm
├─ (Client validation)
├─ POST /api/appointments/book with FormData
│  └─ Backend validates slot availability
├─ Response: appointment created
├─ Show success toast
├─ Redirect to UserDashboard
└─ Display new appointment in list
```

### Example 2: Admin Approves Doctor

```
Admin clicks "Approve" on pending doctor
├─ Show confirmation: "Are you sure?"
├─ POST /api/admin/approve-doctor/:id
│  └─ Backend updates status to "approved"
├─ Response: doctor updated
├─ Show toast: "Doctor approved successfully!"
├─ Remove from pending list or refresh
└─ Update stat card (pendingDoctors -= 1)
```

### Example 3: Reschedule Appointment

```
User clicks "Reschedule" on appointment
├─ Open modal with date/time picker
├─ Validate new date/time (must be future)
├─ PUT /api/appointments/reschedule/:id
│  ├─ Backend checks slot availability
│  └─ Update if available, error if not
├─ Response: updated appointment
├─ Show success or error toast
├─ Refresh appointment list
└─ Display new date/time
```

---

## State Management

### Authentication State

```javascript
// Stored in localStorage
{
  token: "eyJhbGc...",  // JWT
  user: {
    id: "...",
    name: "John",
    email: "john@...",
    type: "customer" // "admin", "doctor", "customer"
  }
}
```

### Component State Patterns

**Loading State:**
```javascript
const [loading, setLoading] = useState(false);

const fetchData = async () => {
  setLoading(true);
  try {
    const res = await api.get('/endpoint');
    setData(res.data);
  } catch (err) {
    setError(err.response?.data?.message);
  } finally {
    setLoading(false);
  }
};

// Render:
if (loading) return <Spinner />;
if (error) return <Alert variant="danger">{error}</Alert>;
return <DataDisplay data={data} />;
```

**Filter State:**
```javascript
const [filters, setFilters] = useState({
  search: '',
  specialization: '',
  page: 1,
  limit: 10
});

const handleFilterChange = (filterName, value) => {
  setFilters(prev => ({
    ...prev,
    [filterName]: value,
    page: 1  // Reset to page 1 when filter changes
  }));
};

// Fetch when filters change:
useEffect(() => {
  fetchData();
}, [filters]);
```

---

## API Integration

### axios Configuration (`utils/api.js`)

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api'
});

// Add token to all requests
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle errors globally
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.clear();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

### Usage Example

```javascript
import api from '../utils/api';

// GET request
const { data } = await api.get('/doctors', {
  params: { search: 'john', page: 1 }
});

// POST with file upload
const formData = new FormData();
formData.append('doctorId', '...');
formData.append('date', '2024-02-15');
formData.append('document', fileInput.files[0]);

const { data } = await api.post('/appointments/book', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});

// PUT request
const { data } = await api.put('/appointments/reschedule/:id', {
  date: '2024-02-16',
  time: '14:00'
});
```

---

## UI Component Library

### Bootstrap 5
- Responsive grid system
- Cards, buttons, forms
- Modals for confirmations

### Ant Design
- Icons (CheckCircle, XCircle, etc.)
- Loading spinners
- Badges for status display

### React-Toastify
```javascript
import { toast } from 'react-toastify';

// Success toast
toast.success('Appointment booked successfully!', {
  position: 'bottom-right',
  autoClose: 2500
});

// Error toast
toast.error('Failed to book appointment', {
  position: 'bottom-right',
  autoClose: 2500
});
```

---

## Key Features by Component

| Component | Features | Props | State |
|-----------|----------|-------|-------|
| DoctorList | Search, filter, pagination | None | doctors, filters, loading |
| BookForm | Date picker, file upload, validation | doctorId | formData, loading, error |
| AdminDashboard | Stats cards, charts, approvals | None | stats, doctors, loading |
| UserDashboard | Appointment list, filter, reschedule | None | appointments, filter, page |
| ProtectedRoute | Role-based access | requiredRole, children | (none) |
| NavBar | Dynamic links, logout | None | (none) |

---

## Styling Approach

- **Bootstrap 5** for responsive layout
- **Inline styles** for dynamic styling
- **Card components** for consistent UI
- **Color-coded status** (green=complete, yellow=pending, red=cancelled)

---

## Best Practices

### ✅ Do
- Use `useEffect` with dependency array to prevent infinite loops
- Clear loading state in finally block
- Reset filters/page when search changes
- Show error messages to user
- Disable buttons while loading
- Use controlled form inputs

### ❌ Don't
- Make API calls directly in component without useEffect
- Store sensitive data in localStorage (only token is ok)
- Ignore error responses
- Show full error objects to users
- Make too many sequential API calls (use Promise.all)

---

## Common Patterns

### Fetch Data on Mount
```javascript
useEffect(() => {
  const fetchData = async () => {
    try {
      const { data } = await api.get('/endpoint');
      setData(data);
    } catch (err) {
      setError(err.response?.data?.message);
    }
  };
  fetchData();
}, []);
```

### Handle Form Submission
```javascript
const handleSubmit = async (e) => {
  e.preventDefault();
  
  // Validation
  if (!formData.field) {
    setError('Field required');
    return;
  }
  
  // API call
  setLoading(true);
  try {
    const { data } = await api.post('/endpoint', formData);
    toast.success('Success!');
    // Redirect or refresh
  } catch (err) {
    toast.error(err.response?.data?.message);
  } finally {
    setLoading(false);
  }
};
```

### Handle Pagination
```javascript
const handlePageChange = (newPage) => {
  setFilters(prev => ({ ...prev, page: newPage }));
};

// Render:
<Pagination>
  {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(page => (
    <Pagination.Item 
      key={page}
      active={page === pagination.currentPage}
      onClick={() => handlePageChange(page)}
    >
      {page}
    </Pagination.Item>
  ))}
</Pagination>
```

---

## Testing the Frontend

### Manual Testing Workflow

**User Journey:**
1. Visit /
2. Click "Register"
3. Fill form and submit
4. Login
5. Browse doctors (search, filter)
6. Click "Book Now"
7. Fill booking form
8. View appointment in dashboard

**Admin Journey:**
1. Login as admin
2. View analytics dashboard
3. See stat cards and charts
4. Approve pending doctors
5. View all appointments

**Doctor Journey:**
1. Apply as doctor
2. Wait for admin approval
3. View assigned appointments

---

## Performance Optimization (Future)

- **Code splitting**: Lazy load admin/doctor components
- **Memoization**: useMemo for expensive calculations
- **Pagination**: Avoid loading all records at once
- **Image optimization**: Compress doctor profile images
- **Caching**: Cache doctor lists with React Query or SWR

---

## Conclusion

MediConnect frontend follows **component-based architecture** with clear data flow. Key patterns include:
- **Protected routes** for role-based access
- **Centralized API** layer for consistent requests
- **Loading/error states** for every async operation
- **Real-time filtering** with pagination
- **Toast notifications** for user feedback

This architecture scales from MVP to production and demonstrates real-world React patterns.
