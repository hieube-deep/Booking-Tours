import express from "express";
import { getDepartureById, getDeparturesByTour } from "../controllers/departures.controller.js";

const DepartureRouter = express.Router();

DepartureRouter.get("/tour/:tourId", getDeparturesByTour);
DepartureRouter.get("/:id", getDepartureById);

export default DepartureRouter;
