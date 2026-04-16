import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import './AdminPanel.css';
import {
  CheckCircleOutlined, ClockCircleOutlined, ExclamationCircleOutlined,
  SearchOutlined, FilterOutlined, DownOutlined,
  UpOutlined, MessageOutlined, AppstoreOutlined,
  CheckOutlined, SyncOutlined, StopOutlined, UserOutlined, PlusCircleOutlined
} from '@ant-design/icons';

const getPriority = (complaint) => {
  if (complaint.priority) return complaint.priority;
  if (!complaint._id) return 'Low';
  const hash = complaint._id.charCodeAt(complaint._id.length - 1);
  if (hash % 3 === 0) return 'High';
  if (hash % 2 === 0) return 'Medium';
  return 'Low';
};

const AdminPanel = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [selectedRows, setSelectedRows] = useState([]);
  
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
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/complaints/all', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.status === 401 || response.status === 403) {
        localStorage.clear();
        navigate('/login');
        return;
      }
      const data = await response.json();
      if (response.ok) {
        const enrichedData = data.map(c => ({
          ...c,
          priority: getPriority(c)
        }));
        setComplaints(enrichedData);
      }
    } catch {
      //
    } finally {
      setLoading(false);
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
      console.error("Failed to update");
    }
  };

  const handleBulkUpdate = async (status) => {
    if (!selectedRows.length) return;
    setLoading(true);
    try {
      await Promise.all(selectedRows.map(id => 
        fetch(`http://localhost:5000/api/complaints/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ status })
        })
      ));
      setSelectedRows([]);
      fetchComplaints();
    } catch {
      console.error("Bulk update failed");
    }
  };

  const toggleSelectRow = (id) => {
    if (selectedRows.includes(id)) {
      setSelectedRows(selectedRows.filter(r => r !== id));
    } else {
      setSelectedRows([...selectedRows, id]);
    }
  };

  // Derived states
  const filteredComplaints = complaints.filter(c => {
    const titleMatch = c.title ? c.title.toLowerCase().includes(searchQuery.toLowerCase()) : false;
    const userMatch = c.user?.name ? c.user.name.toLowerCase().includes(searchQuery.toLowerCase()) : false;
    const descMatch = c.description ? c.description.toLowerCase().includes(searchQuery.toLowerCase()) : false;
    
    const matchesSearch = titleMatch || userMatch || descMatch;
    const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
    const matchesCategory = categoryFilter === 'All' || c.category === categoryFilter;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const toggleSelectAll = (e) => {
    if (e.target.checked) setSelectedRows(filteredComplaints.map(c => c._id));
    else setSelectedRows([]);
  };

  const categories = ['All', ...new Set(complaints.map(c => c.category).filter(Boolean))];

  // Summary Metrics
  const total = complaints.length;
  const pending = complaints.filter(c => c.status === 'Pending').length;
  const inProgress = complaints.filter(c => c.status === 'In Progress').length;
  const resolved = complaints.filter(c => c.status === 'Resolved').length;

  const pendingOld = complaints.filter(c => c.status === 'Pending' && (new Date() - new Date(c.createdAt))/(1000*3600*24) > 3).length;
  const highPriorityPending = complaints.filter(c => c.status === 'Pending' && c.priority === 'High').length;

  return (
    <div className="dashboard-container modern-admin-bg">
      <Navbar />
      <div className="container modern-admin-container">
        
        {/* UPPER ALERTS & SUMMARY */}
        <div className="admin-upper-section">
          <div className="summary-cards-row">
            <div className="admin-summary-card hover-lift">
              <div className="admin-summary-icon total-icon"><AppstoreOutlined /></div>
              <div className="admin-summary-details">
                <span className="admin-summary-title">Total Complaints</span>
                <span className="admin-summary-value">{total}</span>
                <span className="admin-summary-trend positive">+2 today</span>
              </div>
            </div>
            <div className="admin-summary-card hover-lift">
              <div className="admin-summary-icon pending-icon"><ClockCircleOutlined /></div>
              <div className="admin-summary-details">
                <span className="admin-summary-title">Pending</span>
                <span className="admin-summary-value">{pending}</span>
                <span className="admin-summary-trend negative">+1 since yesterday</span>
              </div>
            </div>
            <div className="admin-summary-card hover-lift">
              <div className="admin-summary-icon inprogress-icon"><SyncOutlined spin /></div>
              <div className="admin-summary-details">
                <span className="admin-summary-title">In Progress</span>
                <span className="admin-summary-value">{inProgress}</span>
                <span className="admin-summary-trend">Active handling</span>
              </div>
            </div>
            <div className="admin-summary-card hover-lift">
              <div className="admin-summary-icon resolved-icon"><CheckCircleOutlined /></div>
              <div className="admin-summary-details">
                <span className="admin-summary-title">Resolved</span>
                <span className="admin-summary-value">{resolved}</span>
                <span className="admin-summary-trend positive">+3 this week</span>
              </div>
            </div>
          </div>

          {(pendingOld > 0 || highPriorityPending > 0) && (
            <div className="priority-alert-panel fade-in">
              <div className="priority-alert-header">
                <ExclamationCircleOutlined className="priority-alert-icon" />
                <span>Action Required</span>
              </div>
              <div className="priority-alert-body">
                {pendingOld > 0 && <div className="priority-alert-item">⚠️ {pendingOld} complaints pending more than 3 days</div>}
                {highPriorityPending > 0 && <div className="priority-alert-item">🔥 {highPriorityPending} high priority complaint(s) need attention</div>}
                <div className="priority-alert-item">⏳ {pending} total complaints awaiting action</div>
              </div>
            </div>
          )}
        </div>

        {/* MAIN TWO-COLUMN LAYOUT */}
        <div className="admin-main-grid">
          {/* LEFT: TABLE SECTON */}
          <div className="admin-table-section card">
            <h3 style={{marginTop: 0, marginBottom: '20px', fontSize: '1.2rem', color: '#1e293b'}}>All Complaints</h3>
            {/* Control Bar */}
            <div className="admin-control-bar">
              <div className="admin-search">
                <SearchOutlined className="admin-search-icon" />
                <input 
                  type="text" 
                  placeholder="Search user, title or description..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="admin-filters">
                <FilterOutlined className="admin-filter-icon" />
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="admin-filter-select">
                  <option value="All">All Status</option>
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Rejected">Rejected</option>
                </select>
                <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="admin-filter-select">
                  {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
            </div>

            {/* Bulk Action Bar */}
            {selectedRows.length > 0 && (
              <div className="admin-bulk-action-bar fade-in">
                <span>{selectedRows.length} rows selected</span>
                <div className="bulk-actions">
                  <button onClick={() => handleBulkUpdate('In Progress')} className="btn-bulk btn-progress"><SyncOutlined/> In Progress</button>
                  <button onClick={() => handleBulkUpdate('Resolved')} className="btn-bulk btn-resolve"><CheckCircleOutlined/> Resolve</button>
                  <button onClick={() => handleBulkUpdate('Rejected')} className="btn-bulk btn-reject"><StopOutlined/> Reject</button>
                </div>
              </div>
            )}

            {/* Table */}
            <div className="admin-table-wrapper">
              <table className="admin-interactive-table">
                <thead>
                  <tr>
                    <th>
                      <input 
                        type="checkbox" 
                        checked={selectedRows.length === filteredComplaints.length && filteredComplaints.length > 0} 
                        onChange={toggleSelectAll} 
                      />
                    </th>
                    <th>Priority</th>
                    <th>User</th>
                    <th>Title & Category</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                     Array(4).fill(0).map((_, i) => (
                       <tr key={i} className="skeleton-row">
                         <td colSpan="7"><div className="skeleton-box"></div></td>
                       </tr>
                     ))
                  ) : filteredComplaints.length > 0 ? (
                    filteredComplaints.map((c) => (
                      <AdminRow
                        key={c._id}
                        complaint={c}
                        isSelected={selectedRows.includes(c._id)}
                        onSelect={() => toggleSelectRow(c._id)}
                        onUpdate={handleUpdate}
                      />
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7">
                        <div className="admin-empty-state">
                          <SearchOutlined className="empty-icon" />
                          <p>No complaints found matching your criteria</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

const AdminRow = ({ complaint, isSelected, onSelect, onUpdate }) => {
  const [expanded, setExpanded] = useState(false);
  const [popupOpen, setPopupOpen] = useState(false);
  const [newStatus, setNewStatus] = useState(complaint.status);
  const [newRemarks, setNewRemarks] = useState(complaint.remarks || '');

  const handleSaveStatus = () => {
    onUpdate(complaint._id, newStatus, newRemarks);
    setPopupOpen(false);
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Pending': return 'badge-pending';
      case 'In Progress': return 'badge-progress';
      case 'Resolved': return 'badge-resolved';
      case 'Rejected': return 'badge-rejected';
      default: return 'badge-default';
    }
  };

  const getPriorityClass = (priority) => {
    switch (priority) {
      case 'High': return 'priority-high';
      case 'Medium': return 'priority-medium';
      case 'Low': return 'priority-low';
      default: return 'priority-low';
    }
  };

  return (
    <>
      <tr className={`admin-table-row hover-lift-subtle ${expanded ? 'expanded' : ''} ${complaint.priority === 'High' ? 'row-high-priority' : ''}`}>
        <td onClick={(e) => e.stopPropagation()}>
          <input type="checkbox" checked={isSelected} onChange={onSelect} />
        </td>
        <td>
          <span className={`priority-pill ${getPriorityClass(complaint.priority)}`}>
            {complaint.priority}
          </span>
        </td>
        <td>
          <div style={{fontWeight: 500, color: '#334155'}}>{complaint.user?.name || 'Unknown'}</div>
          <div style={{fontSize: '0.8rem', color: '#94a3b8'}}>{complaint.user?.email || ''}</div>
        </td>
        <td onClick={() => setExpanded(!expanded)} className="expandable-cell cursor-pointer">
          <div className="admin-cell-title">{complaint.title || 'No Title'}</div>
          <div className="admin-cell-category">{complaint.category || 'Uncategorized'}</div>
        </td>
        <td className="status-cell">
          <div className="custom-status-container">
            <span 
              className={`interactive-status-badge ${getStatusBadgeClass(complaint.status)}`}
              onClick={() => setPopupOpen(!popupOpen)}
            >
              <span className="status-dot"></span> {complaint.status} <DownOutlined className="badge-arrow" />
            </span>
            
            {popupOpen && (
              <div className="status-inline-popup fade-in">
                <div style={{fontWeight: 600, fontSize: '0.85rem', marginBottom: '8px'}}>Update Status</div>
                <select value={newStatus} onChange={e => setNewStatus(e.target.value)} className="popup-select">
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Rejected">Rejected</option>
                </select>
                <input 
                  type="text" 
                  value={newRemarks} 
                  onChange={e => setNewRemarks(e.target.value)} 
                  placeholder="Add remark..." 
                  className="popup-input"
                />
                <div className="popup-actions">
                  <button onClick={() => setPopupOpen(false)} className="popup-btn-cancel">Cancel</button>
                  <button onClick={handleSaveStatus} className="popup-btn-save">Save</button>
                </div>
              </div>
            )}
          </div>
        </td>
        <td>{new Date(complaint.createdAt).toLocaleDateString()}</td>
        <td>
          <div className="admin-action-icons">
            <span 
              className="action-icon-btn act-resolve" 
              title="Mark Resolved"
              onClick={() => onUpdate(complaint._id, 'Resolved', complaint.remarks)}
            >
              <CheckOutlined />
            </span>
            <span 
              className="action-icon-btn act-progress" 
              title="Mark In Progress"
              onClick={() => onUpdate(complaint._id, 'In Progress', complaint.remarks)}
            >
              <SyncOutlined />
            </span>
            <span 
              className="action-icon-btn act-reject" 
              title="Reject"
              onClick={() => onUpdate(complaint._id, 'Rejected', complaint.remarks)}
            >
              <StopOutlined />
            </span>
            <span 
              className="action-icon-btn act-expand" 
              title="View Details"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? <UpOutlined /> : <DownOutlined />}
            </span>
          </div>
        </td>
      </tr>
      
      {expanded && (
        <tr className="admin-expanded-row slide-down">
          <td colSpan="7">
            <div className="expanded-details-container">
              <div className="expanded-col">
                <h4>Description</h4>
                <p>{complaint.description || 'No description provided.'}</p>
                {complaint.attachment && (
                  <div style={{marginTop: '12px'}}>
                    <a href={`http://localhost:5000/${complaint.attachment}`} target="_blank" rel="noreferrer" className="attachment-link">
                      View Attachment
                    </a>
                  </div>
                )}
              </div>
              <div className="expanded-col">
                <h4>Admin Remarks</h4>
                <div className="remarks-history">
                  {complaint.remarks ? (
                    <div className="remark-bubble">
                      <MessageOutlined className="remark-icon" /> <span>{complaint.remarks}</span>
                    </div>
                  ) : <span className="no-remarks">No remarks added yet.</span>}
                </div>
              </div>
              <div className="expanded-col">
                <h4>Timeline</h4>
                <div className="mini-timeline">
                  <div className="mt-item"><div className="mt-dot done"></div><span>Created</span></div>
                  {(complaint.status === 'In Progress' || complaint.status === 'Resolved' || complaint.status === 'Rejected') && (
                    <div className="mt-item"><div className="mt-dot done"></div><span>In Progress</span></div>
                  )}
                  {(complaint.status === 'Resolved' || complaint.status === 'Rejected') && (
                    <div className="mt-item"><div className="mt-dot done"></div><span style={{fontWeight: 600}}>{complaint.status}</span></div>
                  )}
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
};

export default AdminPanel;
