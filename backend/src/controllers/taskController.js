const Task = require('../models/Task.js')

const addTask = async (req, res) => {
    const {
        taskTimeElapsed,
        taskDate,
        taskCategory,
        taskType,
        taskTitle,
        taskDescription,
        taskPriority,
        taskStatus
    } = req.body

    if (!taskTimeElapsed || !taskDate || !taskCategory || !taskType || !taskTitle || !taskDescription || !taskPriority || !taskStatus) {
        return res.status(401).json({ success: false, message: "Tasks data is not complete" })
    }

    try {

        const task = new Task(
            {
                taskTimeElapsed,
                taskDate,
                taskCategory,
                taskType,
                taskTitle,
                taskDescription,
                taskPriority,
                taskStatus
            }
        )

        await task.save()

        return res.status(200).json({ success: true, message: "Task added successfully" })

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message })
    }
}

const getAllTask = async (req, res) => {

    try{
        const allTask = await Task.find()
    
        return res.status(200).json({ success: true, message: "All Tasks Received", tasks: allTask })
    } catch(error) {
        return res.status(500).json({ success: false, message: error.message })
    }

}

module.exports = {
    addTask,
    getAllTask
} 