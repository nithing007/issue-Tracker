import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MailOutlined, UserOutlined, DashboardOutlined, KeyOutlined, LogoutOutlined, MenuOutlined, CloseOutlined } from '@ant-design/icons';
import CustomAvatar from './Avatar';
import { Dropdown, Space, Typography, Badge, Avatar as AntAvatar, Divider } from 'antd';
import { useUser } from '../context/UserContext';
import NotificationBell from './NotificationBell';

const Navbar = () => {
  const navigate = useNavigate();
  const { user, profilePicture, logout: contextLogout } = useUser();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  const handleLogout = () => {
    contextLogout();
    navigate('/login');
  };

  const userName = user?.name || "User";
  const displayProfilePicture = profilePicture;
  
  const handleBrandClick = () => {
    if (!token) {
      navigate('/login');
    } else if (role === 'admin') {
      navigate('/admin-panel');
    } else {
      navigate('/home');
    }
  };

  const menuItems = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
      onClick: () => navigate(role === 'admin' ? '/admin-panel' : '/user-panel'),
    },
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Profile',
      onClick: () => navigate('/profile'),
    },
    ...(role !== 'admin' ? [{
      key: 'change-password',
      icon: <KeyOutlined />,
      label: 'Change Password',
      onClick: () => navigate('/change-password'),
    }] : []),
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined style={{ color: '#ff4d4f' }} />,
      label: <span style={{ color: '#ff4d4f' }}>Logout</span>,
      onClick: handleLogout,
    },
  ];

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="brand" onClick={handleBrandClick} style={{ cursor: 'pointer' }}>
          <img src="/assets/trackease-logo.png" alt="TrackEase Pro" className="brand-logo" />
          <span className="brand-text">TrackEase Pro</span>
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
                    <Link to="/user-panel">Dashboard</Link>
                  </li>
                  <li>
                    <Link to="/raise-complaint">Raise Complaint</Link>
                  </li>
                </>
              )}
              {role === 'admin' && (
                <li>
                  <Link to="/admin-panel">Dashboard</Link>
                </li>
              )}
              <li>
                <NotificationBell />
              </li>
              <li className="desktop-user-menu">
                <Dropdown 
                  menu={{ 
                    items: menuItems, 
                    style: { 
                      borderRadius: '12px', 
                      boxShadow: '0 6px 16px rgba(0, 0, 0, 0.08)',
                      padding: '8px'
                    } 
                  }} 
                  trigger={['click']} 
                  placement="bottomRight"
                >
                  <Space 
                    style={{ 
                      cursor: 'pointer', 
                      display: 'flex', 
                      alignItems: 'center', 
                      paddingLeft: '12px' 
                    }}
                  >
                    {displayProfilePicture ? (
                      <AntAvatar src={displayProfilePicture} />
                    ) : (
                      <CustomAvatar name={userName} size="32px" fontSize="0.85rem" />
                    )}
                    <Typography.Text className="user-name-text">
                      {userName}
                    </Typography.Text>
                    <svg 
                      width="10" 
                      height="6" 
                      viewBox="0 0 10 6" 
                      fill="none" 
                      style={{ marginLeft: '4px', opacity: 0.6 }}
                    >
                      <path 
                        d="M1 1L5 5L9 1" 
                        stroke="currentColor" 
                        strokeWidth="1.5" 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                      />
                    </svg>
                  </Space>
                </Dropdown>
              </li>
            </>
          )}
        </ul>

        <div className="mobile-nav-controls">
          {token && <NotificationBell />}
          <div className="mobile-menu-toggle" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <CloseOutlined /> : <MenuOutlined />}
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {isMobileMenuOpen && (
          <div className="mobile-dropdown">
            <div className="mobile-dropdown-header">
               <div className="brand" onClick={() => { handleBrandClick(); setIsMobileMenuOpen(false); }} style={{ cursor: 'pointer' }}>
                <img src="/assets/trackease-logo.png" alt="TrackEase Pro" className="brand-logo" />
                <span className="brand-text">TrackEase Pro</span>
              </div>
              <div className="mobile-close-btn" onClick={() => setIsMobileMenuOpen(false)}>
                <CloseOutlined />
              </div>
            </div>
            
            <div className="mobile-links">
              {!token ? (
                <>
                  <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>Login</Link>
                  <Link to="/register" onClick={() => setIsMobileMenuOpen(false)}>Register</Link>
                </>
              ) : (
                <>
                  {(role === 'user' || role === 'student') && (
                    <>
                      <Link to="/home" onClick={() => setIsMobileMenuOpen(false)}>Home</Link>
                      <Link to="/user-panel" onClick={() => setIsMobileMenuOpen(false)}>Dashboard</Link>
                      <Link to="/raise-complaint" onClick={() => setIsMobileMenuOpen(false)}>Raise Complaint</Link>
                    </>
                  )}
                  {role === 'admin' && (
                    <Link to="/admin-panel" onClick={() => setIsMobileMenuOpen(false)}>Dashboard</Link>
                  )}
                  <Link to="/profile" onClick={() => setIsMobileMenuOpen(false)}>Profile</Link>
                  {role !== 'admin' && (
                    <Link to="/change-password" onClick={() => setIsMobileMenuOpen(false)}>Change Password</Link>
                  )}
                </>
              )}
            </div>

            {token && (
              <>
                <Divider style={{ margin: '12px 0' }} />
                <div className="mobile-user-info">
                  <div className="user-details">
                    {displayProfilePicture ? (
                      <AntAvatar src={displayProfilePicture} size={40} />
                    ) : (
                      <CustomAvatar name={userName} size="40px" fontSize="1rem" />
                    )}
                    <div className="user-text">
                      <span className="user-name">{userName}</span>
                      <span className="user-email">{user?.email || user?.id || "User Account"}</span>
                    </div>
                  </div>
                  <button onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }} className="mobile-logout-btn">
                    Logout
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
