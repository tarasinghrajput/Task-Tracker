const { mongoose } = require('mongoose')

const taskSchema = mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        taskIdentifier: { type: String, required: true },
        taskTimeElapsed: { type: String, required: true, },
        taskDate: { type: Date, required: true, },
        taskCategory: { type: String, required: true, },
        taskType: { type: String, required: true, },
        taskTitle: { type: String, required: true },
        taskDescription: { type: String, required: true },
        taskPriority: { type: Number, required: true },
        taskStatus: { type: String, required: true, },
        impactArea: { type: String, default: '' },
        impactLevel: { type: String, enum: ['low', 'medium', 'high'], default: 'low' },
        issueSource: { type: String, default: '' },
        toolsInvolved: { type: String, default: '' },
        isSyncedToSheet: { type: Boolean, default: false },
        sheetSyncError: { type: String, default: '' },
    },
    { timestamps: true }
)

taskSchema.index({ userId: 1, taskIdentifier: 1 }, { unique: true })

module.exports = mongoose.model("Task", taskSchema)
