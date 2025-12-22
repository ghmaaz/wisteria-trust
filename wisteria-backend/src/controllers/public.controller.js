const Verification = require('../models/Verification');
const Seller = require('../models/Seller');

exports.verifySellerPublic = async (req, res) => {
  try {
    const { vid } = req.query;

    if (!vid) {
      return res.status(400).json({
        message: 'Verification ID is required'
      });
    }

    // Find verification
    const verification = await Verification.findOne({
      verification_id: vid
    }).populate('seller_id');

    if (!verification) {
      return res.status(404).json({
        status: 'Not Verified',
        message: 'This seller is not verified by Wisteria Trust'
      });
    }

    // Check status
    if (verification.status !== 'active') {
      return res.json({
        seller_name: verification.seller_id.seller_name,
        business_name: verification.seller_id.business_name,
        status: verification.status.toUpperCase(),
        message: 'This verification is no longer active',
        disclaimer: 'Identity & legitimacy verified only'
      });
    }

    // Check expiry
    const now = new Date();
    if (verification.expiry_date < now) {
      verification.status = 'expired';
      await verification.save();

      return res.json({
        seller_name: verification.seller_id.seller_name,
        business_name: verification.seller_id.business_name,
        status: 'EXPIRED',
        valid_till: verification.expiry_date,
        disclaimer: 'Identity & legitimacy verified only'
      });
    }

    // Active & valid
    return res.json({
      seller_name: verification.seller_id.seller_name,
      business_name: verification.seller_id.business_name,
      country: verification.seller_id.country,
      status: 'ACTIVE',
      valid_till: verification.expiry_date,
      verification_id: verification.verification_id,
      verified_by: 'Wisteria Trust',
      disclaimer: 'Identity & legitimacy verified only'
    });

  } catch (error) {
    console.error('Public verify error:', error);
    res.status(500).json({
      message: 'Server error'
    });
  }
};
