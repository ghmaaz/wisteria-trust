import jwt from "jsonwebtoken";

export const adminAuth = (req, res, next) => {
  try {
    // 1️⃣ Header se token uthao
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "Access denied. Token missing."
      });
    }

    // 2️⃣ "Bearer <token>" format check
    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied. Invalid token format."
      });
    }

    // 3️⃣ Token verify
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 4️⃣ Admin role check
    if (decoded.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Forbidden. Admin access only."
      });
    }

    // 5️⃣ Request me admin data attach
    req.admin = decoded;

    next(); // ✅ allow request

  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token."
    });
  }
};
