const jwt = require('jsonwebtoken')
const User = require('../models/User')

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
        return res.status(401).json({ success: false, message: 'Missing extension authentication token' })
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        if (!decoded.id || decoded.type !== 'extension') {
            return res.status(401).json({ success: false, message: 'Invalid extension authentication token' })
        }

        const user = await User.findById(decoded.id).select('_id email isActive isEmailVerified')
        if (!user || !user.isActive) {
            return res.status(401).json({ success: false, message: 'Extension user is unavailable' })
        }

        if (!user.isEmailVerified) {
            return res.status(403).json({ success: false, message: 'Verify email before using extension APIs' })
        }

        req.user = {
            id: user._id.toString(),
            email: user.email,
            isEmailVerified: true,
        }

        return next()
    } catch (error) {
        return res.status(401).json({ success: false, message: 'Invalid or expired extension token' })
    }
}

module.exports = {
    extensionAuth,
}
