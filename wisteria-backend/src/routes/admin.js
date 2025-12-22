import express from "express";
import { createVerification } from "../controllers/verificationController.js";
import { adminAuth } from "../middlewares/auth.js";

const router = express.Router();

/**
 * ADMIN: Create Verification
 * POST /api/admin/verification
 */
router.post("/verification", adminAuth, createVerification);

export default router;
