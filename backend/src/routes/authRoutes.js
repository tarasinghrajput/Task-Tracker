const { register, login, logout, sendVerifyOtp, verifyOtp, isAuthenticated, sendPasswordResetOtp, resetPassword } = require('../controllers/authController.js')
const { userAuth } = require('../middleware/userAuth.js')
const express = require('express')
const authRouter = express.Router()

authRouter.post('/register', register)
authRouter.post('/login', login)
authRouter.post('/logout', logout)
authRouter.post('/send-verify-otp', userAuth, sendVerifyOtp)
authRouter.post('/verify-otp', userAuth, verifyOtp)
authRouter.get('/is-authenticated', userAuth, isAuthenticated)
authRouter.post('/send-reset-otp', sendPasswordResetOtp)
authRouter.post('/reset-password', resetPassword)

module.exports = {
    authRouter 
}