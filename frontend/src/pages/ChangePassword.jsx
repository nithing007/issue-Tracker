import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Auth.css';
import Navbar from '../components/Navbar';
import axios from 'axios';

const ChangePassword = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validatePassword = (pass) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(pass);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!validatePassword(newPassword)) {
      setError('Strong password must contain atleast 1 UpperCase,LowerCase,atleast 1 Special Characters and numbers');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:5000/api/auth/change-password', 
        { currentPassword, newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuccess(response.data.message);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => navigate('/profile'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Password update failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modern-auth-page">
      <Navbar />
      <div className="modern-auth-wrapper" style={{ marginTop: '80px' }}>
        <div className="modern-auth-bg-layer"></div>
        <div className="modern-auth-card">
          <div className="modern-auth-header-logo">
            <img src="/assets/trackease-logo.png" alt="TrackEase Pro" />
            <h1>TrackEase Pro</h1>
          </div>
          <h2>Change Password</h2>
          {error && <p className="modern-auth-error">{error}</p>}
          {success && <p className="modern-auth-success" style={{ backgroundColor: '#d1fae5', color: '#065f46', padding: '10px', borderRadius: '6px', textAlign: 'center', marginBottom: '20px' }}>{success}</p>}
          
          <form onSubmit={handleSubmit}>
            <div className="modern-form-group">
              <label>Current Password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
            <div className="modern-form-group">
              <label>New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
            <div className="modern-form-group">
              <label>Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
            <button type="submit" className="modern-auth-button" disabled={loading}>
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;
