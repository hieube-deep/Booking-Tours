import express from "express";
import { changePassword, Login, Register } from "../controllers/auth.controller.js";
import { protect } from "../middlewares/auth.middlewares.js";

const UserRouter = express.Router();

UserRouter.post('/register', Register);
UserRouter.post('/login', Login);
UserRouter.put('/change-password', protect, changePassword);

export default UserRouter;