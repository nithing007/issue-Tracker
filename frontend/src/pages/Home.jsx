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
                            <Link to="/my-complaints">
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
            </Content>
        </Layout>
    );
};

export default Home;
