// models/Task.js
const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  dueDate: { type: Date, required: true },
  priority: { type: String, enum: ['low', 'medium', 'high'], required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },  // Reference to User
});

module.exports = mongoose.model('Task', TaskSchema);
