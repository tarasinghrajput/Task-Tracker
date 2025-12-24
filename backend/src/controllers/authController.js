const bcrypt = require('bcryptjs')
const saltRounds = 12
const jwt = require('jsonwebtoken')
const User = require('../models/User')
const secret = process.env.JWT_SECRET
// const { validationResult } = require('express-validator')
const transporter = require('../config/nodemailer')

const register = async (req, res) => {
    const { formEmail, formPassword } = req.body

    if (!formEmail || !formPassword) {
        return res.status(401).json({ success: false, message: "Email and Password are required" })
    }
    try {
        const existingUser = await User.findOne({ email: formEmail })
        if (existingUser) {
            return res.status(402).json({ success: false, message: "Email is registered" })
        }
        const hashedPassword = await bcrypt.hash(formPassword, saltRounds)
        const date = new Date()
        const createdAt = date.toISOString()

        const user = new User({ email: formEmail, passwordHash: hashedPassword, createdAt })
        await user.save()

        const token = jwt.sign({ id: user._id }, secret, { expiresIn: '7d' })

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        })

        // Sending Welcome Email
        const mailOptions = {
            from: process.env.SMTP_FROM,
            to: formEmail,
            subject: "Welcome to Task Tracker for AP",
            text: `Welcome to the Task Tracker made only for Apnipathshala. Your registered email: ${formEmail} `
        }
        await transporter.sendMail(mailOptions)

        return res.status(200).json({ success: true, message: "Registered Successful" })
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message })
    }
}

const login = async (req, res) => {
    const { formEmail, formPassword } = req.body
    
    if (!formEmail || !formPassword) {
        return res.status(401).json({ success: false, message: "Email and Password are required" })
    }
    try {
        const user = await User.findOne({email: formEmail})
        if(!user) {
            return res.status(402).json({ success: false, message: "Email is not registered" })
        }
        
        const isMatching = await bcrypt.compare(formPassword, user.passwordHash)
        
        if(!isMatching) {
            return res.status(403).json({ success: false, message: "Password is incorrect" })
        }
        
        const token = jwt.sign({ id: user._id }, secret, { expiresIn: '7d' })

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        })

        return res.status(200).json({ success: true, message: "Login Successful" })
        
    } catch(error) {
        return res.status(500).json({ success: false, message: error.message })
    }
}

const logout = async (req, res) => {
    
    try {
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        })

        return res.status(200).json({ success: true, message: "Logout Successful" })
    } catch(error) {
        return res.status(500).json({ success: false, message: error.message })
    }
}

const sendVerifyOtp = async (req, res) => {
    try{
        const userId = req.user.id
        const user = await User.findById(userId)

        if(user.isEmailVerified) {
            return res.status(402).json({ success: false, message: "Account is already verified" })
        }

        const otp = String(Math.floor(100000 + Math.random() * 900000))

        user.verifyOtp = otp
        user.verifyOtpExpireAt = Date.now() + 24 * 60 * 60 * 1000

        await user.save()

        const mailOptions = {
            from: process.env.SMTP_FROM,
            to: user.email,
            subject: "Account Verification OTP",
            text: `Your OTP is ${otp}. Verify your account using this OTP`
        }
        await transporter.sendMail(mailOptions)
        return res.status(200).json({ success: true, message: "Verification OTP is sent to user" })

    } catch(error) {
        return res.status(500).json({ success: false, message: error.message })
    }
}

const verifyOtp = async (req, res) => {
    const { otp } = req.body
    const userId = req.user.id
    
    if(!userId || !otp) {
        return res.status(400).json({ success: false, message: "Missing UserId or OTP" })
    }
    
    try {
        const user = await User.findById(userId)
        
        if(!user) {
            return res.status(401).json({ success: false, message: "User not found" })
        }
        
        if(user.verifyOtp === '' || user.verifyOtp != otp) {
            return res.status(402).json({ success: false, message: "Invalid OTP" })
        }
        
        if(user.verifyOtpExpireAt < Date.now()) {
            return res.status(403).json({ success: false, message: "OTP Expired" })
        }
        
        user.isEmailVerified = true
        user.verifyOtp = ''
        user.verifyOtpExpireAt = 0
        
        await user.save()
        return res.status(200).json({ success: true, message: "Email verified successfully" })

    } catch(error) {
        return res.status(500).json({ success: false, message: error.message })
    }
}

const isAuthenticated = async (req, res) => {
    try {
        return res.status(200).json({ success: true, message: "User is authenticated" })
    } catch(error) {
        return res.status(500).json({ success: false, message: error.message })
    }
}

module.exports = {
    register,
    login,
    logout,
    sendVerifyOtp,
    verifyOtp,
    isAuthenticated
}