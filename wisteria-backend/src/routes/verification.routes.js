import express from "express";
import {
  createVerification,
  publicVerify
} from "../controllers/verification.controller.js";
import { protectAdmin } from "../middlewares/adminAuth.js";
import { getAllVerifications } from "../controllers/verification.controller.js";

const router = express.Router();

/**
 * Admin create verification
 */
router.post("/verification", protectAdmin, createVerification);
router.get("/admin/verifications", protectAdmin, getAllVerifications);
/**
 * Public verify
 */
router.get("/verify/:id", publicVerify);

export default router;
