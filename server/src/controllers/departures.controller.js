import Departure from "../models/departures.model.js";
import Tour from "../models/tours.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getPagination = (req) => {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);
    const skip = (page - 1) * limit;

    return { page, limit, skip };
};

const withAvailableSlots = (departure) => {
    const obj = departure.toObject ? departure.toObject() : departure;
    obj.availableSlots = obj.availableSlots ?? Math.max((obj.maxSlots || 0) - (obj.bookedSlots || 0), 0);
    return obj;
};

export const getDeparturesByTour = asyncHandler(async (req, res) => {
    const { tourId } = req.params;

    const departures = await Departure.find({
        tourId,
        status: { $in: ["open", "confirmed"] },
        departureDate: { $gte: new Date() }
    }).sort({ departureDate: 1 });

    return res.status(200).json({
        success: true,
        data: departures.map(withAvailableSlots)
    });
});

export const getDepartureById = asyncHandler(async (req, res) => {
    const departure = await Departure.findById(req.params.id).populate("tourId", "title slug price");

    if (!departure) {
        return res.status(404).json({ success: false, message: "Khong tim thay lich khoi hanh" });
    }

    return res.status(200).json({ success: true, data: withAvailableSlots(departure) });
});

export const getAdminDepartures = asyncHandler(async (req, res) => {
    const { page, limit, skip } = getPagination(req);
    const filters = {};
    if (req.query.tourId) {
        filters.tourId = req.query.tourId;
    }

    const [departures, total] = await Promise.all([
        Departure.find(filters)
            .populate("tourId", "title slug destination")
            .sort({ departureDate: 1 })
            .skip(skip)
            .limit(limit),
        Departure.countDocuments(filters)
    ]);

    return res.status(200).json({
        success: true,
        data: departures.map(withAvailableSlots),
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit) || 1
        }
    });
});

export const createDeparture = asyncHandler(async (req, res) => {
    const { tourId } = req.body;

    const tour = await Tour.findById(tourId);
    if (!tour) {
        return res.status(404).json({ success: false, message: "Khong tim thay tour" });
    }

    const departure = await Departure.create({ ...req.body });

    return res.status(201).json({
        success: true,
        message: "Tao lich khoi hanh thanh cong",
        data: departure
    });
});

export const updateDeparture = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const departure = await Departure.findByIdAndUpdate(id, { ...req.body }, { new: true });

    if (!departure) {
        return res.status(404).json({ success: false, message: "Khong tim thay lich khoi hanh" });
    }

    return res.status(200).json({
        success: true,
        message: "Cap nhat lich khoi hanh thanh cong",
        data: departure
    });
});

export const deleteDeparture = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const departure = await Departure.findByIdAndDelete(id);

    if (!departure) {
        return res.status(404).json({ success: false, message: "Khong tim thay lich khoi hanh" });
    }

    return res.status(200).json({
        success: true,
        message: "Xoa lich khoi hanh thanh cong",
        data: departure
    });
});
