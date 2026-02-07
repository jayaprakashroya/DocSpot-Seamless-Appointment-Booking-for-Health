import { useEffect, useState } from 'react';
import { FaArrowLeft, FaCalendarAlt, FaFileAlt } from 'react-icons/fa';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../utils/axiosConfig';
import './BookForm.css';

const BookForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [date, setDate] = useState('');
  const [reason, setReason] = useState('');
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [appointmentDetails, setAppointmentDetails] = useState(null);

  useEffect(() => {
    loadDoctor();
  }, [id]);

  const checkAvailability = async (selectedDate) => {
    try {
      const dt = new Date(selectedDate);
      const time = `${String(dt.getHours()).padStart(2, '0')}:${String(dt.getMinutes()).padStart(2, '0')}`;
      const res = await api.get('/doctors/availability/check', {
        params: { doctorId: id, date: selectedDate, time }
      });
      return { ok: true, data: res.data };
    } catch (err) {
      return { ok: false, error: err?.response?.data?.message || err.message };
    }
  };

  const loadDoctor = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/doctors/${id}`);
      setDoctor(res.data);
    } catch (err) {
      toast.error('Failed to load doctor information');
      navigate('/doctor-list');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!date) newErrors.date = 'Appointment date is required';
    if (!reason || reason.trim().length < 5) newErrors.reason = 'Please provide a reason (at least 5 characters)';
    const selectedDate = new Date(date);
    const now = new Date();
    if (selectedDate <= now) newErrors.date = 'Please select a future date and time';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (selectedFile.size > maxSize) {
        toast.error('File size must be less than 5MB');
        return;
      }
      setFile(selectedFile);
      setFileName(selectedFile.name);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      // Pre-booking availability check
      const avail = await checkAvailability(date);
      if (!avail.ok) {
        toast.error('Availability check failed: ' + (avail.error || 'Please try a different time'));
        setSubmitting(false);
        return;
      }
      if (avail.data && avail.data.available === false) {
        toast.error(avail.data.message || 'Selected slot is not available');
        setSubmitting(false);
        return;
      }

      const formData = new FormData();
      formData.append('doctorId', id);
      formData.append('date', date);
      formData.append('reason', reason);
      if (file) formData.append('document', file);

      const res = await api.post('/appointments/book', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      // Determine booking id/token (use API id if provided, otherwise generate)
      const bookingId = res.data._id || res.data.appointmentId || `BK-${Date.now().toString(36).toUpperCase()}`;

      // Store appointment details for confirmation modal
      setAppointmentDetails({
        appointmentId: bookingId,
        doctorName: doctor.fullname || doctor.name,
        doctorSpecialization: doctor.specialization,
        date: date,
        fees: doctor.fees || doctor.consultationFee,
        reason: reason,
        status: res.data.status || 'pending'
      });
      
      setBookingSuccess(true);
      toast.success('✓ Appointment booked successfully!');
    } catch (err) {
      const errorMsg = err?.response?.data?.message || 'Failed to book appointment';
      toast.error('❌ ' + errorMsg);
      console.error(err?.response?.data || err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="book-form-container">
        <div className="text-center py-5">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading doctor information...</p>
        </div>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="book-form-container">
        <div className="alert alert-warning text-center">
          Doctor information could not be loaded.
        </div>
      </div>
    );
  }

  return (
    <div className="book-form-container">
      {bookingSuccess && (
        <div className="booking-success-modal-overlay">
          <div className="booking-success-modal">
            <div className="success-icon">✓</div>
            <h2>Appointment Booked Successfully!</h2>
            <p className="success-message">Your appointment request has been sent to the doctor.</p>
            
            {appointmentDetails?.appointmentId && (
              <div className="booking-id-row">
                <div className="booking-id-label">Booking ID:</div>
                <div className="booking-id-value">{appointmentDetails.appointmentId}</div>
                <button
                  className="btn-copy-id"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(appointmentDetails.appointmentId);
                      toast.success('Booking ID copied to clipboard');
                    } catch (err) {
                      toast.error('Unable to copy booking ID');
                    }
                  }}
                >
                  Copy
                </button>
              </div>
            )}

            <div className="appointment-summary">
              <div className="summary-item">
                <span className="label">Doctor:</span>
                <span className="value">{appointmentDetails.doctorName}</span>
              </div>
              <div className="summary-item">
                <span className="label">Specialization:</span>
                <span className="value">{appointmentDetails.doctorSpecialization}</span>
              </div>
              <div className="summary-item">
                <span className="label">Date & Time:</span>
                <span className="value">{new Date(appointmentDetails.date).toLocaleString()}</span>
              </div>
              <div className="summary-item">
                <span className="label">Consultation Fee:</span>
                <span className="value fee">₹{appointmentDetails.fees}</span>
              </div>
              <div className="summary-item">
                <span className="label">Status:</span>
                <span className="value status-pending">Pending Approval</span>
              </div>
            </div>

            <div className="next-steps">
              <h4>What happens next?</h4>
              <ul>
                <li>✓ Your appointment request has been created</li>
                <li>📧 The doctor will review your request</li>
                <li>📲 You'll receive a notification once approved</li>
                <li>📞 Join the video call at the scheduled time</li>
              </ul>
            </div>

            <div className="modal-actions">
              <button 
                className="btn btn-primary"
                onClick={() => navigate('/user')}
              >
                View All Appointments
              </button>
              <button 
                className="btn btn-outline-secondary"
                onClick={() => navigate('/doctor-list')}
              >
                Back to Doctors
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="form-wrapper">
        <button 
          className="btn btn-link back-btn"
          onClick={() => navigate('/doctor-list')}
        >
          <FaArrowLeft /> Back to Doctors
        </button>

        <div className="doctor-info-banner">
          <div className="doctor-details">
            <h2>{doctor.fullname}</h2>
            <p className="specialization">{doctor.specialization} • {doctor.experience} years experience</p>
            <p className="consultation-fee">Consultation Fee: <strong>₹{doctor.fees}</strong></p>
          </div>
        </div>

        <div className="form-card">
          <h3 className="form-title"><FaCalendarAlt /> Book Your Appointment</h3>
          
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Appointment Date & Time</label>
              <input
                type="datetime-local"
                className={`form-control ${errors.date ? 'is-invalid' : ''}`}
                value={date}
                onChange={e => {
                  setDate(e.target.value);
                  if (errors.date) setErrors({ ...errors, date: null });
                }}
                required
              />
              {errors.date && <div className="invalid-feedback d-block">{errors.date}</div>}
              <small className="form-text text-muted">Select a date and time for your appointment</small>
            </div>

            <div className="mb-3">
              <label className="form-label">Reason for Visit</label>
              <textarea
                className={`form-control ${errors.reason ? 'is-invalid' : ''}`}
                rows="4"
                placeholder="Please describe your symptoms or reason for visit..."
                value={reason}
                onChange={e => {
                  setReason(e.target.value);
                  if (errors.reason) setErrors({ ...errors, reason: null });
                }}
              ></textarea>
              {errors.reason && <div className="invalid-feedback d-block">{errors.reason}</div>}
              <small className="form-text text-muted">This helps the doctor prepare for your visit</small>
            </div>

            <div className="mb-3">
              <label className="form-label">
                <FaFileAlt /> Upload Medical Document (optional)
              </label>
              <div className="file-upload-area">
                <input
                  type="file"
                  id="fileInput"
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                />
                <label htmlFor="fileInput" className="file-input-label">
                  {fileName ? (
                    <>
                      <span className="file-icon">✓</span>
                      <span className="file-name">{fileName}</span>
                    </>
                  ) : (
                    <>
                      <span className="file-icon">📄</span>
                      <span>Click to upload or drag file here</span>
                      <span className="file-hint">Supported: PDF, DOC, DOCX, JPG, PNG (Max 5MB)</span>
                    </>
                  )}
                </label>
              </div>
            </div>

            <div className="form-actions">
              <button
                type="submit"
                className="btn btn-primary btn-lg"
                disabled={submitting}
              >
                {submitting ? '⏳ Booking...' : '✓ Book Appointment'}
              </button>
              <button
                type="button"
                className="btn btn-outline-secondary btn-lg"
                onClick={() => navigate('/doctor-list')}
                disabled={submitting}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>

        <div className="info-box">
          <h5>What happens next?</h5>
          <ul>
            <li>Your appointment request will be sent to {doctor.fullname}</li>
            <li>The doctor will review and approve/reschedule if needed</li>
            <li>You'll receive a notification once approved</li>
            <li>Join the video call at the scheduled time</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default BookForm;
