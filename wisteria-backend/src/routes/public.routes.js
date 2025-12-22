const express = require('express');
const router = express.Router();
const { verifySellerPublic } = require('../controllers/public.controller');

// Public read-only route
router.get('/verify', verifySellerPublic);

module.exports = router;
