const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['chat', 'status_update', 'issue_update'],
      required: true,
    },
    read: {
      type: Boolean,
      default: false,
    },
    complaintId: {
       type: mongoose.Schema.Types.ObjectId,
       ref: 'Complaint',
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', notificationSchema);
