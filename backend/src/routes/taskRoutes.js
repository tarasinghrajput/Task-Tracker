const { addTask, getTask } = require('../controllers/taskController.js')
const express = require('express')
const taskRouter = express.Router()

taskRouter.post('/add', addTask)
taskRouter.get('/get', getTask)

module.exports = { taskRouter }