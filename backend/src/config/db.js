const mongoose = require('mongoose')
const logger = require('./logger')

const connectDB = async () => {
    const uri = `${process.env.MONGO_URI}`
    if (!process.env.MONGO_URI) {
        throw new Error('MONGO_URI absent in .env')
    }
    if (!uri) {
        throw new Error('MONGO_URI absent in .env')
    }

    try {
        await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 10000
        })

        logger.info('MongoDB connected successfully')
    } catch (error) {
        logger.error('MongoDB connection failed', { error: error.message })
        process.exit(1)
    }
}

module.exports = connectDB
