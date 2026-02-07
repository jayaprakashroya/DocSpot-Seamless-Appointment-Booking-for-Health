import { useEffect, useState } from 'react';
import { FaCheckCircle, FaEnvelope, FaPhone, FaStethoscope, FaUser, FaUserTag } from 'react-icons/fa';
import api from '../../utils/axiosConfig';
import './UserProfile.css';

const UserProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get('/users/profile');
      setProfile(res.data);
    } catch (err) {
      setError('Failed to load profile information');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="user-profile">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="user-profile">
        <div className="alert alert-danger">{error}</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="user-profile">
        <div className="alert alert-warning">No profile data available</div>
      </div>
    );
  }

  return (
    <div className="user-profile">
      <div className="profile-header">
        <h2><FaUser /> My Profile</h2>
        <p className="text-muted">Manage your personal information</p>
      </div>

      <div className="profile-card">
        <div className="profile-content">
          {/* Basic Information */}
          <div className="profile-section">
            <h5 className="section-title">Basic Information</h5>
            
            <div className="profile-item">
              <label className="profile-label">
                <FaUser className="profile-icon" /> Full Name
              </label>
              <p className="profile-value">{profile.name || 'Not provided'}</p>
            </div>

            <div className="profile-item">
              <label className="profile-label">
                <FaEnvelope className="profile-icon" /> Email Address
              </label>
              <p className="profile-value">{profile.email || 'Not provided'}</p>
            </div>

            <div className="profile-item">
              <label className="profile-label">
                <FaPhone className="profile-icon" /> Phone Number
              </label>
              <p className="profile-value">{profile.phone || 'Not provided'}</p>
            </div>
          </div>

          {/* Account Status */}
          <div className="profile-section">
            <h5 className="section-title">Account Status</h5>
            
            <div className="profile-item">
              <label className="profile-label">
                <FaUserTag className="profile-icon" /> Account Type
              </label>
              <p className="profile-value badge bg-primary" style={{display:'inline-block'}}>
                {profile.type ? profile.type.charAt(0).toUpperCase() + profile.type.slice(1) : 'Customer'}
              </p>
            </div>

            <div className="profile-item">
              <label className="profile-label">
                <FaStethoscope className="profile-icon" /> Doctor Account
              </label>
              <p className="profile-value">
                {profile.isDoctor ? (
                  <span className="badge bg-success">
                    <FaCheckCircle /> Active Doctor
                  </span>
                ) : (
                  <span className="badge bg-secondary">Not a Doctor</span>
                )}
              </p>
            </div>

            <div className="profile-item">
              <label className="profile-label">
                <FaCheckCircle className="profile-icon" /> Account Status
              </label>
              <p className="profile-value">
                {profile.isActive ? (
                  <span className="badge bg-success">
                    <FaCheckCircle /> Active
                  </span>
                ) : (
                  <span className="badge bg-warning">Inactive</span>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
