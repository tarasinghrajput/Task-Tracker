const Task = require('../models/Task.js')
const { syncTaskWithSheet } = require('../services/taskSheetSync')

const TASK_IDENTIFIER_PREFIX = 'TASK-'
const TASK_IDENTIFIER_REGEX = /^TASK-\d{3,}$/i
const IMPACT_LEVELS = ['low', 'medium', 'high']

const parseTaskDateInput = (value = '') => {
    const trimmedValue = value.trim()

    if (/^\d{2}\/\d{2}\/\d{4}$/.test(trimmedValue)) {
        const [day, month, year] = trimmedValue.split('/').map(Number)
        const parsedDate = new Date(Date.UTC(year, month - 1, day))
        if (Number.isNaN(parsedDate.getTime())) {
            return null
        }
        return parsedDate
    }

    const parsedDate = new Date(trimmedValue)
    if (Number.isNaN(parsedDate.getTime())) {
        return null
    }
    return new Date(Date.UTC(parsedDate.getUTCFullYear(), parsedDate.getUTCMonth(), parsedDate.getUTCDate()))
}

const getNextTaskIdentifierValue = async () => {
    const lastTask = await Task.findOne().sort({ createdAt: -1 }).select('taskIdentifier')
    if (!lastTask || !TASK_IDENTIFIER_REGEX.test(lastTask.taskIdentifier || '')) {
        return `${TASK_IDENTIFIER_PREFIX}001`
    }

    const [, numericPart] = lastTask.taskIdentifier.split('-')
    const nextNumber = (parseInt(numericPart, 10) || 0) + 1
    return `${TASK_IDENTIFIER_PREFIX}${String(nextNumber).padStart(3, '0')}`
}

const addTask = async (req, res) => {
    const {
        taskIdentifier,
        taskTimeElapsed,
        taskDate,
        taskCategory,
        taskType,
        taskTitle,
        taskDescription,
        taskPriority,
        taskStatus,
        impactArea,
        impactLevel,
        issueSource,
        toolsInvolved,
    } = req.body

    if (
        !taskTimeElapsed ||
        !taskDate ||
        !taskCategory ||
        !taskType ||
        !taskTitle ||
        !taskDescription ||
        taskPriority === undefined ||
        taskPriority === null ||
        !taskStatus ||
        !impactLevel ||
        !impactArea ||
        !issueSource ||
        !toolsInvolved
    ) {
        return res.status(401).json({ success: false, message: "Tasks data is not complete" })
    }

    const numericTaskPriority = Number(taskPriority)

    if (Number.isNaN(numericTaskPriority) || numericTaskPriority < 0 || numericTaskPriority > 3) {
        return res.status(400).json({ success: false, message: "Invalid priority value" })
    }

    const normalizedTaskDate = parseTaskDateInput(taskDate)
    if (!normalizedTaskDate) {
        return res.status(400).json({ success: false, message: "Invalid task date provided" })
    }

    const normalizedImpactLevel = impactLevel.toLowerCase()
    if (!IMPACT_LEVELS.includes(normalizedImpactLevel)) {
        return res.status(400).json({ success: false, message: "Invalid impact level provided" })
    }

    const providedIdentifier = taskIdentifier?.trim().toUpperCase()
    let identifierToUse = providedIdentifier

    if (providedIdentifier) {
        if (!TASK_IDENTIFIER_REGEX.test(providedIdentifier)) {
            return res.status(400).json({ success: false, message: "Task ID must follow TASK-001 format" })
        }

        const existingTask = await Task.findOne({ taskIdentifier: providedIdentifier })
        if (existingTask) {
            return res.status(409).json({ success: false, message: "Provided Task ID already exists" })
        }
    } else {
        identifierToUse = await getNextTaskIdentifierValue()
    }

    try {

        const task = new Task(
            {
                taskIdentifier: identifierToUse,
                taskTimeElapsed,
                taskDate: normalizedTaskDate,
                taskCategory,
                taskType,
                taskTitle,
                taskDescription,
                taskPriority: numericTaskPriority,
                taskStatus,
                impactArea,
                impactLevel: normalizedImpactLevel,
                issueSource,
                toolsInvolved,
            }
        )

        await task.save()

        const syncResult = await syncTaskWithSheet(task)
        task.isSyncedToSheet = !!syncResult.synced
        task.sheetSyncError = syncResult.reason && !syncResult.synced ? syncResult.reason : ''
        const responseMessage = syncResult.synced
            ? "Task added and synced successfully"
            : syncResult.reason
                ? `Task added but not synced: ${syncResult.reason}`
                : "Task added successfully"

        return res.status(200).json({
            success: true,
            message: responseMessage,
            task,
            syncedToSheet: syncResult.synced,
        })

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

const deleteTask = async (req, res) => {
    const { id } = req.params

    if (!id) {
        return res.status(400).json({ success: false, message: "Task id is required" })
    }

    try {
        const deletedTask = await Task.findByIdAndDelete(id)

        if (!deletedTask) {
            return res.status(404).json({ success: false, message: "Task not found" })
        }

        return res.status(200).json({ success: true, message: "Task deleted successfully" })

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message })
    }
}

const getNextTaskIdentifier = async (req, res) => {
    try {
        const nextId = await getNextTaskIdentifierValue()
        return res.status(200).json({ success: true, nextId })
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message })
    }
}

module.exports = {
    addTask,
    getAllTask,
    deleteTask,
    getNextTaskIdentifier,
}
