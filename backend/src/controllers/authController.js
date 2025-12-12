const bcrypt = require('bcryptjs')
const saltRounds = 12
// const jwt = require('jsonwebtoken')
const User = require('../models/User')
const { validationResult } = require('express-validator')

const register = async (req, res) => {

    const errors = validationResult(req)
    if(!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() })
    }

    const { email, password } = req.body
    const exisiting = await User.findOne({ email })
    if(exisiting) {
        res.status(409).json({ message: "User already registered" })
    }

    const passwordHash = await bcrypt.hash(password, saltRounds)
    const createdAt = new Date().toIsoString()
    const user = await User.create({ email, passwordHash, createdAt })

    await user.save()

    return res.status(201).json({
        message: "Registered the user successfully"
    })
}

module.exports = {
    register
}