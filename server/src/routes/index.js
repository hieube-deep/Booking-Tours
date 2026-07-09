import express from "express";
import UserRouter from "./users.route.js";
import TourRouter from "./tours.route.js";
import AdminRouter from "./admin.route.js";

const router = express.Router();

router.use('/auth', UserRouter);
router.use('/tours', TourRouter);
router.use('/admin', AdminRouter);

export default router;
