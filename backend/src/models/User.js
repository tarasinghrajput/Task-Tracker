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
        sheets: [sheetSchema],
    },
    { timestamps: true }
)

module.exports = mongoose.model("User", userSchema)