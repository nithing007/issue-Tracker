import React, { useState, useEffect } from 'react';
import { Badge, Dropdown, List, Typography, Button, Spin, Empty, Space } from 'antd';
import { BellOutlined, CheckCircleOutlined, MessageOutlined, InfoCircleOutlined, SyncOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useSocket } from '../context/SocketContext';

const { Text } = Typography;

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const socket = useSocket();

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/notifications', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(res.data);
      setUnreadCount(res.data.filter(n => !n.read).length);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    if (socket) {
      const handleNewNotification = (notification) => {
        setNotifications(prev => [notification, ...prev]);
        setUnreadCount(prev => prev + 1);
        console.log('Real-time notification received:', notification);
      };

      const handleStatusUpdate = (data) => {
        console.log('Status update received:', data);
        fetchNotifications(); // Refresh list to get latest
      };

      const handleNewMessage = (data) => {
        console.log('New message received:', data);
        fetchNotifications(); // Refresh list to get latest
      };

      socket.on('new_notification', handleNewNotification);
      socket.on('status_update', handleStatusUpdate);
      socket.on('receive_message', handleNewMessage);

      return () => {
        socket.off('new_notification', handleNewNotification);
        socket.off('status_update', handleStatusUpdate);
        socket.off('receive_message', handleNewMessage);
      };
    }
  }, [socket]);

  const markAsRead = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/notifications/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const markAllRead = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put('http://localhost:5000/api/notifications/read-all', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'chat': return <MessageOutlined style={{ color: '#1890ff' }} />;
      case 'status_update': return <SyncOutlined style={{ color: '#52c41a' }} />;
      case 'issue_update': return <InfoCircleOutlined style={{ color: '#faad14' }} />;
      default: return <BellOutlined />;
    }
  };

  const menu = (
    <div style={{ 
      width: '320px', 
      backgroundColor: '#fff', 
      borderRadius: '12px', 
      boxShadow: '0 10px 32px rgba(0,0,0,0.15)',
      overflow: 'hidden'
    }} onClick={(e) => e.stopPropagation()}>
      <div style={{ 
        padding: '12px 16px', 
        borderBottom: '1px solid #f0f0f0', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        background: '#fafafa'
      }}>
        <Text strong style={{ fontSize: '16px' }}>Notifications</Text>
        {unreadCount > 0 && (
          <Button type="link" size="small" onClick={(e) => { e.preventDefault(); e.stopPropagation(); markAllRead(); }}>
            Mark all as read
          </Button>
        )}
      </div>
      <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
        {loading ? (
          <div style={{ padding: '24px', textAlign: 'center' }}><Spin /></div>
        ) : notifications.length > 0 ? (
          <List
            dataSource={notifications}
            renderItem={item => (
              <List.Item 
                style={{ 
                   padding: '12px 16px', 
                   cursor: 'pointer',
                   backgroundColor: item.read ? '#fff' : '#e6f7ff',
                   transition: 'background-color 0.3s'
                }}
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); !item.read && markAsRead(item._id); }}
              >
                <div style={{ display: 'flex', gap: '12px', width: '100%' }}>
                  <div style={{ marginTop: '4px' }}>{getIcon(item.type)}</div>
                  <div style={{ flex: 1 }}>
                    <Text style={{ display: 'block', fontSize: '14px', marginBottom: '4px' }}>
                      {item.message}
                    </Text>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      {new Date(item.createdAt).toLocaleString()}
                    </Text>
                  </div>
                  {!item.read && <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#1890ff', marginTop: '8px' }} />}
                </div>
              </List.Item>
            )}
          />
        ) : (
          <div style={{ padding: '32px 0' }}>
            <Empty description="No notifications" image={Empty.PRESENTED_IMAGE_SIMPLE} />
          </div>
        )}
      </div>
    </div>
  );

  return (
    <Dropdown 
      dropdownRender={() => menu} 
      trigger={['click']} 
      placement="bottomRight" 
      arrow
    >
      <button 
        type="button"
        style={{ 
          cursor: 'pointer', 
          padding: '0 12px', 
          border: 'none', 
          background: 'none',
          outline: 'none',
          display: 'flex',
          alignItems: 'center'
        }}
        onClick={(e) => {
          console.log('Bell click event');
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        <Badge count={unreadCount} overflowCount={9} size="small" style={{ backgroundColor: '#f5222d' }}>
          <BellOutlined style={{ fontSize: '20px', color: '#555' }} />
        </Badge>
      </button>
    </Dropdown>
  );
};

export default NotificationBell;
