const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  username: {
    type: String,
    required: false,  // Optional for initial registration
    default: null,  
    },  // Ensure it's set to null by default if not provided
    isVerified: { type: Boolean, default: false },
    verificationCode: { type: String }, // 4-digit code
    codeExpiration: { type: Date }, // Expiration time for the code
  
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

module.exports = mongoose.model('User', userSchema);
