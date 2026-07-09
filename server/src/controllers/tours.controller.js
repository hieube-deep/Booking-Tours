import Tour from "../models/tours.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose from "mongoose";

export const getAllTours = asyncHandler(async (req, res) => {
    const tours = await Tour.find({ isActive: true }).sort({ createdAt: -1 });

    return res.status(200).json({ success: true, data: tours.length, tours })
});

export const getTourById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    let tour;

    if (mongoose.Types.ObjectId.isValid(id)) {
        tour = await Tour.findById(id).populate({
            path: "review",
            select: "_id"
        });
    } else {
        tour = await Tour.findOne({ slug: id }).populate({
            path: "review",
            select: "_id"
        });
    }

    if (!tour) {
        return res.status(404).json({
            success: false,
            message: "Tour Not Found"
        });
    }
    return res.status(200).json({
        success: true,
        tour
    });
});

export const createTour = asyncHandler(async (req, res) => {
    const tour = await Tour.create({ ...req.body });
    return res.status(201).json({
        success: true,
        message: "Tour Created Successfully",
        tour
    });
});

export const updateTour = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const tour = await Tour.findByIdAndUpdate(id, { ...req.body }, { new: true });

    if (!tour) {
        return res.status(404).json({
            success: false,
            message: "Tour Not Found"
        });
    }
    return res.status(200).json({
        success: true,
        message: "Tour Update Successfully",
        tour
    });
});

export const deleteTour = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const tour = await Tour.findByIdAndDelete(id);

    if (!tour) {
        return res.status(404).json({
            success: false,
            message: "Tour Not Found"
        });
    }
    return res.status(200).json({
        success: true,
        message: "Tour Delete Successfully",
        tour
    });
});