import { useState } from 'react';
import { FaCalendarCheck, FaEnvelope, FaEye, FaEyeSlash, FaLock, FaShieldAlt, FaStethoscope, FaUser } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../utils/axiosConfig';
import './Register.css';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  // Validation
  const validateForm = () => {
    const newErrors = {};
    if (!name.trim()) newErrors.name = 'Name is required';
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) newErrors.email = 'Valid email required';
    if (!phone.trim()) newErrors.phone = 'Phone number required';
    if (password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formErrors = validateForm();
    
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      toast.error('Please fix the errors below');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/users/register', { name, email, password, phone });
      toast.success('✓ Registration successful! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      const errorMsg = err?.response?.data?.message || 'Registration failed';
      toast.error(errorMsg);
      setErrors({ submit: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      {/* Left side - Branding */}
      <div className="register-left">
        <div className="register-brand">
          <div className="brand-icon">
            <FaStethoscope />
          </div>
          <h1>MediConnect</h1>
          <p className="brand-tagline">Healthcare Made Simple</p>
        </div>

        <div className="register-features">
          <div className="feature-item">
            <div className="feature-icon">
              <FaCalendarCheck />
            </div>
            <div>
              <h3>Instant Booking</h3>
              <p>Book appointments in seconds with verified doctors</p>
            </div>
          </div>

          <div className="feature-item">
            <div className="feature-icon">
              <FaStethoscope />
            </div>
            <div>
              <h3>Verified Doctors</h3>
              <p>All doctors are authenticated and certified professionals</p>
            </div>
          </div>

          <div className="feature-item">
            <div className="feature-icon">
              <FaShieldAlt />
            </div>
            <div>
              <h3>Secure & Private</h3>
              <p>Your data is encrypted and protected with top security</p>
            </div>
          </div>
        </div>

        <div className="register-stats">
          <div className="stat">
            <h4>10K+</h4>
            <p>Users</p>
          </div>
          <div className="stat">
            <h4>500+</h4>
            <p>Doctors</p>
          </div>
          <div className="stat">
            <h4>50K+</h4>
            <p>Appointments</p>
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="register-right">
        <div className="register-form-wrapper">
          <h2>Create Account</h2>
          <p className="register-subtitle">Join thousands of patients finding their perfect doctor</p>

          <form onSubmit={handleSubmit} className="register-form">
            {/* Name Input */}
            <div className="form-group">
              <label>Full Name</label>
              <div className="input-wrapper">
                <FaUser className="input-icon" />
                <input
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setErrors({ ...errors, name: '' });
                  }}
                  className={errors.name ? 'error' : ''}
                />
              </div>
              {errors.name && <span className="error-message">{errors.name}</span>}
            </div>

            {/* Email Input */}
            <div className="form-group">
              <label>Email Address</label>
              <div className="input-wrapper">
                <FaEnvelope className="input-icon" />
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setErrors({ ...errors, email: '' });
                  }}
                  className={errors.email ? 'error' : ''}
                />
              </div>
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>

            {/* Phone Input */}
            <div className="form-group">
              <label>Phone Number</label>
              <div className="input-wrapper">
                <span className="input-icon">📱</span>
                <input
                  type="tel"
                  placeholder="9876543210"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    setErrors({ ...errors, phone: '' });
                  }}
                  className={errors.phone ? 'error' : ''}
                />
              </div>
              {errors.phone && <span className="error-message">{errors.phone}</span>}
            </div>

            {/* Password Input */}
            <div className="form-group">
              <label>Password</label>
              <div className="input-wrapper">
                <FaLock className="input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Min 6 characters"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrors({ ...errors, password: '' });
                  }}
                  className={errors.password ? 'error' : ''}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {errors.password && <span className="error-message">{errors.password}</span>}
            </div>

            {/* Confirm Password Input */}
            <div className="form-group">
              <label>Confirm Password</label>
              <div className="input-wrapper">
                <FaLock className="input-icon" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setErrors({ ...errors, confirmPassword: '' });
                  }}
                  className={errors.confirmPassword ? 'error' : ''}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
            </div>

            {/* Submit Error */}
            {errors.submit && <div className="alert alert-danger">{errors.submit}</div>}

            {/* Submit Button */}
            <button
              type="submit"
              className="btn-register"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Creating Account...
                </>
              ) : (
                'Create My Account'
              )}
            </button>

            {/* Login Link */}
            <p className="login-link">
              Already have an account? <a href="/login">Sign In Here</a>
            </p>
          </form>

          {/* Terms */}
          <p className="terms">
            By registering, you agree to our <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
