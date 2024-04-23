import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
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
        res.send("Signup POST");
    },
};

export default controller;
