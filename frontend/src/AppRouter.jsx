import { BrowserRouter, Route, Routes } from 'react-router-dom';
import AdminDashboard from './components/admin/AdminDashboard';
import Home from './components/common/Home';
import Login from './components/common/Login';
import NavBar from './components/common/NavBar';
import ProtectedRoute from './components/common/ProtectedRoute';
import Register from './components/common/Register';
import SampleOverview from './components/demo/SampleOverview';
import DoctorDashboard from './components/doctor/DoctorDashboard';
import BookForm from './components/user/BookForm';
import DoctorList from './components/user/DoctorList';
import UserDashboard from './components/user/UserDashboard';
import UserProfile from './components/user/UserProfile';

export default function AppRouter() {
  return (
    <BrowserRouter>
      <NavBar />
      <div className="container py-4">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/doctor-list" element={<ProtectedRoute requiredRole="user"><DoctorList /></ProtectedRoute>} />
          <Route path="/doctors" element={<ProtectedRoute requiredRole="user"><DoctorList /></ProtectedRoute>} />
          <Route path="/book/:id" element={<ProtectedRoute requiredRole="user"><BookForm /></ProtectedRoute>} />
          <Route path="/user" element={<ProtectedRoute requiredRole="user"><UserDashboard /></ProtectedRoute>} />
          <Route path="/user/appointments" element={<ProtectedRoute requiredRole="user"><UserDashboard /></ProtectedRoute>} />
          <Route path="/user/profile" element={<ProtectedRoute requiredRole="user"><UserProfile /></ProtectedRoute>} />
          <Route path="/doctor" element={<ProtectedRoute requiredRole="doctor"><DoctorDashboard /></ProtectedRoute>} />
          <Route path="/doctor/appointments" element={<ProtectedRoute requiredRole="doctor"><DoctorDashboard /></ProtectedRoute>} />
          <Route path="/doctor/profile" element={<ProtectedRoute requiredRole="doctor"><DoctorDashboard /></ProtectedRoute>} />
          <Route path="/doctor/availability" element={<ProtectedRoute requiredRole="doctor"><DoctorDashboard /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/pending" element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/doctors" element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/appointments" element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>} />
          <Route path="/demo/sample-overview" element={<SampleOverview />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
