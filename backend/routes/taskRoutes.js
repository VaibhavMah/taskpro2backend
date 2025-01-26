const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const { getTasks, addTask, getPendingTasks,getCompletedTasks } = require('../controllers/taskController');
const Task = require('../models/Task');
const sendEmail = require('../utils/sendEmail');

const router = express.Router();

router.get('/', authMiddleware, getTasks);
router.get('/pending',authMiddleware,getPendingTasks)
router.get('/completed',authMiddleware,getCompletedTasks)
router.post('/', authMiddleware, addTask);

router.post('/toggle-status/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { completed } = req.body;

    const task = await Task.findById(id);

    if (!task) {
      return res.status(404).send('Task not found');
    }

    // Toggle the 'completed' field
    task.completed = completed;
    task.completedAt = completed ? new Date() : null;
    await task.save();

    // Send email notification if the task status changes
    const userEmail = req.user.email; // Assuming `req.user` contains authenticated user's data
    const subject = task.completed ? 'Task Marked as Done' : 'Task Marked as Pending';
    const statusText = task.completed ? 'Done' : 'Incomplete';

    await sendEmail(
      userEmail, // recipient email
      subject, // subject
      task.dueDate, // due date
      `The task "${task.title}" has been updated to status: ${statusText}. Priority: ${task.priority}.`
    );

    res.status(200).json({ message: `Task marked as ${completed ? 'done' : 'pending'}` });
  } catch (err) {
    console.error('Error toggling task status or sending email:', err);
    res.status(500).send('Internal Server Error');
  }
});

module.exports = router;
