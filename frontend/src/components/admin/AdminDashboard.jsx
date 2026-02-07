import { useEffect, useState } from 'react';
import { FaCalendarAlt, FaClipboardList, FaUserMd, FaUsers } from 'react-icons/fa';
import { useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../utils/axiosConfig';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const location = useLocation();
  const [stats, setStats] = useState(null);
  const [pending, setPending] = useState([]);
  const [doctorsList, setDoctorsList] = useState([]);
  const [allAppointments, setAllAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [approvingId, setApprovingId] = useState(null);

  useEffect(() => {
    // Load appropriate data depending on admin route
    const path = location.pathname || '/admin';
    if (path.startsWith('/admin/doctors')) {
      loadDoctors();
    } else if (path.startsWith('/admin/appointments')) {
      loadAllAppointments();
    } else {
      // default: stats + pending
      loadData();
    }
  }, [location.pathname]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsRes, pendingRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/pending-doctors')
      ]);

      setStats(statsRes.data.stats || statsRes.data);
      setPending(pendingRes.data.doctors || pendingRes.data);
    } catch (err) {
      toast.error('Failed to load dashboard data');
      console.error(err?.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadDoctors = async () => {
    try {
      setLoading(true);
      const res = await api.get('/doctors?limit=100&page=1');
      setDoctorsList(res.data.doctors || res.data || []);
    } catch (err) {
      toast.error('Failed to load doctors');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadAllAppointments = async () => {
    try {
      setLoading(true);
      const res = await api.get('/appointments/all?limit=100&page=1');
      setAllAppointments(res.data.appointments || res.data || []);
    } catch (err) {
      toast.error('Failed to load appointments');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    if (!window.confirm('Approve this doctor?')) return;
    setApprovingId(id);
    try {
      await api.post(`/admin/approve-doctor/${id}`);
      toast.success('Doctor approved successfully!');
      setPending(prev => prev.filter(d => d._id !== id));
      // Reload stats
      const statsRes = await api.get('/admin/stats');
      setStats(statsRes.data.stats || statsRes.data);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to approve');
    } finally {
      setApprovingId(null);
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm('Reject this doctor application?')) return;
    setApprovingId(id);
    try {
      await api.post(`/admin/reject-doctor/${id}`);
      toast.success('Doctor application rejected');
      setPending(prev => prev.filter(d => d._id !== id));
      const statsRes = await api.get('/admin/stats');
      setStats(statsRes.data.stats || statsRes.data);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to reject');
    } finally {
      setApprovingId(null);
    }
  };

  if (loading) {
    return (
      <div className="admin-dashboard">
        <div className="text-center py-5">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  // Determine active admin section from path
  const path = location.pathname || '/admin';
  const isDoctors = path.startsWith('/admin/doctors');
  const isAppointments = path.startsWith('/admin/appointments');
  const isPending = path.startsWith('/admin/pending') || path === '/admin';

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h2><FaClipboardList /> Admin Dashboard</h2>
        <p className="text-muted">System overview and doctor management</p>
      </div>

      {isDoctors ? (
        <div>
          <h3>Doctors</h3>
          {loading ? (
            <div className="text-center py-3">Loading doctors...</div>
          ) : doctorsList.length === 0 ? (
            <div className="empty-state">No doctors found</div>
          ) : (
            <div className="doctors-grid">
              {doctorsList.map(d => (
                <div key={d._id} className="doctor-card-admin">
                  <h5>Dr. {d.fullname}</h5>
                  <p>{d.specialization}</p>
                  <p>Fees: ₹{d.fees}</p>
                  <p>Status: {d.status}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : isAppointments ? (
        <div>
          <h3>All Appointments</h3>
          {loading ? (
            <div className="text-center py-3">Loading appointments...</div>
          ) : allAppointments.length === 0 ? (
            <div className="empty-state">No appointments found</div>
          ) : (
            <div className="appointments-list">
              {allAppointments.map(a => (
                <div key={a._id} className="appointment-row">
                  <div><strong>Patient:</strong> {a.userInfo?.name || 'N/A'}</div>
                  <div><strong>Doctor:</strong> {a.doctorInfo?.fullname || 'N/A'}</div>
                  <div><strong>Date:</strong> {new Date(a.date).toLocaleDateString()}</div>
                  <div><strong>Time:</strong> {a.time}</div>
                  <div><strong>Status:</strong> {a.status}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        // Default: stats + pending
        <>
          {/* Stats Cards */}
          {stats && (
            <div className="stats-grid">
              <div className="stat-card bg-primary">
                <div className="stat-icon">
                  <FaUsers />
                </div>
                <div className="stat-content">
                  <p className="stat-label">Total Users</p>
                  <h3>{stats.totalUsers}</h3>
                </div>
              </div>

              <div className="stat-card bg-success">
                <div className="stat-icon">
                  <FaUserMd />
                </div>
                <div className="stat-content">
                  <p className="stat-label">Total Doctors</p>
                  <h3>{stats.totalDoctors}</h3>
                </div>
              </div>

              <div className="stat-card bg-info">
                <div className="stat-icon">
                  <FaCalendarAlt />
                </div>
                <div className="stat-content">
                  <p className="stat-label">Appointments</p>
                  <h3>{stats.totalAppointments}</h3>
                </div>
              </div>

              <div className="stat-card bg-warning">
                <div className="stat-icon">
                  <FaClipboardList />
                </div>
                <div className="stat-content">
                  <p className="stat-label">Pending Approvals</p>
                  <h3>{stats.pendingDoctors}</h3>
                </div>
              </div>
            </div>
          )}

          {/* Appointment Status Summary */}
          {stats && stats.appointmentsByStatus && (
            <div className="status-summary">
              <h4>Appointment Status Breakdown</h4>
              <div className="status-grid">
                {Object.entries(stats.appointmentsByStatus).map(([status, count]) => (
                  <div key={status} className={`status-item status-${status}`}>
                    <span className="status-name">{status.charAt(0).toUpperCase() + status.slice(1)}</span>
                    <span className="status-count">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pending Doctor Applications */}
          <div className="pending-doctors-section">
            <h4>
              <FaUserMd /> Pending Doctor Applications ({pending.length})
            </h4>

            {pending.length === 0 ? (
              <div className="empty-state">
                <p>✓ All doctor applications have been reviewed!</p>
              </div>
            ) : (
              <div className="doctors-grid">
                {pending.map(doc => (
                  <div key={doc._id} className="doctor-application-card">
                    <div className="card-header">
                      <h5>{doc.fullname}</h5>
                      <span className="badge bg-warning">Pending</span>
                    </div>

                    <div className="card-body">
                      <p><strong>📧 Email:</strong> {doc.email}</p>
                      <p><strong>🏥 Specialization:</strong> {doc.specialization}</p>
                      <p><strong>⏳ Experience:</strong> {doc.experience} years</p>
                      <p><strong>💰 Consultation Fee:</strong> ₹{doc.fees}</p>
                      <p><strong>📍 Address:</strong> {doc.address}</p>
                    </div>

                    <div className="card-actions">
                      <button
                        className="btn btn-success"
                        disabled={approvingId === doc._id}
                        onClick={() => handleApprove(doc._id)}
                      >
                        {approvingId === doc._id ? '⏳ Approving...' : '✓ Approve'}
                      </button>
                      <button
                        className="btn btn-danger"
                        disabled={approvingId === doc._id}
                        onClick={() => handleReject(doc._id)}
                      >
                        {approvingId === doc._id ? '⏳ Processing...' : '✗ Reject'}
                      </button>
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

export default AdminDashboard;
