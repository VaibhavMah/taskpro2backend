const express = require('express');
const { register , loginUser } = require('../controllers/authController');

const router = express.Router();

router.post('/register', register);
router.post('/login', loginUser);
// Render the login page
router.get('/login', (req, res) => {
    res.render('auth/login');
  });
  router.get('/logout', (req, res) => {
    res.clearCookie('authToken');
    res.redirect('/auth/login');
});

  

module.exports = router;
