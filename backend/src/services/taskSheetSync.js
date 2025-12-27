const Sheets = require('../models/Sheets')
const Task = require('../models/Task')
const { sendTasksToAppsScript } = require('./appsScriptClient')

const formatTaskForSheet = (task) => {
    const formatDate = (value) => {
        if (!value) return ''
        const date = new Date(value)
        if (Number.isNaN(date.getTime())) {
            return value
        }
        return date.toISOString().split('T')[0]
    }

    return {
        taskId: task._id.toString(),
        taskDate: formatDate(task.taskDate),
        taskTitle: task.taskTitle,
        taskDescription: task.taskDescription,
        taskCategory: task.taskCategory,
        taskType: task.taskType,
        taskPriority: task.taskPriority,
        taskStatus: task.taskStatus,
        taskTimeElapsed: task.taskTimeElapsed,
        impactArea: task.impactArea || '',
        impactLevel: task.impactLevel || '',
        issueSource: task.issueSource || '',
        toolsInvolved: task.toolsInvolved || '',
        taskIdentifier: task.taskIdentifier,
        createdAt: new Date(task.createdAt || Date.now()).toISOString(),
    }
}

const getDefaultSheetConfig = async () => {
    return Sheets.findOne({ isDefault: true })
}

const syncTaskWithSheet = async (task) => {
    const sheetConfig = await getDefaultSheetConfig()
    if (!sheetConfig || !sheetConfig.appsScriptUrl) {
        return { synced: false, reason: 'No Apps Script URL configured' }
    }

    try {
        await sendTasksToAppsScript({
            scriptUrl: sheetConfig.appsScriptUrl,
            payload: {
                action: 'appendTasks',
                sheetName: sheetConfig.sheetName,
                spreadsheetId: sheetConfig.spreadsheetId,
                tasks: [formatTaskForSheet(task)],
            },
        })

        await Task.updateOne(
            { _id: task._id },
            { $set: { isSyncedToSheet: true, sheetSyncError: '' } }
        )

        return { synced: true }
    } catch (error) {
        await Task.updateOne(
            { _id: task._id },
            { $set: { isSyncedToSheet: false, sheetSyncError: error.message } }
        )
        return { synced: false, reason: error.message }
    }
}

const syncPendingTasksWithSheet = async () => {
    const sheetConfig = await getDefaultSheetConfig()
    if (!sheetConfig || !sheetConfig.appsScriptUrl) {
        throw new Error('No Apps Script URL configured')
    }

    const pendingTasks = await Task.find({ isSyncedToSheet: { $ne: true } })
    if (pendingTasks.length === 0) {
        return { syncedCount: 0, total: 0 }
    }

    const payloadTasks = pendingTasks.map(formatTaskForSheet)

    try {
        await sendTasksToAppsScript({
            scriptUrl: sheetConfig.appsScriptUrl,
            payload: {
                action: 'appendTasks',
                sheetName: sheetConfig.sheetName,
                spreadsheetId: sheetConfig.spreadsheetId,
                tasks: payloadTasks,
            },
        })

        await Task.updateMany(
            { _id: { $in: pendingTasks.map((task) => task._id) } },
            { $set: { isSyncedToSheet: true, sheetSyncError: '' } }
        )

        return { syncedCount: pendingTasks.length, total: pendingTasks.length }
    } catch (error) {
        throw new Error(error.message)
    }
}

module.exports = {
    syncTaskWithSheet,
    syncPendingTasksWithSheet,
    getDefaultSheetConfig,
}
