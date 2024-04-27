import express from "express";
import userModel from "../models/userModel.js";
import authMiddleware from "../middlewares/authMiddleware.js";

/**
 *
 * @param {Request} req
 * @param {Response} res
 * @returns
 */
async function createUser(req, res) {
    const { username, password, name, email } = req.body;
    let ret = {};
    try {
        const user = new userModel({ username, password, name, email });
        await user.save();
        ret = { created: true, user_id: user._id, user: user };
    } catch (error) {
        if (error.code === 11000) {
            error.errors = {
                ...error.errors,
                username: { message: "Username already exists!" },
            };
        }
        ret = { created: false, error: error };
    }
    return ret;
}
async function findUser(username) {
    let ret = {
        doesExist: false,
        user: null,
        error: { errors: {} },
    };
    if (!username || username === "") {
        ret.error.errors.username = { message: "Username is required!" };
        return ret;
    }
    try {
        const user = await userModel.findOne({ username: username });
        if (user) {
            ret.doesExist = true;
            ret.user = user;
            delete ret.error;
        } else {
            ret.error.errors.username = { message: "Username does not exist!" };
        }
    } catch (error) {
        ret.error.errors.general = {
            message: "An error occurred while finding the user",
        };
    }
    return ret;
}

const controller = {
    /**
     *
     * @param {express.Request} req
     * @param {express.Response} res
     */
    loginGet: async function (req, res) {
        res.render("auth/login", { context: {} });
    },
    /**
     *
     * @param {express.Request} req
     * @param {express.Response} res
     */
    signupGet: async function (req, res) {
        res.render("auth/signup", { context: {} });
    },
    /**
     *
     * @param {express.Request} req
     * @param {express.Response} res
     */
    loginPost: async function (req, res) {
        const { username, password } = req.body;
        const user = await findUser(username);
        if (!user.doesExist) {
            res.status(404);
            res.send(user);
            return;
        }
        const ret = await authMiddleware.authenticate(user.user, password, req);
        if (ret.isAuthenticated) {
            res.status(200);
            res.cookie("token", ret.token, {
                httpOnly: true,
                maxAge: 86400000,
            });
            res.cookie("_id", user.user._id, {
                maxAge: 86400000,
            });
            res.cookie("isAuthenticated", true, {
                maxAge: 86400000,
            });
        } else {
            res.status(401);
        }
        delete ret.token;
        res.send(ret);
    },
    /**
     *
     * @param {express.Request} req
     * @param {express.Response} res
     */
    signupPost: async function (req, res) {
        const ret = await createUser(req, res);
        if (ret.created) {
            res.status(201);
        } else {
            res.status(400);
        }
        res.send(ret);
    },
};

export default controller;
