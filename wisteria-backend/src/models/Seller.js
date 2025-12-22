const mongoose = require('mongoose');

const sellerSchema = new mongoose.Schema({
  seller_name: { type: String, required: true },
  business_name: { type: String },
  business_type: { type: String, enum: ['individual', 'company'] },
  contact_email: { type: String },
  contact_phone: { type: String },
  country: { type: String },
  profile_link: { type: String },
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Seller', sellerSchema);
