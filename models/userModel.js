import mongoose from "mongoose";
import bcrypt from "bcrypt";

const saltRounds = 10;

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: [true, "Username is required!"],
            unique: true,
            trim: true,
            validate: {
                validator: function (value) {},
                message: (props) => `${props.value} is not a valid username!`,
            },
            minlength: [3, "Username must be at least 3 characters!"],
        },
        password: {
            type: String,
            required: true,
            minlength: [3, "Password must be at least 3 characters!"],
            validate: {
                validator: function (value) {},
                message: (props) => `Password is not valid!`,
            },
        },
        name: { type: String, trim: true, default: "" },
        email: { type: String, trim: true, default: "" },
    },
    {
        timestamps: true,
    }
);

userSchema.pre("save", async function (next) {
    const user = this;
    user.password = await bcrypt.hash(user.password, saltRounds);
    next();
});

const userModel = mongoose.model("user", userSchema);

export default userModel;
