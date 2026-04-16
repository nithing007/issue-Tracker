import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MailOutlined, UserOutlined, DashboardOutlined, KeyOutlined, LogoutOutlined } from '@ant-design/icons';
import { Avatar, Dropdown, Space, Typography } from 'antd';
import { useUser } from '../context/UserContext';

const Navbar = () => {
  const navigate = useNavigate();
  const { user, profilePicture, logout: contextLogout } = useUser();
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  const handleLogout = () => {
    contextLogout();
    navigate('/login');
  };

  const userName = user?.name || "User";
  const displayProfilePicture = profilePicture;

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
    {
      key: 'change-password',
      icon: <KeyOutlined />,
      label: 'Change Password',
      onClick: () => navigate('/change-password'),
    },
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
              <li style={{ display: 'none' }}>
                <button onClick={handleLogout} className="logout-btn">
                  Logout
                </button>
              </li>
              <li>
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
                    <Avatar 
                      src={displayProfilePicture}
                      icon={!displayProfilePicture && <UserOutlined />} 
                      style={{ backgroundColor: '#e6f7ff', color: '#1890ff' }} 
                    />
                    <Typography.Text style={{ fontWeight: 500, fontSize: '15px', color: '#333' }}>
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
      </div>
    </nav>
  );
};

export default Navbar;
