import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Input, Select, Tooltip, Empty, Modal, Form, message, Popconfirm, Button, Spin } from 'antd';
import { SearchOutlined, EyeOutlined, EditOutlined, DeleteOutlined, InfoCircleOutlined, SyncOutlined, CheckCircleOutlined, CloseCircleOutlined, PaperClipOutlined, DownloadOutlined, SendOutlined } from '@ant-design/icons';
import Navbar from '../components/Navbar';
import { useSocket } from '../context/SocketContext';
import './Dashboard.css';

const UserPanel = () => {
  const [complaints, setComplaints] = useState([]);
  const socket = useSocket();
  const [statusMsg, setStatusMsg] = useState('');
  
  // Defensive check for complaints array
  const safeComplaints = Array.isArray(complaints) ? complaints : [];
  const [timeRange, setTimeRange] = useState('All Time');
  const [expandedRowKeys, setExpandedRowKeys] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [graphMode, setGraphMode] = useState('count');
  
  // Modal states
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [attachmentModalVisible, setAttachmentModalVisible] = useState(false);
  const [previewAttachment, setPreviewAttachment] = useState(null);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [editForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  
  // Comment states
  const [commentText, setCommentText] = useState('');
  const [commentAttachments, setCommentAttachments] = useState([]);

  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  const toggleRow = (id) => {
    setExpandedRowKeys(prev => ({ ...prev, [id]: !prev[id] }));
  };

  useEffect(() => {
    if (socket) {
      socket.on('status_update', (data) => {
        setComplaints(prev => prev.map(c => c._id === data.id ? { ...c, status: data.status } : c));
        message.info(`Status of complaint #${data.id.slice(-6)} updated to ${data.status}`);
      });

      socket.on('receive_message', (data) => {
        setComplaints(prev => prev.map(c => {
          if (c._id === data.roomId) {
            // Check if comment already exists
            const exists = c.comments.some(cm => cm.date === data.comment.date && cm.text === data.comment.text);
            if (!exists) {
              return { ...c, comments: [...c.comments, data.comment] };
            }
          }
          return c;
        }));
      });

      return () => {
        socket.off('status_update');
        socket.off('receive_message');
      };
    }
  }, [socket]);

  useEffect(() => {
    if (socket && safeComplaints.length > 0) {
      safeComplaints.forEach(c => {
        if (c?._id) {
          socket.emit('join_room', c._id.toString());
        }
      });
    }
  }, [socket, safeComplaints.length]);

  useEffect(() => {
    if (!token || !(role === 'user' || role === 'student')) {
      navigate('/login');
      return;
    }
    fetchComplaints();
  }, [token, role, navigate]);

  const fetchComplaints = async () => {
    setLoading(true);
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
      console.error('Fetch error:', error);
      setStatusMsg('Unable to load complaints');
    } finally {
      setLoading(false);
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

  const total = safeComplaints.length;
  const resolved = safeComplaints.filter(c => c?.status === 'Resolved' || c?.status?.toLowerCase() === 'resolved').length;
  const inProgress = safeComplaints.filter(c => c?.status === 'In Progress' || c?.status?.toLowerCase()?.includes('progress')).length;
  const rejected = safeComplaints.filter(c => c?.status === 'Rejected' || c?.status?.toLowerCase() === 'rejected').length;

  const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

  const getStatusBadge = (status) => {
    const s = status?.toLowerCase() || '';
    if (s.includes('resolved')) return <span className="status-badge" style={{background: '#d1fae5', color: '#065f46', padding: '4px 12px', borderRadius: '9999px', fontWeight: 'bold'}}><CheckCircleOutlined /> Resolved</span>;
    if (s.includes('progress')) return <span className="status-badge" style={{background: '#ffedd5', color: '#c2410c', padding: '4px 12px', borderRadius: '9999px', fontWeight: 'bold'}}><SyncOutlined spin /> In Progress</span>;
    if (s.includes('rejected')) return <span className="status-badge" style={{background: '#fee2e2', color: '#b91c1c', padding: '4px 12px', borderRadius: '9999px', fontWeight: 'bold'}}><CloseCircleOutlined /> Rejected</span>;
    if (s.includes('pending')) return <span className="status-badge" style={{background: '#dbeafe', color: '#1d4ed8', padding: '4px 12px', borderRadius: '9999px', fontWeight: 'bold'}}><InfoCircleOutlined /> Pending</span>;
    return <span className="status-badge" style={{background: '#dbeafe', color: '#1d4ed8', padding: '4px 12px', borderRadius: '9999px', fontWeight: 'bold'}}><InfoCircleOutlined /> {status || 'Pending'}</span>;
  };

  const getPriorityBadge = (priority) => {
    if (priority === 'High') return <span style={{background: '#fee2e2', color: '#b91c1c', padding: '2px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold'}}>High</span>;
    if (priority === 'Low') return <span style={{background: '#ecfdf5', color: '#065f46', padding: '2px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold'}}>Low</span>;
    return <span style={{background: '#fef3c7', color: '#b45309', padding: '2px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold'}}>Medium</span>;
  };

  const handleDownload = (complaint) => {
    if (!complaint) return;
    const content = `COMPLAINT DETAILS
--------------------
Title: ${complaint.title || 'N/A'}
Category: ${complaint.category || 'N/A'}
Priority: ${complaint.priority || 'Medium'}
Status: ${complaint.status || 'Pending'}
Date: ${complaint.createdAt ? new Date(complaint.createdAt).toLocaleDateString() : 'N/A'}

Description:
${complaint.description || 'No description'}

Estimated Resolution: 2-3 days
${complaint.remarks ? '\nAdmin Remarks:\n' + complaint.remarks : ''}`;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Complaint_${(complaint.title || 'detail').substring(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCommentFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    files.forEach(file => {
        if (file.size > 5 * 1024 * 1024) return;
        const reader = new FileReader();
        reader.onloadend = () => {
            setCommentAttachments(prev => [...prev, {
                name: file.name,
                type: file.type,
                url: reader.result,
                size: file.size,
                uploadedBy: 'User'
            }]);
        };
        reader.readAsDataURL(file);
    });
  };

  const handleAddComment = async (complaintId) => {
    if (!commentText.trim() && commentAttachments.length === 0) return;
    
    try {
      const response = await fetch(`http://localhost:5000/api/complaints/${complaintId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          newComment: { text: commentText, attachments: commentAttachments } 
        }),
      });

      if (response.ok) {
        setCommentText('');
        setCommentAttachments([]);
        fetchComplaints(); // refresh data
      }
    } catch (e) {
      message.error('Failed to add comment');
    }
  };
  const now = new Date();
  const getFilteredComplaints = () => {
    let result = safeComplaints;
    
    if (timeRange !== 'All Time') {
      result = result.filter(c => {
        if (!c?.createdAt) return false;
        const createdAt = new Date(c.createdAt);
        const diffTime = Math.abs(now - createdAt);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (timeRange === '10 Days') return diffDays <= 10;
        if (timeRange === 'A Month') return diffDays <= 30;
        return true;
      });
    }

    if (searchQuery) result = result.filter(c => c?.title?.toLowerCase()?.includes(searchQuery.toLowerCase()));
    
    if (statusFilter !== 'All') {
      if (statusFilter === 'Pending') result = result.filter(c => c?.status?.toLowerCase() === 'pending');
      else if (statusFilter === 'In Progress') result = result.filter(c => c?.status?.toLowerCase()?.includes('progress'));
      else if (statusFilter === 'Resolved') result = result.filter(c => c?.status?.toLowerCase()?.includes('resolved'));
      else if (statusFilter === 'Rejected') result = result.filter(c => c?.status?.toLowerCase() === 'rejected');
    }

    if (categoryFilter !== 'All') result = result.filter(c => (c?.category || 'General') === categoryFilter);
    if (priorityFilter !== 'All') result = result.filter(c => (c?.priority || 'Medium') === priorityFilter);

    return result;
  };

  const filteredComplaints = getFilteredComplaints();
  const categories = ['All', ...new Set(safeComplaints.map(c => c?.category || 'General'))];

  return (
    <div className="dashboard-root-wrapper">
      <div className="modern-dashboard-bg">
      <Navbar />
      
      <div className="modern-dashboard-header">
        <h1>TrackEase Pro Dashboard</h1>
        <p>Track and monitor your complaints with ease.</p>
      </div>

      <div className="modern-dashboard-container">
        {statusMsg && <p style={{color: 'red', textAlign: 'center'}}>{statusMsg}</p>}

        {/* Quick Stats Strip */}
        <div className="quick-stats-strip">
          <div className="stat-pill blue-pill hover-lift">
            <span className="pill-icon">📋</span>
            <span className="pill-label">Today Complaints</span>
            <span className="pill-value">{safeComplaints.filter(c => c?.createdAt && new Date(c.createdAt).toDateString() === new Date().toDateString()).length}</span>
          </div>
          <div className="stat-pill orange-pill hover-lift">
            <span className="pill-icon">⏳</span>
            <span className="pill-label">Pending Today</span>
            <span className="pill-value">{safeComplaints.filter(c => c?.createdAt && new Date(c.createdAt).toDateString() === new Date().toDateString() && (c.status?.toLowerCase()?.includes('progress') || c.status?.toLowerCase() === 'pending')).length}</span>
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
              <Select 
                value={priorityFilter} 
                onChange={value => setPriorityFilter(value)}
                style={{ width: 150 }}
                options={[
                  { value: 'All', label: 'All Priorities' },
                  { value: 'Low', label: 'Low ' },
                  { value: 'Medium', label: 'Medium' },
                  { value: 'High', label: 'High' }
                ]}
              />
            </div>
          </div>

          <div className="dashboard-table-wrapper">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>TITLE</th>
                  <th>PRIORITY</th>
                  <th>CATEGORY</th>
                  <th>STATUS</th>
                  <th>DATE &darr;</th>
                  <th>FILES</th>
                  <th style={{textAlign: 'center'}}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" style={{textAlign: 'center', padding: '50px 0'}}>
                      <Spin size="large" tip="Loading complaints..." />
                    </td>
                  </tr>
                ) : filteredComplaints.length > 0 ? (
                  filteredComplaints.map((c) => {
                    const date = new Date(c.createdAt);
                    const isExpanded = expandedRowKeys[c._id];
                    return (
                      <React.Fragment key={c._id}>
                        <tr className="table-row-hover" style={{cursor: 'pointer', transition: 'background-color 0.2s'}} onClick={() => toggleRow(c._id)}>
                          <td style={{fontWeight: '500', color: '#1d4ed8'}}>
                            {c.title} <span style={{fontSize: '0.7rem', marginLeft: '6px', color: '#94a3b8'}}>{isExpanded ? '▲' : '▼'}</span>
                          </td>
                          <td>{getPriorityBadge(c.priority || 'Medium')}</td>
                          <td>{c.category || 'General'}</td>
                          <td>{getStatusBadge(c.status)}</td>
                          <td>{date.toLocaleDateString('en-GB')}</td>
                          <td>{c.attachments && c.attachments.length > 0 ? <Tooltip title={`${c.attachments.length} attachment(s)`}><PaperClipOutlined style={{color: '#64748b'}} /></Tooltip> : '-'}</td>
                          <td style={{textAlign: 'center'}} onClick={(e) => e.stopPropagation()}>
                            <div className="table-actions">
                              <Tooltip title="View"><EyeOutlined className="action-icon view-icon" onClick={() => handleView(c)} /></Tooltip>
                              <Tooltip title="Download"><DownloadOutlined className="action-icon" style={{color: '#10b981'}} onClick={() => handleDownload(c)} /></Tooltip>
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
                            <td colSpan="7" style={{padding: '16px 24px', borderBottom: '1px solid #e2e8f0'}}>
                              <div style={{display: 'flex', flexDirection: 'column', gap: '16px', color: '#475569', fontSize: '0.95rem', lineHeight: '1.6'}}>
                                {/* Timeline */}
                                <div style={{display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', background: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0'}}>
                                  <div style={{flex: 1, textAlign: 'center', fontWeight: 'bold', color: '#3b82f6'}}>🔵 Submitted</div>
                                  <div style={{height: '2px', background: c.status === 'Pending' ? '#e2e8f0' : '#3b82f6', flex: 1}}></div>
                                  <div style={{flex: 1, textAlign: 'center', fontWeight: c.status !== 'Pending' ? 'bold' : 'normal', color: c.status !== 'Pending' ? '#f59e0b' : '#94a3b8'}}>{c.status !== 'Pending' ? '🟠 In Progress' : '⚪ In Progress'}</div>
                                  <div style={{height: '2px', background: ['Resolved', 'Rejected'].includes(c.status) ? (c.status === 'Resolved' ? '#22c55e' : '#ef4444') : '#e2e8f0', flex: 1}}></div>
                                  <div style={{flex: 1, textAlign: 'center', fontWeight: ['Resolved', 'Rejected'].includes(c.status) ? 'bold' : 'normal', color: c.status === 'Resolved' ? '#22c55e' : (c.status === 'Rejected' ? '#ef4444' : '#94a3b8')}}>
                                    {c.status === 'Resolved' ? '🟢 Resolved' : (c.status === 'Rejected' ? '🔴 Rejected' : '⚪ Resolved/Rejected')}
                                  </div>
                                </div>

                                <div>
                                  <strong style={{color: '#334155'}}>Description: </strong>
                                  {c.description || 'No detailed description provided.'}
                                </div>
                                <div style={{fontSize: '0.85rem', color: '#64748b', fontStyle: 'italic'}}>Estimated resolution: 2-3 days</div>

                                {/* Attachments */}
                                {c.attachments && c.attachments.length > 0 && (
                                  <div>
                                    <strong style={{color: '#334155'}}>Attachments ({c.attachments.length}):</strong>
                                    <div style={{display: 'flex', gap: '10px', marginTop: '8px', flexWrap: 'wrap'}}>
                                      {c.attachments.map((att, i) => (
                                        <div key={i} onClick={() => { setPreviewAttachment(att); setAttachmentModalVisible(true); }} style={{border: '1px solid #cbd5e1', padding: '4px', borderRadius: '4px', cursor: 'pointer', background: '#fff', display: 'flex', alignItems: 'center', gap: '8px'}}>
                                          {att.type.includes('image') ? <img src={att.url} alt="att" style={{width: '30px', height: '30px', objectFit: 'cover'}} /> : <PaperClipOutlined />}
                                          <span style={{fontSize: '0.8rem', maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>{att.name}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Comments / Reply Section */}
                                <div style={{background: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', padding: '12px'}}>
                                  <strong style={{color: '#334155', display: 'block', marginBottom: '12px'}}>Discussion</strong>
                                  <div style={{maxHeight: '150px', overflowY: 'auto', marginBottom: '12px', display: 'flex', flexDirection: 'column', gap: '8px'}}>
                                    {(!c.comments || c.comments.length === 0) && <div style={{color: '#94a3b8', fontSize: '0.85rem', textAlign: 'center'}}>No comments yet.</div>}
                                    {c.comments && c.comments.map((cm, i) => (
                                      <div key={i} style={{alignSelf: cm.sender === 'User' ? 'flex-end' : 'flex-start', background: cm.sender === 'User' ? '#dbeafe' : '#f1f5f9', padding: '8px 12px', borderRadius: '8px', maxWidth: '80%'}}>
                                        <div style={{fontSize: '0.75rem', color: '#64748b', marginBottom: '4px', fontWeight: 'bold'}}>{cm.sender} <span style={{fontWeight: 'normal'}}>{new Date(cm.date).toLocaleString()}</span></div>
                                        <div>{cm.text}</div>
                                        {cm.attachments && cm.attachments.length > 0 && (
                                          <div style={{display: 'flex', gap: '4px', marginTop: '4px'}}>
                                            {cm.attachments.map((a, j) => (
                                              <span key={j} onClick={() => { setPreviewAttachment(a); setAttachmentModalVisible(true); }} style={{color: '#1d4ed8', cursor: 'pointer', fontSize: '0.8rem'}}><PaperClipOutlined /> {a.name}</span>
                                            ))}
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                  <div style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
                                    <Input placeholder="Type a comment..." value={commentText} onChange={e => setCommentText(e.target.value)} onPressEnter={() => handleAddComment(c._id)} />
                                    <label style={{cursor: 'pointer', color: '#64748b'}}><input type="file" multiple style={{display: 'none'}} onChange={handleCommentFileChange} /><PaperClipOutlined fontSize="large" /></label>
                                    <Button type="primary" icon={<SendOutlined />} onClick={() => handleAddComment(c._id)} />
                                  </div>
                                  {commentAttachments.length > 0 && <div style={{fontSize: '0.75rem', color: '#10b981', marginTop: '4px'}}>{commentAttachments.length} file(s) attached</div>}
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="7" style={{textAlign: 'center', padding: '50px 0'}}>
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

        {/* Enhanced Lower Grid Area */}
        <div className="dashboard-grid-lower" style={{marginTop: '32px'}}>
          
          {/* TOP ROW: Quick Insights Cards */}
          <div style={{gridColumn: '1 / -1', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '8px'}}>
            <div className="dashboard-card hover-lift" style={{padding: '20px', textAlign: 'center', borderTop: '4px solid #3b82f6'}}>
               <div style={{fontSize: '2rem', marginBottom: '8px'}}>📊</div>
               <div style={{color: '#64748b', fontWeight: '500', marginBottom: '4px'}}>Total Complaints</div>
               <div style={{fontSize: '1.75rem', fontWeight: '700', color: '#1e293b'}}>{total}</div>
            </div>
            <div className="dashboard-card hover-lift" style={{padding: '20px', textAlign: 'center', borderTop: '4px solid #f59e0b'}}>
               <div style={{fontSize: '2rem', marginBottom: '8px'}}>⏳</div>
               <div style={{color: '#64748b', fontWeight: '500', marginBottom: '4px'}}>In Progress</div>
               <div style={{fontSize: '1.75rem', fontWeight: '700', color: '#1e293b'}}>{inProgress}</div>
            </div>
            <div className="dashboard-card hover-lift" style={{padding: '20px', textAlign: 'center', borderTop: '4px solid #22c55e'}}>
               <div style={{fontSize: '2rem', marginBottom: '8px'}}>✅</div>
               <div style={{color: '#64748b', fontWeight: '500', marginBottom: '4px'}}>Resolved</div>
               <div style={{fontSize: '1.75rem', fontWeight: '700', color: '#1e293b'}}>{resolved}</div>
            </div>
            <div className="dashboard-card hover-lift" style={{padding: '20px', textAlign: 'center', borderTop: '4px solid #8b5cf6'}}>
               <div style={{fontSize: '2rem', marginBottom: '8px'}}>⚡</div>
               <div style={{color: '#64748b', fontWeight: '500', marginBottom: '4px'}}>Response Time</div>
               <div style={{fontSize: '1.75rem', fontWeight: '700', color: '#1e293b'}}>~24h</div>
            </div>
          </div>

          {/* LEFT COLUMN: Recent Activity Panel */}
          <div className="dashboard-card hover-lift" style={{display: 'flex', flexDirection: 'column', height: '100%'}}>
            <h2 className="dashboard-card-title" style={{marginBottom: '20px'}}>
              <SyncOutlined style={{marginRight: '8px', color: '#3b82f6'}} /> Recent Activity
            </h2>
            <div className="updates-timeline" style={{flex: 1}}>
              {safeComplaints.slice(0, 5).map((c, i) => {
                const isResolved = c?.status?.toLowerCase()?.includes('resolved');
                const hasAdminReply = c?.comments?.some(cm => cm.sender === 'Admin');
                return (
                  <div className="update-item" key={c?._id || i}>
                    <div className={`update-dot ${isResolved ? 'resolved' : 'in-progress'}`}></div>
                    <div className="update-content">
                      <p style={{margin: 0, fontWeight: '500', color: '#334155'}}>
                        {hasAdminReply ? "Admin replied to" : "Action on"} "{c?.title}"
                      </p>
                      <p style={{margin: '2px 0 6px 0', fontSize: '0.85rem', color: '#64748b'}}>
                        Status is now <strong style={{color: isResolved ? '#22c55e' : '#f59e0b'}}>{c?.status}</strong>
                      </p>
                      <div className="update-time" style={{fontSize: '0.75rem', opacity: 0.7}}>
                        {c?.createdAt ? new Date(c.createdAt).toLocaleDateString() : 'N/A'}
                      </div>
                    </div>
                  </div>
                );
              })}
              {safeComplaints.length === 0 && <div style={{textAlign: 'center', padding: '20px', color: '#94a3b8'}}>No activity yet</div>}
            </div>
          </div>

          {/* RIGHT COLUMN: Pending Actions & Alerts */}
          <div style={{display: 'flex', flexDirection: 'column', gap: '24px'}}>
            <div className="dashboard-card hover-lift" style={{background: '#fff7ed', border: '1px solid #ffedd5'}}>
              <h2 className="dashboard-card-title" style={{color: '#c2410c', marginBottom: '16px'}}>
                <InfoCircleOutlined style={{marginRight: '8px'}} /> Pending Actions / Alerts
              </h2>
              <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
                {safeComplaints.filter(c => {
                  const days = Math.floor((new Date() - new Date(c.createdAt)) / (1000 * 60 * 60 * 24));
                  return days > 3 && c.status === 'Pending';
                }).length > 0 && (
                  <div style={{display: 'flex', gap: '12px', padding: '12px', background: '#fee2e2', borderRadius: '8px', borderLeft: '4px solid #ef4444'}}>
                    <span style={{fontSize: '1.2rem'}}>⚠️</span>
                    <div>
                      <div style={{fontWeight: '600', color: '#b91c1c'}}>Attention Required</div>
                      <div style={{fontSize: '0.85rem', color: '#7f1d1d'}}>{safeComplaints.filter(c => Math.floor((new Date() - new Date(c.createdAt)) / (1000 * 60 * 60 * 24)) > 3 && c.status === 'Pending').length} complaints pending &gt; 3 days</div>
                    </div>
                  </div>
                )}
                
                <div style={{display: 'flex', gap: '12px', padding: '12px', background: '#dbeafe', borderRadius: '8px', borderLeft: '4px solid #3b82f6'}}>
                  <span style={{fontSize: '1.2rem'}}>💬</span>
                  <div>
                    <div style={{fontWeight: '600', color: '#1e3a8a'}}>Waiting for Response</div>
                    <div style={{fontSize: '0.85rem', color: '#1e3a8a'}}>{safeComplaints.filter(c => c.comments && c.comments.length > 0 && c.comments[c.comments.length-1].sender === 'Admin').length} awaiting your action</div>
                  </div>
                </div>

                {safeComplaints.filter(c => c.status === 'In Progress').length > 0 && (
                  <div style={{display: 'flex', gap: '12px', padding: '12px', background: '#fef9c3', borderRadius: '8px', borderLeft: '4px solid #eab308'}}>
                    <span style={{fontSize: '1.2rem'}}>🔄</span>
                    <div>
                      <div style={{fontWeight: '600', color: '#854d0e'}}>In Progress</div>
                      <div style={{fontSize: '0.85rem', color: '#854d0e'}}>{safeComplaints.filter(c => c.status === 'In Progress').length} complaints being addressed</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="dashboard-card hover-lift">
              <h2 className="dashboard-card-title" style={{marginBottom: '20px'}}>
                <span style={{marginRight: '8px', color: '#f59e0b'}}>⚡</span> Quick Links
              </h2>
              <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
                <Link to="/raise-complaint" style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: '#f8fafc', borderRadius: '8px', textDecoration: 'none', color: '#1e293b'}}>
                   <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                      <div style={{width: '32px', height: '32px', background: '#dbeafe', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6'}}>+</div>
                      <div>Raise New Complaint</div>
                   </div>
                   <div style={{fontWeight: 'bold', color: '#94a3b8'}}>&rarr;</div>
                </Link>
                <a href="/profile" style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: '#f8fafc', borderRadius: '8px', textDecoration: 'none', color: '#1e293b'}}>
                   <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                      <div style={{width: '32px', height: '32px', background: '#dcfce7', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#22c55e'}}>👤</div>
                      <div>View Profile Stats</div>
                   </div>
                   <div style={{fontWeight: 'bold', color: '#94a3b8'}}>&rarr;</div>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-footer">
        &copy; 2026 <strong>TrackEase Pro</strong>. All rights reserved.
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

        {/* Attachment Preview Modal */}
        <Modal
          title={<span style={{fontWeight: 'bold'}}>Preview Attachment</span>}
          open={attachmentModalVisible}
          footer={
            <Button type="primary" icon={<DownloadOutlined />} onClick={() => {
              const a = document.createElement('a');
              a.href = previewAttachment?.url;
              a.download = previewAttachment?.name;
              a.click();
            }}>
              Download
            </Button>
          }
          onCancel={() => setAttachmentModalVisible(false)}
        >
          {previewAttachment && (
            <div style={{textAlign: 'center'}}>
              {previewAttachment.type.includes('image') ? (
                <img src={previewAttachment.url} alt="preview" style={{maxWidth: '100%', maxHeight: '400px'}} />
              ) : (
                <p style={{padding: '40px', background: '#f1f5f9', borderRadius: '8px', fontWeight: 'bold'}}>
                  {previewAttachment.name} (PDF/Document)
                </p>
              )}
              <div style={{marginTop: '10px', fontSize: '0.85rem', color: '#64748b'}}>
                Uploaded by: {previewAttachment.uploadedBy || 'User'}
              </div>
            </div>
          )}
        </Modal>
    </div>
    </div>
  );
};

export default UserPanel;
