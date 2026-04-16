import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ComplaintForm = () => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('Hardware');
    const [priority, setPriority] = useState('Medium');
    const [attachments, setAttachments] = useState([]);
    const [messageText, setMessageText] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        const validFiles = [];
        let errorMsg = '';

        files.forEach(file => {
            if (file.size > 5 * 1024 * 1024) {
                errorMsg = 'Some files exceed the 5MB limit and were not added.';
                return;
            }
            if (!['image/jpeg', 'image/png', 'application/pdf'].includes(file.type)) {
                errorMsg = 'Only JPG, PNG, and PDF files are allowed.';
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setAttachments(prev => [...prev, {
                    name: file.name,
                    type: file.type,
                    url: reader.result,
                    size: file.size,
                    uploadedBy: 'User'
                }]);
            };
            reader.readAsDataURL(file);
        });

        if (errorMsg) setMessageText(errorMsg);
    };

    const removeAttachment = (index) => {
        setAttachments(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessageText('');
        setIsSuccess(false);
        setIsLoading(true);

        try {
            const response = await fetch('http://localhost:5000/api/complaints', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ title, description, category, priority, attachments }),
            });

            if (response.status === 401 || response.status === 403) {
                localStorage.clear();
                navigate('/login');
                return;
            }

            if (response.ok) {
                setTitle('');
                setDescription('');
                setCategory('Hardware');
                setPriority('Medium');
                setAttachments([]);
                setIsSuccess(true);
                setMessageText('Complaint submitted successfully. Estimated resolution: 2-3 days.');
            } else {
                setMessageText('Complaint submission failed');
            }
        } catch {
            setMessageText('Complaint submission failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h3>Raise a Complaint</h3>
            {messageText && (
                <div style={{
                    padding: '10px', 
                    marginBottom: '15px', 
                    borderRadius: '5px', 
                    backgroundColor: isSuccess ? '#d1fae5' : '#fee2e2',
                    color: isSuccess ? '#065f46' : '#991b1b',
                    border: `1px solid ${isSuccess ? '#34d399' : '#f87171'}`
                }}>
                    {messageText}
                </div>
            )}
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Title</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                        className="hover-lift-input"
                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc', marginTop: '5px' }}
                    />
                </div>

                <div style={{ display: 'flex', gap: '15px' }}>
                    <div className="form-group" style={{ flex: 1 }}>
                        <label>Category</label>
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="hover-lift-input"
                            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc', marginTop: '5px' }}
                        >
                            <option value="Hardware">Hardware</option>
                            <option value="Software">Software</option>
                            <option value="Network">Network</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    <div className="form-group" style={{ flex: 1 }}>
                        <label>Priority</label>
                        <select
                            value={priority}
                            onChange={(e) => setPriority(e.target.value)}
                            className="hover-lift-input"
                            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc', marginTop: '5px' }}
                        >
                            <option value="Low">Low</option>
                            <option value="Medium">Medium</option>
                            <option value="High">High</option>
                        </select>
                    </div>
                </div>

                <div className="form-group" style={{ marginTop: '15px' }}>
                    <label>Description</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                        rows="5"
                        className="hover-lift-input"
                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc', marginTop: '5px' }}
                    />
                </div>

                <div className="form-group" style={{ marginTop: '15px' }}>
                    <label>Upload Attachments (optional) <small style={{color: '#666'}}>- JPG, PNG, PDF up to 5MB</small></label>
                    <div style={{
                        border: '2px dashed #94a3b8',
                        borderRadius: '8px',
                        padding: '20px',
                        textAlign: 'center',
                        marginTop: '5px',
                        backgroundColor: '#f8fafc',
                        cursor: 'pointer',
                        position: 'relative'
                    }}>
                        <input
                            type="file"
                            multiple
                            accept="image/jpeg, image/png, application/pdf"
                            onChange={handleFileChange}
                            style={{
                                position: 'absolute',
                                width: '100%',
                                height: '100%',
                                top: 0,
                                left: 0,
                                opacity: 0,
                                cursor: 'pointer'
                            }}
                        />
                        <p style={{ margin: 0, color: '#475569' }}>Drag & drop files here or click to browse</p>
                    </div>
                    
                    {/* Attachments Preview */}
                    {attachments.length > 0 && (
                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '15px' }}>
                            {attachments.map((att, index) => (
                                <div key={index} style={{
                                    position: 'relative', 
                                    border: '1px solid #cbd5e1', 
                                    padding: '5px', 
                                    borderRadius: '5px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    backgroundColor: '#fff'
                                }}>
                                    {att.type.includes('image') ? (
                                        <img src={att.url} alt="preview" style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
                                    ) : (
                                        <div style={{ width: '40px', height: '40px', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold' }}>PDF</div>
                                    )}
                                    <div style={{ fontSize: '12px', maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {att.name}
                                    </div>
                                    <button 
                                        type="button" 
                                        onClick={() => removeAttachment(index)}
                                        style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '16px' }}
                                    >
                                        &times;
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <button 
                    type="submit" 
                    className="hover-lift"
                    disabled={isLoading}
                    style={{ 
                        marginTop: '20px', 
                        width: '100%', 
                        padding: '12px', 
                        borderRadius: '8px', 
                        backgroundColor: '#1890ff', 
                        color: 'white', 
                        border: 'none', 
                        fontWeight: 'bold', 
                        cursor: isLoading ? 'not-allowed' : 'pointer',
                        opacity: isLoading ? 0.7 : 1,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: '8px'
                    }}
                >
                    {isLoading ? (
                        <>
                            <span style={{ 
                                display: 'inline-block', 
                                width: '16px', 
                                height: '16px', 
                                border: '2px solid #fff', 
                                borderTop: '2px solid transparent', 
                                borderRadius: '50%', 
                                animation: 'spin 1s linear infinite' 
                            }}></span>
                            Submitting...
                        </>
                    ) : 'Submit Complaint'}
                </button>
                <style>{`
                    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                    .hover-lift-input:hover, .hover-lift-input:focus { border-color: #1890ff !important; outline: none; box-shadow: 0 0 0 2px rgba(24,144,255,0.2); transition: all 0.2s ease; }
                    .hover-lift { transition: transform 0.2s ease, box-shadow 0.2s ease; }
                    .hover-lift:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
                `}</style>
            </form>
        </div>
    );
};

export default ComplaintForm;
