const Task = require('../models/Task');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');

exports.getTasks = async (req, res) => {
    try {
      // Fetch tasks associated with the logged-in user
      const tasks = await Task.find({ user: req.user.id });
      
      // Ensure tasks are passed to the EJS template
      res.render('tasks/dashboard', { tasks, user: req.user });
    } catch (err) {
      console.error('Error fetching tasks:', err);
      res.status(500).json({ error: 'Error fetching tasks' });
    }
  };
  

  exports.addTask = async (req, res) => {
    const { title, dueDate, priority } = req.body;
  
    try {
      // Check if the task already exists
      const existingTask = await Task.findOne({ user: req.user.id, title, dueDate });
  
      if (existingTask) {
        return res.status(400).json({ error: 'Task with this title and due date already exists' });
      }
  
      // Create and save new task if it doesn't exist
      const task = new Task({ user: req.user.id, title, dueDate, priority });
      await task.save();
  
      // Send email notification
      await sendEmail(req.user.email, title, dueDate, priority);
  
      res.redirect('/tasks'); // Redirect to the task dashboard
    } catch (err) {
      console.error('Error adding task:', err.message);
      res.status(500).json({ error: 'Error adding task' });
    }
  };
  
  

