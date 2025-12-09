const express = require('express')
const connectDB = require('./db')

const app = express()
const PORT = process.env.PORT || 8000

// connectDB()

app.get('/health', (req, res) => {
    res.status(200).json({message: "ok", timestamps: new Date})
})

app.listen(PORT, () => {
    console.log(`Server is listening on PORT = ${PORT}`)
})