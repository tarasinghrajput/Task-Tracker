const { mongoose } = require('mongoose')

const userSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true, },
        email: { type: String, required: true, unique: true, lowercase: true, },
        passwordHash: { type: String, required: true, },
        isActive: { type: Boolean, default: true, },
        isVerified: { type: Boolean, default: false, },
        otpHash: { type: String, },
        otpExpiresAt: { type: Date, },
    },
    { timestamps: true }
)

module.exports = mongoose.model("User", userSchema)