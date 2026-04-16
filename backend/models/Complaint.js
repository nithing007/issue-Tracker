const mongoose = require('mongoose');

const attachmentSchema = new mongoose.Schema({
  name: String,
  type: String,
  url: String,
  size: Number,
  uploadedBy: { type: String, default: 'User' },
  date: { type: Date, default: Date.now }
});

const commentSchema = new mongoose.Schema({
  text: String,
  sender: { type: String, enum: ['User', 'Admin'], default: 'User' },
  date: { type: Date, default: Date.now },
  attachments: [attachmentSchema]
});

const complaintSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      enum: ['Hardware', 'Software', 'Network', 'Other'],
    },
    status: {
      type: String,
      enum: ['Pending', 'In Progress', 'Resolved', 'Rejected'],
      default: 'Pending',
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      default: 'Medium',
    },
    attachments: [attachmentSchema],
    comments: [commentSchema],
    remarks: {
      type: String,
      default: '',
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Complaint', complaintSchema);
