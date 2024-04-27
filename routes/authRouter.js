import express from "express";
import authController from "../controllers/authController.js";

const router = express.Router();

router.get("/login", authController.loginGet);
router.get("/signup", authController.signupGet);
router.get("/logout", authController.logoutGet);

router.post("/login", authController.loginPost);
router.post("/signup", authController.signupPost);

export default router;
