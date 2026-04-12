const Sheets = require('../models/Sheets')
const { syncPendingTasksWithSheet, getDefaultSheetConfig } = require('../services/taskSheetSync')
const logger = require('../config/logger')

const connectSheet = async (req, res) => {
    const userId = req.user.id
    const { displayName, spreadsheetId, sheetName, sheetURL, appsScriptUrl } = req.body

    if (!spreadsheetId || !sheetName || !appsScriptUrl) {
        return res.status(400).json({ success: false, message: 'Spreadsheet ID, sheet name, and Apps Script URL are required' })
    }

    const name = displayName?.trim() || 'Primary Sheet'
    const normalizedURL = sheetURL || `https://docs.google.com/spreadsheets/d/${spreadsheetId}`

    try {
        await Sheets.updateMany({ userId }, { $set: { isDefault: false } })

        const sheetConfig = await Sheets.findOneAndUpdate(
            { spreadsheetId, userId },
            {
                userId,
                name,
                sheetURL: normalizedURL,
                spreadsheetId,
                sheetName,
                appsScriptUrl,
                isDefault: true,
            },
            { upsert: true, new: true, setDefaultsOnInsert: true },
        )

        return res.status(200).json({ success: true, message: 'Google Sheet connected successfully', sheet: sheetConfig })
    } catch (error) {
        logger.error('Connect sheet error', { error: error.message, userId })
        return res.status(500).json({ success: false, message: error.message })
    }
}

const getSheetConnection = async (req, res) => {
    const userId = req.user.id
    try {
        const config = await getDefaultSheetConfig(userId)
        if (!config) {
            return res.status(200).json({ success: true, sheet: null })
        }
        return res.status(200).json({ success: true, sheet: config })
    } catch (error) {
        logger.error('Get sheet connection error', { error: error.message, userId })
        return res.status(500).json({ success: false, message: error.message })
    }
}

const getSheetById = async (req, res) => {
    try {
        return res.status(200).json({ success: true, sheet: req.sheet })
    } catch (error) {
        logger.error('Get sheet by ID error', { error: error.message, sheetId: req.sheet?._id })
        return res.status(500).json({ success: false, message: error.message })
    }
}

const deleteSheetById = async (req, res) => {
    try {
        await Sheets.deleteOne({ _id: req.sheet._id })

        const nextDefault = await Sheets.findOne({ userId: req.user.id }).sort({ _id: -1 })
        if (nextDefault) {
            nextDefault.isDefault = true
            await nextDefault.save()
        }

        logger.info('Sheet deleted', { sheetId: req.sheet._id, userId: req.user.id })
        return res.status(200).json({ success: true, message: 'Sheet deleted successfully' })
    } catch (error) {
        logger.error('Delete sheet error', { error: error.message, sheetId: req.sheet?._id, userId: req.user.id })
        return res.status(500).json({ success: false, message: error.message })
    }
}

const syncPendingTasks = async (req, res) => {
    const userId = req.user.id
    try {
        const result = await syncPendingTasksWithSheet(userId)
        logger.info('Pending tasks synced', { userId, syncedCount: result.syncedCount })
        return res.status(200).json({
            success: true,
            message: `${result.syncedCount} task(s) synced with Google Sheets`,
            ...result,
        })
    } catch (error) {
        logger.error('Sync pending tasks error', { error: error.message, userId })
        return res.status(500).json({ success: false, message: error.message })
    }
}

module.exports = {
    connectSheet,
    getSheetConnection,
    getSheetById,
    deleteSheetById,
    syncPendingTasks,
}
