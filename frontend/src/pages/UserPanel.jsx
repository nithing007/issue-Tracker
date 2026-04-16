import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Input, Select, Tooltip, Empty, Modal, Form, message, Popconfirm, Button } from 'antd';
import { SearchOutlined, EyeOutlined, EditOutlined, DeleteOutlined, InfoCircleOutlined, SyncOutlined, CheckCircleOutlined, CloseCircleOutlined, PaperClipOutlined } from '@ant-design/icons';
import Navbar from '../components/Navbar';
import './Dashboard.css';

const UserPanel = () => {
  const [complaints, setComplaints] = useState([]);
  const [statusMsg, setStatusMsg] = useState('');
  const [timeRange, setTimeRange] = useState('All Time');
  const [expandedRowKeys, setExpandedRowKeys] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [graphMode, setGraphMode] = useState('count');
  
  // Modal states
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [editForm] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  const toggleRow = (id) => {
    setExpandedRowKeys(prev => ({ ...prev, [id]: !prev[id] }));
  };

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
        setStatusMsg('Failed to load complaints');
      }
    } catch (error) {
      setStatusMsg('Unable to load complaints');
    }
  };

  const handleView = (complaint) => {
    setSelectedComplaint(complaint);
    setViewModalVisible(true);
  };

  const handleEdit = (complaint) => {
    if (complaint.status !== 'Pending') {
      message.warning('Only pending complaints can be edited');
      return;
    }
    setSelectedComplaint(complaint);
    editForm.setFieldsValue({
      title: complaint.title,
      category: complaint.category,
      description: complaint.description
    });
    setEditModalVisible(true);
  };

  const handleDelete = async (id) => {

    try {
      const response = await fetch(`http://localhost:5000/api/complaints/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        message.success('Complaint deleted successfully');
        fetchComplaints();
      } else {
        const data = await response.json();
        message.error(data.message || 'Failed to delete complaint');
      }
    } catch (error) {
      message.error('Server error. Please try again.');
    }
  };

  const onUpdate = async (values) => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/complaints/${selectedComplaint._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(values),
      });

      if (response.ok) {
        message.success('Complaint updated successfully');
        setEditModalVisible(false);
        fetchComplaints();
      } else {
        const data = await response.json();
        message.error(data.message || 'Update failed');
      }
    } catch (error) {
      message.error('Server error');
    } finally {
      setLoading(false);
    }
  };

  const total = complaints.length;
  const resolved = complaints.filter(c => c.status === 'Resolved' || c.status?.toLowerCase() === 'resolved').length;
  const inProgress = complaints.filter(c => c.status === 'In Progress' || c.status?.toLowerCase().includes('progress')).length;
  const rejected = complaints.filter(c => c.status === 'Rejected' || c.status?.toLowerCase() === 'rejected').length;

  const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

  const getStatusBadge = (status) => {
    const s = status?.toLowerCase() || '';
    if (s.includes('resolved')) return <span className="status-badge resolved"><CheckCircleOutlined /> Resolved</span>;
    if (s.includes('progress')) return <span className="status-badge in-progress"><SyncOutlined spin /> In Progress</span>;
    if (s.includes('rejected')) return <span className="status-badge rejected"><CloseCircleOutlined /> Rejected</span>;
    if (s.includes('pending')) return <span className="status-badge pending"><InfoCircleOutlined /> Pending</span>;
    return <span className="status-badge pending"><InfoCircleOutlined /> {status || 'Pending'}</span>;
  };

  // Filter complaints based on timeRange
  const now = new Date();
  const getFilteredComplaints = () => {
    let result = complaints;
    
    if (timeRange !== 'All Time') {
      result = result.filter(c => {
        const createdAt = new Date(c.createdAt);
        const diffTime = Math.abs(now - createdAt);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (timeRange === '10 Days') return diffDays <= 10;
        if (timeRange === 'A Month') return diffDays <= 30;
        return true;
      });
    }

    if (searchQuery) result = result.filter(c => c.title?.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (statusFilter !== 'All') {
      if (statusFilter === 'Pending') result = result.filter(c => c.status?.toLowerCase() === 'pending');
      else if (statusFilter === 'In Progress') result = result.filter(c => c.status?.toLowerCase().includes('progress'));
      else if (statusFilter === 'Resolved') result = result.filter(c => c.status?.toLowerCase().includes('resolved'));
      else if (statusFilter === 'Rejected') result = result.filter(c => c.status?.toLowerCase() === 'rejected');
    }

    if (categoryFilter !== 'All') result = result.filter(c => (c.category || 'General') === categoryFilter);

    return result;
  };

  const filteredComplaints = getFilteredComplaints();
  const categories = ['All', ...new Set(complaints.map(c => c.category || 'General'))];

  return (
    <div className="modern-dashboard-bg">
      <Navbar />
      
      <div className="modern-dashboard-header">
        <h1>Student Dashboard</h1>
        <p>Track and monitor your complaints with ease.</p>
      </div>

      <div className="modern-dashboard-container">
        {statusMsg && <p style={{color: 'red', textAlign: 'center'}}>{statusMsg}</p>}

        {/* Quick Stats Strip */}
        <div className="quick-stats-strip">
          <div className="stat-pill blue-pill hover-lift">
            <span className="pill-icon">📋</span>
            <span className="pill-label">Today Complaints</span>
            <span className="pill-value">{complaints.filter(c => new Date(c.createdAt).toDateString() === new Date().toDateString()).length}</span>
          </div>
          <div className="stat-pill orange-pill hover-lift">
            <span className="pill-icon">⏳</span>
            <span className="pill-label">Pending Today</span>
            <span className="pill-value">{complaints.filter(c => new Date(c.createdAt).toDateString() === new Date().toDateString() && (c.status?.toLowerCase().includes('progress') || c.status?.toLowerCase() === 'pending')).length}</span>
          </div>
        </div>

        {/* My Complaints Table Card */}
        <div className="dashboard-card hover-lift" id="my-complaints">
          <div className="dashboard-card-header">
            <h2 className="dashboard-card-title">My Complaints</h2>
            <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
              <span style={{fontSize: '0.9rem', color: '#64748b', fontWeight: '500'}}>Time Range:</span>
              <Select 
                value={timeRange} 
                onChange={value => setTimeRange(value)}
                style={{ width: 110 }}
                options={[
                  { value: '10 Days', label: '10 Days' },
                  { value: 'A Month', label: 'A Month' },
                  { value: 'All Time', label: 'All Time' }
                ]}
              />
            </div>
          </div>

          <div className="table-controls-bar">
            <div className="table-controls-left">
              <Input 
                prefix={<SearchOutlined style={{color: '#94a3b8'}} />}
                placeholder="Search by title..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{ width: 220 }}
              />
              <Select 
                value={statusFilter} 
                onChange={value => setStatusFilter(value)}
                style={{ width: 150 }}
                options={[
                  { value: 'All', label: 'Filter by Status' },
                  { value: 'Pending', label: 'Pending' },
                  { value: 'In Progress', label: 'In Progress' },
                  { value: 'Resolved', label: 'Resolved' },
                  { value: 'Rejected', label: 'Rejected' }
                ]}
              />
              <Select 
                value={categoryFilter} 
                onChange={value => setCategoryFilter(value)}
                style={{ width: 150 }}
                options={categories.map(cat => ({ value: cat, label: cat === 'All' ? 'All Categories' : cat }))}
              />
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
                  <th style={{textAlign: 'center'}}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredComplaints.length > 0 ? (
                  filteredComplaints.map((c) => {
                    const date = new Date(c.createdAt);
                    const isExpanded = expandedRowKeys[c._id];
                    return (
                      <React.Fragment key={c._id}>
                        <tr className="table-row-hover" style={{cursor: 'pointer', transition: 'background-color 0.2s'}} onClick={() => toggleRow(c._id)}>
                          <td style={{fontWeight: '500', color: '#1d4ed8'}}>
                            {c.title} <span style={{fontSize: '0.7rem', marginLeft: '6px', color: '#94a3b8'}}>{isExpanded ? '▲' : '▼'}</span>
                          </td>
                          <td>{c.category || 'General'}</td>
                          <td>{getStatusBadge(c.status)}</td>
                          <td>{date.toLocaleDateString('en-GB')}</td>
                          <td>{date.toLocaleString('default', { month: 'long' })}</td>
                          <td style={{textAlign: 'center'}} onClick={(e) => e.stopPropagation()}>
                            <div className="table-actions">
                              <Tooltip title="View"><EyeOutlined className="action-icon view-icon" onClick={() => handleView(c)} /></Tooltip>
                              <Tooltip title="Edit"><EditOutlined className="action-icon edit-icon" onClick={() => handleEdit(c)} /></Tooltip>
                              <Popconfirm
                                title="Delete the complaint"
                                description="Are you sure to delete this complaint?"
                                onConfirm={() => handleDelete(c._id)}
                                okText="Yes"
                                cancelText="No"
                              >
                                <Tooltip title="Delete"><DeleteOutlined className="action-icon delete-icon" /></Tooltip>
                              </Popconfirm>
                            </div>
                          </td>
                        </tr>
                        {isExpanded && (
                          <tr style={{backgroundColor: '#f8fafc', borderLeft: '4px solid #3b82f6'}}>
                            <td colSpan="6" style={{padding: '16px 24px', borderBottom: '1px solid #e2e8f0'}}>
                              <div style={{color: '#475569', fontSize: '0.95rem', lineHeight: '1.6'}}>
                                <strong style={{color: '#334155'}}>Description: </strong>
                                {c.description || c.remarks || 'No detailed description provided for this complaint.'}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="6" style={{textAlign: 'center', padding: '50px 0'}}>
                      <Empty description={<span style={{color: '#94a3b8', fontSize: '1rem'}}>No complaints found</span>} />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="dashboard-table-footer">
            Showing {filteredComplaints.length} of {total} complaints
          </div>
        </div>

        {/* Lower Grid area */}
        <div className="dashboard-grid-lower">
          
          {/* LEFT COLUMN */}
          <div style={{display: 'flex', flexDirection: 'column', gap: '24px'}}>
            
            {/* Alert Box */}
            <div className="notification-alert">
              <InfoCircleOutlined className="alert-icon" />
              <div className="alert-content">
                <div className="alert-text">2 complaints pending more than 3 days</div>
                <div className="alert-text">1 complaint awaiting admin response</div>
              </div>
            </div>

            {/* Complaint Summary */}
            <div className="dashboard-card hover-lift">
              <h2 className="dashboard-card-title" style={{marginBottom: '20px'}}>Complaint Summary</h2>
              
              <div className="summary-blocks">
                <div className="summary-block total hover-lift-subtle">
                  <div className="summary-icon">📋</div>
                  <div className="summary-label">Total</div>
                  <div className="summary-value">{total}</div>
                  <div className="summary-trend"><span>+2</span> this week</div>
                </div>
                <div className="summary-block resolved hover-lift-subtle">
                  <div className="summary-icon">✅</div>
                  <div className="summary-label">Resolved</div>
                  <div className="summary-value">{resolved}</div>
                  <div className="summary-trend positive"><span>+1</span> this week</div>
                </div>
                <div className="summary-block in-progress hover-lift-subtle">
                  <div className="summary-icon">⏳</div>
                  <div className="summary-label">In Progress</div>
                  <div className="summary-value">{inProgress}</div>
                  <div className="summary-trend warning"><span>-1</span> pending</div>
                </div>
                <div className="summary-block rejected hover-lift-subtle">
                  <div className="summary-icon">❌</div>
                  <div className="summary-label">Rejected</div>
                  <div className="summary-value">{rejected}</div>
                  <div className="summary-trend negative"><span>0</span> this week</div>
                </div>
              </div>

              <div className="resolution-rate-container">
                <div className="resolution-rate">Resolution Rate: {resolutionRate}%</div>
                <div className="resolution-trend positive">+2% vs last month</div>
              </div>
              <div className="progress-bar-container">
                <div className="progress-bar-fill" style={{width: `${resolutionRate}%`}}></div>
              </div>
            </div>

            {/* Recent Updates */}
            <div className="dashboard-card hover-lift">
              <h2 className="dashboard-card-title" style={{marginBottom: '20px'}}>
                <span style={{marginRight: '8px'}}>🕒</span> Recent Updates
              </h2>
              
              <div className="updates-timeline">
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
            <div className="dashboard-card hover-lift">
              <div className="graph-header-controls">
                <h2 className="dashboard-card-title">Complaints Overview</h2>
                <div className="graph-controls-right">
                  <div className="graph-toggles">
                    <button className={`graph-toggle ${graphMode === 'count' ? 'active' : ''}`} onClick={() => setGraphMode('count')}>
                      Complaints Count
                    </button>
                    <button className={`graph-toggle ${graphMode === 'distribution' ? 'active' : ''}`} onClick={() => setGraphMode('distribution')}>
                      Status Dist.
                    </button>
                  </div>
                  <Select 
                    value={timeRange} 
                    onChange={value => setTimeRange(value)}
                    size="small"
                    style={{ width: 100 }}
                    options={[
                      { value: '10 Days', label: '10 Days' },
                      { value: 'A Month', label: 'A Month' },
                      { value: 'All Time', label: 'All Time' }
                    ]}
                  />
                </div>
              </div>
              
              <div style={{display: 'flex', justifyContent: 'flex-end', gap: '12px', fontSize: '0.75rem', fontWeight: '600', margin: '0 0 10px 0'}}>
                <span style={{color: '#22c55e'}}>⬜ Resolved</span>
                <span style={{color: '#f59e0b'}}>⬜ In Progress</span>
                <span style={{color: '#ef4444'}}>⬜ Rejected</span>
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
            <div className="dashboard-card hover-lift">
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

       {/* View Modal */}
       <Modal
          title={<span style={{fontSize: '1.25rem', fontWeight: '600', color: '#1e3a8a'}}><EyeOutlined style={{marginRight: '8px'}} /> Complaint Details</span>}
          open={viewModalVisible}
          onCancel={() => setViewModalVisible(false)}
          footer={[
            <Button key="close" type="primary" onClick={() => setViewModalVisible(false)} style={{borderRadius: '8px', background: '#1e3a8a'}}>
              Close
            </Button>
          ]}
          width={700}
          centered
          className="custom-modal"
          styles={{body: {padding: '24px'}}}
        >
          {selectedComplaint && (
            <div className="view-details-content">
              <div style={{marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <h3 style={{fontSize: '1.2rem', color: '#334155', margin: 0}}>{selectedComplaint.title}</h3>
                {getStatusBadge(selectedComplaint.status)}
              </div>
              
              <div className="detail-item" style={{marginBottom: '16px'}}>
                <strong style={{display: 'block', color: '#64748b', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px'}}>Category</strong>
                <span style={{color: '#1e293b', fontWeight: '500'}}>{selectedComplaint.category || 'General'}</span>
              </div>

              <div className="detail-item" style={{marginBottom: '16px'}}>
                <strong style={{display: 'block', color: '#64748b', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px'}}>Description</strong>
                <p style={{color: '#475569', fontSize: '0.95rem', lineHeight: '1.6', background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0'}}>
                  {selectedComplaint.description}
                </p>
              </div>

              <div style={{display: 'flex', gap: '32px', borderTop: '1px solid #f1f5f9', paddingTop: '16px'}}>
                <div className="detail-item">
                  <strong style={{display: 'block', color: '#64748b', fontSize: '0.85rem', textTransform: 'uppercase', marginBottom: '4px'}}>Submitted On</strong>
                  <span style={{color: '#475569'}}>{new Date(selectedComplaint.createdAt).toLocaleDateString('en-GB')}</span>
                </div>
                <div className="detail-item">
                  <strong style={{display: 'block', color: '#64748b', fontSize: '0.85rem', textTransform: 'uppercase', marginBottom: '4px'}}>Last Updated</strong>
                  <span style={{color: '#475569'}}>{new Date(selectedComplaint.updatedAt).toLocaleDateString('en-GB')}</span>
                </div>
              </div>

              {selectedComplaint.remarks && (
                <div className="detail-item" style={{marginTop: '20px', padding: '12px', background: '#ecfdf5', borderRadius: '8px', border: '1px solid #a7f3d0'}}>
                  <strong style={{display: 'block', color: '#065f46', fontSize: '0.85rem', textTransform: 'uppercase', marginBottom: '4px'}}>Admin Remarks</strong>
                  <p style={{color: '#065f46', margin: 0, fontSize: '0.95rem'}}>{selectedComplaint.remarks}</p>
                </div>
              )}
            </div>
          )}
        </Modal>

        {/* Edit Modal */}
        <Modal
          title={<span style={{fontSize: '1.25rem', fontWeight: '600', color: '#d97706'}}><EditOutlined style={{marginRight: '8px'}} /> Edit Complaint</span>}
          open={editModalVisible}
          onCancel={() => setEditModalVisible(false)}
          footer={null}
          width={600}
          centered
        >
          <Form
            form={editForm}
            layout="vertical"
            onFinish={onUpdate}
            style={{paddingTop: '12px'}}
          >
            <Form.Item
              name="title"
              label="Complaint Title"
              rules={[{ required: true, message: 'Please enter title' }]}
            >
              <Input placeholder="Brief title of the issue" style={{borderRadius: '8px', padding: '10px'}} />
            </Form.Item>

            <Form.Item
              name="category"
              label="Category"
              rules={[{ required: true, message: 'Please select category' }]}
            >
              <Select placeholder="Select category" style={{borderRadius: '8px'}}>
                {categories.filter(c => c !== 'All').map(cat => (
                  <Select.Option key={cat} value={cat}>{cat}</Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="description"
              label="Detailed Description"
              rules={[{ required: true, message: 'Please enter description' }]}
            >
              <Input.TextArea rows={5} placeholder="Explain the issue in detail..." style={{borderRadius: '8px'}} />
            </Form.Item>

            <div style={{display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px'}}>
              <Button onClick={() => setEditModalVisible(false)} style={{borderRadius: '8px', height: '40px', padding: '0 20px'}}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit" loading={loading} style={{borderRadius: '8px', height: '40px', padding: '0 24px', background: '#d97706', border: 'none'}}>
                Update Complaint
              </Button>
            </div>
          </Form>
        </Modal>
    </div>
  );
};

export default UserPanel;
