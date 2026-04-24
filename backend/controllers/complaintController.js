const Complaint = require('../models/Complaint');
const Notification = require('../models/Notification');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');

const createNotification = async (userId, message, type, complaintId, io) => {
  try {
    const notification = await Notification.create({ userId, message, type, complaintId });
    if (io) {
      io.to(userId.toString()).emit('new_notification', notification);
      console.log(`Socket emitted new_notification to user ${userId}`);
    }
    console.log(`Notification created in DB for user ${userId}: ${message}`);
    return notification;
  } catch (error) {
    console.error('Notification creation failed:', error);
  }
};

const createComplaint = async (req, res) => {
  const { title, description, category, priority, attachments } = req.body;

  if (req.user.role !== 'user') {
    return res.status(403).json({ message: 'Access denied' });
  }

  if (!title || !description || !category) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const complaint = await Complaint.create({
      user: req.user.id,
      title,
      description,
      category,
      priority: priority || 'Medium',
      attachments: attachments || [],
      status: 'Pending',
    });

    res.status(201).json(complaint);
  } catch {
    res.status(500).json({ message: 'Failed to create complaint' });
  }
};

const getMyComplaints = async (req, res) => {
  if (req.user.role !== 'user') {
    return res.status(403).json({ message: 'Access denied' });
  }

  try {
    const complaints = await Complaint.find({ user: req.user.id }).sort({
      createdAt: -1,
    });
    res.json(complaints);
  } catch {
    res.status(500).json({ message: 'Failed to fetch complaints' });
  }
};

const getComplaintCount = async (req, res) => {
  try {
    const count = await Complaint.countDocuments({ user: req.user.id });
    res.json({ count });
  } catch {
    res.status(500).json({ message: 'Failed to fetch complaint count' });
  }
};

const getAllComplaints = async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied' });
  }

  try {
    const complaints = await Complaint.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
    res.json(complaints);
  } catch {
    res.status(500).json({ message: 'Failed to fetch complaints' });
  }
};

const updateComplaintStatus = async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied' });
  }

  const { status, remarks, newComment } = req.body;
  const io = req.app.get('socketio');

  try {
    const complaint = await Complaint.findById(req.params.id).populate('user');

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    let notificationMessage = '';
    let notificationType = '';

    if (status) {
      complaint.status = status;
      notificationMessage = `Your complaint status has been updated to "${status}"`;
      notificationType = 'status_update';
    }

    if (remarks !== undefined) {
      complaint.remarks = remarks;
    }

    if (newComment) {
      complaint.comments.push({ ...newComment, sender: 'Admin' });
      if (!notificationMessage) {
        notificationMessage = 'Admin sent a new message on your complaint';
        notificationType = 'chat';
      }
      // Notify about the message specifically
      io.to(complaint._id.toString()).emit('receive_message', {
         roomId: complaint._id.toString(),
         comment: { ...newComment, sender: 'Admin', date: new Date() }
      });
    }

    await complaint.save();

    if (notificationMessage) {
      await createNotification(complaint.user._id, notificationMessage, notificationType, complaint._id, io);
      
      // Emit status update to user dashboard
      io.to(complaint.user._id.toString()).emit('status_update', {
        id: complaint._id,
        status: complaint.status
      });

      // Send Email to Google Users
      if (complaint.user.authProvider === 'google') {
        console.log(`Triggering email notification for Google user: ${complaint.user.email}`);
        const emailMessage = `
          <html>
            <body>
              <h3>Hello ${complaint.user.name},</h3>
              <p>${notificationMessage}</p>
              <p><strong>Complaint ID:</strong> ${complaint._id}</p>
              <p><strong>Current Status:</strong> ${complaint.status}</p>
              <br>
              <p>Login to Issue Tracker to view more details and reply: <a href="http://localhost:5173/user-panel">Go to Dashboard</a></p>
              <p>Thank you for using our service!</p>
            </body>
          </html>
        `;
        
        sendEmail({
          email: complaint.user.email,
          subject: 'Issue Tracker Notification',
          html: emailMessage
        }).then(() => {
          console.log(`Email successfully queued/sent to ${complaint.user.email}`);
        }).catch(err => {
          console.error(`Failed to send email to ${complaint.user.email}:`, err);
        });
      } else {
        console.log(`Standard user detected (${complaint.user.email}), skipping email notification.`);
      }
    }

    res.json(complaint);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to update complaint' });
  }
};

const updateComplaint = async (req, res) => {
  const { title, description, category, priority, attachments, newComment } = req.body;
  const io = req.app.get('socketio');

  try {
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    // Check ownership
    if (complaint.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (newComment) {
      // Allow adding a comment regardless of status
      complaint.comments.push({ ...newComment, sender: 'User' });
      
      // Emit message to room
      io.to(complaint._id.toString()).emit('receive_message', {
        roomId: complaint._id.toString(),
        comment: { ...newComment, sender: 'User', date: new Date() }
      });

      // Notify Admins
      const admins = await User.find({ role: 'admin' });
      const notificationMessage = `User ${req.user.name} sent a new message on complaint #${complaint._id.toString().slice(-6)}`;
      
      for (const admin of admins) {
        await createNotification(admin._id, notificationMessage, 'chat', complaint._id, io);
        
        // Email Admin if Google User
        if (admin.authProvider === 'google') {
          console.log(`Triggering email notification for Admin (Google user): ${admin.email}`);
          const emailHtml = `
            <html>
              <body>
                <h3>Hello Admin ${admin.name},</h3>
                <p>User <strong>${req.user.name}</strong> sent a new message on complaint #${complaint._id.toString().slice(-6)}.</p>
                <p><strong>Complaint ID:</strong> ${complaint._id}</p>
                <br>
                <p><a href="http://localhost:5173/admin-panel">Go to Admin Dashboard</a></p>
              </body>
            </html>
          `;
          sendEmail({
            email: admin.email,
            subject: 'New Message on Complaint',
            html: emailHtml
          });
        }
      }

    } else {
      // Only allow updating original fields if pending
      if (complaint.status !== 'Pending') {
        return res.status(400).json({ message: 'Cannot edit complaint once it is processed' });
      }

      complaint.title = title || complaint.title;
      complaint.description = description || complaint.description;
      complaint.category = category || complaint.category;
      if (priority) complaint.priority = priority;
      if (attachments) complaint.attachments = attachments;
      
      // Notify Admin about issue update
      const admins = await User.find({ role: 'admin' });
      const notificationMessage = `User ${req.user.name} updated complaint #${complaint._id.toString().slice(-6)}`;
      for (const admin of admins) {
        await createNotification(admin._id, notificationMessage, 'issue_update', complaint._id, io);
      }
    }

    await complaint.save();
    res.json(complaint);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to update complaint' });
  }
};

const deleteComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    // Check ownership
    if (complaint.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Allow deletion of any complaint regardless of status
    // (User requested deletion from dashboard and database upon clicking delete and yes)

    await complaint.deleteOne();
    res.json({ message: 'Complaint removed' });
  } catch {
    res.status(500).json({ message: 'Failed to delete complaint' });
  }
};

module.exports = {
  createComplaint,
  getMyComplaints,
  getComplaintCount,
  getAllComplaints,
  updateComplaintStatus,
  updateComplaint,
  deleteComplaint,
};
