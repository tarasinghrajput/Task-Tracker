const express = require('express')
const connectDB = require('./db')
require('dotenv').config()

const app = express()
const PORT = process.env.PORT || 8000

connectDB()

app.get('/api/health', (req, res) => {
    res.status(200).json({message: "ok", timestamps: new Date})
})

app.get('/api/login', (req, res) => {
    if(req.body == null) {
        res.status(400).json({message: "email or password is missing in the request"})
    }

    res.status(200).json({ message: "login successfully" })
})

app.listen(PORT, () => {
    console.log(`Server is listening on PORT = ${PORT}`)
})