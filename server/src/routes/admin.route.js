import express from "express";
import {
    deleteUser,
    getAdminBookings,
    getAdminTours,
    getAdminUsers,
    getDashboard,
    getRevenueChart,
    updateBookingStatus,
    updateUserRole
} from "../controllers/admin.controller.js";
import { createTour, deleteTour, updateTour } from "../controllers/tours.controller.js";
import { adminOnly, protect } from "../middlewares/auth.middlewares.js";

const AdminRouter = express.Router();

AdminRouter.use(protect, adminOnly);

AdminRouter.get("/dashboard", getDashboard);
AdminRouter.get("/revenue", getRevenueChart);

AdminRouter.get("/tours", getAdminTours);
AdminRouter.post("/tours", createTour);
AdminRouter.put("/tours/:id", updateTour);
AdminRouter.delete("/tours/:id", deleteTour);

AdminRouter.get("/bookings", getAdminBookings);
AdminRouter.put("/bookings/:id/status", updateBookingStatus);

AdminRouter.get("/users", getAdminUsers);
AdminRouter.put("/users/:id/role", updateUserRole);
AdminRouter.delete("/users/:id", deleteUser);

export default AdminRouter;
