const addTask = async (req, res) => {
    const {
        id,
        taskTimeElapsed,
        taskDate,
        taskCategory,
        taskType,
        taskTitle,
        taskDescription,
        taskPriority,
        taskStatus
    } = req.body

    if(!id || !taskTimeElapsed || !taskDate || !taskCategory || !taskType || !taskTitle || !taskDescription || !taskPriority || !taskStatus) {
        return res.status(401).json({ message: "Tasks data is not complete" })
    }
    
    console.log(id, taskTimeElapsed, taskDate, taskCategory, taskType, taskTitle, taskDescription, taskPriority, taskStatus, "Task added successfully")
}

const getTask = async (req, res) => {
    const id = req.params.taskId
    
    if(!id) {
        return res.status(401).json({ message: "Task id is required" })
    }

    console.log("Task got successfully")
}

module.exports = {
    addTask,
    getTask
} 