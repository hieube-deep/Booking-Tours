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

    // Thử tìm bằng slug trước (slug là chuỗi chứa dấu '-')
    // nếu id trông giống ObjectId (24 ký tự hex) thì thử findById, không thì findOne theo slug
    const isObjectId = /^[a-fA-F0-9]{24}$/.test(id);

    if (isObjectId) {
        tour = await Tour.findById(id).populate({ path: "review", select: "_id" });
        // Nếu không tìm thấy theo _id, fallback sang slug
        if (!tour) {
            tour = await Tour.findOne({ slug: id }).populate({ path: "review", select: "_id" });
        }
    } else {
        // Tìm theo slug
        tour = await Tour.findOne({ slug: id }).populate({ path: "review", select: "_id" });
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