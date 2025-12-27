const { mongoose } = require('mongoose')

const taskSchema = mongoose.Schema(
    {
        taskIdentifier: { type: String, required: true, unique: true },
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

module.exports = mongoose.model("Task", taskSchema)
