const jwt = require('jsonwebtoken')
const User = require('../models/User')
const logger = require('../config/logger')

const extractToken = (req) => {
    const cookieToken = req.cookies?.token
    if (cookieToken) {
        return cookieToken
    }

    const authHeader = req.headers?.authorization || ''
    if (authHeader.startsWith('Bearer ')) {
        return authHeader.slice(7)
    }

    return null
}

const userAuth = async (req, res, next) => {
    const token = extractToken(req)

    if (!token) {
        logger.warn('Auth middleware: missing token')
        return res.status(401).json({ success: false, message: 'Not authorized login again' })
    }

    try {
        const tokenDecode = jwt.verify(token, process.env.JWT_SECRET)

        if (!tokenDecode.id) {
            logger.warn('Auth middleware: token missing id field')
            return res.status(401).json({ success: false, message: 'Not authorized login again' })
        }

        const user = await User.findById(tokenDecode.id).select('_id email isActive isEmailVerified')

        if (!user || !user.isActive) {
            logger.warn('Auth middleware: user inactive or not found', { userId: tokenDecode.id })
            return res.status(401).json({ success: false, message: 'User account is inactive or unavailable' })
        }

        req.user = {
            id: user._id.toString(),
            email: user.email,
            isEmailVerified: Boolean(user.isEmailVerified),
        }

        return next()
    } catch (error) {
        logger.warn('Auth middleware: invalid or expired token', { error: error.message })
        return res.status(401).json({ success: false, message: 'Invalid or expired authentication token' })
    }
}

module.exports = {
    userAuth,
}
