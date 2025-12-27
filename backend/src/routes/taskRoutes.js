const { addTask, getAllTask } = require('../controllers/taskController.js')
const express = require('express')
const taskRouter = express.Router()

taskRouter.post('/add-task', addTask)
taskRouter.get('/get-task', getAllTask)

module.exports = { taskRouter }