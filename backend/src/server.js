const express = require('express')
const cors = require('cors')
const connectDB = require('./config/db.js')
require('dotenv').config()
const cookieParser = require('cookie-parser')
const { authRouter } = require('./routes/authRoutes.js')
const { taskRouter } = require('./routes/taskRoutes.js')

const app = express()
app.use(express.json())
app.use(cookieParser())
app.use(cors({ origin: "http://localhost:5173", credentials: true }))
const PORT = process.env.PORT || 8000

connectDB()
app.set('trust proxy', 1)

// API Endpoint
app.get('/api/health', (req, res) => {
    res.status(200).json({message: "ok", timestamp: new Date})
})

app.use('/api/auth', authRouter)
app.use('/api/task', taskRouter)

app.listen(PORT, () => {
    console.log(`Server is listening on PORT = ${PORT}`)
})