
import { useEffect, useState } from 'react';
import { FaCalendarAlt, FaCheckCircle, FaClipboardList, FaClock, FaEnvelope, FaPhone, FaTimesCircle, FaUser } from 'react-icons/fa';
import { useLocation } from 'react-router-dom';
import api from '../../utils/axiosConfig';
import './DoctorDashboard.css';

const DoctorDashboard = () => {
  const location = useLocation();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [doctor, setDoctor] = useState(null);
  const [stats, setStats] = useState({
    pending: 0,
    scheduled: 0,
    completed: 0
  });
  const [actionInProgress, setActionInProgress] = useState(null);

  useEffect(() => {
    loadAppointments();
    loadDoctorProfile();
  }, [location.pathname]);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const res = await api.get('/appointments/doctor');
      const allAppointments = res.data.appointments || [];
      setAppointments(allAppointments);
      
      // Calculate stats
      setStats({
        pending: allAppointments.filter(a => a.status === 'pending').length,
        scheduled: allAppointments.filter(a => a.status === 'scheduled').length,
        completed: allAppointments.filter(a => a.status === 'completed').length
      });
    } catch (err) {
      console.error('Failed to load doctor appointments', err);
    } finally {
      setLoading(false);
    }
  };

  const loadDoctorProfile = async () => {
    try {
      const res = await api.get('/doctors/profile');
      setDoctor(res.data.doctor || res.data);
    } catch (err) {
      console.error('Failed to load doctor profile', err);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    if (!window.confirm(`Set status to '${status.toUpperCase()}'?`)) return;
    setActionInProgress(id);
    try {
      await api.put(`/appointments/status/${id}`, { status });
      loadAppointments();
    } catch (err) {
      console.error('Failed to update status', err);
      alert(err?.response?.data?.message || 'Failed to update status');
    } finally {
      setActionInProgress(null);
    }
  };

  const handleReschedule = async (id) => {
    const newDate = window.prompt('Enter new date (YYYY-MM-DD):');
    if (!newDate) return;
    const newTime = window.prompt('Enter new time (HH:MM):');
    if (!newTime) return;
    setActionInProgress(id);
    try {
      await api.put(`/appointments/reschedule/${id}`, { newDate, newTime });
      loadAppointments();
    } catch (err) {
      console.error('Failed to reschedule', err);
      alert(err?.response?.data?.message || 'Failed to reschedule');
    } finally {
      setActionInProgress(null);
    }
  };

  const getStatusClass = (status) => {
    return `status-${status}`;
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return (
      <div className="doctor-dashboard">
        <div className="loading-state">
          <div className="spinner"></div>
          <span>Loading dashboard...</span>
        </div>
      </div>
    );
  }

  // Determine active section from path
  const path = location.pathname || '/doctor';
  const isAppointments = path.startsWith('/doctor/appointments');
  const isAvailability = path.startsWith('/doctor/availability');
  const isProfile = path.startsWith('/doctor/profile');

  return (
    <div className="doctor-dashboard">
      <div className="dashboard-header">
        <h2><FaClipboardList /> Doctor Dashboard</h2>
        <p>Manage your schedule and patient appointments</p>
      </div>

      {isAppointments ? (
        // Appointments View
        <div>
          <h3>📅 All Appointments</h3>
          {appointments.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📋</div>
              <h3>No appointments yet</h3>
              <p>Appointments will appear here once patients book with you</p>
            </div>
          ) : (
            <div className="appointments-list">
              {appointments.map(appointment => (
                <div key={appointment._id} className="appointment-card">
                  <div className="appointment-header">
                    <div>
                      <div className="appointment-patient">
                        👤 {appointment.userInfo?.name || 'Patient'}
                      </div>
                      <div className="appointment-time">
                        <FaCalendarAlt style={{ marginRight: '6px' }} />
                        {formatDate(appointment.date)} at {appointment.time}
                      </div>
                    </div>
                    <div className={`status-badge ${getStatusClass(appointment.status)}`}>
                      {appointment.status}
                    </div>
                  </div>

                  <div className="appointment-info">
                    <div className="info-item">
                      <span className="info-label">Complaint/Reason</span>
                      <span className="info-value">{appointment.reason || 'General Checkup'}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Consultation Type</span>
                      <span className="info-value">{appointment.consultationType || 'In-Person'}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label"><FaEnvelope /> Email</span>
                      <span className="info-value">{appointment.userInfo?.email || 'N/A'}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label"><FaPhone /> Phone</span>
                      <span className="info-value">{appointment.userInfo?.phone || 'N/A'}</span>
                    </div>
                  </div>

                  <div className="appointment-actions">
                    {appointment.status === 'pending' && (
                      <>
                        <button 
                          className="btn-action btn-approve"
                          onClick={() => handleUpdateStatus(appointment._id, 'scheduled')}
                          disabled={actionInProgress === appointment._id}
                        >
                          <FaCheckCircle /> Approve
                        </button>
                        <button 
                          className="btn-action btn-reject"
                          onClick={() => handleUpdateStatus(appointment._id, 'cancelled')}
                          disabled={actionInProgress === appointment._id}
                        >
                          <FaTimesCircle /> Reject
                        </button>
                      </>
                    )}

                    {appointment.status === 'scheduled' && (
                      <>
                        <button 
                          className="btn-action btn-reschedule"
                          onClick={() => handleReschedule(appointment._id)}
                          disabled={actionInProgress === appointment._id}
                        >
                          📅 Reschedule
                        </button>
                        <button 
                          className="btn-action btn-complete"
                          onClick={() => handleUpdateStatus(appointment._id, 'completed')}
                          disabled={actionInProgress === appointment._id}
                        >
                          ✅ Mark Completed
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : isAvailability ? (
        // Availability View
        <div>
          <h3><FaClock /> Your Availability</h3>
          {doctor ? (
            <div className="availability-section">
              <div className="availability-info">
                <p><strong>Special consultation hours can be customized through your profile.</strong></p>
                <p style={{marginTop: '1rem'}}>Current availability was set during your registration setup.</p>
              </div>

              {/* Availability Stats */}
              {doctor.availability && Object.entries(doctor.availability).length > 0 && (
                <div className="availability-stats" style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '1rem',
                  marginBottom: '2rem',
                  padding: '1rem',
                  backgroundColor: '#f5f5f5',
                  borderRadius: '8px'
                }}>
                  <div style={{textAlign: 'center', padding: '0.5rem'}}>
                    <p style={{fontSize: '1.5rem', fontWeight: 'bold', margin: '0.5rem 0'}}>{Object.keys(doctor.availability).filter(day => doctor.availability[day] && doctor.availability[day].length > 0).length}</p>
                    <p style={{margin: '0', color: '#666'}}>Days Available</p>
                  </div>
                  <div style={{textAlign: 'center', padding: '0.5rem'}}>
                    <p style={{fontSize: '1.5rem', fontWeight: 'bold', margin: '0.5rem 0'}}>
                      {Object.values(doctor.availability).reduce((sum, times) => sum + (Array.isArray(times) ? times.length : 0), 0)}
                    </p>
                    <p style={{margin: '0', color: '#666'}}>Total Slots/Week</p>
                  </div>
                  <div style={{textAlign: 'center', padding: '0.5rem'}}>
                    <p style={{fontSize: '1.5rem', fontWeight: 'bold', margin: '0.5rem 0'}}>₹{doctor.fees?.consultation || doctor.fees || 'N/A'}</p>
                    <p style={{margin: '0', color: '#666'}}>Consultation Fee</p>
                  </div>
                </div>
              )}

              <div className="availability-grid">
                {doctor.availability && Object.entries(doctor.availability).length > 0 ? (
                  Object.entries(doctor.availability).map(([day, times]) => (
                    <div key={day} className="availability-day">
                      <h4>{day.charAt(0).toUpperCase() + day.slice(1)}</h4>
                      <div className="time-slots">
                        {Array.isArray(times) && times.length > 0 ? (
                          times.map((time, idx) => (
                            <span key={idx} className="time-slot">{time}</span>
                          ))
                        ) : (
                          <span className="no-availability">Not Available</span>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="empty-state">
                    <p>No availability set yet. Please update your profile.</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="empty-state">
              <p>Loading availability...</p>
            </div>
          )}
        </div>
      ) : isProfile ? (
        // Profile View
        <div>
          <h3><FaUser /> Doctor Profile</h3>
          {doctor ? (
            <div className="profile-section">
              <div className="profile-card">
                <div className="profile-header">
                  <div className="profile-avatar">
                    <img src={doctor.avatarUrl || 'https://i.pravatar.cc/150?img=default'} alt={doctor.fullname} />
                  </div>
                  <div className="profile-info">
                    <h2>{doctor.fullname}</h2>
                    <p className="specialty">{doctor.specialty || doctor.specialization || 'Specialist'}</p>
                    <p className="experience">🎓 {doctor.yearsExperience || doctor.experience || 0} years experience</p>
                    {doctor.rating && <p className="rating">⭐ {doctor.rating} / 5.0</p>}
                  </div>
                </div>

                {/* Professional Stats */}
                <div className="profile-stats" style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                  gap: '1rem',
                  marginBottom: '2rem',
                  padding: '1rem',
                  backgroundColor: '#f9f9f9',
                  borderRadius: '8px'
                }}>
                  <div style={{textAlign: 'center', padding: '0.5rem'}}>
                    <p style={{fontSize: '1.3rem', fontWeight: 'bold', margin: '0.5rem 0'}}>{doctor.yearsExperience || doctor.experience || 'N/A'}</p>
                    <p style={{margin: '0', fontSize: '0.9rem', color: '#666'}}>Years Experience</p>
                  </div>
                  <div style={{textAlign: 'center', padding: '0.5rem'}}>
                    <p style={{fontSize: '1.3rem', fontWeight: 'bold', margin: '0.5rem 0'}}>₹{doctor.fees?.consultation || doctor.fees || 'N/A'}</p>
                    <p style={{margin: '0', fontSize: '0.9rem', color: '#666'}}>Consultation Fee</p>
                  </div>
                  <div style={{textAlign: 'center', padding: '0.5rem'}}>
                    <p style={{fontSize: '1.3rem', fontWeight: 'bold', margin: '0.5rem 0'}}>{doctor.rating || 'N/A'}</p>
                    <p style={{margin: '0', fontSize: '0.9rem', color: '#666'}}>Rating</p>
                  </div>
                </div>

                <div className="profile-details">
                  <div className="detail-row">
                    <span className="label">📧 Email:</span>
                    <span className="value">{doctor.contact?.email || doctor.email}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">📞 Phone:</span>
                    <span className="value">{doctor.contact?.phone || doctor.phone || 'N/A'}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">🏥 Clinic:</span>
                    <span className="value">{doctor.clinic || 'N/A'}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">💰 Consultation Fee:</span>
                    <span className="value">₹{doctor.fees?.consultation || doctor.fees || 'N/A'}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">📍 Location:</span>
                    <span className="value">
                      {doctor.location ? `${doctor.location.address}, ${doctor.location.city}, ${doctor.location.state}` : 'N/A'}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="label">🗣️ Languages:</span>
                    <span className="value">{doctor.languages?.join(', ') || 'N/A'}</span>
                  </div>
                  {doctor.registrationNumber && (
                    <div className="detail-row">
                      <span className="label">🆔 Registration Number:</span>
                      <span className="value">{doctor.registrationNumber}</span>
                    </div>
                  )}
                  {doctor.licenseNumber && (
                    <div className="detail-row">
                      <span className="label">📄 License Number:</span>
                      <span className="value">{doctor.licenseNumber}</span>
                    </div>
                  )}
                </div>

                {doctor.bio && (
                  <div className="profile-bio">
                    <h4>About</h4>
                    <p>{doctor.bio}</p>
                  </div>
                )}

                {doctor.education && doctor.education.length > 0 && (
                  <div className="profile-education">
                    <h4>Education</h4>
                    <ul>
                      {doctor.education.map((edu, idx) => (
                        <li key={idx}>{edu}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {doctor.certifications && doctor.certifications.length > 0 && (
                  <div className="profile-certifications">
                    <h4>Certifications</h4>
                    <ul>
                      {doctor.certifications.map((cert, idx) => (
                        <li key={idx}>{cert}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {doctor.specializations && doctor.specializations.length > 0 && (
                  <div className="profile-specializations">
                    <h4>Specializations</h4>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {doctor.specializations.map((spec, idx) => (
                        <span key={idx} style={{
                          backgroundColor: '#e3f2fd',
                          padding: '0.5rem 1rem',
                          borderRadius: '20px',
                          fontSize: '0.9rem'
                        }}>
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="empty-state">
              <p>Loading profile...</p>
            </div>
          )}
        </div>
      ) : (
        // Default Dashboard View
        <>
          {/* Stats Section */}
          <div className="dashboard-stats">
            <div className="stat-box">
              <div className="stat-icon">⏳</div>
              <div className="stat-number">{stats.pending}</div>
              <div className="stat-label">Pending Approvals</div>
            </div>
            <div className="stat-box">
              <div className="stat-icon">📅</div>
              <div className="stat-number">{stats.scheduled}</div>
              <div className="stat-label">Scheduled</div>
            </div>
            <div className="stat-box">
              <div className="stat-icon">✅</div>
              <div className="stat-number">{stats.completed}</div>
              <div className="stat-label">Completed</div>
            </div>
          </div>

          {/* Appointments Section */}
          <div className="appointments-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h3 className="section-title"><FaCalendarAlt /> All Appointments</h3>
              <button className="btn-refresh" onClick={loadAppointments}>🔄 Refresh</button>
            </div>

            {appointments.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📋</div>
                <h3>No appointments yet</h3>
                <p>Appointments will appear here once patients book with you</p>
              </div>
            ) : (
              <div className="appointments-list">
                {appointments.map(appointment => (
                  <div key={appointment._id} className="appointment-card">
                    <div className="appointment-header">
                      <div>
                        <div className="appointment-patient">
                          👤 {appointment.userInfo?.name || 'Patient'}
                        </div>
                        <div className="appointment-time">
                          <FaCalendarAlt style={{ marginRight: '6px' }} />
                          {formatDate(appointment.date)} at {appointment.time}
                        </div>
                      </div>
                      <div className={`status-badge ${getStatusClass(appointment.status)}`}>
                        {appointment.status}
                      </div>
                    </div>

                    <div className="appointment-info">
                      <div className="info-item">
                        <span className="info-label">Complaint/Reason</span>
                        <span className="info-value">{appointment.reason || 'General Checkup'}</span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">Consultation Type</span>
                        <span className="info-value">{appointment.consultationType || 'In-Person'}</span>
                      </div>
                      <div className="info-item">
                        <span className="info-label"><FaEnvelope /> Email</span>
                        <span className="info-value">{appointment.userInfo?.email || 'N/A'}</span>
                      </div>
                      <div className="info-item">
                        <span className="info-label"><FaPhone /> Phone</span>
                        <span className="info-value">{appointment.userInfo?.phone || 'N/A'}</span>
                      </div>
                    </div>

                    <div className="appointment-actions">
                      {appointment.status === 'pending' && (
                        <>
                          <button 
                            className="btn-action btn-approve"
                            onClick={() => handleUpdateStatus(appointment._id, 'scheduled')}
                            disabled={actionInProgress === appointment._id}
                          >
                            <FaCheckCircle /> Approve
                          </button>
                          <button 
                            className="btn-action btn-reject"
                            onClick={() => handleUpdateStatus(appointment._id, 'cancelled')}
                            disabled={actionInProgress === appointment._id}
                          >
                            <FaTimesCircle /> Reject
                          </button>
                        </>
                      )}

                      {appointment.status === 'scheduled' && (
                        <>
                          <button 
                            className="btn-action btn-reschedule"
                            onClick={() => handleReschedule(appointment._id)}
                            disabled={actionInProgress === appointment._id}
                          >
                            📅 Reschedule
                          </button>
                          <button 
                            className="btn-action btn-complete"
                            onClick={() => handleUpdateStatus(appointment._id, 'completed')}
                            disabled={actionInProgress === appointment._id}
                          >
                            ✅ Mark Completed
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default DoctorDashboard;
