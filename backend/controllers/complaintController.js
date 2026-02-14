const Complaint = require('../models/Complaint');

const createComplaint = async (req, res) => {
  const { title, description, category } = req.body;

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

  const { status, remarks } = req.body;

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

    await complaint.save();
    res.json(complaint);
  } catch {
    res.status(500).json({ message: 'Failed to update complaint' });
  }
};

module.exports = {
  createComplaint,
  getMyComplaints,
  getAllComplaints,
  updateComplaintStatus,
};
