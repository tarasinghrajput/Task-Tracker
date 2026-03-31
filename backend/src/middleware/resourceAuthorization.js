const { mongoose } = require('mongoose')
const Task = require('../models/Task')
const Sheets = require('../models/Sheets')

const requireVerifiedEmail = (req, res, next) => {
    if (!req.user?.isEmailVerified) {
        return res.status(403).json({ success: false, message: 'Please verify your email to access this module' })
    }

    return next()
}

const authorizeTaskOwner = async (req, res, next) => {
    const taskId = req.params?.id || req.params?.taskId

    if (!taskId || !mongoose.Types.ObjectId.isValid(taskId)) {
        return res.status(400).json({ success: false, message: 'Valid task id is required' })
    }

    try {
        const task = await Task.findOne({ _id: taskId, userId: req.user.id })

        if (!task) {
            return res.status(403).json({ success: false, message: 'You are not authorized to access this task' })
        }

        req.task = task
        return next()
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message })
    }
}

const authorizeSheetOwner = async (req, res, next) => {
    const sheetId = req.params?.sheetId || req.params?.id

    if (!sheetId || !mongoose.Types.ObjectId.isValid(sheetId)) {
        return res.status(400).json({ success: false, message: 'Valid sheet id is required' })
    }

    try {
        const sheet = await Sheets.findOne({ _id: sheetId, userId: req.user.id })

        if (!sheet) {
            return res.status(403).json({ success: false, message: 'You are not authorized to access this sheet' })
        }

        req.sheet = sheet
        return next()
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message })
    }
}

module.exports = {
    requireVerifiedEmail,
    authorizeTaskOwner,
    authorizeSheetOwner,
}
