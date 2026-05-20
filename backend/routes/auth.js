const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getUserProfile, getUsers } = require('../controllers/authController');
const { protect, admin } = require('../middleware/auth');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile', protect, getUserProfile);
router.get('/users', protect, getUsers);

module.exports = router;
