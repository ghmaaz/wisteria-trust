import express from "express";
import { adminLogin } from "../controllers/admin.controller.js";
import {
  createVerification,
  getAllVerifications,
  revokeVerification,
  expireVerification,
  extendVerification
} from "../controllers/verification.controller.js";
import { protectAdmin } from "../middlewares/adminAuth.js";

const router = express.Router();

/**
 * Admin login
 */
router.post("/login", adminLogin);

/**
 * Admin create verification (protected)
 */
router.post("/verification", protectAdmin, createVerification);

/**
 * Admin get all verifications (protected)
 */
router.get("/verifications", protectAdmin, getAllVerifications);

/**
 * Admin revoke verification (protected)
 */
router.patch(
  "/verification/:id/revoke",
  protectAdmin,
  revokeVerification
);

/**
 * Admin expire verification (protected)
 */
router.patch(
  "/verification/:id/expire",
  protectAdmin,
  expireVerification
);

/**
 * Admin extend verification expiry (protected)
 */
router.patch(
  "/verification/:id/extend",
  protectAdmin,
  extendVerification
);

export default router;
