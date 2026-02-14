import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

const AdminDashboard = () => {
  const [complaints, setComplaints] = useState([]);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  useEffect(() => {
    if (!token || role !== 'admin') {
      navigate('/login');
      return;
    }
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/complaints/all', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401 || response.status === 403) {
        localStorage.clear();
        navigate('/login');
        return;
      }

      const data = await response.json();
      if (response.ok) {
        setComplaints(data);
      }
    } catch {
      navigate('/login');
    }
  };

  const handleUpdate = async (id, status, remarks) => {
    try {
      const response = await fetch(`http://localhost:5000/api/complaints/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status, remarks }),
      });

      if (response.status === 401 || response.status === 403) {
        localStorage.clear();
        navigate('/login');
        return;
      }

      if (response.ok) {
        fetchComplaints();
      }
    } catch {
      navigate('/login');
    }
  };

  return (
    <div className="dashboard-container">
      <Navbar />
      <div className="container">
        <h2>Admin Dashboard</h2>

        <div className="card">
          <h3>All Complaints</h3>

          <table className="complaint-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Title</th>
                <th>Category</th>
                <th>Description</th>
                <th>Status</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {complaints.length > 0 ? (
                complaints.map((c) => (
                  <AdminRow
                    key={c._id}
                    complaint={c}
                    onUpdate={handleUpdate}
                  />
                ))
              ) : (
                <tr>
                  <td colSpan="7">No complaints found</td>
                </tr>
              )}
            </tbody>
          </table>

        </div>
      </div>
    </div>
  );
};

const AdminRow = ({ complaint, onUpdate }) => {
  const [status, setStatus] = useState(complaint.status);
  const [remarks, setRemarks] = useState(complaint.remarks || '');

  useEffect(() => {
    setStatus(complaint.status);
    setRemarks(complaint.remarks || '');
  }, [complaint]);

  return (
    <tr>
      <td>{complaint.user?.name || 'User'}</td>
      <td>{complaint.title}</td>
      <td>{complaint.category}</td>
      <td>{complaint.description}</td>
      <td>{complaint.status}</td>
      <td>{new Date(complaint.createdAt).toLocaleDateString()}</td>
      <td>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="Pending">Pending</option>
          <option value="In Progress">In Progress</option>
          <option value="Resolved">Resolved</option>
          <option value="Rejected">Rejected</option>
        </select>
        <input
          type="text"
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          placeholder="Remarks"
        />
        <button
          onClick={() => onUpdate(complaint._id, status, remarks)}
        >
          Update
        </button>
      </td>
    </tr>
  );
};

export default AdminDashboard;
