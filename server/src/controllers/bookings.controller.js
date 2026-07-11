import Booking from "../models/bookings.model.js";
import Departure from "../models/departures.model.js";
import Tour from "../models/tours.model.js";
import Payment from "../models/payments.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { createVnpayPaymentUrl } from "./payments.controller.js";

const parseCount = (value, fallback = 0) => Math.max(Number(value) || fallback, 0);

const getPagination = (req) => {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 50);
    const skip = (page - 1) * limit;

    return { page, limit, skip };
};

const getPrice = (tour, departure) => ({
    adult: departure?.priceOverride?.adult ?? tour.price.adult,
    child: departure?.priceOverride?.child ?? tour.price.child ?? 0,
    infant: tour.price.infant ?? 0,
    singleRoomSurcharge: tour.price.singleRoomSurcharge ?? 0
});

const populateBooking = (query) => query
    .populate("tourId", "title slug destination thumbnail price duration departureFrom")
    .populate("departureId", "departureDate returnDate status maxSlots bookedSlots availableSlots");

export const createBooking = asyncHandler(async (req, res) => {
    const {
        tourId,
        departureId,
        passengers = {},
        contactInfo,
        specialRequests,
        promoCode,
        singleRoom = false,
        paymentMethod = "vnpay"
    } = req.body;

    if (!tourId || !contactInfo?.name || !contactInfo?.email || !contactInfo?.phone) {
        return res.status(400).json({
            success: false,
            message: "Vui long nhap day du thong tin dat tour"
        });
    }

    const totalAdults = Math.max(parseCount(passengers.adults, 1), 1);
    const totalChildren = parseCount(passengers.children);
    const totalInfants = parseCount(passengers.infants);
    const totalGuests = totalAdults + totalChildren + totalInfants;

    const tour = await Tour.findOne({ _id: tourId, isActive: true });
    if (!tour) {
        return res.status(404).json({ success: false, message: "Khong tim thay tour" });
    }

    const departure = departureId
        ? await Departure.findOne({ _id: departureId, tourId: tour._id, status: { $in: ["open", "confirmed"] } })
        : null;

    if (departureId && !departure) {
        return res.status(404).json({ success: false, message: "Khong tim thay lich khoi hanh phu hop" });
    }

    const availableSlots = departure
        ? departure.availableSlots ?? Math.max((departure.maxSlots || 0) - (departure.bookedSlots || 0), 0)
        : tour.maxGroupSize;

    if (availableSlots && totalGuests > availableSlots) {
        return res.status(400).json({ success: false, message: "So luong khach vuot qua so cho con lai" });
    }

    const price = getPrice(tour, departure);
    const adultTotal = totalAdults * price.adult;
    const childTotal = totalChildren * price.child;
    const infantTotal = totalInfants * price.infant;
    const singleRoomSurcharge = singleRoom ? totalAdults * price.singleRoomSurcharge : 0;
    const discount = 0;
    const total = adultTotal + childTotal + infantTotal + singleRoomSurcharge - discount;

    const booking = await Booking.create({
        tourId: tour._id,
        departureId: departure?._id,
        userId: req.user._id,
        status: "pending",
        passengers: [],
        contactInfo,
        specialRequests,
        totalAdults,
        totalChildren,
        totalInfants,
        priceBreakdown: {
            adultTotal,
            childTotal: childTotal + infantTotal,
            singleRoomSurcharge,
            discount,
            total
        },
        promoCode
    });

    if (departure) {
        departure.bookedSlots = (departure.bookedSlots || 0) + totalGuests;
        departure.availableSlots = Math.max((departure.maxSlots || 0) - departure.bookedSlots, 0);
        if (departure.availableSlots === 0) {
            departure.status = "full";
        }
        await departure.save();
    }

    let paymentUrl;
    if (paymentMethod === "vnpay") {
        paymentUrl = await createVnpayPaymentUrl(booking, req);
    } else {
        await Payment.create({
            bookingId: booking._id,
            method: paymentMethod,
            status: paymentMethod === "cash" ? "pending" : "failed",
            amount: total
        });
    }

    const populatedBooking = await populateBooking(Booking.findById(booking._id));

    return res.status(201).json({
        success: true,
        message: "Tao booking thanh cong",
        data: populatedBooking,
        paymentUrl
    });
});

export const getMyBookings = asyncHandler(async (req, res) => {
    const { page, limit, skip } = getPagination(req);

    const [bookings, total] = await Promise.all([
        populateBooking(Booking.find({ userId: req.user._id }).sort({ createdAt: -1 }).skip(skip).limit(limit)),
        Booking.countDocuments({ userId: req.user._id })
    ]);

    return res.status(200).json({
        success: true,
        message: "Lay danh sach booking thanh cong",
        data: bookings,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit) || 1
        }
    });
});

export const getBookingById = asyncHandler(async (req, res) => {
    const booking = await populateBooking(Booking.findOne({ _id: req.params.id, userId: req.user._id }));

    if (!booking) {
        return res.status(404).json({ success: false, message: "Khong tim thay booking" });
    }

    return res.status(200).json({ success: true, data: booking });
});

export const cancelBooking = asyncHandler(async (req, res) => {
    const booking = await Booking.findOne({ _id: req.params.id, userId: req.user._id });

    if (!booking) {
        return res.status(404).json({ success: false, message: "Khong tim thay booking" });
    }

    if (booking.status === "success") {
        return res.status(400).json({ success: false, message: "Khong the huy booking da thanh toan" });
    }

    booking.status = "cancelled";
    await booking.save();
    await Payment.findOneAndUpdate({ bookingId: booking._id }, { status: "failed" });

    return res.status(200).json({
        success: true,
        message: "Huy booking thanh cong",
        data: booking
    });
});
