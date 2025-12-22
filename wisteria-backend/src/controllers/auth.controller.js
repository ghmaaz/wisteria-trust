const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const { comparePassword } = require('../utils/hashPassword');

const JWT_EXPIRES_IN = '2h';

exports.loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' });
    }

    const admin = await Admin.findOne({ email });

    if (!admin) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const passwordMatch = await comparePassword(password, admin.password_hash);

    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      {
        adminId: admin._id,
        role: admin.role
      },
      process.env.JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    admin.last_login = new Date();
    await admin.save();

    res.json({
      token,
      admin: {
        name: admin.name,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
