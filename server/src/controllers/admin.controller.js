import Booking from "../models/bookings.model";
import User from "../models/users.model";
import { asyncHandler } from "../utils/asyncHandler";

export const getDashboard = asyncHandler(async (req, res) => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    const [
        totalUsers,
        totalBookings,
        monthBookings,
        lastMonthBookings,
        revenueData,
        bookingsByStatus,
        topTours, ,
    ] = await Promise.all([
        User.countDocuments({ role: "user" }),
        Booking.countDocuments(),
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
            { $group: { _id: '$status', count: { $sum: 1 } } },
        ])
    ])
})