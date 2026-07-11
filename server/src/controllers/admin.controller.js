import Booking from "../models/bookings.model.js";
import Payment from "../models/payments.model.js";
import User from "../models/users.model.js";
import Tour from "../models/tours.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getPagination = (req) => {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 100);
    const skip = (page - 1) * limit;

    return { page, limit, skip };
};

const paginatedResponse = (res, data, page, limit, total, message = "Lay du lieu thanh cong") => {
    return res.status(200).json({
        success: true,
        message,
        data,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit) || 1
        }
    });
};

export const getDashboard = asyncHandler(async (req, res) => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    const [
        totalUsers,
        totalBookings,
        activeTours,
        monthStats,
        lastMonthStats,
        bookingsByStatus
    ] = await Promise.all([
        User.countDocuments({ role: "user" }),
        Booking.countDocuments(),
        Tour.countDocuments({ isActive: true }),
        Booking.aggregate([
            { $match: { status: "success", createdAt: { $gte: startOfMonth } } },
            {
                $group: {
                    _id: null,
                    monthTotal: { $sum: 1 },
                    monthRevenue: { $sum: "$priceBreakdown.total" }
                }
            }
        ]),
        Booking.aggregate([
            {
                $match: {
                    status: "success",
                    createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth }
                }
            },
            {
                $group: {
                    _id: null,
                    monthTotal: { $sum: 1 },
                    monthRevenue: { $sum: "$priceBreakdown.total" }
                }
            }
        ]),
        Booking.aggregate([
            { $group: { _id: "$status", count: { $sum: 1 } } }
        ])
    ]);

    return res.status(200).json({
        success: true,
        data: {
            totalUsers,
            totalBookings,
            activeTours,
            monthRevenue: monthStats[0]?.monthRevenue || 0,
            monthBookings: monthStats[0]?.monthTotal || 0,
            lastMonthRevenue: lastMonthStats[0]?.monthRevenue || 0,
            lastMonthBookings: lastMonthStats[0]?.monthTotal || 0,
            bookingsByStatus
        }
    });
});

export const getRevenueChart = asyncHandler(async (req, res) => {
    const year = Number(req.query.year) || new Date().getFullYear();

    const data = await Payment.aggregate([
        {
            $match: {
                status: "success",
                paidAt: {
                    $gte: new Date(Date.UTC(year, 0, 1)),
                    $lt: new Date(Date.UTC(year + 1, 0, 1))
                },
            },
        },
        {
            $group: {
                _id: { month: { $month: { date: "$paidAt", timezone: "+07:00" } } },
                revenue: { $sum: "$amount" },
                count: { $sum: 1 },
            },
        },
        { $sort: { "_id.month": 1 } },
    ]);

    const chartData = Array.from({ length: 12 }, (_, i) => {
        const month = i + 1;
        const found = data.find(d => d._id.month === month);
        return {
            month,
            revenue: found?.revenue || 0,
            count: found?.count || 0
        };
    });

    return res.json({ success: true, data: chartData });
});

export const getAdminTours = asyncHandler(async (req, res) => {
    const { page, limit, skip } = getPagination(req);
    const search = req.query.search?.trim();
    const filters = {};

    if (search) {
        filters.$or = [
            { title: { $regex: search, $options: "i" } },
            { destination: { $regex: search, $options: "i" } },
            { departureFrom: { $regex: search, $options: "i" } }
        ];
    }

    const [tours, total] = await Promise.all([
        Tour.find(filters).sort({ createdAt: -1 }).skip(skip).limit(limit),
        Tour.countDocuments(filters)
    ]);

    return paginatedResponse(res, tours, page, limit, total);
});

export const getAdminBookings = asyncHandler(async (req, res) => {
    const { page, limit, skip } = getPagination(req);
    const status = req.query.status;
    const filters = status && status !== "all" ? { status } : {};

    const [bookings, total] = await Promise.all([
        Booking.find(filters)
            .populate("userId", "name email phone")
            .populate("tourId", "title slug destination")
            .populate({
                path: "departureId",
                select: "tourId departureDate returnDate status",
                populate: { path: "tourId", select: "title slug destination" }
            })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit),
        Booking.countDocuments(filters)
    ]);

    return paginatedResponse(res, bookings, page, limit, total);
});

export const updateBookingStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const allowedStatuses = ["pending", "success", "failed", "cancelled"];

    if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
            success: false,
            message: "Trang thai booking khong hop le"
        });
    }

    const booking = await Booking.findByIdAndUpdate(id, { status }, { new: true })
        .populate("userId", "name email phone")
        .populate({
            path: "departureId",
            select: "tourId departureDate returnDate status",
            populate: { path: "tourId", select: "title slug destination" }
        });

    if (!booking) {
        return res.status(404).json({
            success: false,
            message: "Khong tim thay booking"
        });
    }

    return res.status(200).json({
        success: true,
        message: "Cap nhat trang thai booking thanh cong",
        data: booking
    });
});

export const getAdminUsers = asyncHandler(async (req, res) => {
    const { page, limit, skip } = getPagination(req);
    const search = req.query.search?.trim();
    const filters = {};

    if (search) {
        filters.$or = [
            { name: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
            { phone: { $regex: search, $options: "i" } }
        ];
    }

    const [users, total] = await Promise.all([
        User.find(filters).select("-password").sort({ createdAt: -1 }).skip(skip).limit(limit),
        User.countDocuments(filters)
    ]);

    return paginatedResponse(res, users, page, limit, total);
});

export const updateUserRole = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { role } = req.body;

    if (!["user", "admin"].includes(role)) {
        return res.status(400).json({
            success: false,
            message: "Vai tro khong hop le"
        });
    }

    if (req.user._id.toString() === id && role !== "admin") {
        return res.status(400).json({
            success: false,
            message: "Khong the tu ha quyen tai khoan admin dang dang nhap"
        });
    }

    const user = await User.findByIdAndUpdate(id, { role }, { new: true }).select("-password");

    if (!user) {
        return res.status(404).json({
            success: false,
            message: "Khong tim thay nguoi dung"
        });
    }

    return res.status(200).json({
        success: true,
        message: "Cap nhat vai tro nguoi dung thanh cong",
        data: user
    });
});

export const deleteUser = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (req.user._id.toString() === id) {
        return res.status(400).json({
            success: false,
            message: "Khong the xoa tai khoan dang dang nhap"
        });
    }

    const user = await User.findByIdAndDelete(id).select("-password");

    if (!user) {
        return res.status(404).json({
            success: false,
            message: "Khong tim thay nguoi dung"
        });
    }

    return res.status(200).json({
        success: true,
        message: "Xoa nguoi dung thanh cong",
        data: user
    });
});


