const test = require('node:test')
const assert = require('node:assert/strict')
const jwt = require('jsonwebtoken')
const User = require('../models/User')
const { userAuth } = require('../middleware/userAuth')
const { extensionAuth } = require('../middleware/extensionAuth')

const USER_ID = '507f1f77bcf86cd799439011'
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret'

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

test('userAuth rejects request when token is missing', async () => {
    const req = { cookies: {}, headers: {} }
    const res = createRes()
    let nextCalled = false

    await userAuth(req, res, () => {
        nextCalled = true
    })

    assert.equal(nextCalled, false)
    assert.equal(res.statusCode, 401)
})

test('userAuth accepts bearer token for active user', async () => {
    const originalFindById = User.findById
    User.findById = () => ({
        select: async () => ({
            _id: USER_ID,
            email: 'member@example.com',
            isActive: true,
            isEmailVerified: true,
        }),
    })

    const token = jwt.sign({ id: USER_ID }, process.env.JWT_SECRET)
    const req = { cookies: {}, headers: { authorization: `Bearer ${token}` } }
    const res = createRes()
    let nextCalled = false

    await userAuth(req, res, () => {
        nextCalled = true
    })

    User.findById = originalFindById

    assert.equal(nextCalled, true)
    assert.equal(req.user.id, USER_ID)
    assert.equal(req.user.isEmailVerified, true)
})

test('extensionAuth rejects token with wrong token type', async () => {
    const token = jwt.sign({ id: USER_ID, type: 'web' }, process.env.JWT_SECRET)
    const req = { headers: { authorization: `Bearer ${token}` } }
    const res = createRes()
    let nextCalled = false

    await extensionAuth(req, res, () => {
        nextCalled = true
    })

    assert.equal(nextCalled, false)
    assert.equal(res.statusCode, 401)
})

test('extensionAuth accepts valid extension token for verified user', async () => {
    const originalFindById = User.findById
    User.findById = () => ({
        select: async () => ({
            _id: USER_ID,
            email: 'member@example.com',
            isActive: true,
            isEmailVerified: true,
        }),
    })

    const token = jwt.sign({ id: USER_ID, type: 'extension' }, process.env.JWT_SECRET)
    const req = { headers: { authorization: `Bearer ${token}` } }
    const res = createRes()
    let nextCalled = false

    await extensionAuth(req, res, () => {
        nextCalled = true
    })

    User.findById = originalFindById

    assert.equal(nextCalled, true)
    assert.equal(req.user.email, 'member@example.com')
})
