import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import './Dashboard.css';

const UserDashboard = () => {
  const [complaints, setComplaints] = useState([]);
  const [message, setMessage] = useState('');
  const [timeRange, setTimeRange] = useState('All Time');
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

  const total = complaints.length;
  const resolved = complaints.filter(c => c.status === 'Resolved' || c.status?.toLowerCase() === 'resolved').length;
  const inProgress = complaints.filter(c => c.status === 'In Progress' || c.status?.toLowerCase().includes('progress')).length;
  const rejected = complaints.filter(c => c.status === 'Rejected' || c.status?.toLowerCase() === 'rejected').length;

  const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

  const getStatusBadge = (status) => {
    const s = status?.toLowerCase() || '';
    if (s.includes('resolved')) return <span className="status-badge resolved"><i className="anticon-check-circle" /> Resolved</span>;
    if (s.includes('progress')) return <span className="status-badge in-progress"><i className="anticon-clock-circle" /> In Progress</span>;
    if (s.includes('rejected')) return <span className="status-badge rejected"><i className="anticon-close-circle" /> Rejected</span>;
    return <span className="status-badge">{status}</span>;
  };

  return (
    <div className="modern-dashboard-bg">
      <Navbar />
      
      <div className="modern-dashboard-header">
        <h1>Student Dashboard</h1>
        <p>Track and monitor your complaints with ease.</p>
      </div>

      <div className="modern-dashboard-container">
        {message && <p style={{color: 'red', textAlign: 'center'}}>{message}</p>}

        {/* My Complaints Table Card */}
        <div className="dashboard-card" id="my-complaints">
          <div className="dashboard-card-header">
            <h2 className="dashboard-card-title">My Complaints</h2>
            <div>
              <span style={{fontSize: '0.9rem', color: '#64748b', marginRight: '8px', fontWeight: '500'}}>Time Range:</span>
              <select 
                className="time-range-select" 
                value={timeRange} 
                onChange={(e) => setTimeRange(e.target.value)}
              >
                <option value="10 Days">10 Days</option>
                <option value="A Month">A Month</option>
                <option value="All Time">All Time</option>
              </select>
            </div>
          </div>

          <div className="dashboard-table-wrapper">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>TITLE</th>
                  <th>CATEGORY</th>
                  <th>STATUS</th>
                  <th>DATE &darr;</th>
                  <th>MONTH</th>
                </tr>
              </thead>
              <tbody>
                {complaints.length > 0 ? (
                  complaints.map((c) => {
                    const date = new Date(c.createdAt);
                    return (
                      <tr key={c._id}>
                        <td style={{fontWeight: '500'}}>{c.title}</td>
                        <td>{c.category || 'General'}</td>
                        <td>{getStatusBadge(c.status)}</td>
                        <td>{date.toLocaleDateString('en-GB')}</td>
                        <td>{date.toLocaleString('default', { month: 'long' })}</td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="5" style={{textAlign: 'center', padding: '30px'}}>
                      No complaints found for this period.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="dashboard-table-footer">
            Showing {complaints.length} of {total} complaints
          </div>
        </div>

        {/* Lower Grid area */}
        <div className="dashboard-grid-lower">
          
          {/* LEFT COLUMN */}
          <div style={{display: 'flex', flexDirection: 'column', gap: '24px'}}>
            
            {/* Complaint Summary */}
            <div className="dashboard-card">
              <h2 className="dashboard-card-title" style={{marginBottom: '20px'}}>Complaint Summary</h2>
              
              <div className="summary-blocks">
                <div className="summary-block total">
                  <div className="summary-icon">📋</div>
                  <div className="summary-label">Total</div>
                  <div className="summary-value">{total}</div>
                </div>
                <div className="summary-block resolved">
                  <div className="summary-icon">✅</div>
                  <div className="summary-label">Resolved</div>
                  <div className="summary-value">{resolved}</div>
                </div>
                <div className="summary-block in-progress">
                  <div className="summary-icon">⏳</div>
                  <div className="summary-label">In Progress</div>
                  <div className="summary-value">{inProgress}</div>
                </div>
                <div className="summary-block rejected">
                  <div className="summary-icon">❌</div>
                  <div className="summary-label">Rejected</div>
                  <div className="summary-value">{rejected}</div>
                </div>
              </div>

              <div className="resolution-rate">Resolution Rate: {resolutionRate}%</div>
              <div className="progress-bar-container">
                <div className="progress-bar-fill" style={{width: `${resolutionRate}%`}}></div>
              </div>
            </div>

            {/* Recent Updates */}
            <div className="dashboard-card">
              <h2 className="dashboard-card-title" style={{marginBottom: '20px'}}>
                <span style={{marginRight: '8px'}}>🕒</span> Recent Updates
              </h2>
              
              <div className="updates-list">
                {complaints.slice(0, 3).map((c, i) => (
                  <div className="update-item" key={c._id || i}>
                    <div className={`update-dot ${
                        c.status?.toLowerCase().includes('resolved') ? 'resolved' :
                        c.status?.toLowerCase().includes('progress') ? 'in-progress' : 'rejected'
                    }`}></div>
                    <div className="update-content">
                      <p>Your complaint "{c.title}" is currently {c.status?.toLowerCase()}.</p>
                      <div className="update-time">{new Date(c.createdAt).toLocaleString('en-US', {month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'})}</div>
                    </div>
                  </div>
                ))}
                
                {complaints.length === 0 && (
                  <div style={{color: '#94a3b8', fontSize: '0.9rem'}}>No recent updates.</div>
                )}
              </div>
              
              <a href="#my-complaints" className="view-all-link">View All Complaints &rarr;</a>
            </div>
            
          </div>

          {/* RIGHT COLUMN */}
          <div style={{display: 'flex', flexDirection: 'column', gap: '24px'}}>
            
            {/* Complaints Overview Chart */}
            <div className="dashboard-card">
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px'}}>
                <h2 className="dashboard-card-title">Complaints Overview</h2>
                <div style={{display: 'flex', gap: '12px', fontSize: '0.75rem', fontWeight: '600'}}>
                  <span style={{color: '#22c55e'}}>⬜ Resolved</span>
                  <span style={{color: '#f59e0b'}}>⬜ In Progress</span>
                  <span style={{color: '#ef4444'}}>⬜ Rejected</span>
                </div>
              </div>
              
              {/* Static SVG Chart exactly matching user Mock */}
              <div className="chart-container">
                <div className="chart-axis-y">
                  <span>3</span><span>2</span><span>1</span><span>0</span>
                </div>
                <div className="chart-svg-wrapper">
                  <svg width="100%" height="100%" viewBox="0 0 400 200" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="grad-resolved" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#22c55e" stopOpacity="0.2"/>
                        <stop offset="100%" stopColor="#22c55e" stopOpacity="0"/>
                      </linearGradient>
                      <linearGradient id="grad-progress" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.2"/>
                        <stop offset="100%" stopColor="#f59e0b" stopOpacity="0"/>
                      </linearGradient>
                      <linearGradient id="grad-rejected" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#ef4444" stopOpacity="0.2"/>
                        <stop offset="100%" stopColor="#ef4444" stopOpacity="0"/>
                      </linearGradient>
                    </defs>

                    {/* BG Fills */}
                    <path d="M0,133 L200,133 L400,0 L400,200 L0,200 Z" fill="url(#grad-resolved)" />
                    <path d="M0,200 L200,133 L400,133 L400,200 L0,200 Z" fill="url(#grad-progress)" />
                    <path d="M0,200 L200,200 L400,133 L400,200 L0,200 Z" fill="url(#grad-rejected)" />

                    {/* Lines */}
                    <polyline points="0,133 200,133 400,0" fill="none" stroke="#22c55e" strokeWidth="2" />
                    <polyline points="0,200 200,133 400,133" fill="none" stroke="#f59e0b" strokeWidth="2" />
                    <polyline points="0,200 200,200 400,133" fill="none" stroke="#ef4444" strokeWidth="2" />
                    
                    {/* Points */}
                    {/* Resolved */}
                    <circle cx="0" cy="133" r="4" fill="white" stroke="#22c55e" strokeWidth="2" />
                    <circle cx="200" cy="133" r="4" fill="white" stroke="#22c55e" strokeWidth="2" />
                    <circle cx="400" cy="0" r="4" fill="white" stroke="#22c55e" strokeWidth="2" />
                    
                    {/* In Progress */}
                    <circle cx="0" cy="200" r="4" fill="white" stroke="#f59e0b" strokeWidth="2" />
                    <circle cx="200" cy="133" r="4" fill="white" stroke="#f59e0b" strokeWidth="2" />
                    <circle cx="400" cy="133" r="4" fill="white" stroke="#f59e0b" strokeWidth="2" />
                    
                    {/* Rejected */}
                    <circle cx="0" cy="200" r="4" fill="white" stroke="#ef4444" strokeWidth="2" />
                    <circle cx="200" cy="200" r="4" fill="white" stroke="#ef4444" strokeWidth="2" />
                    <circle cx="400" cy="133" r="4" fill="white" stroke="#ef4444" strokeWidth="2" />
                  </svg>
                </div>
                <div className="chart-axis-x" style={{marginLeft: '30px'}}>
                  <span>10 Days</span>
                  <span>A Month</span>
                  <span>All Time</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="dashboard-card">
              <h2 className="dashboard-card-title" style={{marginBottom: '20px'}}>
                <span style={{marginRight: '8px', color: '#f59e0b'}}>⚡</span> Quick Actions
              </h2>

              <Link to="/raise-complaint" className="quick-action-btn blue">
                <div className="qa-left">
                  <div className="qa-icon-wrapper">➕</div>
                  <div className="qa-text">
                    <h4>Raise a New Complaint</h4>
                    <p>Report a new issue</p>
                  </div>
                </div>
                <div style={{color: '#3b82f6', fontWeight: 'bold'}}>&gt;</div>
              </Link>

              <a href="#my-complaints" className="quick-action-btn green">
                <div className="qa-left">
                  <div className="qa-icon-wrapper">📄</div>
                  <div className="qa-text">
                    <h4>View All Complaints</h4>
                    <p>See all your complaint history</p>
                  </div>
                </div>
                <div style={{color: '#22c55e', fontWeight: 'bold'}}>&gt;</div>
              </a>

            </div>

          </div>
        </div>
      </div>

      <div className="dashboard-footer">
        &copy; 2026 <strong>Complaint Tracker</strong>. All rights reserved.
      </div>
    </div>
  );
};

export default UserDashboard;
