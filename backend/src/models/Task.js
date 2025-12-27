const { mongoose } = require('mongoose')

const taskSchema = mongoose.Schema(
    {
        taskTimeElapsed: { type: String, required: true, },
            taskDate: { type: Date, required: true, },
        taskCategory: { type: String, required: true, },
        taskType: { type: String, required: true, },
        taskTitle: { type: String, required: true },
        taskDescription: { type: String, required: true },
        taskPriority: { type: Number, required: true },
        taskStatus: { type: String, required: true, },
    },
    { timestamps: true }
)

module.exports = mongoose.model("Task", taskSchema)