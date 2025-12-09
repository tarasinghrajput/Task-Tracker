const { mongoose } = require('mongoose')
const { Schema } = mongoose

const sheetSchema = new Schema(
    {
        id: { type: Schema.Types.ObjectId, required: true, unique: true, },
        name: { type: String, required: true, },
        tabName: { type: String, required: true, },
        sheetURL: { type: String, required: true, },
        isDefault: { type: Boolean, default: false, },
    }
)

const userSchema = new Schema(
    {
        name: { type: String, required: true, trim: true, },
        email: { type: String, required: true, unique: true, lowercase: true, },
        passwordHash: { type: String, required: true, },
        isActive: { type: Boolean, default: true, },
        isVerified: { type: Boolean, default: false, },
        otpHash: { type: String, },
        otpExpiresAt: { type: Date, },
        createdAt: { type: Date, required: true, },
        updatedAt: { type: Date, },
        sheets: [sheetSchema],
    },
    { timestamps: true }
)

module.exports = mongoose.model("User", userSchema)