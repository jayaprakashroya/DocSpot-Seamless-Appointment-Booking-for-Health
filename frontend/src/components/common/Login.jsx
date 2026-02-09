import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../utils/axiosConfig';
import './Login.css';

const Login = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [loginType, setLoginType] = useState('user'); // 'user', 'doctor', 'admin'
  const [sessionExpired, setSessionExpired] = useState(false);

  useEffect(() => {
    // Show session expired message if redirected back to login
    if (searchParams.get('session_expired') === 'true') {
      setSessionExpired(true);
      toast.warning('Your session has expired. Please login again.');
    }
  }, [searchParams]);

  const validateForm = () => {
    const newErrors = {};
    if (!email) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = 'Invalid email format';
    if (!password) newErrors.password = 'Password is required';
    else if (password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const res = await api.post('/users/login', { email, password, type: loginType });
      const { token, user } = res.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      // Notify other components (navbar, etc.) that auth changed
      try { window.dispatchEvent(new Event('authChanged')); } catch (e) { /* ignore */ }
      toast.success('Login successful!');
      setSessionExpired(false);
      setTimeout(() => {
        if (user.type === 'admin') navigate('/admin');
        else if (user.isDoctor || user.type === 'doctor') navigate('/doctor');
        else navigate('/user');
      }, 500);
    } catch (err) {
      let message = 'Login failed. Please try again.';
      
      // Check if server is unreachable
      if (!err.response) {
        if (err.message === 'Network Error') {
          message = '❌ Cannot reach server. Is the backend running on port 5000? Start it in terminal.';
        } else if (err.code === 'ECONNREFUSED') {
          message = '❌ Backend server is not running. Start it with: npm start (in backend folder)';
        } else {
          message = `❌ Network error: ${err.message}`;
        }
      } else if (err.response?.status === 400 || err.response?.status === 401) {
        // Invalid credentials
        message = err?.response?.data?.message || 'Invalid email or password';
      } else if (err.response?.status === 500) {
        message = '❌ Server error. Check if backend is properly connected to MongoDB.';
      } else if (err.response?.status === 503) {
        message = '❌ Database unavailable. Is MongoDB running?';
      } else {
        message = err?.response?.data?.message || 'Login failed. Please try again.';
      }
      
      toast.error(message);
      setErrors({ submit: message });
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };



  const isFormValid = email && password && !errors.email && !errors.password;

  return (
    <div className="login-container">
      {/* Left Section - Branding */}
      <div className="login-left">
        <div className="brand-section">
          <div className="logo-circle">
            <h1>📋</h1>
          </div>
          <h2>DocSpot</h2>
          <p className="tagline">Book doctor appointments seamlessly</p>
          
          <div className="features-list">
            <div className="feature-item">
              <span className="feature-icon">✔</span>
              <span>Book appointments instantly</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">✔</span>
              <span>Verified doctors & specialists</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">✔</span>
              <span>Secure & role-based access</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Section - Login Form */}
      <div className="login-right">
        <div className="login-card">
          <h3 className="form-title">Welcome Back</h3>
          <p className="form-subtitle">Sign in to your account</p>

          {/* Login Type Selector */}
          <div className="login-type-selector">
            <button
              type="button"
              className={`login-type-btn ${loginType === 'user' ? 'active' : ''}`}
              onClick={() => { setLoginType('user'); setErrors({}); setEmail(''); setPassword(''); }}
            >
              👥 User
            </button>
            <button
              type="button"
              className={`login-type-btn ${loginType === 'doctor' ? 'active' : ''}`}
              onClick={() => { setLoginType('doctor'); setErrors({}); setEmail(''); setPassword(''); }}
            >
              ⚕️ Doctor
            </button>
            <button
              type="button"
              className={`login-type-btn ${loginType === 'admin' ? 'active' : ''}`}
              onClick={() => { setLoginType('admin'); setErrors({}); setEmail(''); setPassword(''); }}
            >
              🛡️ Admin
            </button>
          </div>


          <form onSubmit={handleSubmit}>
            {/* Email Field */}
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div className="input-wrapper">
                <span className="input-icon">✉</span>
                <input
                  type="email"
                  className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors({ ...errors, email: '' });
                  }}
                />
              </div>
              {errors.email && <small className="text-danger">{errors.email}</small>}
            </div>

            {/* Password Field */}
            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="input-wrapper">
                <span className="input-icon">🔒</span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors({ ...errors, password: '' });
                  }}
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? '👁' : '👁‍🗨'}
                </button>
              </div>
              {errors.password && <small className="text-danger">{errors.password}</small>}
            </div>

            {/* Submit Error */}
            {errors.submit && (
              <div className="alert alert-danger" role="alert">
                {errors.submit}
              </div>
            )}

            {/* Login Button */}
            <button
              type="submit"
              className="btn btn-login"
              disabled={!isFormValid || loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Forgot Password & Register Links */}
          <div className="auth-links">
            <Link to="/forgot-password" className="forgot-password">Forgot password?</Link>
            <div className="divider">or</div>
            <p className="register-prompt">
              Don't have an account? <Link to="/register" className="register-link">Create one</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
