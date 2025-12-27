const { addTask, getAllTask, deleteTask } = require('../controllers/taskController.js')
const express = require('express')
const taskRouter = express.Router()

taskRouter.post('/add-task', addTask)
taskRouter.get('/get-tasks', getAllTask)
taskRouter.post('/delete-task', deleteTask)

module.exports = { taskRouter }