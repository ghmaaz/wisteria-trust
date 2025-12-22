import mongoose from "mongoose";

const verificationSchema = new mongoose.Schema(
  {
    verificationId: {
      type: String,
      required: true,
      unique: true
    },

    sellerName: {
      type: String,
      required: true
    },

    businessName: {
      type: String,
      required: true
    },

    email: {
      type: String,
      required: true
    },

    website: {
      type: String
    },

    city: {
      type: String,
      required: true   // ⚠️ THIS IS IMPORTANT
    },

    status: {
      type: String,
      enum: ["ACTIVE", "REVOKED", "EXPIRED"],
      default: "ACTIVE"
    },

    expiryDate: {
      type: Date,
      required: true
    }
  },
  { timestamps: true }
);

export default mongoose.model("Verification", verificationSchema);
