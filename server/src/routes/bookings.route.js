import express from "express";
import { cancelBooking, createBooking, getBookingById, getMyBookings } from "../controllers/bookings.controller.js";
import { protect } from "../middlewares/auth.middlewares.js";

const BookingRouter = express.Router();

BookingRouter.use(protect);
BookingRouter.post("/", createBooking);
BookingRouter.get("/my", getMyBookings);
BookingRouter.get("/:id", getBookingById);
BookingRouter.put("/:id/cancel", cancelBooking);

export default BookingRouter;
