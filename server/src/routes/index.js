import express from "express";
import UserRouter from "./users.route.js";
import TourRouter from "./tours.route.js";

const router = express.Router();

router.use('/auth', UserRouter);
router.use('/tours', TourRouter);

export default router;