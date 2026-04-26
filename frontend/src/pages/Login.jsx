import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Auth.css';
import { useUser } from '../context/UserContext';
import { GoogleLogin } from '@react-oauth/google';
import { EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';
import axios from 'axios';

const Login = () => {
  const API = import.meta.env.VITE_API_URL;
  const { updateUser } = useUser();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    if (token) {
      if (role === 'admin') {
        navigate('/admin-panel');
      } else {
        navigate('/home');
      }
    }
  }, [navigate]);

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const { credential } = credentialResponse;
      const response = await axios.post(`${API}/api/auth/google`, {
        token: credential
      });

      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('role', user.role);
      
      updateUser(user);

      if (user.role === 'admin') {
        navigate('/admin-panel');
      } else {
        navigate('/home');
      }
    } catch (err) {
      console.error('Google login error:', err);
      setError(err.response?.data?.message || 'Google login failed');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch(`${API}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Login failed');
        return;
      }

      const role = data.role || data.user?.role;

      if (!role) {
        setError('Role not found');
        return;
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('role', role);

      if (data.user) {
        updateUser(data.user);
      }

      if (role === 'admin') {
        navigate('/admin-panel');
      } else {
        navigate('/home');
      }
    } catch {
      setError('Server error');
    }
  };

  return (
    <div className="modern-auth-page">
      <div className="modern-auth-wrapper">
        <div className="modern-auth-header-logo">
          <img src="/assets/trackease-logo.png" alt="TrackEase Pro" />
          <h1>TrackEase Pro</h1>
          <p>Welcome back!</p>
        </div>
        
        <div className="modern-auth-card">
          {error && <p className="modern-auth-error">{error}</p>}
          <form onSubmit={handleSubmit}>
            <div className="modern-form-group">
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your Email ID"
                required
              />
            </div>
            <div className="modern-form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label>Password</label>
                <Link to="/forgot-password" style={{ fontSize: '13px', color: '#2563eb', textDecoration: 'none', marginBottom: '8px', fontWeight: '600' }}>Forgot password?</Link>
              </div>
              <div className="password-input-container">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
                <div 
                  className="password-toggle-icon" 
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                </div>
              </div>
            </div>
            <button type="submit" className="modern-auth-button">Sign In</button>
          </form>

          <div className="modern-auth-divider">or continue with</div>

          <div className="google-login-container">
            <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setError('Google Login Failed')}
                useOneTap
                theme="outline"
                shape="pill"
                width="280px"
            />
          </div>

          <p className="modern-auth-link-text">
            Don't have an account? <Link to="/register">Sign Up</Link>
          </p>
        </div>
      </div>
      <div className="modern-auth-footer">
        <p>By continuing, you agree to our <Link to="/terms">Terms of Service</Link> and <Link to="/privacy">Privacy Policy</Link></p>
      </div>
    </div>
  );
};

export default Login;
