const bcrypt = require('bcryptjs')
const saltRounds = 12
const jwt = require('jsonwebtoken')
const User = require('../models/User')
const secret = process.env.JWT_SECRET
const transporter = require('../config/nodemailer')
const logger = require('../config/logger')

const generateOtp = () => String(Math.floor(100000 + Math.random() * 900000))

const sendVerificationOtpEmail = async (user) => {
    const otp = generateOtp()
    user.verifyOtp = await bcrypt.hash(otp, 10)
    user.verifyOtpExpireAt = Date.now() + 24 * 60 * 60 * 1000
    await user.save()

    await transporter.sendMail({
        from: process.env.SMTP_FROM,
        to: user.email,
        subject: 'Account Verification OTP',
        text: `Your OTP is ${otp}. Verify your account using this OTP`,
    })
}

const register = async (req, res) => {
    const { formEmail, formPassword } = req.body

    if (!formEmail || !formPassword) {
        logger.warn('Register attempt with missing fields')
        return res.status(400).json({ success: false, message: "Email and Password are required" })
    }
    try {
        const normalizedEmail = formEmail.trim().toLowerCase()
        const existingUser = await User.findOne({ email: normalizedEmail })
        if (existingUser) {
            logger.warn('Register attempt with existing email', { email: normalizedEmail })
            return res.status(409).json({ success: false, message: "Email is registered" })
        }
        const hashedPassword = await bcrypt.hash(formPassword, saltRounds)
        const date = new Date()
        const createdAt = date.toISOString()

        const user = new User({ email: normalizedEmail, passwordHash: hashedPassword, createdAt })
        await user.save()

        const token = jwt.sign({ id: user._id }, secret, { expiresIn: '7d' })

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        })

        await sendVerificationOtpEmail(user)

        logger.info('User registered successfully', { email: normalizedEmail, userId: user._id })

        return res.status(200).json({
            success: true,
            message: "Registered successfully. Verify your email with OTP.",
            user: {
                email: user.email,
                isEmailVerified: false,
            },
        })
    } catch (error) {
        logger.error('Registration error', { error: error.message, email: formEmail })
        return res.status(500).json({ success: false, message: error.message })
    }
}

const login = async (req, res) => {
    const { formEmail, formPassword } = req.body
    
    if (!formEmail || !formPassword) {
        logger.warn('Login attempt with missing fields')
        return res.status(401).json({ success: false, message: "Email and Password are required" })
    }
    try {
        const normalizedEmail = formEmail.trim().toLowerCase()
        const user = await User.findOne({email: normalizedEmail})
        if(!user) {
            logger.warn('Login attempt for unregistered email', { email: normalizedEmail })
            return res.status(401).json({ success: false, message: "Invalid email or password" })
        }
        
        const isMatching = await bcrypt.compare(formPassword, user.passwordHash)
        
        if(!isMatching) {
            logger.warn('Login attempt with incorrect password', { email: normalizedEmail })
            return res.status(401).json({ success: false, message: "Invalid email or password" })
        }
        
        const token = jwt.sign({ id: user._id }, secret, { expiresIn: '7d' })

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        })

        logger.info('User logged in successfully', { email: user.email, userId: user._id })

        return res.status(200).json({
            success: true,
            message: "Login Successful",
            user: {
                email: user.email,
                isEmailVerified: Boolean(user.isEmailVerified),
            },
        })
        
    } catch(error) {
        logger.error('Login error', { error: error.message, email: formEmail })
        return res.status(500).json({ success: false, message: error.message })
    }
}

const logout = async (req, res) => {
    try {
        const userId = req.user?.id
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        })

        logger.info('User logged out', { userId })
        return res.status(200).json({ success: true, message: "Logout Successful" })
    } catch(error) {
        logger.error('Logout error', { error: error.message, userId: req.user?.id })
        return res.status(500).json({ success: false, message: error.message })
    }
}

const sendVerifyOtp = async (req, res) => {
    try{
        const userId = req.user.id
        const user = await User.findById(userId)

        if (!user) {
            logger.warn('Send verify OTP requested for non-existent user', { userId })
            return res.status(401).json({ success: false, message: "User not found" })
        }

        if(user.isEmailVerified) {
            logger.info('Verify OTP requested for already-verified email', { userId, email: user.email })
            return res.status(200).json({ success: true, message: "Account is already verified" })
        }

        await sendVerificationOtpEmail(user)
        logger.info('Verification OTP sent', { userId, email: user.email })
        return res.status(200).json({ success: true, message: "Verification OTP is sent to user" })

    } catch(error) {
        logger.error('Send verify OTP error', { error: error.message, userId: req.user?.id })
        return res.status(500).json({ success: false, message: error.message })
    }
}

const verifyOtp = async (req, res) => {
    const { otp } = req.body
    const userId = req.user.id
    
    if(!userId || !otp) {
        logger.warn('Verify OTP attempt with missing fields', { userId })
        return res.status(400).json({ success: false, message: "Missing UserId or OTP" })
    }
    
    try {
        const user = await User.findById(userId)
        
        if(!user) {
            logger.warn('Verify OTP for non-existent user', { userId })
            return res.status(401).json({ success: false, message: "User not found" })
        }
        
        if (user.isEmailVerified) {
            logger.info('Verify OTP for already-verified email', { userId, email: user.email })
            return res.status(200).json({ success: true, message: "Email already verified" })
        }

        if(!user.verifyOtp || !(await bcrypt.compare(otp, user.verifyOtp))) {
            logger.warn('Invalid OTP provided', { userId, email: user.email })
            return res.status(401).json({ success: false, message: "Invalid OTP" })
        }
        
        if(user.verifyOtpExpireAt < Date.now()) {
            logger.warn('Expired OTP provided', { userId, email: user.email })
            return res.status(401).json({ success: false, message: "OTP Expired" })
        }
        
        user.isEmailVerified = true
        user.verifyOtp = ''
        user.verifyOtpExpireAt = 0
        
        await user.save()
        logger.info('Email verified successfully', { userId, email: user.email })
        return res.status(200).json({ success: true, message: "Email verified successfully" })

    } catch(error) {
        logger.error('Verify OTP error', { error: error.message, userId })
        return res.status(500).json({ success: false, message: error.message })
    }
}

const isAuthenticated = async (req, res) => {
    try {
        return res.status(200).json({
            success: true,
            message: "User is authenticated",
            user: {
                id: req.user.id,
                email: req.user.email,
                isEmailVerified: Boolean(req.user.isEmailVerified),
            },
        })
    } catch(error) {
        logger.error('Is-authenticated check error', { error: error.message, userId: req.user?.id })
        return res.status(500).json({ success: false, message: error.message })
    }
}

const sendPasswordResetOtp = async (req, res) => {
    const { formEmail } = req.body
    
    if(!formEmail) {
        logger.warn('Password reset OTP requested without email')
        return res.status(400).json({ success: false, message: "Email not provided" })
    }
    
    try {
        const normalizedEmail = formEmail.trim().toLowerCase()
        const user = await User.findOne({ email: normalizedEmail })
        if(!user) {
            logger.info('Password reset OTP requested for unregistered email', { email: normalizedEmail })
            return res.status(200).json({ success: true, message: "If this email is registered, you will receive an OTP" })
        }

        const otp = String(Math.floor(100000 + Math.random() * 900000))

        user.resetOtp = await bcrypt.hash(otp, 10)
        user.resetOtpExpireAt = Date.now() + 15 * 60 * 1000

        await user.save()

        const mailOptions = {
            from: process.env.SMTP_FROM,
            to: user.email,
            subject: "Password reset OTP",
            text: `Your otp to reset the forgotten password is ${otp}`
        }
        await transporter.sendMail(mailOptions)
        logger.info('Password reset OTP sent', { email: normalizedEmail, userId: user._id })
        return res.status(200).json({ success: true, message: "If this email is registered, you will receive an OTP" })

    } catch(error) {
        logger.error('Send password reset OTP error', { error: error.message, email: formEmail })
        return res.status(500).json({ success: false, message: error.message })
    }
}

const resetPassword = async (req, res) => {
    const { formEmail, newPassword, otp } = req.body
    
    if(!formEmail || !newPassword || !otp) {
        logger.warn('Password reset attempt with missing fields', { email: formEmail })
        return res.status(400).json({ success: false, message: "Please provide all the details" })
    }
    
    try {
        const normalizedEmail = formEmail.trim().toLowerCase()
        const user = await User.findOne({ email: normalizedEmail })
        if(!user) {
            logger.warn('Password reset for non-existent user', { email: normalizedEmail })
            return res.status(400).json({ success: false, message: "User not found" })
        }

        if(!user.resetOtp || !(await bcrypt.compare(otp, user.resetOtp))) {
            logger.warn('Invalid reset OTP provided', { email: normalizedEmail })
            return res.status(401).json({ success: false, message: "Invalid OTP" })
        }
        
        if(user.resetOtpExpireAt < Date.now()) {
            logger.warn('Expired reset OTP provided', { email: normalizedEmail })
            return res.status(401).json({ success: false, message: "OTP Expired" })
        }

        const hashedPassword = await bcrypt.hash(newPassword, saltRounds)

        user.passwordHash = hashedPassword
        user.resetOtp =''
        user.resetOtpExpireAt = 0

        await user.save()
        logger.info('Password reset successful', { email: normalizedEmail, userId: user._id })
        return res.status(200).json({ success: true, message: "Password reset successful" })

    } catch(error) {
        logger.error('Password reset error', { error: error.message, email: formEmail })
        return res.status(500).json({ success: false, message: error.message })
    }
}

const generateExtensionToken = async (req, res) => {
    try {
        const token = jwt.sign(
            {
                id: req.user.id,
                type: 'extension',
            },
            secret,
            { expiresIn: '30d' },
        )

        logger.info('Extension token generated', { userId: req.user.id })
        return res.status(200).json({
            success: true,
            message: 'Extension token generated successfully',
            token,
            expiresIn: '30d',
        })
    } catch (error) {
        logger.error('Extension token generation error', { error: error.message, userId: req.user?.id })
        return res.status(500).json({ success: false, message: error.message })
    }
}

module.exports = {
    register,
    login,
    logout,
    sendVerifyOtp,
    verifyOtp,
    isAuthenticated,
    sendPasswordResetOtp,
    resetPassword,
    generateExtensionToken,
}
