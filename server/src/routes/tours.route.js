import express from "express";
import { createTour, deleteTour, getAllTours, getTourById, updateTour } from "../controllers/tours.controller.js";
import { adminOnly, protect } from "../middlewares/auth.middlewares.js";

const TourRouter = express.Router();

TourRouter.get('/', getAllTours);
TourRouter.get('/:id', getTourById);



TourRouter.post('/', createTour);
TourRouter.put('/:id', updateTour);
TourRouter.delete('/:id', deleteTour);

export default TourRouter;