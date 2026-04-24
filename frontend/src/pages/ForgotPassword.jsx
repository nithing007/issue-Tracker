import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Auth.css';
import axios from 'axios';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/auth/forgot-password', { email });
      setSuccess(response.data.message);
    } catch (err) {
      setError(err.response?.data?.message || 'Request failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modern-auth-page">
      <div className="modern-auth-wrapper">
        <div className="modern-auth-bg-layer"></div>
        <div className="modern-auth-card">
          <div className="modern-auth-header-logo">
            <img src="/assets/trackease-logo.png" alt="TrackEase Pro" />
            <h1>TrackEase Pro</h1>
          </div>
          <h2>Forgot Password</h2>
          <p style={{ textAlign: 'center', color: '#64748b', fontSize: '0.9rem', marginBottom: '24px' }}>
            Enter your email address and we'll send you a link to reset your password.
          </p>
          
          {error && <p className="modern-auth-error">{error}</p>}
          {success && <p className="modern-auth-success" style={{ backgroundColor: '#d1fae5', color: '#065f46', padding: '10px', borderRadius: '6px', textAlign: 'center', marginBottom: '20px' }}>{success}</p>}
          
          <form onSubmit={handleSubmit}>
            <div className="modern-form-group">
              <label>Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="abc@gmail.com"
                required
              />
            </div>
            <button type="submit" className="modern-auth-button" disabled={loading}>
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>

          <div className="modern-auth-link-text">
            Remember your password?{' '}
            <Link to="/login">Back to Login</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
