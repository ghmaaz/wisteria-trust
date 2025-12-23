import express from "express";
import { adminLogin } from "../controllers/admin.controller.js";
import {
  createVerification,
  getAllVerifications,
  revokeVerification,
  expireVerification,
  extendVerification     // ⭐ NEW
} from "../controllers/verification.controller.js";

import { protectAdmin } from "../middlewares/adminAuth.js";
import { expireVerification } from "../controllers/verification.controller.js";

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
 * Admin revoke verification (protected) 🔴 NEW
 */
router.patch(
  "/verification/:id/revoke",
  protectAdmin,
  revokeVerification
);


router.patch(
  "/verification/:id/expire",
  protectAdmin,
  expireVerification
);

router.patch(
  "/verification/:id/extend",
  protectAdmin,
  extendVerification
);

export default router;


