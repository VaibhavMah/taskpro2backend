const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const { getTasks} = require('../controllers/taskController');
const Task=require('../models/Task')

const router = express.Router();


router.get('/', authMiddleware, getTasks);
router.post('/toggle-status/:id',authMiddleware, async (req, res) => {
    try {
      const { id } = req.params;
      const task = await Task.findById(id);
  
      if (!task) {
        return res.status(404).send('Task not found');
      }
  
      // Toggle the 'completed' field
      task.completed = !task.completed;
      await task.save();
  
      // Send email notification if the task is marked as done
      const transporter = createTransporter();
      const userEmail = req.user.email; // Assuming `req.user` contains authenticated user's data
  
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: userEmail,
        subject: task.completed ? 'Task Marked as Done' : 'Task Marked as Incomplete',
        text: `Dear User,\n\nThe following task has been updated:\n\nTitle: ${task.title}\nStatus: ${task.completed ? 'Done' : 'Incomplete'}\n\nThank you for using our task management system!`,
      };
  
      await transporter.sendMail(mailOptions);
  
      res.redirect('/dashboard');
    } catch (err) {
      console.error('Error toggling task status or sending email:', err);
      res.status(500).send('Internal Server Error');
    }
  });
module.exports = router;


