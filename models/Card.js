
import mongoose, { Schema } from "mongoose";


const taskSchema = new mongoose.Schema({
    task: {
        type: String,
        required: true,
    },
    completed: {
        type: Boolean,
        required: true,
        default: false,
    },
})

const cardSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    priority: {
        type: String,
        required: true,
    },
    checklist: {
        type: [taskSchema],
        required: true,
    },
    dueDate: {
        type: Date,
    },
    category: {
        type: String,
        required: true,
        default: 'to do',
    },
    assignee: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    }
    
}, { timestamps: true })

export default mongoose.model("Card", cardSchema);