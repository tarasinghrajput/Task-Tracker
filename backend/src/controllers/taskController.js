const Task = require('../models/Task.js')
const { syncTaskWithSheet } = require('../services/taskSheetSync')
const logger = require('../config/logger')

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

const getNextTaskIdentifierValue = async (userId) => {
    const lastTask = await Task.findOne({ userId }).sort({ createdAt: -1 }).select('taskIdentifier')
    if (!lastTask || !TASK_IDENTIFIER_REGEX.test(lastTask.taskIdentifier || '')) {
        return `${TASK_IDENTIFIER_PREFIX}001`
    }

    const [, numericPart] = lastTask.taskIdentifier.split('-')
    const nextNumber = (parseInt(numericPart, 10) || 0) + 1
    return `${TASK_IDENTIFIER_PREFIX}${String(nextNumber).padStart(3, '0')}`
}

const addTask = async (req, res) => {
    const userId = req.user.id
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
        return res.status(400).json({ success: false, message: 'Tasks data is not complete' })
    }

    const numericTaskPriority = Number(taskPriority)

    if (Number.isNaN(numericTaskPriority) || numericTaskPriority < 0 || numericTaskPriority > 3) {
        return res.status(400).json({ success: false, message: 'Invalid priority value' })
    }

    const normalizedTaskDate = parseTaskDateInput(taskDate)
    if (!normalizedTaskDate) {
        return res.status(400).json({ success: false, message: 'Invalid task date provided' })
    }

    const normalizedImpactLevel = impactLevel.toLowerCase()
    if (!IMPACT_LEVELS.includes(normalizedImpactLevel)) {
        return res.status(400).json({ success: false, message: 'Invalid impact level provided' })
    }

    const providedIdentifier = taskIdentifier?.trim().toUpperCase()
    let identifierToUse = providedIdentifier

    if (providedIdentifier) {
        if (!TASK_IDENTIFIER_REGEX.test(providedIdentifier)) {
            return res.status(400).json({ success: false, message: 'Task ID must follow TASK-001 format' })
        }

        const existingTask = await Task.findOne({ taskIdentifier: providedIdentifier, userId })
        if (existingTask) {
            return res.status(409).json({ success: false, message: 'Provided Task ID already exists' })
        }
    } else {
        identifierToUse = await getNextTaskIdentifierValue(userId)
    }

    try {
        const task = new Task({
            userId,
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
        })

        await task.save()

        const syncResult = await syncTaskWithSheet(task, userId)
        task.isSyncedToSheet = !!syncResult.synced
        task.sheetSyncError = syncResult.reason && !syncResult.synced ? syncResult.reason : ''
        const responseMessage = syncResult.synced
            ? 'Task added and synced successfully'
            : syncResult.reason
                ? `Task added but not synced: ${syncResult.reason}`
                : 'Task added successfully'

        return res.status(200).json({
            success: true,
            message: responseMessage,
            task,
            syncedToSheet: syncResult.synced,
        })
    } catch (error) {
        logger.error('Add task error', { error: error.message, userId })
        return res.status(500).json({ success: false, message: error.message })
    }
}

const completeDraftTask = async (req, res) => {
    const userId = req.user.id
    const {
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

    if (!req.task?.isDraft) {
        return res.status(400).json({ success: false, message: 'Only draft tasks can be completed' })
    }

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
        return res.status(400).json({ success: false, message: 'Tasks data is not complete' })
    }

    const numericTaskPriority = Number(taskPriority)
    if (Number.isNaN(numericTaskPriority) || numericTaskPriority < 0 || numericTaskPriority > 3) {
        return res.status(400).json({ success: false, message: 'Invalid priority value' })
    }

    const normalizedTaskDate = parseTaskDateInput(taskDate)
    if (!normalizedTaskDate) {
        return res.status(400).json({ success: false, message: 'Invalid task date provided' })
    }

    const normalizedImpactLevel = impactLevel.toLowerCase()
    if (!IMPACT_LEVELS.includes(normalizedImpactLevel)) {
        return res.status(400).json({ success: false, message: 'Invalid impact level provided' })
    }

    try {
        req.task.taskTimeElapsed = taskTimeElapsed
        req.task.taskDate = normalizedTaskDate
        req.task.taskCategory = taskCategory
        req.task.taskType = taskType
        req.task.taskTitle = taskTitle
        req.task.taskDescription = taskDescription
        req.task.taskPriority = numericTaskPriority
        req.task.taskStatus = taskStatus
        req.task.impactArea = impactArea
        req.task.impactLevel = normalizedImpactLevel
        req.task.issueSource = issueSource
        req.task.toolsInvolved = toolsInvolved
        req.task.isDraft = false
        req.task.draftSource = ''

        await req.task.save()

        const syncResult = await syncTaskWithSheet(req.task, userId)
        req.task.isSyncedToSheet = !!syncResult.synced
        req.task.sheetSyncError = syncResult.reason && !syncResult.synced ? syncResult.reason : ''
        await req.task.save()

        const responseMessage = syncResult.synced
            ? 'Draft task completed and synced successfully'
            : syncResult.reason
                ? `Draft task completed but not synced: ${syncResult.reason}`
                : 'Draft task completed successfully'

        return res.status(200).json({
            success: true,
            message: responseMessage,
            task: req.task,
            syncedToSheet: syncResult.synced,
        })
    } catch (error) {
        logger.error('Complete draft task error', { error: error.message, userId, taskId: req.task?._id })
        return res.status(500).json({ success: false, message: error.message })
    }
}

const getAllTask = async (req, res) => {
    const userId = req.user.id

    try {
        const allTask = await Task.find({ userId }).sort({ createdAt: -1 })
        return res.status(200).json({ success: true, message: 'All Tasks Received', tasks: allTask })
    } catch (error) {
        logger.error('Get all tasks error', { error: error.message, userId })
        return res.status(500).json({ success: false, message: error.message })
    }
}

const getTaskById = async (req, res) => {
    try {
        return res.status(200).json({ success: true, task: req.task })
    } catch (error) {
        logger.error('Get task by ID error', { error: error.message, taskId: req.task?._id })
        return res.status(500).json({ success: false, message: error.message })
    }
}

const deleteTask = async (req, res) => {
    const { id } = req.params

    if (!id) {
        return res.status(400).json({ success: false, message: 'Task id is required' })
    }

    try {
        await Task.deleteOne({ _id: req.task._id })
        logger.info('Task deleted', { taskId: id, userId: req.user.id })
        return res.status(200).json({ success: true, message: 'Task deleted successfully' })
    } catch (error) {
        logger.error('Delete task error', { error: error.message, taskId: id, userId: req.user.id })
        return res.status(500).json({ success: false, message: error.message })
    }
}

const getNextTaskIdentifier = async (req, res) => {
    const userId = req.user.id
    try {
        const nextId = await getNextTaskIdentifierValue(userId)
        return res.status(200).json({ success: true, nextId })
    } catch (error) {
        logger.error('Get next task identifier error', { error: error.message, userId })
        return res.status(500).json({ success: false, message: error.message })
    }
}

module.exports = {
    addTask,
    completeDraftTask,
    getAllTask,
    getTaskById,
    deleteTask,
    getNextTaskIdentifier,
}
