import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Layout, Typography, Card, Avatar, Button, Divider, Row, Col, Upload, message } from 'antd';
import { UserOutlined, DashboardOutlined, LogoutOutlined, NotificationOutlined } from '@ant-design/icons';
import { useUser } from '../context/UserContext';

const { Content } = Layout;
const { Title, Text } = Typography;

const Profile = () => {
  const navigate = useNavigate();
  const { user, profilePicture, updateProfilePicture, logout: contextLogout } = useUser();
  const role = localStorage.getItem('role') || 'user';

  const name = user?.name || "User";
  const email = user?.email || "";
  const displayProfilePicture = profilePicture;

  const handleLogout = () => {
    contextLogout();
    navigate('/login');
  };

  const handleAvatarChange = async (info) => {
    const file = info.file.originFileObj || info.file;
    if (!file) return;

    // Local preview for immediate feedback
    const reader = new FileReader();
    reader.onloadend = () => {
      // updateProfilePicture(reader.result); // Optional: if you want immediate UI update before server response
    };
    reader.readAsDataURL(file);

    const formData = new FormData();
    formData.append('profilePicture', file);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/auth/update-profile', {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}` 
          // Do NOT set Content-Type for FormData, the browser will set it with the boundary
        },
        body: formData
      });

      const data = await response.json();

      if (response.ok) {
        updateProfilePicture(data.user.profilePicture);
        message.success('Profile picture updated successfully');
      } else {
        // Handle specific errors like Payload Too Large
        if (response.status === 413) {
            message.error('Image is too large. Please upload an image smaller than 10MB.');
        } else {
            message.error(data.message || 'Failed to update profile picture');
        }
      }
    } catch (error) {
      console.error('Error updating profile picture:', error);
      // Check if it's a parsing error (like receiving HTML)
      if (error.message.includes('Unexpected token')) {
          message.error('Server error: Image likely too large or invalid format.');
      } else {
          message.error('Could not connect to server. Please try again later.');
      }
    }
  };

  const InfoRow = ({ label, value }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 0' }}>
      <Text type="secondary" style={{ fontSize: '15px' }}>{label}</Text>
      <Text strong style={{ fontSize: '15px', color: '#262626' }}>{value}</Text>
    </div>
  );

  return (
    <Layout style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
      <Navbar />
      <Content style={{
        padding: '64px 24px',
        maxWidth: '800px',
        margin: '0 auto',
        width: '100%',
        animation: 'fadeIn 0.8s ease-out'
      }}>
        <style>{`
          @keyframes fadeIn { 
            from { opacity: 0; transform: translateY(20px); } 
            to { opacity: 1; transform: translateY(0); } 
          }
          .quick-action-btn:hover {
            opacity: 0.9 !important;
            transform: translateY(-2px);
          }
          .secondary-btn:hover {
            background: #e6f7ff !important;
            color: #1890ff !important;
            transform: translateY(-2px);
          }
        `}</style>
        
        <div style={{ marginBottom: '24px' }}>
             <Title level={2} style={{ color: '#003a8c', marginBottom: '8px', fontWeight: 600 }}>My Profile</Title>
             <Text type="secondary" style={{ fontSize: '15px' }}>Manage your account details</Text>
        </div>

        <Card 
            bordered={false} 
            bodyStyle={{ padding: 0 }}
            style={{ 
                borderRadius: '24px', 
                overflow: 'hidden',
                boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
                background: '#ffffff'
            }}
        >
          {/* Header Section */}
          <div style={{
            background: 'linear-gradient(135deg, #2d73ff 0%, #6848ff 100%)',
            padding: '48px 24px',
            textAlign: 'center',
            color: 'white'
          }}>
             <div style={{ position: 'relative', display: 'inline-block', marginBottom: '16px' }}>
                <Avatar 
                    size={110} 
                    src={displayProfilePicture}
                    icon={!displayProfilePicture && <UserOutlined />} 
                    style={{ 
                        backgroundColor: '#82b1ff', 
                        color: '#002766',
                        border: '4px solid rgba(255, 255, 255, 0.4)',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        fontSize: '48px'
                    }} 
                />
             </div>
             
             <div style={{ marginBottom: '16px' }}>
                 <Upload
                    showUploadList={false}
                    customRequest={({ file, onSuccess }) => {
                        setTimeout(() => onSuccess("ok"), 0);
                    }}
                    onChange={handleAvatarChange}
                >
                    <Button 
                        size="small" 
                        type="ghost" 
                        style={{ 
                            color: 'white', 
                            borderColor: 'rgba(255,255,255,0.4)', 
                            background: 'rgba(255,255,255,0.1)', 
                            borderRadius: '16px',
                            fontSize: '13px'
                        }}
                    >
                        Change Picture
                    </Button>
                </Upload>
             </div>

             <Title level={3} style={{ color: 'white', margin: '0 0 4px 0', fontWeight: 600 }}>{name}</Title>
             <Text style={{ color: 'rgba(255, 255, 255, 0.85)', fontSize: '16px' }}>{email}</Text>
          </div>

          <div style={{ padding: '40px 32px' }}>
            {/* Account Information */}
            <Title level={4} style={{ marginBottom: '24px', color: '#1f1f1f', fontWeight: 600 }}>Account Information</Title>
            
            <div style={{ background: '#fafafa', padding: '0 24px', borderRadius: '16px' }}>
                <InfoRow label="Full Name" value={name} />
                <Divider style={{ margin: '0', background: '#f0f0f0' }} />
                <InfoRow label="Email Address" value={email} />
            </div>

            <Divider style={{ margin: '40px 0', background: 'transparent' }} />

            {/* Quick Actions */}
            <Title level={4} style={{ marginBottom: '24px', color: '#1f1f1f', fontWeight: 600 }}>Quick Actions</Title>
            
            <Row gutter={[16, 16]}>
                <Col xs={24} sm={12}>
                    <Button 
                        type="primary" 
                        block 
                        size="large" 
                        icon={<NotificationOutlined />}
                        onClick={() => navigate('/raise-complaint')}
                        className="quick-action-btn"
                        style={{ 
                            height: '52px', 
                            borderRadius: '12px',
                            background: 'linear-gradient(90deg, #2d73ff 0%, #4834d4 100%)',
                            border: 'none',
                            boxShadow: '0 6px 16px rgba(45, 115, 255, 0.25)',
                            fontSize: '15px',
                            fontWeight: 500,
                            transition: 'all 0.3s ease'
                        }}
                    >
                        Raise Complaint
                    </Button>
                </Col>
                <Col xs={24} sm={12}>
                    <Button 
                        block 
                        size="large" 
                        icon={<DashboardOutlined />}
                        className="secondary-btn"
                        onClick={() => navigate(role === 'admin' ? '/admin-panel' : '/user-panel')}
                        style={{ 
                            height: '52px', 
                            borderRadius: '12px',
                            background: '#f0f2f5',
                            border: 'none',
                            color: '#1f1f1f',
                            fontSize: '15px',
                            fontWeight: 500,
                            transition: 'all 0.3s ease'
                        }}
                    >
                        Go to Dashboard
                    </Button>
                </Col>
            </Row>

            <Divider style={{ margin: '32px 0 24px 0', background: '#f0f0f0' }} />

            {/* Sign Out Action */}
            <Button 
                block 
                size="large" 
                icon={<LogoutOutlined />}
                onClick={handleLogout}
                style={{ 
                    height: '52px', 
                    borderRadius: '12px',
                    borderColor: '#ff4d4f',
                    color: '#ff4d4f',
                    fontSize: '15px',
                    fontWeight: 500,
                    background: '#fff1f0',
                    transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#ffccc7'; e.currentTarget.style.color = '#d9363e'; e.currentTarget.style.borderColor = '#d9363e'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = '#fff1f0'; e.currentTarget.style.color = '#ff4d4f'; e.currentTarget.style.borderColor = '#ff4d4f'; }}
            >
                Sign Out
            </Button>
          </div>
        </Card>
      </Content>
    </Layout>
  );
};

export default Profile;
