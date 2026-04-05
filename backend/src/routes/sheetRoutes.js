const { connectSheet, getSheetConnection, getSheetById, deleteSheetById, syncPendingTasks } = require('../controllers/sheetController.js')
const { userAuth } = require('../middleware/userAuth.js')
const { requireVerifiedEmail, authorizeSheetOwner } = require('../middleware/resourceAuthorization.js')
const express = require('express')
const sheetRouter = express.Router()

sheetRouter.get('/config', userAuth, requireVerifiedEmail, getSheetConnection)
sheetRouter.post('/connect', userAuth, requireVerifiedEmail, connectSheet)
sheetRouter.post('/sync-pending', userAuth, requireVerifiedEmail, syncPendingTasks)
sheetRouter.get('/:sheetId', userAuth, requireVerifiedEmail, authorizeSheetOwner, getSheetById)
sheetRouter.delete('/:sheetId', userAuth, requireVerifiedEmail, authorizeSheetOwner, deleteSheetById)

module.exports = { sheetRouter }
