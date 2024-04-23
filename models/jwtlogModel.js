import mongoose from "mongoose";

const jwtlogSchema = new mongoose.Schema(
    {
        token: {
            type: String,
            required: [true, "Please provide a token"],
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user",
            required: [true, "Please provide a user"],
        },
        ip: {
            type: String,
            required: [true, "Please provide an IP address"],
        },
        expires: {
            type: Number,
            required: [true, "Please provide a expiration date"],
        },
    },
    {
        timestamps: true,
    }
);

const jwtlogModel = mongoose.model("jwtlog", jwtlogSchema);

export default jwtlogModel;
