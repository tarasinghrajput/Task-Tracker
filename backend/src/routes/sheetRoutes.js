const { connectSheet, getSheetConnection, syncPendingTasks } = require('../controllers/sheetController.js')
const express = require('express')
const sheetRouter = express.Router()

sheetRouter.get('/config', getSheetConnection)
sheetRouter.post('/connect', connectSheet)
sheetRouter.post('/sync-pending', syncPendingTasks)

module.exports = { sheetRouter }
