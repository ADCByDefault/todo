import mongoose from "mongoose";

const statusEnum = ["active", "inactive", "done", "deleted"];

const Schema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "Title is required!"],
        },
        description: {
            type: String,
        },
        status: {
            type: String,
            enum: statusEnum,
            default: statusEnum[0],
        },
        dueDate: {
            type: Date,
        },
        priority: {
            type: Number,
            min: [1, "Priority must be between 1 and 5"],
            max: [5, "Priority must be between 1 and 5"],
        },
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user",
            required: [true, "Owner is required!"],
        },
        sharedWith: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "user",
            },
        ],
    },
    {
        timestamps: true,
    }
);

const taskModel = mongoose.model("task", Schema);

export default taskModel;
