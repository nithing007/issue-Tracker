import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MailOutlined } from '@ant-design/icons';

const Navbar = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            background: '#1890ff',
            borderRadius: '8px',
            padding: '8px 10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <MailOutlined style={{ fontSize: '24px', color: 'white' }} />
          </div>
          <h1>Complaint Tracker</h1>
        </div>
        <ul className="nav-links">
          {!token ? (
            <>
              <li>
                <Link to="/login">Login</Link>
              </li>
              <li>
                <Link to="/register">Register</Link>
              </li>
            </>
          ) : (
            <>
              {(role === 'user' || role === 'student') && (
                <>
                  <li>
                    <Link to="/home">Home</Link>
                  </li>
                  <li>
                    <Link to="/user-dashboard">Dashboard</Link>
                  </li>
                  <li>
                    <Link to="/raise-complaint">Raise Complaint</Link>
                  </li>
                </>
              )}
              {role === 'admin' && (
                <li>
                  <Link to="/admin-dashboard">Dashboard</Link>
                </li>
              )}
              <li>
                <button onClick={handleLogout} className="logout-btn">
                  Logout
                </button>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
