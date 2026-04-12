const jwt = require('jsonwebtoken')
const User = require('../models/User')
const logger = require('../config/logger')

const extractExtensionToken = (req) => {
    const authHeader = req.headers?.authorization || ''
    if (authHeader.startsWith('Bearer ')) {
        return authHeader.slice(7)
    }

    const tokenHeader = req.headers?.['x-extension-token']
    if (typeof tokenHeader === 'string' && tokenHeader.trim()) {
        return tokenHeader.trim()
    }

    return null
}

const extensionAuth = async (req, res, next) => {
    const token = extractExtensionToken(req)

    if (!token) {
        logger.warn('Extension auth: missing token')
        return res.status(401).json({ success: false, message: 'Missing extension authentication token' })
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        if (!decoded.id || decoded.type !== 'extension') {
            logger.warn('Extension auth: invalid token type or missing id', { decodedId: decoded.id, decodedType: decoded.type })
            return res.status(401).json({ success: false, message: 'Invalid extension authentication token' })
        }

        const user = await User.findById(decoded.id).select('_id email isActive isEmailVerified')
        if (!user || !user.isActive) {
            logger.warn('Extension auth: user unavailable', { userId: decoded.id })
            return res.status(401).json({ success: false, message: 'Extension user is unavailable' })
        }

        if (!user.isEmailVerified) {
            logger.warn('Extension auth: unverified email', { userId: decoded.id })
            return res.status(403).json({ success: false, message: 'Verify email before using extension APIs' })
        }

        req.user = {
            id: user._id.toString(),
            email: user.email,
            isEmailVerified: true,
        }

        return next()
    } catch (error) {
        logger.warn('Extension auth: invalid or expired token', { error: error.message })
        return res.status(401).json({ success: false, message: 'Invalid or expired extension token' })
    }
}

module.exports = {
    extensionAuth,
}
