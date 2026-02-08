import { useEffect, useState } from 'react';
import { FaCalendarAlt, FaChartBar, FaCheckCircle, FaClipboardList, FaClock, FaHome, FaSignOutAlt, FaSync, FaUser, FaUsers } from 'react-icons/fa';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import api from '../../utils/axiosConfig';
import { initSocket } from '../../utils/socket';
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
  // Real-time data for doctors
  const [appointments, setAppointments] = useState({ pending: 0, scheduled: 0, completed: 0 });
  const [availableSlots, setAvailableSlots] = useState({});
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

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
      loadAppointmentStats();
      loadAvailabilityData();
      
      // Set up interval to refresh data every 30 seconds
      const interval = setInterval(() => {
        loadAppointmentStats();
        loadAvailabilityData();
      }, 30000); // 30 seconds
      
      // Set up socket listeners for real-time updates
      try {
        const sock = initSocket(user._id);
        sock.on('appointmentUpdated', () => {
          console.log('Real-time: Appointment updated');
          loadAppointmentStats();
        });
        sock.on('appointmentCreated', () => {
          console.log('Real-time: Appointment created');
          loadAppointmentStats();
        });
        sock.on('availabilityUpdated', () => {
          console.log('Real-time: Availability updated');
          loadAvailabilityData();
        });
      } catch (err) {
        console.error('Socket connection error:', err);
      }
      
      return () => {
        clearInterval(interval);
      };
    }
  }, [user]);

  const loadDoctorInfo = async (retries = 3) => {
    try {
      setDoctorLoading(true);
      const res = await api.get('/doctors/profile');
      setDoctor(res.data.doctor || res.data);
    } catch (err) {
      console.error('Failed to load doctor profile', err?.response?.status, err?.response?.data);
      if (err?.response?.status === 401) {
        // Token invalid, auto logout will be handled by axiosConfig
        return;
      }
      if (retries > 0 && err?.response?.status >= 500) {
        // Retry on server error after 2 seconds
        setTimeout(() => loadDoctorInfo(retries - 1), 2000);
      } else {
        setDoctor(null);
      }
    } finally {
      setDoctorLoading(false);
    }
  };

  const loadAppointmentStats = async (retries = 3) => {
    try {
      const res = await api.get('/appointments/doctor');
      const allAppointments = res.data.appointments || [];
      
      const stats = {
        pending: allAppointments.filter(a => a.status === 'pending').length,
        scheduled: allAppointments.filter(a => a.status === 'scheduled').length,
        completed: allAppointments.filter(a => a.status === 'completed').length,
      };
      
      setAppointments(stats);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Failed to load appointment stats', err?.response?.status, err?.response?.data);
      if (err?.response?.status === 401) {
        // Token invalid
        return;
      }
      if (retries > 0 && err?.response?.status >= 500) {
        // Retry on server error
        setTimeout(() => loadAppointmentStats(retries - 1), 2000);
      }
    }
  };

  const loadAvailabilityData = async (retries = 3) => {
    try {
      const res = await api.get('/doctors/profile');
      const doctorData = res.data.doctor || res.data;
      if (doctorData.availability) {
        setAvailableSlots(doctorData.availability);
      }
    } catch (err) {
      console.error('Failed to load availability data', err?.response?.status, err?.response?.data);
      if (err?.response?.status === 401) {
        // Token invalid
        return;
      }
      if (retries > 0 && err?.response?.status >= 500) {
        // Retry on server error
        setTimeout(() => loadAvailabilityData(retries - 1), 2000);
      }
    }
  };

  const handleRefreshData = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        loadDoctorInfo(2),
        loadAppointmentStats(2),
        loadAvailabilityData(2)
      ]);
    } catch (err) {
      console.error('Refresh failed:', err);
    } finally {
      setIsRefreshing(false);
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
                      {(appointments.pending > 0 || appointments.scheduled > 0) && (
                        <span className="badge-count">
                          {appointments.pending + appointments.scheduled}
                        </span>
                      )}
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
                              <button 
                                className="btn-refresh-mini"
                                onClick={handleRefreshData}
                                disabled={isRefreshing}
                                title="Refresh data"
                              >
                                <FaSync className={isRefreshing ? 'spinning' : ''} />
                              </button>
                            </div>

                            {/* Real-time Appointments Stats */}
                            <div className="dropdown-section appointments-stats">
                              <p className="section-title">📅 Appointments</p>
                              <div className="stats-grid">
                                <div className="stat-item pending">
                                  <span className="stat-number">{appointments.pending}</span>
                                  <span className="stat-label">Pending</span>
                                </div>
                                <div className="stat-item scheduled">
                                  <span className="stat-number">{appointments.scheduled}</span>
                                  <span className="stat-label">Scheduled</span>
                                </div>
                                <div className="stat-item completed">
                                  <span className="stat-number">{appointments.completed}</span>
                                  <span className="stat-label">Completed</span>
                                </div>
                              </div>
                            </div>

                            <div className="dropdown-section">
                              <p className="section-title">📋 Profile Info</p>
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

                            {/* Real-time Availability */}
                            {availableSlots && Object.keys(availableSlots).length > 0 && (
                              <div className="dropdown-section">
                                <p className="section-title">🕐 Your Availability</p>
                                <div className="availability-mini">
                                  {Object.entries(availableSlots).slice(0, 6).map(([day, times]) => {
                                    const slotCount = Array.isArray(times) ? times.length : 0;
                                    if (slotCount === 0) return null;
                                    return (
                                      <div key={day} className="mini-day">
                                        <span className="day-name">{day.slice(0, 3).toUpperCase()}</span>
                                        <span className="time-count">{slotCount} slots</span>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}

                            {/* Last Updated */}
                            {lastUpdated && (
                              <div className="dropdown-section last-updated">
                                <p className="update-time">
                                  🔄 Updated {lastUpdated.toLocaleTimeString()}
                                </p>
                              </div>
                            )}

                            <div className="dropdown-actions">
                              <Link to="/doctor/appointments" className="dropdown-link" onClick={() => setIsInfoOpen(false)}>
                                View All Appointments
                              </Link>
                              <Link to="/doctor/availability" className="dropdown-link" onClick={() => setIsInfoOpen(false)}>
                                Manage Availability
                              </Link>
                              <Link to="/doctor/profile" className="dropdown-link" onClick={() => setIsInfoOpen(false)}>
                                View Full Profile
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
