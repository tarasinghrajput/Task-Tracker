const express = require('express')
const cors = require('cors')
const connectDB = require('./db')
require('dotenv').config()

const app = express()
app.use(express.json())
app.use(cors({ origin: "http://localhost:5173" }))
const PORT = process.env.PORT || 8000

connectDB()
app.set('trust proxy', 1)

app.get('/api/health', (req, res) => {
    res.status(200).json({message: "ok", timestamp: new Date})
})

app.post('/api/login', (req, res) => {
    if(req.body == null) {
        res.status(401).json({message: "email or password is missing in the request"})
    }

    res.status(200).json({ message: "login successfully" })
})

app.listen(PORT, () => {
    console.log(`Server is listening on PORT = ${PORT}`)
})