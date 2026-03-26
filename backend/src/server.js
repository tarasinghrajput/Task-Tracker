const express = require('express')
const cors = require('cors')
const connectDB = require('./config/db.js')
require('dotenv').config()
const cookieParser = require('cookie-parser')
const { authRouter } = require('./routes/authRoutes.js')
const { taskRouter } = require('./routes/taskRoutes.js')
const { sheetRouter } = require('./routes/sheetRoutes.js')

const app = express()
app.use(express.json())
app.use(cookieParser())
app.use(cors({ origin: process.env.CORS_ORIGIN, credentials: true }))
const PORT = process.env.PORT || 8000

connectDB()
app.set('trust proxy', 1)

// API Endpoint
app.get('/api/health', (req, res) => {
    res.status(200).json({message: "ok", timestamp: new Date})
})

app.use('/api/auth', authRouter)
app.use('/api/task', taskRouter)
app.use('/api/sheets', sheetRouter)

app.post('/api/extension/taskNote', (req, res) => {
    try {
        const { taskNote } = req.body;
    
        if(!taskNote) return res.status(401).json({ success: false, message: "No taskNote received" })
    
        console.log("New taskNote appeared from extension", taskNote)
        res.status(200).json({ success: true, message: "Task Note added from extension" })
    } catch(error) {
        res.status(500).json({ success: false, message: error.message })
    }
})

app.listen(PORT, () => {
    console.log(`Server is listening on PORT = ${PORT}`)
})
