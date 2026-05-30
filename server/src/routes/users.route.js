import express from "express";
import { changePassword, Login, Register, googleLogin } from "../controllers/auth.controller.js";
import { protect, adminOnly } from "../middlewares/auth.middlewares.js";
import { getDashboard, getRevenueChart } from "../controllers/admin.controller.js";

const UserRouter = express.Router();

UserRouter.post('/register', Register);
UserRouter.post('/login', Login);
UserRouter.post('/google-login', googleLogin);

UserRouter.use(protect);

UserRouter.get('/', adminOnly, getDashboard);
UserRouter.get('/revenue', adminOnly, getRevenueChart)
UserRouter.put('/change-password', changePassword);

export default UserRouter;
