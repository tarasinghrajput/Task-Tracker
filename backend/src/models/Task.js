const { mongoose } = require('mongoose')

const taskSchema = mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        taskIdentifier: { type: String, required: true },
        taskTimeElapsed: { type: String, default: '00:00:00' },
        taskDate: { type: Date, default: Date.now },
        taskCategory: { type: String, default: '' },
        taskType: { type: String, default: '' },
        taskTitle: { type: String, default: '' },
        taskDescription: { type: String, default: '' },
        taskPriority: { type: Number, default: 0 },
        taskStatus: { type: String, default: 'draft' },
        impactArea: { type: String, default: '' },
        impactLevel: { type: String, enum: ['low', 'medium', 'high'], default: 'low' },
        issueSource: { type: String, default: '' },
        toolsInvolved: { type: String, default: '' },
        isSyncedToSheet: { type: Boolean, default: false },
        sheetSyncError: { type: String, default: '' },
        isDraft: { type: Boolean, default: false },
        draftSource: { type: String, default: '' },
    },
    { timestamps: true }
)

taskSchema.index({ userId: 1, taskIdentifier: 1 }, { unique: true })

module.exports = mongoose.model("Task", taskSchema)
