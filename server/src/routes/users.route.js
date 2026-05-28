import express from "express";
import { changePassword, Login, Register, googleLogin } from "../controllers/auth.controller.js";
import { protect } from "../middlewares/auth.middlewares.js";

const UserRouter = express.Router();

UserRouter.post('/register', Register);
UserRouter.post('/login', Login);
UserRouter.post('/google-login', googleLogin);

UserRouter.use(protect);

UserRouter.put('/change-password', changePassword);

export default UserRouter;
