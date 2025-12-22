import express from "express";
import { adminLogin } from "../controllers/admin.controller.js";
import {
  createVerification,
  getAllVerifications
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
 * Admin get all verifications (protected)  ✅ NEW
 */
router.get("/verifications", protectAdmin, getAllVerifications);

export default router;
