import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ComplaintForm from '../components/ComplaintForm';

const UserDashboard = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  useEffect(() => {
    if (!token || !(role === 'user' || role === 'student')) {
      navigate('/login');
    }
  }, [navigate, token, role]);

  return (
    <div className="dashboard-container">
      <Navbar />
      <div className="container">
        <h2>Dashboard</h2>
        <ComplaintForm />
      </div>
    </div>
  );
};

export default UserDashboard;
