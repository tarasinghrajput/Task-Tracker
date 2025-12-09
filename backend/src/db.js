const { mongoose } = require('mongoose')

const connectDB = async () => {
    const uri = process.env.MONGO_URI
    if(!uri) {
        throw new Error('MONGO_URI absent in .env')
    }

    try {

        await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 10000
        })

        console.log('�o Mong DB Connected successfully')
    } catch(error) {
        console.error("Mongo DB not connected", error.message)
        process.exit(1)
    }
}

module.exports = connectDB