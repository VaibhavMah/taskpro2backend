const express = require('express');
const { register, loginUser,validateToken,setUsername, verifyCode } = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

// Registration endpoint
router.post('/register', register);

// Login endpoint
router.post('/login', loginUser);

router.post('/verify-code',verifyCode);

router.post('/set-username',authMiddleware,setUsername)

router.get('/validate-token',validateToken)
// Handle logout by clearing the authentication cookie
router.get('/logout', (req, res) => {
  res.clearCookie('authToken');  // Clear the auth cookie
  res.json({ message: 'Logged out successfully' });  // Respond with a JSON message
});

module.exports = router;
