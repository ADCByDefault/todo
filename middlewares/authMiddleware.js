import jwt from "jsonwebtoken";
import jwtlogModel from "../models/jwtlogModel.js";
import userModel from "../models/userModel.js";
import express from "express";

function getExpireDate(duration = 86400) {
    const currentTime = new Date().getTime();
    const expireTime = currentTime + duration;
    return expireTime;
}

const methods = {
    isAuthenticated: async function (req, res) {},
    authenticate: async function (req, res) {},
    generateToken: async function (user) {},
    verifyToken: async function (username, jwt) {},
};

export default methods;
