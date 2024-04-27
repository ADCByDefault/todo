import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
const controller = {
    /**
     *
     * @param {express.Request} req
     * @param {express.Response} res
     */
    dashboardGet: async function (req, res) {
        const _id = req.cookies?._id || "";
        const token = req.cookies?.token || "";
        const ret = await authMiddleware.isAuthenticated(_id, token);
        if (!ret.isAuthenticated) {
            res.clearCookie("token");
            res.clearCookie("_id");
            res.clearCookie("isAuthenticated");
            res.redirect("/auth/login");
            return;
        }
        res.render("dashboard", { context: {} });
    },
    homeGet: async function (req, res) {
        res.render("home", { context: {} });
    },
};

export default controller;
