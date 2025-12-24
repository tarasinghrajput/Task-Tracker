const { register, login, logout, sendVerifyOtp, verifyOtp, isAuthenticated } = require('../controllers/authController.js')
const { userAuth } = require('../middleware/userAuth.js')
const express = require('express')
const authRouter = express.Router()

authRouter.post('/register', register)
authRouter.post('/login', login)
authRouter.post('/logout', logout)
authRouter.post('/send-verify-otp', userAuth, sendVerifyOtp)
authRouter.post('/verify-otp', userAuth, verifyOtp)
authRouter.post('/is-authenticated', userAuth, isAuthenticated)

module.exports = {
    authRouter 
}