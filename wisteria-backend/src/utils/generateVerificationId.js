import Verification from "../models/verification.model.js";

/**
 * Generates a new Verification ID
 * Format: WT-YYYY-001
 * Example: WT-2025-001
 */
const generateVerificationId = async () => {
  const year = new Date().getFullYear();

  // Find last verification of current year
  const lastVerification = await Verification.findOne({
    verificationId: { $regex: `^WT-${year}-` }
  }).sort({ createdAt: -1 });

  let nextNumber = 1;

  if (lastVerification) {
    const lastId = lastVerification.verificationId; // WT-2025-007
    const parts = lastId.split("-");
    nextNumber = parseInt(parts[2], 10) + 1;
  }

  const paddedNumber = String(nextNumber).padStart(3, "0");

  return `WT-${year}-${paddedNumber}`;
};

export default generateVerificationId;
