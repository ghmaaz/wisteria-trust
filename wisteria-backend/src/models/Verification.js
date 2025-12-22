const mongoose = require('mongoose');

const verificationSchema = new mongoose.Schema({
  verification_id: {
    type: String,
    unique: true,
    required: true
  },
  seller_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Seller',
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'expired', 'revoked'],
    default: 'active'
  },
  issue_date: {
    type: Date,
    default: Date.now
  },
  expiry_date: {
    type: Date,
    required: true
  },
  internal_notes: {
    type: String
  },
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Verification', verificationSchema);
