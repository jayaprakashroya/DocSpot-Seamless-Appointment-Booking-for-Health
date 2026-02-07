import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const token = localStorage.getItem('token');

  if (!token || !user) return <Navigate to="/login" />;

  if (requiredRole) {
    const isAdmin = user.type === 'admin';
    const isDoctor = user.isDoctor || user.type === 'doctor';
    
    const hasRole = 
      (requiredRole === 'admin' && isAdmin) ||
      (requiredRole === 'doctor' && isDoctor) ||
      (requiredRole === 'user' && !isAdmin && !isDoctor);

    if (!hasRole) return <Navigate to="/" />;
  }

  return children;
};

export default ProtectedRoute;
