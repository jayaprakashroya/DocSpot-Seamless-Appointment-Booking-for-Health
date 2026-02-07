# DocSpot Frontend

React 18 application for the DocSpot appointment booking platform.

## Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm start
```

Frontend runs on `http://localhost:3000`

The frontend is configured to proxy API calls to `http://localhost:5000` (see `package.json`). Ensure the backend is running.

## Features

### Common Components
- **Home** — Landing page
- **Login** — User login with JWT storage and role-based redirect
- **Register** — New user registration
- **NavBar** — Navigation with logout and user display

### User Components
- **DoctorList** — Browse available doctors
- **BookForm** — Book appointment with document upload
- **UserDashboard** — View and manage appointments

### Doctor Components
- **DoctorDashboard** — Placeholder for doctor's appointment management

### Admin Components
- **AdminDashboard** — Approve pending doctor applications

## Routing & Protection

Routes are protected with `ProtectedRoute` component:
- `/doctors` — User access only
- `/book/:id` — User access only
- `/user` — User access only
- `/doctor` — Doctor access only
- `/admin` — Admin access only

Unauthenticated users are redirected to `/login`. Users without proper role are redirected to `/`.

## Authentication

JWT token is stored in `localStorage` after login:
```javascript
localStorage.getItem('token')
localStorage.getItem('user')
```

Token is sent with requests:
```javascript
headers: { Authorization: `Bearer ${token}` }
```

Logout removes both token and user from storage.

## File Structure

```
frontend/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── admin/
│   │   │   └── AdminDashboard.jsx
│   │   ├── common/
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── NavBar.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   └── Register.jsx
│   │   ├── doctor/
│   │   │   └── DoctorDashboard.jsx
│   │   └── user/
│   │       ├── BookForm.jsx
│   │       ├── DoctorList.jsx
│   │       └── UserDashboard.jsx
│   ├── utils/
│   │   └── axiosConfig.js
│   ├── App.js
│   ├── AppRouter.jsx
│   └── index.js
└── package.json
```

## Dependencies

- `react` — UI library
- `react-dom` — React DOM rendering
- `react-router-dom` — Client-side routing
- `axios` — HTTP client
- `bootstrap` — CSS framework
- `antd` — UI component library

## Development

```bash
# Start frontend dev server
npm start

# Build for production
npm build
```

The app runs on `http://localhost:3000` and proxies API calls to `http://localhost:5000`.

## Notes

- Backend must be running on `http://localhost:5000`
- All API calls use relative paths (proxied via `package.json`)
- Token expiration and refresh not implemented (add as needed)
- Error handling uses alerts and console logs (improve with toast notifications)

