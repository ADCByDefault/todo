import express from "express";
import indexController from "../controllers/indexController.js";

const router = express.Router();

router.get("/", indexController.homeGet);
router.get("/dashboard", indexController.dashboardGet);

export default router;
