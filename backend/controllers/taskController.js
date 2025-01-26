const Task = require('../models/Task');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');

exports.getTasks = async (req, res) => {
    try {
      // Fetch tasks associated with the logged-in user
      const tasks = await Task.find({ userId: req.user.id});
      res.status(200).json({tasks});
    } catch (err) {
      console.error('Error fetching pending tasks:', err);
      res.status(500).json({ error: 'Error fetching pending tasks' });
    }
  };
  exports.getPendingTasks = async (req, res) => {
    try {
      const tasks = await Task.find({ userId: req.user.id, completed: false });
      console.log('Fetched pending tasks:', tasks); // Log tasks for debugging
      res.status(200).json({ tasks });
    } catch (err) {
      console.error('Error fetching pending tasks:', err);
      res.status(500).json({ error: 'Error fetching pending tasks' });
    }
  };
  
  exports.getCompletedTasks = async (req, res) => {
    try {
      const tasks = await Task.find({ userId: req.user.id, completed: true });
      console.log('Fetched pending tasks:', tasks); // Log tasks for debugging
      res.status(200).json({ tasks });
    } catch (err) {
      console.error('Error fetching pending tasks:', err);
      res.status(500).json({ error: 'Error fetching pending tasks' });
    }
  };
  
  

  exports.addTask = async (req, res) => {
    const { title, dueDate,dueTime, priority,} = req.body;
  
    try {
      // Check if the task already exists
      const existingTask = await Task.findOne({ user: req.user.id, title, dueDate });
  
      if (existingTask) {
        return res.status(400).json({ error: 'Task with this title and due date already exists' });
      }
      console.log(req.user);
      // Create and save new task if it doesn't exist
      const task = new Task({ userId: req.user.id, title, dueDate,dueTime, priority });
      await task.save();
      res.status(200).json({task});

      // Send email notification
      await sendEmail(req.user.email, title, dueDate, priority);
    } catch (err) {
      console.error('Error adding task:', err.message);
      res.status(500).json({ error: 'Error adding task' });
    }
  };
  
  

