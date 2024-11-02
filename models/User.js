
import mongoose, { Schema } from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    cards: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Card'
        }
    ]
}, { timestamps: true })

export default mongoose.model("User", userSchema);