const test = require('node:test')
const assert = require('node:assert/strict')
const Task = require('../models/Task')
const Sheets = require('../models/Sheets')
const {
    requireVerifiedEmail,
    authorizeTaskOwner,
    authorizeSheetOwner,
} = require('../middleware/resourceAuthorization')

const USER_ID = '507f1f77bcf86cd799439011'
const TASK_ID = '507f1f77bcf86cd799439012'
const SHEET_ID = '507f1f77bcf86cd799439013'

const createRes = () => {
    const res = {
        statusCode: 200,
        payload: null,
        status(code) {
            this.statusCode = code
            return this
        },
        json(data) {
            this.payload = data
            return this
        },
    }

    return res
}

test('requireVerifiedEmail denies access for unverified users', () => {
    const req = { user: { isEmailVerified: false } }
    const res = createRes()
    let nextCalled = false

    requireVerifiedEmail(req, res, () => {
        nextCalled = true
    })

    assert.equal(nextCalled, false)
    assert.equal(res.statusCode, 403)
})

test('authorizeTaskOwner allows access when user owns the task', async () => {
    const originalFindOne = Task.findOne
    const taskDoc = { _id: TASK_ID, userId: USER_ID, taskTitle: 'Task A' }
    Task.findOne = async () => taskDoc

    const req = { params: { id: TASK_ID }, user: { id: USER_ID } }
    const res = createRes()
    let nextCalled = false

    await authorizeTaskOwner(req, res, () => {
        nextCalled = true
    })

    Task.findOne = originalFindOne

    assert.equal(nextCalled, true)
    assert.deepEqual(req.task, taskDoc)
})

test('authorizeSheetOwner denies access when sheet is not owned', async () => {
    const originalFindOne = Sheets.findOne
    Sheets.findOne = async () => null

    const req = { params: { sheetId: SHEET_ID }, user: { id: USER_ID } }
    const res = createRes()
    let nextCalled = false

    await authorizeSheetOwner(req, res, () => {
        nextCalled = true
    })

    Sheets.findOne = originalFindOne

    assert.equal(nextCalled, false)
    assert.equal(res.statusCode, 403)
})
