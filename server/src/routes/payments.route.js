import express from "express";
import { createPaymentForBooking, handleVnpayReturn } from "../controllers/payments.controller.js";
import { protect } from "../middlewares/auth.middlewares.js";

const PaymentRouter = express.Router();

PaymentRouter.post("/vnpay", protect, createPaymentForBooking);
PaymentRouter.get("/vnpay-return", handleVnpayReturn);

export default PaymentRouter;
