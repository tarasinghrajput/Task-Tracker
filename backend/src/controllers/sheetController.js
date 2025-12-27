const Sheets = require('../models/Sheets')
const { syncPendingTasksWithSheet, getDefaultSheetConfig } = require('../services/taskSheetSync')

const connectSheet = async (req, res) => {
    const { displayName, spreadsheetId, sheetName, sheetURL, appsScriptUrl } = req.body

    if (!spreadsheetId || !sheetName || !appsScriptUrl) {
        return res.status(400).json({ success: false, message: 'Spreadsheet ID, sheet name, and Apps Script URL are required' })
    }

    const name = displayName?.trim() || 'Primary Sheet'
    const normalizedURL = sheetURL || `https://docs.google.com/spreadsheets/d/${spreadsheetId}`

    try {
        await Sheets.updateMany({}, { $set: { isDefault: false } })

        const sheetConfig = await Sheets.findOneAndUpdate(
            { spreadsheetId },
            {
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
        return res.status(500).json({ success: false, message: error.message })
    }
}

const getSheetConnection = async (req, res) => {
    try {
        const config = await getDefaultSheetConfig()
        if (!config) {
            return res.status(200).json({ success: true, sheet: null })
        }
        return res.status(200).json({ success: true, sheet: config })
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message })
    }
}

const syncPendingTasks = async (req, res) => {
    try {
        const result = await syncPendingTasksWithSheet()
        return res.status(200).json({
            success: true,
            message: `${result.syncedCount} task(s) synced with Google Sheets`,
            ...result,
        })
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message })
    }
}

module.exports = {
    connectSheet,
    getSheetConnection,
    syncPendingTasks,
}
