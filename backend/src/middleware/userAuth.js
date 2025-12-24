const jwt = require('jsonwebtoken')

const userAuth = async (req, res, next) => {
    const token = req.cookies?.token

    if (!token) {
        return res.status(401).json({ success: false, message: "Not authorized login again" })
    }

    try {
        const tokenDecode = jwt.verify(token, process.env.JWT_SECRET)

        if (!tokenDecode.id) {
            return res.status(402).json({ success: false, message: "Not authorized login again" })
            // req.body.userId = tokenDecode.id
        }

        req.user = {
            id: tokenDecode.id
        }

        next()

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message })
    }
}

module.exports = {
    userAuth
}