import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ComplaintForm from '../components/ComplaintForm';
import { Layout, Typography } from 'antd';

const { Content } = Layout;
const { Title } = Typography;

const RaiseComplaint = () => {
    const navigate = useNavigate();
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    useEffect(() => {
        if (!token || !(role === 'user' || role === 'student')) {
            navigate('/login');
        }
    }, [navigate, token, role]);

    return (
        <Layout style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
            <Navbar />

            <Content style={{
                padding: '64px 24px',
                maxWidth: '1200px',
                margin: '0 auto',
                width: '100%'
            }}>
                <div style={{
                    background: 'white',
                    padding: '40px',
                    borderRadius: '16px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
                }}>
                    <Title level={2} style={{ marginBottom: '32px', color: '#1890ff' }}>
                        Raise a Complaint
                    </Title>
                    <ComplaintForm />
                </div>
            </Content>
        </Layout>
    );
};

export default RaiseComplaint;
