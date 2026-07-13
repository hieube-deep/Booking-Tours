import express from "express";
import { validatePromoCode } from "../controllers/promotion.controller.js";
import { protect } from "../middlewares/auth.middlewares.js";

const PromotionRouter = express.Router();

PromotionRouter.use(protect);
PromotionRouter.post("/validate", validatePromoCode);

export default PromotionRouter;
