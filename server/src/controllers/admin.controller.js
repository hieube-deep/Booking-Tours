import Booking from "../models/bookings.model";
import Payment from "../models/payments.model";
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
});

export const getRevenueChart = asyncHandler(async (req, res) => {
    const year = Number(req.query.year) || new Date().getFullYear();

    const data = await Payment.aggregate([
        {
            $match: {
                status: 'success',
                paidAt: {
                    $gte: new Date(Date.UTC(year, 0, 1)),
                    $lt: new Date(Date.UTC(year + 1, 0, 1))
                },
            },
        },
        {
            $group: {
                _id: { month: { $month: { date: '$paidAt', timezone: '+07:00' } } },
                revenue: { $sum: '$amount' },
                count: { $sum: 1 },
            },
        },
        { $sort: { '_id.month': 1 } },
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
