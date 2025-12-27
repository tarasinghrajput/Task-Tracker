const { addTask, getAllTask } = require('../controllers/taskController.js')
const express = require('express')
const taskRouter = express.Router()

taskRouter.post('/add-task', addTask)
taskRouter.get('/get-tasks', getAllTask)

module.exports = { taskRouter }