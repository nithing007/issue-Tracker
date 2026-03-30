import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Auth.css';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

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
        localStorage.setItem('user', JSON.stringify(data.user));
      }

      navigate('/user-dashboard');

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
