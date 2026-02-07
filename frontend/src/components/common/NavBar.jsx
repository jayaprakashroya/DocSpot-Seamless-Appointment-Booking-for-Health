import { useEffect, useState } from 'react';
import { FaCalendarAlt, FaChartBar, FaCheckCircle, FaClipboardList, FaClock, FaHome, FaSignOutAlt, FaUser, FaUsers } from 'react-icons/fa';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import api from '../../utils/axiosConfig';
import './NavBar.css';

const NavBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [doctor, setDoctor] = useState(null);
  const [doctorLoading, setDoctorLoading] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isInfoOpen, setIsInfoOpen] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) setUser(JSON.parse(storedUser));

    // Listen for auth changes from other components (login/logout)
    const handleAuthChange = () => {
      const s = localStorage.getItem('user');
      setUser(s ? JSON.parse(s) : null);
    };

    // Storage event (other tabs)
    const handleStorage = (e) => {
      if (e.key === 'user' || e.key === 'token') handleAuthChange();
    };

    window.addEventListener('authChanged', handleAuthChange);
    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener('authChanged', handleAuthChange);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  // Load doctor profile for doctors
  useEffect(() => {
    if (user?.type === 'doctor') {
      loadDoctorInfo();
    }
  }, [user]);

  const loadDoctorInfo = async () => {
    try {
      setDoctorLoading(true);
      const res = await api.get('/doctors/profile');
      setDoctor(res.data.doctor || res.data);
    } catch (err) {
      console.error('Failed to load doctor profile', err);
      setDoctor(null);
    } finally {
      setDoctorLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    try { window.dispatchEvent(new Event('authChanged')); } catch (e) {}
    navigate('/');
    setIsDropdownOpen(false);
    setIsMenuOpen(false);
  };

  const isActive = (path) => location.pathname.startsWith(path);

  // Navigation items based on role
  const getNavItems = () => {
    if (!user) return [];
    
    switch (user.type) {
      case 'admin':
        return [
          { label: 'Dashboard', path: '/admin', icon: <FaChartBar /> },
          { label: 'Approvals', path: '/admin/pending', icon: <FaCheckCircle /> },
          { label: 'Doctors', path: '/admin/doctors', icon: <FaUsers /> },
          { label: 'Users', path: '/admin/users', icon: <FaUsers /> },
          { label: 'Appointments', path: '/admin/appointments', icon: <FaCalendarAlt /> },
        ];
      case 'doctor':
        return [
          { label: 'Dashboard', path: '/doctor', icon: <FaClipboardList /> },
          { label: 'Appointments', path: '/doctor/appointments', icon: <FaCalendarAlt /> },
          { label: 'Availability', path: '/doctor/availability', icon: <FaClock /> },
          { label: 'Profile', path: '/doctor/profile', icon: <FaUser /> },
        ];
      default: // customer/user
        return [
          { label: 'Home', path: '/', icon: <FaHome /> },
          { label: 'Doctors', path: '/doctor-list', icon: <FaUsers /> },
          { label: 'Appointments', path: '/user/appointments', icon: <FaClipboardList /> },
          { label: 'Profile', path: '/user/profile', icon: <FaUser /> },
        ];
    }
  };

  const navItems = getNavItems();

  return (
    <>
      <nav className="navbar-modern">
        <div className="navbar-container">
          {/* Logo */}
          <Link to="/" className="navbar-logo">
            <span className="logo-icon">🏥</span>
            <span className="logo-text">DocSpot</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="navbar-menu">
            {user && (
              <div className="nav-items">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
                    title={item.label}
                  >
                    <span className="nav-icon">{item.icon}</span>
                    <span className="nav-label">{item.label}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Right Side - User & Actions */}
          <div className="navbar-right">
            {!user ? (
              <div className="auth-buttons">
                <Link to="/login" className="btn-nav btn-login-nav">
                  Sign In
                </Link>
                <Link to="/register" className="btn-nav btn-register-nav">
                  Register
                </Link>
              </div>
            ) : (
              <div className="user-menu">
                {user?.type === 'doctor' && (
                  <div className="doctor-info-menu">
                    <button 
                      className="btn-info-dropdown"
                      onClick={() => setIsInfoOpen(!isInfoOpen)}
                      title="View your info and availability"
                    >
                      <FaUser /> {doctor?.fullname || 'Doctor'}
                    </button>
                    {isInfoOpen && (
                      <div className="info-dropdown-menu">
                        {doctorLoading ? (
                          <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
                            Loading your profile...
                          </div>
                        ) : doctor ? (
                          <>
                            <div className="dropdown-header">
                              <h4>{doctor.fullname || 'Doctor'}</h4>
                              <p className="specialty">{doctor.specialty || doctor.specialization || 'Specialist'}</p>
                            </div>

                            <div className="dropdown-section">
                              <p className="section-title">📋 Quick Info</p>
                              <div className="info-item">
                                <span>Experience:</span>
                                <strong>{doctor.yearsExperience || doctor.experience || 'N/A'} years</strong>
                              </div>
                              <div className="info-item">
                                <span>Fee:</span>
                                <strong>₹{doctor.fees?.consultation || doctor.fees || 'N/A'}</strong>
                              </div>
                              <div className="info-item">
                                <span>Location:</span>
                                <strong>{doctor.clinic || 'N/A'}</strong>
                              </div>
                            </div>

                            {doctor.availability && Object.keys(doctor.availability).length > 0 && (
                              <div className="dropdown-section">
                                <p className="section-title">🕐 This Week's Availability</p>
                                <div className="availability-mini">
                                  {Object.entries(doctor.availability).map(([day, times]) => {
                                    if (!Array.isArray(times) || times.length === 0) return null;
                                    return (
                                      <div key={day} className="mini-day">
                                        <span className="day-name">{day.slice(0, 3).toUpperCase()}</span>
                                        <span className="time-count">{times.length} slots</span>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}

                            <div className="dropdown-actions">
                              <Link to="/doctor/profile" className="dropdown-link" onClick={() => setIsInfoOpen(false)}>
                                View Full Profile
                              </Link>
                              <Link to="/doctor/availability" className="dropdown-link" onClick={() => setIsInfoOpen(false)}>
                                Manage Availability
                              </Link>
                            </div>
                          </>
                        ) : (
                          <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
                            Unable to load profile
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
                <span className="user-greeting">{user.name}</span>
                <button className="btn-logout" onClick={handleLogout}>
                  <FaSignOutAlt /> LOGOUT
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="mobile-menu-btn"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <span className={`hamburger ${isMenuOpen ? 'active' : ''}`}></span>
          </button>
        </div>
      </nav>

      {/* Mobile Navigation */}
      {isMenuOpen && user && (
        <div className="navbar-mobile-menu">
          <div className="mobile-nav-items">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`mobile-nav-item ${isActive(item.path) ? 'active' : ''}`}
                onClick={() => setIsMenuOpen(false)}
              >
                <span className="nav-icon">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
            <hr />
            <button className="mobile-nav-item logout" onClick={handleLogout}>
              <span className="nav-icon"><FaSignOutAlt /></span>
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default NavBar;
