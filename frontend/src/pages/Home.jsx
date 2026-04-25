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
    AppstoreOutlined,
    SolutionOutlined,
    LockOutlined,
    SmileOutlined,
    RocketOutlined
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
        <Layout style={{ minHeight: '100vh', background: '#f8faff' }}>
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
                <div className="hero-section-container">
                    <div className="hero-content">
                        <Space direction="vertical" size="large" style={{ width: '100%' }}>
                            <Title level={1} className="hero-title">
                                Manage complaints efficiently with your <span style={{ color: '#1890ff' }}>Support Team</span>
                            </Title>
                            <Paragraph className="hero-paragraph">
                                The modern SaaS platform to track, update, and resolve technical issues faster than ever with real-time transparency.
                            </Paragraph>
                            <div className="hero-buttons">
                                <Link to="/raise-complaint" className="hero-btn-link">
                                    <Button type="primary" size="large" icon={<PlusOutlined />} shape="round" className="hero-btn-primary">
                                        Raise Complaint
                                    </Button>
                                </Link>
                                <Link to="/user-panel" className="hero-btn-link">
                                    <Button size="large" icon={<DashboardOutlined />} shape="round" className="hero-btn-secondary">
                                        View Dashboard
                                    </Button>
                                </Link>
                            </div>
                        </Space>
                    </div>
                    <div className="hero-logo-container">
                        <img src="/assets/trackease-logo.png" alt="TrackEase Pro" className="hero-logo" />
                    </div>
                </div>

                {/* New Feature Cards Section */}
                <div style={{ marginBottom: '64px' }}>
                    <div style={{ textAlign: 'center', marginBottom: '48px' }}>
                        <Title level={2} style={{ fontWeight: 800, color: '#003a8c', marginBottom: '16px' }}>Why Choose TrackEase Pro?</Title>
                        <Paragraph style={{ color: '#64748b', fontSize: '16px', maxWidth: '600px', margin: '0 auto' }}>
                            Our platform is designed to make complaint management seamless, secure, and transparent for everyone.
                        </Paragraph>
                    </div>
                    <Row gutter={[32, 32]}>
                        {[
                            { title: 'Smart Issue Management', desc: 'Efficiently track, update, and resolve complaints', icon: <SolutionOutlined />, color: '#1890ff' },
                            { title: 'Real-time Updates', desc: 'Live status tracking with instant updates', icon: <SyncOutlined />, color: '#52c41a' },
                            { title: 'Secure & Reliable', desc: 'Role-based access and secure data handling', icon: <LockOutlined />, color: '#722ed1' },
                            { title: 'User-Friendly Interface', desc: 'Clean, intuitive dashboard for better usability', icon: <SmileOutlined />, color: '#faad14' }
                        ].map((feature, i) => (
                            <Col key={i} xs={24} sm={12} lg={6}>
                                <Card
                                    hoverable
                                    bordered={false}
                                    style={{
                                        borderRadius: '20px',
                                        height: '100%',
                                        textAlign: 'center',
                                        transition: 'all 0.3s ease',
                                        boxShadow: '0 10px 30px rgba(0,0,0,0.03)'
                                    }}
                                    bodyStyle={{ padding: '40px 24px' }}
                                >
                                    <div style={{
                                        fontSize: '40px',
                                        color: feature.color,
                                        marginBottom: '24px',
                                        height: '80px',
                                        width: '80px',
                                        background: `${feature.color}15`,
                                        borderRadius: '20px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        margin: '0 auto 24px'
                                    }}>
                                        {feature.icon}
                                    </div>
                                    <Title level={4} style={{ marginBottom: '16px', color: '#1e293b' }}>{feature.title}</Title>
                                    <Paragraph style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>{feature.desc}</Paragraph>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                </div>

                {/* About Issue Tracker Section */}
                <div className="about-section-container">
                    <div className="about-content">
                        <Text strong className="about-subtitle">
                            ABOUT ISSUE TRACKER
                        </Text>
                        <Title level={2} className="about-title">
                            Built for efficient complaint management
                        </Title>
                        <Paragraph className="about-paragraph">
                            Our platform centralizes complaint tracking, offering real-time status updates
                            and a transparent resolution workflow. With separate roles for
                            admins and users, Issue Tracker ensures secure and structured handling of complaints.
                        </Paragraph>
                        <div className="about-features-list">
                            {[
                                'Centralized complaint tracking',
                                'Real-time status updates',
                                'Transparent resolution workflow',
                                'Secure and structured complaint handling'
                            ].map((item, i) => (
                                <div key={i} className="about-feature-item">
                                    <CheckCircleOutlined style={{ color: '#1890ff', fontSize: '18px' }} />
                                    <Text style={{ fontSize: '15px', color: '#434343' }}>{item}</Text>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* SVG Illustration */}
                    <div className="about-illustration">
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
                        © 2026 TrackEase Pro. All rights reserved.
                    </Text>
                </div>

            </Content>
        </Layout>
    );
};

export default Home;
