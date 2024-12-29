const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const token = req.cookies.authToken; // Ensure the cookie name matches
  console.log('Token received:', token);

  if (!token) {
    console.log('No token found. Redirecting to /auth/login');
    return res.redirect('/auth/login');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify the JWT
    console.log('Decoded token:', decoded);
    req.user = decoded; // Attach user info to the request object
    next(); // Proceed to the next middleware/route handler
  } catch (err) {
    console.error('JWT verification failed:', err.message);
    res.clearCookie('authToken');
    res.redirect('/auth/login');
  }
};

module.exports = authMiddleware;


