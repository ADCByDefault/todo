import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import jwtlogModel from "../models/jwtlogModel.js";
import userModel from "../models/userModel.js";
import express from "express";

const secret = "verysecretkey";

function getExpireTime(duration = 86400000) {
    const currentTime = new Date().getTime();
    const expireTime = currentTime + duration;
    return expireTime;
}

const methods = {
    isAuthenticated: async function (token) {
        let ret = {
            isAuthenticated: false,
            error: {
                errors: {},
            },
        };
        const retVerify = await this.verifyToken(token);
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
                const duration = 86400000;
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
            const token = jwt.sign({ _id: user._id }, secret);
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
    verifyToken: async function (token) {
        let ret = {
            verified: false,
            user: null,
            error: {
                errors: {},
            },
        };
        try {
            if (!token || token === "") {
                ret.error.errors.token = { message: "Token is required!" };
                return ret;
            }
            const jwtlog = await jwtlogModel.findOne({ token: token });
            const user_id = jwt.decode(token);
            const user = await userModel.findOne({ _id: user_id });
            ret.user = user;
            if (!user_id || !user || !jwtlog) {
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
                return ret;
            }
            ret.verified = true;
            delete ret.error;
        } catch (error) {
            ret.error.errors.general = {
                message: "An error occurred while authenticating",
            };
            return ret;
        } finally {
            if (!ret.verified) {
                this.removeToken(token);
            }
        }

        return ret;
    },
    removeToken: async function (token) {
        try {
            await jwtlogModel.deleteOne({ token: token });
        } catch (error) {
            return false;
        }
        return true;
    },
};

export default methods;
