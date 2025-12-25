import Verification from "../models/verification.model.js";
import generateVerificationId from "../utils/generateVerificationId.js";

/**
 * ================================
 * CREATE VERIFICATION (ADMIN ONLY)
 * ================================
 */
export const createVerification = async (req, res) => {
  try {
    const {
      sellerName,
      businessName,
      email,
      website,
      city,
      expiryDate
    } = req.body;

    // ✅ Validate required fields
    if (!sellerName || !businessName || !email || !city || !expiryDate) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided"
      });
    }

    // 🔐 Generate unique verification ID
    const verificationId = await generateVerificationId();

    // 🧾 Create verification record
    const verification = await Verification.create({
      verificationId,
      sellerName,
      businessName,
      email,
      website,
      city,
      status: "ACTIVE",
      expiryDate
    });

    return res.status(201).json({
      success: true,
      message: "Verification created successfully",
      data: verification
    });
  } catch (error) {
    console.error("Create verification error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

/**
 * ================================
 * PUBLIC VERIFY (NO AUTH)
 * ================================
 */
export const publicVerify = async (req, res) => {
  try {
    const { id } = req.params;

    const verification = await Verification.findOne({
      verificationId: id
    }).lean();

    if (!verification) {
      return res.status(404).json({
        verified: false,
        message: "Verification not found"
      });
    }

    // ⏰ Expiry check
    if (new Date(verification.expiryDate) < new Date()) {
      return res.json({
        verified: false,
        status: "EXPIRED",
        sellerName: verification.sellerName
      });
    }

    // 🚫 Status check
    if (verification.status !== "ACTIVE") {
      return res.json({
        verified: false,
        status: verification.status
      });
    }

    // ✅ Verified
    return res.json({
      verified: true,
      status: "ACTIVE",
      verificationId: verification.verificationId,
      sellerName: verification.sellerName,
      businessName: verification.businessName,
      website: verification.website,
      city: verification.city,
      validTill: verification.expiryDate
    });
  } catch (error) {
    console.error("Public verify error:", error.message);

    return res.status(500).json({
      verified: false,
      message: "Internal server error"
    });
  }
};

export const getAllVerifications = async (req, res) => {
  try {
    const list = await Verification.find().sort({ createdAt: -1 });
    res.json({ success: true, data: list });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};
export const revokeVerification = async (req, res) => {
  try {
    const { id } = req.params;

    const verification = await Verification.findOneAndUpdate(
      { verificationId: id },
      { status: "REVOKED" },
      { new: true }
    );

    if (!verification) {
      return res.status(404).json({
        success: false,
        message: "Verification not found"
      });
    }

    res.json({
      success: true,
      message: "Verification revoked",
      data: verification
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};
export const expireVerification = async (req, res) => {
  try {
    const { id } = req.params;

    const verification = await Verification.findOneAndUpdate(
      { verificationId: id },
      { status: "EXPIRED" },
      { new: true }
    );

    if (!verification) {
      return res.status(404).json({
        success: false,
        message: "Verification not found"
      });
    }

    res.json({
      success: true,
      message: "Verification expired",
      data: verification
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

export const extendVerification = async (req, res) => {
  try {
    const { id } = req.params;
    const { expiryDate } = req.body;

    if (!expiryDate) {
      return res.status(400).json({
        success: false,
        message: "Expiry date is required"
      });
    }

    const verification = await Verification.findOneAndUpdate(
      { verificationId: id },
      { expiryDate },
      { new: true }
    );

    if (!verification) {
      return res.status(404).json({
        success: false,
        message: "Verification not found"
      });
    }

    res.json({
      success: true,
      message: "Expiry date updated",
      data: verification
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};
export const updateVerification = async (req, res) => {
  try {
    const { id } = req.params;

    const updateData = {};
    const fields = ["sellerName", "businessName", "city", "email", "expiryDate"];

    fields.forEach(f => {
      if (req.body[f] !== undefined) {
        updateData[f] = req.body[f];
      }
    });

    const updated = await Verification.findOneAndUpdate(
      { verificationId: id },
      { $set: updateData },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Verification not found"
      });
    }

    res.json({
      success: true,
      message: "Verification updated",
      data: updated
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};



