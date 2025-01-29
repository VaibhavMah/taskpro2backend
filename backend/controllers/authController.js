const jwt = require('jsonwebtoken');
const User = require('../models/User');
const bcryptjs = require('bcrypt');
const crypto=require('crypto');
const sendVerificationEmail=require('../utils/sendVerification')
const generateVerificationCode = (length = 4) => {
  // Generate random bytes and convert to a base36 string (numbers + letters)
  code= crypto.randomBytes(length).toString('hex').slice(0, length);
  return code;
};

exports.register = async (req, res) => {
  const { email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: 'User already exists' });

    const verificationCode=generateVerificationCode();
    const verificationCodeExpiry = Date.now() + 10 * 60 * 1000;
    const user = new User({ email,
       password,
       username:null,
       isVerified:false,
       verificationCode,
       verificationCodeExpiry });
     
    await user.save();
    await sendVerificationEmail(email,verificationCode);

    const token = jwt.sign(
      { id: user._id, email: user.email, username: user.username || null },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    console.log("User is ", user);

     res.status(200).json({
      message: ' Please verify your email with the code sent to your email address.',
      token,
      user: { id: user._id, email: user.email, username: user.username },
      needsUsername: !user.username,// Indicates if the username is missing
      needsVerification: !user.isVerified 
    });
  }
    catch (err) {
      console.error('Error during registration:', err);
    res.status(500).json({ error: 'Registration failed' });
  }
};

// Example login function
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const isPasswordValid = await bcryptjs.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, username: user.username || null },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    console.log("User is ", user);

     res.status(200).json({
      message: 'Login successful',
      token,
      user: { id: user._id, email: user.email, username: user.username },
      needsUsername: !user.username, // Indicates if the username is missing
    });
  } catch (err) {
    console.error('Error during login:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};



exports.validateToken = (req, res) => {
  const token = req.headers.authorization?.split(' ')[1]; // Extract token from "Bearer <token>"
  console.log(token);

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user=decoded;
    return res.status(200).json({ message: 'Token is valid', user: decoded });
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};


exports.setUsername = async (req, res) => {
  console.log('req body',req.body);
  console.log('Decoded User from Token:', req.user);
  const { username } = req.body;
  const userId = req.user.id; // Get user from JWT

  try {
    const user = await User.findById(userId);
    user.username = username;
    await user.save();

    return res.status(200).json({ message: 'Username set successfully' });
  } catch (err) {
    console.error('Error setting username:', err);
    return res.status(500).json({ error: 'Error setting username' });
  }
};

exports.verifyCode = async (req, res) => {
  const { email, code } = req.body;

  try {
    // Validate input
    if (!email || !code) {
      return res.status(400).json({ error: 'Email and verification code are required' });
    }

    // Log the incoming email and code for debugging
    console.log(`Email: ${email}, Code: ${code}`);

    // Find the user with the provided email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: 'User not found. Please register again.' });
    }

    if (user.isVerified) {
      return res.status(400).json({ error: 'User is already verified.' });
    }

    // Compare the entered code with the stored code
    if (user.verificationCode !== code) {
      return res.status(400).json({ error: 'Invalid verification code. Please try again.' });
    }

    // Check if the code has expired
    if (user.verificationCodeExpiry && Date.now() > user.verificationCodeExpiry) {
      return res.status(400).json({ error: 'Verification code has expired. Please register again.' });
    }

    // Mark user as verified and clear the code
    user.isVerified = true;
    user.verificationCode = undefined; // Clear the code after successful verification
    user.verificationCodeExpiry = undefined; // Clear expiry time
    await user.save();

    res.status(200).json({ message: 'Email verified successfully!' });
  } catch (error) {
    console.error('Error verifying code:', error);
    res.status(500).json({ error: 'Verification failed. Please try again later.' });
  }
};
