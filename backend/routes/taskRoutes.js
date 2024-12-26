const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const { getTasks, addTask } = require('../controllers/taskController');

const router = express.Router();

router.get('/', authMiddleware, getTasks);
router.post('/', authMiddleware, addTask);

module.exports = router;
