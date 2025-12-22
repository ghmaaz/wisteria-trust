import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1️⃣ Email check
    if (email !== process.env.ADMIN_EMAIL) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // 2️⃣ Password compare
    const isMatch = await bcrypt.compare(
      password,
      process.env.ADMIN_PASSWORD_HASH
    );

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // 3️⃣ JWT generate
    const token = jwt.sign(
      { role: "admin", email },
      process.env.JWT_SECRET,
      { expiresIn: "12h" }
    );

    // 4️⃣ Success response
    return res.json({
      message: "Admin login successful",
      token
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};
