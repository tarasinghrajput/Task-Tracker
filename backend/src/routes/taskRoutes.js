const { addTask, getAllTask, deleteTask, getNextTaskIdentifier } = require('../controllers/taskController.js')
const express = require('express')
const taskRouter = express.Router()

taskRouter.post('/add-task', addTask)
taskRouter.get('/get-tasks', getAllTask)
taskRouter.get('/next-id', getNextTaskIdentifier)
taskRouter.delete('/:id', deleteTask)

module.exports = { taskRouter }
