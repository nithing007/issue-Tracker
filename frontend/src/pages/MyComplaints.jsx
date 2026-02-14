import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

const MyComplaints = () => {
    const [complaints, setComplaints] = useState([]);
    const [message, setMessage] = useState('');
    const navigate = useNavigate();
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    useEffect(() => {
        if (!token || !(role === 'user' || role === 'student')) {
            navigate('/login');
            return;
        }
        fetchComplaints();
    }, [token, role, navigate]);

    const fetchComplaints = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/complaints/my', {
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
            } else {
                setMessage('Failed to load complaints');
            }
        } catch (error) {
            setMessage('Unable to load complaints');
        }
    };

    return (
        <div className="dashboard-container">
            <Navbar />
            <div className="container">
                <h2>My Complaints</h2>
                {message && <p className="message">{message}</p>}

                <div className="card">
                    <table className="complaint-table my-complaints">
                        <thead>
                            <tr>
                                <th>Title</th>
                                <th>Category</th>
                                <th>Status</th>
                                <th>Date</th>
                                <th>Remarks</th>
                            </tr>
                        </thead>
                        <tbody>
                            {complaints.length > 0 ? (
                                complaints.map((c) => (
                                    <tr key={c._id}>
                                        <td>{c.title}</td>
                                        <td>{c.category}</td>
                                        <td>{c.status}</td>
                                        <td>{new Date(c.createdAt).toLocaleDateString()}</td>
                                        <td>{c.remarks || '-'}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5">No complaints found</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default MyComplaints;
