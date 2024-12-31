const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  dueDate: { type: Date, required: true },
  dueTime: { type: String, required: true },  // This should be String for time like '21:00'
  priority: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  completed: { type: Boolean, default: false }
});


module.exports = mongoose.model('Task', taskSchema);


