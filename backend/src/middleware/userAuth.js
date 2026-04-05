const jwt = require('jsonwebtoken')
const User = require('../models/User')

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
        return res.status(401).json({ success: false, message: 'Not authorized login again' })
    }

    try {
        const tokenDecode = jwt.verify(token, process.env.JWT_SECRET)

        if (!tokenDecode.id) {
            return res.status(401).json({ success: false, message: 'Not authorized login again' })
        }

        const user = await User.findById(tokenDecode.id).select('_id email isActive isEmailVerified')

        if (!user || !user.isActive) {
            return res.status(401).json({ success: false, message: 'User account is inactive or unavailable' })
        }

        req.user = {
            id: user._id.toString(),
            email: user.email,
            isEmailVerified: Boolean(user.isEmailVerified),
        }

        return next()
    } catch (error) {
        return res.status(401).json({ success: false, message: 'Invalid or expired authentication token' })
    }
}

module.exports = {
    userAuth,
}
