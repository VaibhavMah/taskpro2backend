const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');

const router=express.Router()

const Task = require('../models/Task'); // Import your Task model

router.get('/dashboard', authMiddleware, async (req, res) => {
  try {
    // Fetch user-specific tasks
    const tasks = await Task.find({ userId: req.user.id });
    // Render the dashboard with the user's email and tasks
    res.render('tasks/dashboard', {email: req.user.email,tasks: tasks});
  } catch (err) {
    console.error('Error fetching tasks:', err);
    res.status(500).send('Internal Server Error');
  }
});

router.get('/add-task', authMiddleware, (req, res) => {
    res.render('tasks/addTask'); 
  });
  
  router.post('/add-task', authMiddleware, async (req, res) => {
    const { title, dueDate, dueTime, priority } = req.body;
  
    console.log('Request body:', req.body);  // Check incoming request data
  
    try {
      const today = new Date();
      const dueDateObj = new Date(dueDate);
  
      // Validate that the due date is not in the past
      if (dueDateObj < today.setHours(0, 0, 0, 0)) {
        console.log('Due date is in the past');
        return res.status(400).send('Due date cannot be in the past.');
      }
  
      // Ensure dueTime is present
      if (!dueTime) {
        console.log('Due time is missing');
        return res.status(400).send('Due time is required.');
      }
  
      // Split the dueTime into hours and minutes
      const [hours, minutes] = dueTime.split(':');
      if (hours && minutes) {
        dueDateObj.setHours(hours, minutes, 0, 0);  // Set the time on the dueDate
      }
  
      console.log('Due Date with Time:', dueDateObj);
  
      // Create the task if the validation passes
      await Task.create({
        title,
        dueDate: dueDateObj,  // Store the complete date with time
        dueTime,  // Save the time as a string (e.g., '21:00')
        priority,
        userId: req.user.id,
      });
  
      res.redirect('/dashboard');
    } catch (err) {
      console.error('Error adding task:', err);
      res.status(500).send('Internal Server Error');
    }
  });
  
  

  
  

module.exports=router

