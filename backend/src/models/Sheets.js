const { mongoose } = require('mongoose')


const Sheets = mongoose.Schema(
    {
        name: { type: String, required: true, },
        tabName: { type: String, required: true, },
        sheetURL: { type: String, required: true, },
        isDefault: { type: Boolean, default: false, },
    }
)

module.exports = mongoose.model("Sheets", Sheets)