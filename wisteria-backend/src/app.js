import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { apiLimiter } from "./middlewares/rateLimit.js";
import adminRoutes from "./routes/admin.routes.js";
import verificationRoutes from "./routes/verification.routes.js";



dotenv.config();

const app = express();

/* ===============================
   GLOBAL MIDDLEWARES
================================ */
app.use(cors());
app.use(express.json());

/* ===============================
   RATE LIMIT (IMPORTANT)
   Applies to all /api routes
================================ */
app.use("/api", apiLimiter);

app.use("/api/admin", adminRoutes);

app.use("/api", verificationRoutes);

/* ===============================
   HEALTH CHECK
================================ */
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Wisteria Trust Backend is running"
  });
});

/* ===============================
   API PLACEHOLDER
================================ */
app.get("/api/status", (req, res) => {
  res.json({
    service: "Verification Infrastructure",
    status: "Under development",
    note: "No verifications are issued until backend is live"
  });
});

export default app;
