import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Auth.css';
import { useUser } from '../context/UserContext';
import { GoogleLogin } from '@react-oauth/google';
import axios from 'axios';

const Register = () => {
  const { updateUser } = useUser();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const { credential } = credentialResponse;
      const response = await axios.post('http://localhost:5000/api/auth/google', {
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
      console.error('Google register error:', err);
      setError(err.response?.data?.message || 'Google registration failed');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          password,
          role: 'user'
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Registration failed');
        return;
      }

      const role = data.role || data.user?.role || 'user';

      localStorage.setItem('token', data.token);
      localStorage.setItem('role', role);

      if (data.user) {
        updateUser(data.user);
      }

      navigate('/user-panel');

    } catch {
      setError('Server error');
    }
  };

  return (
    <div className="modern-auth-page">
      <div className="modern-auth-wrapper">
        <div className="modern-auth-bg-layer"></div>
        <div className="modern-auth-card">
          <h2>Register</h2>
          {error && <p className="modern-auth-error">{error}</p>}
          <form onSubmit={handleSubmit}>
            <div className="modern-form-group">
              <label>Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Name"
                required
              />
            </div>
            <div className="modern-form-group">
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="abc@gmail.com"
                required
              />
            </div>
            <div className="modern-form-group">
              <label>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
            <button type="submit" className="modern-auth-button">Register</button>
          </form>

          <div className="modern-auth-divider">or</div>

          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setError('Google Registration Failed')}
                useOneTap
                theme="outline"
                shape="rectangular"
                width="100%"
                text="continue_with"
            />
          </div>

          <p className="modern-auth-link-text">
            Already have an account?{' '}
            <Link to="/login">Login</Link>
          </p>
        </div>
      </div>
      <div className="modern-auth-footer">
        © 2026 <strong>Issue Tracker</strong>. All rights reserved.
      </div>
    </div>
  );
};

export default Register;
