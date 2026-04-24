import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import UserPanel from './pages/UserPanel';
import AdminPanel from './pages/AdminPanel';
import RaiseComplaint from './pages/RaiseComplaint';
import Profile from './pages/Profile';
import ChangePassword from './pages/ChangePassword';
import ForgotPassword from './pages/ForgotPassword';

// Reusable Route Guard Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  if (!token || !allowedRoles.includes(role)) {
    return <Navigate to="/login" />;
  }

  return children;
};

const App = () => {
  return (
    <div className="app">
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        <Route
          path="/home"
          element={
            <ProtectedRoute allowedRoles={['user', 'student']}>
              <Home />
            </ProtectedRoute>
          }
        />

        <Route
          path="/user-panel"
          element={
            <ProtectedRoute allowedRoles={['user', 'student']}>
              <UserPanel />
            </ProtectedRoute>
          }
        />

        <Route
          path="/raise-complaint"
          element={
            <ProtectedRoute allowedRoles={['user', 'student']}>
              <RaiseComplaint />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute allowedRoles={['user', 'student', 'admin']}>
              <Profile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/change-password"
          element={
            <ProtectedRoute allowedRoles={['user', 'student', 'admin']}>
              <ChangePassword />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin-panel"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminPanel />
            </ProtectedRoute>
          }
        />

        {/* Fallback for any other route */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </div>
  );
};

export default App;
