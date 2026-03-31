import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Layout, Typography, Row, Col, Card, Statistic, Button, Space } from 'antd';
import {
    PlusOutlined,
    DashboardOutlined,
    FolderOpenOutlined,
    SyncOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    AppstoreOutlined
} from '@ant-design/icons';

const { Content } = Layout;
const { Title, Text, Paragraph } = Typography;

const Home = () => {
    const navigate = useNavigate();
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    // State for dashboard data
    const [complaints, setComplaints] = useState([]);
    const [stats, setStats] = useState({
        total: 0,
        open: 0,
        inProgress: 0,
        resolved: 0,
        closed: 0
    });

    useEffect(() => {
        if (!token || !(role === 'user' || role === 'student')) {
            navigate('/login');
            return;
        }

        // Fetch data using existing API
        const fetchData = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/complaints/my', {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (response.ok) {
                    const data = await response.json();
                    setComplaints(data);

                    // Calculate stats from data
                    // Note: 'Closed' status might not exist in backend yet, handled gracefully
                    const total = data.length;
                    const open = data.filter(c => c.status === 'Pending').length;
                    const inProgress = data.filter(c => c.status === 'In Progress').length;
                    const resolved = data.filter(c => c.status === 'Resolved').length;
                    const closed = data.filter(c => c.status === 'Closed').length;

                    setStats({ total, open, inProgress, resolved, closed });
                }
            } catch (error) {
                console.error('Failed to fetch dashboard data');
            }
        };

        fetchData();
    }, [navigate, token, role]);

    // Stat configurations
    const statCards = [
        {
            title: "Total Complaints",
            value: stats.total,
            icon: <AppstoreOutlined />,
            color: "#1890ff",
            bg: "#e6f7ff"
        },
        {
            title: "Open",
            value: stats.open,
            icon: <FolderOpenOutlined />,
            color: "#ff4d4f",
            bg: "#fff1f0"
        },
        {
            title: "In Progress",
            value: stats.inProgress,
            icon: <SyncOutlined spin />,
            color: "#faad14",
            bg: "#fffbe6"
        },
        {
            title: "Resolved",
            value: stats.resolved,
            icon: <CheckCircleOutlined />,
            color: "#52c41a",
            bg: "#f6ffed"
        },
        {
            title: "Closed",
            value: stats.closed,
            icon: <CloseCircleOutlined />,
            color: "#722ed1",
            bg: "#f9f0ff"
        }
    ];

    return (
        <Layout style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
            <Navbar />

            <Content style={{
                padding: '64px 24px',
                maxWidth: '1400px',
                margin: '0 auto',
                width: '100%',
                animation: 'fadeIn 0.8s ease-out'
            }}>
                <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }`}</style>

                {/* Hero Section */}
                <div style={{
                    textAlign: 'center',
                    marginBottom: '80px',
                    padding: '80px 20px',
                    background: 'linear-gradient(180deg, #e6f7ff 0%, #ffffff 100%)',
                    borderRadius: '24px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.05)'
                }}>
                    <Space direction="vertical" size="large">
                        <Title level={1} style={{ margin: 0, fontWeight: 700, color: '#003a8c' }}>
                            Manage complaints efficiently
                        </Title>
                        <Paragraph style={{ fontSize: '18px', color: '#595959', maxWidth: '700px', margin: '0 auto' }}>
                            Track, update, and resolve technical issues faster with our streamlined complaint management system.
                        </Paragraph>
                        <Space size="middle" style={{ marginTop: '20px' }}>
                            <Link to="/raise-complaint">
                                <Button type="primary" size="large" icon={<PlusOutlined />} shape="round" style={{ height: '48px', padding: '0 32px', fontSize: '16px' }}>
                                    Raise Complaint
                                </Button>
                            </Link>
                            <Link to="/user-dashboard">
                                <Button size="large" icon={<DashboardOutlined />} shape="round" style={{ height: '48px', padding: '0 32px', fontSize: '16px' }}>
                                    View Dashboard
                                </Button>
                            </Link>
                        </Space>
                    </Space>
                </div>

                {/* Statistics Section */}
                <Row gutter={[24, 24]} justify="center">
                    {statCards.map((stat, index) => (
                        <Col key={index} xs={24} sm={12} md={8} lg={4} style={{ display: 'flex', justifyContent: 'center' }}>
                            <Card
                                bordered={false}
                                hoverable
                                style={{
                                    borderRadius: '16px',
                                    boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                                    height: '100%',
                                    width: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'center',
                                    transition: 'all 0.3s ease'
                                }}
                                bodyStyle={{ padding: '24px', textAlign: 'center' }}
                            >
                                <div style={{
                                    width: '64px',
                                    height: '64px',
                                    background: stat.bg,
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    margin: '0 auto 16px',
                                    color: stat.color,
                                    fontSize: '28px'
                                }}>
                                    {stat.icon}
                                </div>
                                <Statistic
                                    title={<Text type="secondary" style={{ fontSize: '16px' }}>{stat.title}</Text>}
                                    value={stat.value}
                                    valueStyle={{ fontWeight: 700, fontSize: '32px', color: '#262626' }}
                                />
                            </Card>
                        </Col>
                    ))}
                </Row>

                {/* About Issue Tracker Section */}
                <div style={{
                    marginTop: '64px',
                    background: 'white',
                    borderRadius: '24px',
                    padding: '48px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '48px',
                    flexWrap: 'wrap'
                }}>
                    <div style={{ flex: '1 1 400px' }}>
                        <Text strong style={{
                            color: '#1890ff',
                            fontSize: '13px',
                            letterSpacing: '2px',
                            textTransform: 'uppercase',
                            display: 'block',
                            marginBottom: '12px'
                        }}>
                            ABOUT ISSUE TRACKER
                        </Text>
                        <Title level={2} style={{ margin: '0 0 16px 0', fontWeight: 700, color: '#141414' }}>
                            Built for efficient complaint management
                        </Title>
                        <Paragraph style={{ fontSize: '15px', color: '#595959', lineHeight: '1.8', marginBottom: '24px' }}>
                            Our platform centralizes complaint tracking, offering real-time status updates
                            and a transparent resolution workflow. With separate roles for
                            admins and users, Issue Tracker ensures secure and structured handling of complaints.
                        </Paragraph>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {[
                                'Centralized complaint tracking',
                                'Real-time status updates',
                                'Transparent resolution workflow',
                                'Secure and structured complaint handling'
                            ].map((item, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <CheckCircleOutlined style={{ color: '#1890ff', fontSize: '18px' }} />
                                    <Text style={{ fontSize: '15px', color: '#434343' }}>{item}</Text>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* SVG Illustration */}
                    <div style={{ flex: '1 1 320px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <svg viewBox="0 0 400 300" style={{ width: '100%', maxWidth: '420px' }} xmlns="http://www.w3.org/2000/svg">
                            {/* Desk */}
                            <rect x="60" y="200" width="280" height="12" rx="6" fill="#e6f0fa" />
                            <rect x="120" y="212" width="16" height="60" rx="4" fill="#d6e4f0" />
                            <rect x="264" y="212" width="16" height="60" rx="4" fill="#d6e4f0" />

                            {/* Monitor */}
                            <rect x="110" y="100" width="180" height="100" rx="10" fill="#1890ff" />
                            <rect x="118" y="108" width="164" height="76" rx="6" fill="#e6f7ff" />
                            <rect x="185" y="184" width="30" height="16" rx="3" fill="#b0d4f1" />

                            {/* Dashboard elements on screen */}
                            <rect x="130" y="120" width="50" height="8" rx="4" fill="#91d5ff" />
                            <rect x="130" y="134" width="35" height="6" rx="3" fill="#bae7ff" />
                            <rect x="130" y="148" width="140" height="4" rx="2" fill="#d6e4f0" />
                            <rect x="130" y="158" width="100" height="4" rx="2" fill="#d6e4f0" />
                            <rect x="130" y="168" width="120" height="4" rx="2" fill="#d6e4f0" />
                            <circle cx="255" cy="135" r="18" fill="#91d5ff" opacity="0.5" />
                            <path d="M248,135 L253,140 L262,130" stroke="#1890ff" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />

                            {/* Person */}
                            <circle cx="80" cy="148" r="18" fill="#ffd8bf" />
                            <path d="M62,200 Q62,172 80,168 Q98,172 98,200" fill="#1890ff" />
                            <rect x="60" y="176" width="40" height="24" rx="6" fill="#1890ff" />

                            {/* Headphones */}
                            <path d="M64,148 Q64,128 80,126 Q96,128 96,148" stroke="#434343" strokeWidth="3" fill="none" />
                            <rect x="58" y="142" width="8" height="14" rx="4" fill="#434343" />
                            <rect x="94" y="142" width="8" height="14" rx="4" fill="#434343" />

                            {/* Keyboard */}
                            <rect x="140" y="190" width="80" height="10" rx="4" fill="#d6e4f0" />

                            {/* Warning icon floating */}
                            <circle cx="320" cy="90" r="22" fill="#fff7e6" stroke="#faad14" strokeWidth="2" />
                            <text x="320" y="97" textAnchor="middle" fontSize="20" fill="#faad14" fontWeight="bold">!</text>

                            {/* Shield icon floating */}
                            <g transform="translate(50, 80)">
                                <path d="M0,8 L16,0 L32,8 L32,20 Q32,32 16,38 Q0,32 0,20 Z" fill="#f0f5ff" stroke="#1890ff" strokeWidth="1.5" />
                                <path d="M10,18 L14,22 L22,14" stroke="#1890ff" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                            </g>

                            {/* Check badge floating */}
                            <circle cx="340" cy="180" r="18" fill="#f6ffed" stroke="#52c41a" strokeWidth="2" />
                            <path d="M332,180 L337,185 L348,174" stroke="#52c41a" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />

                            {/* Coffee mug */}
                            <rect x="300" y="186" width="18" height="14" rx="3" fill="#ffd8bf" />
                            <path d="M318,190 Q326,190 326,196 Q326,200 318,200" stroke="#ffd8bf" strokeWidth="2" fill="none" />
                        </svg>
                    </div>
                </div>

                {/* Footer */}
                <div style={{
                    marginTop: '64px',
                    textAlign: 'center',
                    padding: '24px 0',
                    borderTop: '1px solid #f0f0f0'
                }}>
                    <Text type="secondary" style={{ fontSize: '13px' }}>
                        © 2026 Issue Tracker. All rights reserved.
                    </Text>
                </div>

            </Content>
        </Layout>
    );
};

export default Home;
