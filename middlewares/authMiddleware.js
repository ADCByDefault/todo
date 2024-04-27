import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import jwtlogModel from "../models/jwtlogModel.js";
import userModel from "../models/userModel.js";
import express from "express";

const secret = "verysecretkey";

function getExpireTime(duration = 86400) {
    const currentTime = new Date().getTime();
    const expireTime = currentTime + duration;
    return expireTime;
}

const methods = {
    isAuthenticated: async function (_id, token) {
        let ret = {
            isAuthenticated: false,
            error: {
                errors: {},
            },
        };
        if (!_id || _id === "") {
            ret.error.errors._ida = { message: "Username is required!" };
            return ret;
        }
        if (!token || token === "") {
            ret.error.errors.token = { message: "Token is required!" };
            return ret;
        }
        const retVerify = await this.verifyToken(_id, token);
        if (!retVerify.verified) {
            ret.error = retVerify.error;
            return ret;
        }
        ret.isAuthenticated = true;
        delete ret.error;
        return ret;
    },
    authenticate: async function (user, password, req) {
        let ret = {
            isAuthenticated: false,
            token: null,
            error: {
                errors: {},
            },
        };
        if (!user) {
            ret.error.errors.username = { message: "User not found!" };
            return ret;
        }
        if (!password || password === "") {
            ret.error.errors.password = { message: "Password is required!" };
            return ret;
        }
        try {
            const isMatch = await bcrypt.compare(password, user.password);
            if (isMatch) {
                const ip = req.ip;
                const duration = 86400;
                const jwtlog = await this.generateToken(user, ip, duration);
                ret.token = jwtlog.token;
                ret.isAuthenticated = true;
                delete ret.error;
            } else {
                ret.error.errors.password = {
                    message: "Password is incorrect!",
                };
            }
        } catch (error) {
            ret.error.errors.general = {
                message: "An error occurred while authenticating",
            };
        }
        return ret;
    },
    generateToken: async function (user, ip, duration) {
        let ret = {
            generated: false,
            jwtlog: null,
            token: null,
            error: {
                errors: {},
            },
        };
        try {
            const token = jwt.sign({ id: user._id }, secret);
            const expireTime = getExpireTime(duration);
            const jwtlog = new jwtlogModel({
                token: token,
                user: user._id,
                expires: expireTime,
                ip: ip,
            });
            await jwtlog.save();
            ret.jwtlog = jwtlog;
            ret.token = token;
            ret.generated = true;
            delete ret.error;
        } catch (error) {
            ret.error.errors.general = {
                message: "An error occurred while generating token",
            };
        }
        return ret;
    },
    verifyToken: async function (_id, token) {
        let ret = {
            verified: false,
            error: {
                errors: {},
            },
        };
        try {
            const user = await userModel.findOne({ _id: _id });
            if (!user) {
                ret.error.errors._idv = {
                    message: "Username does not exist!",
                };
                return ret;
            }
            const jwtlog = await jwtlogModel.findOne({ token: token });
            if (!jwtlog) {
                ret.error.errors.token = { message: "Token is invalid!" };
                return ret;
            }
            if (jwtlog.user.toString() !== user._id.toString()) {
                ret.error.errors.token = { message: "Token is invalid!" };
                return ret;
            }
            const currentTime = new Date().getTime();
            if (jwtlog.expires < currentTime) {
                ret.error.errors.token = { message: "Token has expired!" };
                jwtlogModel.deleteOne({ token: jwtlog.token });
                return ret;
            }
        } catch (error) {
            ret.error.errors.general = {
                message: "An error occurred while authenticating",
            };
        }
        ret.verified = true;
        delete ret.error;
        return ret;
    },
};

export default methods;
