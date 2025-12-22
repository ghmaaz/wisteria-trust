import Verification from "../models/verification.model.js";
import generateVerificationId from "../utils/generateVerificationId.js";

export const createVerification = async (req, res) => {
  try {
    const {
      sellerName,
      businessName,
      email,
      website,
      city,              // 🔴 YAHI MISSING THI
      expiryDate
    } = req.body;

    if (!sellerName || !businessName || !email || !city || !expiryDate) {
      return res.status(400).json({
        success: false,
        message: "Required fields missing"
      });
    }

    const verificationId = await generateVerificationId();

    const verification = await Verification.create({
      verificationId,
      sellerName,
      businessName,
      email,
      website,
      city,             // ✅ PASS KAR DIYA
      expiryDate
    });

    res.status(201).json({
      success: true,
      message: "Verification created successfully",
      data: {
        verificationId: verification.verificationId,
        status: verification.status
      }
    });

  } catch (error) {
    console.error("Create verification error:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};
