import express from "express";
import { createReview, deleteReview, getReviewsByTour } from "../controllers/reviews.controller.js";
import { protect } from "../middlewares/auth.middlewares.js";

const ReviewRouter = express.Router();

ReviewRouter.get('/tour/:tourId', getReviewsByTour);
ReviewRouter.post('/', protect, createReview);
ReviewRouter.delete('/:id', protect, deleteReview);

export default ReviewRouter;
