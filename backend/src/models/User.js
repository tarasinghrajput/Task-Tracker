const { mongoose } = require('mongoose')
const { Sheets } = require('./Sheets')


const userSchema = mongoose.Schema(
    {
        // name: { type: String, trim: true, },
        email: { type: String, required: true, unique: true, lowercase: true, },
        passwordHash: { type: String, required: true, },
        isActive: { type: Boolean, default: true, },
        isEmailVerified: { type: Boolean, default: false, },
        refreshTokenId: { type: String },
        createdAt: { type: Date, required: true, },
        updatedAt: { type: Date, },
        passwordResetToken: { type: String },
        passwordResetExpires: { type: Date },
    },
    { timestamps: true }
)

module.exports = mongoose.model("User", userSchema)