import express from "express";
import UserRouter from "./users.route.js";

const router = express.Router();

router.use('/auth', UserRouter);

export default router;