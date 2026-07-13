import Tour from "../models/tours.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose from "mongoose";

const sortOptions = {
    newest: { createdAt: -1 },
    priceAsc: { "price.adult": 1 },
    priceDesc: { "price.adult": -1 },
    rating: { rating: -1 },
};

export const getAllTours = asyncHandler(async (req, res) => {
    const { type, destination, search, minPrice, maxPrice, duration, isFeatured, sort } = req.query;
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 12, 1), 50);
    const skip = (page - 1) * limit;

    const filters = { isActive: true };

    if (type) filters.type = type;
    if (destination) filters.destination = { $regex: destination, $options: "i" };
    if (isFeatured !== undefined) filters.isFeatured = isFeatured === "true";
    if (duration) filters["duration.days"] = Number(duration);
    if (minPrice || maxPrice) {
        filters["price.adult"] = {};
        if (minPrice) filters["price.adult"].$gte = Number(minPrice);
        if (maxPrice) filters["price.adult"].$lte = Number(maxPrice);
    }
    if (search) {
        filters.$or = [
            { title: { $regex: search, $options: "i" } },
            { destination: { $regex: search, $options: "i" } },
            { tags: { $regex: search, $options: "i" } },
        ];
    }

    const [tours, total] = await Promise.all([
        Tour.find(filters).sort(sortOptions[sort] || sortOptions.newest).skip(skip).limit(limit),
        Tour.countDocuments(filters),
    ]);

    return res.status(200).json({
        success: true,
        data: tours,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit) || 1,
        },
    });
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