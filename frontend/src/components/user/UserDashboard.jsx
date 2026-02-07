import { useEffect, useState } from 'react';
import { FaCalendarAlt, FaClipboard, FaSync } from 'react-icons/fa';
import { Link, useLocation } from 'react-router-dom';
import api from '../../utils/axiosConfig';
import { disconnectSocket, getSocket, initSocket } from '../../utils/socket';
import './UserDashboard.css';

const UserDashboard = () => {
  const location = useLocation();
  const [appointments, setAppointments] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
  const [rescheduleAppointment, setRescheduleAppointment] = useState(null);
  const [rescheduleDateTime, setRescheduleDateTime] = useState('');

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) setUser(JSON.parse(storedUser));
    loadAppointments();
    // init socket and listen for updates
    let sock;
    try {
      const uid = storedUser ? JSON.parse(storedUser)._id : null;
      sock = initSocket(uid);
      sock.on('appointmentUpdated', (payload) => {
        setAppointments((prev) => prev.map(a => a._id === payload._id ? payload : a));
      });
      sock.on('appointmentCreated', (payload) => {
        // if the created appointment belongs to this user, prepend
        const uid = storedUser ? JSON.parse(storedUser)._id : null;
        if (payload.userInfo && payload.userInfo._id === uid) {
          setAppointments((prev) => [payload, ...prev]);
        }
      });
    } catch (err) {
      // ignore socket init errors
      console.error('Socket init error', err);
    }

    return () => {
      try { if (getSocket()) disconnectSocket(); } catch (e) {}
    };
  }, [location]); // Reload when navigating to this page

  const loadAppointments = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/appointments/me');
      setAppointments(res.data.appointments || []);
    } catch (err) {
      setError('Failed to load appointments');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const res = await api.get('/appointments/me');
      setAppointments(res.data.appointments || []);
    } catch (err) {
      console.error('Refresh failed:', err);
    } finally {
      setRefreshing(false);
    }
  };

  const handleCancel = async (appointmentId) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    try {
      await api.put(`/appointments/status/${appointmentId}`, { status: 'cancelled' });
      setAppointments((prev) => prev.map(a => a._id === appointmentId ? { ...a, status: 'cancelled' } : a));
    } catch (err) {
      console.error('Cancel failed', err);
      alert('Failed to cancel appointment');
    }
  };

  const openRescheduleModal = (appointment) => {
    setRescheduleAppointment(appointment);
    // prefill with current appointment date (as datetime-local compatible)
    const dt = new Date(appointment.date);
    const isoLocal = new Date(dt.getTime() - dt.getTimezoneOffset() * 60000).toISOString().slice(0,16);
    setRescheduleDateTime(isoLocal);
    setRescheduleModalOpen(true);
  };

  const submitReschedule = async () => {
    if (!rescheduleAppointment || !rescheduleDateTime) return alert('Please pick a new date/time');
    try {
      const dt = new Date(rescheduleDateTime);
      const newDate = dt.toISOString();
      const newTime = `${String(dt.getHours()).padStart(2,'0')}:${String(dt.getMinutes()).padStart(2,'0')}`;
      await api.put(`/appointments/reschedule/${rescheduleAppointment._id}`, { newDate, newTime });
      setAppointments((prev) => prev.map(a => a._id === rescheduleAppointment._id ? { ...a, date: newDate, time: newTime } : a));
      setRescheduleModalOpen(false);
      setRescheduleAppointment(null);
    } catch (err) {
      console.error('Reschedule failed', err);
      alert(err?.response?.data?.message || 'Failed to reschedule appointment');
    }
  };

  const counts = appointments.reduce(
    (acc, apt) => {
      acc.total += 1;
      if (apt.status === 'pending') acc.pending += 1;
      if (apt.status === 'scheduled') acc.scheduled += 1;
      if (apt.status === 'completed') acc.completed += 1;
      if (apt.status === 'cancelled') acc.cancelled += 1;
      return acc;
    },
    { total: 0, pending: 0, scheduled: 0, completed: 0, cancelled: 0 }
  );

  const filteredAppointments = appointments.filter((apt) => {
    if (filterStatus !== 'all' && apt.status !== filterStatus) return false;
    if (search && !(apt.doctorInfo?.fullname || '').toLowerCase().includes(search.toLowerCase())) return false;
    if (fromDate) {
      const from = new Date(fromDate);
      if (new Date(apt.date) < from) return false;
    }
    if (toDate) {
      const to = new Date(toDate);
      if (new Date(apt.date) > to) return false;
    }
    return true;
  });

  const getStatusBadge = (status) => {
    const statusColors = {
      pending: 'warning',
      scheduled: 'info',
      completed: 'success',
      cancelled: 'danger',
    };
    return statusColors[status] || 'secondary';
  };

  if (loading) {
    return (
      <div className="user-dashboard">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="user-dashboard">
        <div className="alert alert-danger">{error}</div>
      </div>
    );
  }

  return (
    <div className="user-dashboard layout-with-sidebar">
      <aside className="dashboard-sidebar">
        <div className="sidebar-user">
          <div className="avatar">{user?.name ? user.name.charAt(0).toUpperCase() : 'U'}</div>
          <div className="user-info">
            <div className="user-name">{user?.name || 'User'}</div>
            <div className="user-email">{user?.email}</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <button className={`sidebar-link ${filterStatus === 'all' ? 'active' : ''}`} onClick={() => setFilterStatus('all')}>
            All Appointments <span className="count">{counts.total}</span>
          </button>
          <button className={`sidebar-link ${filterStatus === 'pending' ? 'active' : ''}`} onClick={() => setFilterStatus('pending')}>
            Pending <span className="count">{counts.pending}</span>
          </button>
          <button className={`sidebar-link ${filterStatus === 'scheduled' ? 'active' : ''}`} onClick={() => setFilterStatus('scheduled')}>
            Scheduled <span className="count">{counts.scheduled}</span>
          </button>
          <button className={`sidebar-link ${filterStatus === 'completed' ? 'active' : ''}`} onClick={() => setFilterStatus('completed')}>
            Completed <span className="count">{counts.completed}</span>
          </button>
          <button className={`sidebar-link ${filterStatus === 'cancelled' ? 'active' : ''}`} onClick={() => setFilterStatus('cancelled')}>
            Cancelled <span className="count">{counts.cancelled}</span>
          </button>
          <Link to="/user/profile" className="sidebar-link">Profile</Link>
          <Link to="/doctor-list" className="sidebar-link">Browse Doctors</Link>
        </nav>
      </aside>

      <main className="dashboard-main">
        <div className="dashboard-header">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2>
                <FaClipboard /> My Appointments
              </h2>
              <p className="text-muted">Manage all your doctor appointments here</p>
            </div>
            <button
              className="btn btn-sm btn-outline-secondary"
              onClick={handleRefresh}
              disabled={refreshing}
              title="Refresh appointments"
            >
              <FaSync style={{ marginRight: '0.5rem', animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>

        <div className="dashboard-controls" style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
          <label>
            Status:
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={{ marginLeft: 8 }}>
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="scheduled">Scheduled</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </label>

          <label>
            Doctor search:
            <input placeholder="Doctor name" value={search} onChange={(e) => setSearch(e.target.value)} style={{ marginLeft: 8 }} />
          </label>

          <label>
            From:
            <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} style={{ marginLeft: 8 }} />
          </label>

          <label>
            To:
            <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} style={{ marginLeft: 8 }} />
          </label>

          <Link to="/doctors" className="btn btn-sm btn-primary" style={{ marginLeft: 'auto' }}>
            Browse Doctors
          </Link>
        </div>

        {filteredAppointments.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <FaCalendarAlt />
            </div>
            <h3>No appointments found</h3>
            <p>Try adjusting filters or browse doctors to book a new appointment.</p>
            <Link to="/doctors" className="btn btn-primary btn-lg">
              Browse Doctors
            </Link>
          </div>
        ) : (
          <div className="appointments-grid">
            {filteredAppointments.map((apt) => (
              <div key={apt._id} className="appointment-card">
                <div className="appointment-header">
                  <h4>{apt.doctorInfo?.fullname || 'Doctor'}</h4>
                  <span className={`badge bg-${getStatusBadge(apt.status)}`}>
                    {apt.status.toUpperCase()}
                  </span>
                </div>

                <div className="appointment-details">
                  <p>
                    <strong>Date:</strong> {new Date(apt.date).toLocaleDateString()}
                  </p>
                  <p>
                    <strong>Time:</strong> {apt.time}
                  </p>
                  <p>
                    <strong>Specialization:</strong> {apt.doctorInfo?.specialization || 'N/A'}
                  </p>
                  <p>
                    <strong>Reason:</strong> {apt.reason || 'General Checkup'}
                  </p>
                </div>

                <div className="appointment-actions">
                  {apt.status === 'scheduled' && (
                    <>
                      <button className="btn btn-sm btn-outline-primary" onClick={() => openRescheduleModal(apt)}>Reschedule</button>
                      <button className="btn btn-sm btn-outline-danger" onClick={() => handleCancel(apt._id)}>Cancel</button>
                    </>
                  )}
                  {apt.status === 'pending' && <small className="text-warning">Awaiting approval</small>}
                  {apt.status === 'completed' && <button className="btn btn-sm btn-outline-secondary">Leave Review</button>}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {rescheduleModalOpen && (
        <div className="modal-overlay">
          <div className="reschedule-modal">
            <h4>Reschedule Appointment</h4>
            <p>Doctor: {rescheduleAppointment?.doctorInfo?.fullname}</p>
            <label className="form-label">New Date & Time</label>
            <input type="datetime-local" className="form-control" value={rescheduleDateTime} onChange={(e) => setRescheduleDateTime(e.target.value)} />
            <div style={{ display: 'flex', gap: 8, marginTop: 12, justifyContent: 'flex-end' }}>
              <button className="btn btn-outline-secondary" onClick={() => { setRescheduleModalOpen(false); setRescheduleAppointment(null); }}>Cancel</button>
              <button className="btn btn-primary" onClick={submitReschedule}>Submit</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;
