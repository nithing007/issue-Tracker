const Complaint = require('../models/Complaint');

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

  try {
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    if (status) {
      complaint.status = status;
    }

    if (remarks !== undefined) {
      complaint.remarks = remarks;
    }

    if (newComment) {
      complaint.comments.push({ ...newComment, sender: 'Admin' });
    }

    await complaint.save();
    res.json(complaint);
  } catch {
    res.status(500).json({ message: 'Failed to update complaint' });
  }
};

const updateComplaint = async (req, res) => {
  const { title, description, category, priority, attachments, newComment } = req.body;

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
    }

    await complaint.save();
    res.json(complaint);
  } catch {
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
  getAllComplaints,
  updateComplaintStatus,
  updateComplaint,
  deleteComplaint,
};
