const { addTask, getAllTask, getTaskById, deleteTask, getNextTaskIdentifier } = require('../controllers/taskController.js')
const { userAuth } = require('../middleware/userAuth.js')
const { requireVerifiedEmail, authorizeTaskOwner } = require('../middleware/resourceAuthorization.js')
const express = require('express')
const taskRouter = express.Router()

taskRouter.post('/add-task', userAuth, requireVerifiedEmail, addTask)
taskRouter.get('/get-tasks', userAuth, requireVerifiedEmail, getAllTask)
taskRouter.get('/next-id', userAuth, requireVerifiedEmail, getNextTaskIdentifier)
taskRouter.get('/:id', userAuth, requireVerifiedEmail, authorizeTaskOwner, getTaskById)
taskRouter.delete('/:id', userAuth, requireVerifiedEmail, authorizeTaskOwner, deleteTask)

module.exports = { taskRouter }
