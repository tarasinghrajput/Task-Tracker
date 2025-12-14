const express = require('express')
const cors = require('cors')
const connectDB = require('./db')
require('dotenv').config()
const session = require('express-session')
const { authRouter } = require('./routes/authRoutes.js')

const app = express()
app.use(express.json())
app.use(cors({ origin: "http://localhost:5173", credentials: true }))
const PORT = process.env.PORT || 8000

connectDB()
app.set('trust proxy', 1)

// API Endpoint
app.get('/api/health', (req, res) => {
    res.status(200).json({message: "ok", timestamp: new Date})
})

app.use('/api/auth', authRouter)

app.listen(PORT, () => {
    console.log(`Server is listening on PORT = ${PORT}`)
})