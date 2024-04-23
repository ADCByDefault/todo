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
        ret = { created: true, user_id: user._id };
    } catch (error) {
        console.log(error);
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

const controller = {
    /**
     *
     * @param {express.Request} req
     * @param {express.Response} res
     */
    loginGet: async function (req, res) {
        res.render("auth/login");
    },
    /**
     *
     * @param {express.Request} req
     * @param {express.Response} res
     */
    signupGet: async function (req, res) {
        res.render("auth/signup");
    },
    /**
     *
     * @param {express.Request} req
     * @param {express.Response} res
     */
    loginPost: async function (req, res) {
        res.send("Login POST");
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
