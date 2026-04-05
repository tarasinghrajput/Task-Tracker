const express = require('express')
const cors = require('cors')
const connectDB = require('./config/db.js')
require('dotenv').config()
const cookieParser = require('cookie-parser')
const { authRouter } = require('./routes/authRoutes.js')
const { taskRouter } = require('./routes/taskRoutes.js')
const { sheetRouter } = require('./routes/sheetRoutes.js')
const { extensionAuth } = require('./middleware/extensionAuth.js')
const Task = require('./models/Task.js')

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

const TASK_IDENTIFIER_PREFIX = 'TASK-'
const TASK_IDENTIFIER_REGEX = /^TASK-\d{3,}$/i

const getNextTaskIdentifierValue = async (userId) => {
    const lastTask = await Task.findOne({ userId }).sort({ createdAt: -1 }).select('taskIdentifier')
    if (!lastTask || !TASK_IDENTIFIER_REGEX.test(lastTask.taskIdentifier || '')) {
        return `${TASK_IDENTIFIER_PREFIX}001`
    }

    const [, numericPart] = lastTask.taskIdentifier.split('-')
    const nextNumber = (parseInt(numericPart, 10) || 0) + 1
    return `${TASK_IDENTIFIER_PREFIX}${String(nextNumber).padStart(3, '0')}`
}

app.post('/api/extension/taskNote', extensionAuth, async (req, res) => {
    try {
        const taskNote = String(req.body?.taskNote || '').trim()
        const taskTimeElapsed = String(req.body?.taskTimeElapsed || '00:00:00').trim()
        const stoppedAt = req.body?.stoppedAt

        const taskIdentifier = await getNextTaskIdentifierValue(req.user.id)
        const taskDate = stoppedAt ? new Date(stoppedAt) : new Date()
        const normalizedTaskNote = taskNote || 'Draft task from extension'

        const draftTask = new Task({
            userId: req.user.id,
            taskIdentifier,
            taskTimeElapsed,
            taskDate: Number.isNaN(taskDate.getTime()) ? new Date() : taskDate,
            taskTitle: normalizedTaskNote,
            taskDescription: normalizedTaskNote,
            taskStatus: 'draft',
            isDraft: true,
            draftSource: 'extension',
        })

        await draftTask.save()

        return res.status(200).json({
            success: true,
            message: 'Task draft saved from extension',
            task: draftTask,
        })
    } catch(error) {
        return res.status(500).json({ success: false, message: error.message })
    }
})

app.listen(PORT, () => {
    console.log(`Server is listening on PORT = ${PORT}`)
})
