import crypto from "crypto";
import Booking from "../models/bookings.model.js";
import Payment from "../models/payments.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const VNPAY_VERSION = "2.1.0";
const VNPAY_COMMAND = "pay";
const VNPAY_ORDER_TYPE = "other";
const VNPAY_LOCALE = "vn";
const VNPAY_CURRENCY = "VND";

const formatVnpayDate = (date) => {
    const pad = (number) => number.toString().padStart(2, "0");
    return [
        date.getFullYear(),
        pad(date.getMonth() + 1),
        pad(date.getDate()),
        pad(date.getHours()),
        pad(date.getMinutes()),
        pad(date.getSeconds())
    ].join("");
};

const buildSignedQuery = (params, secret) => {
    const sorted = {};
    const keys = Object.keys(params).sort();
    keys.forEach((key) => {
        sorted[key] = encodeURIComponent(params[key]).replace(/%20/g, "+");
    });
    const signData = Object.entries(sorted)
        .map(([key, value]) => `${key}=${value}`)
        .join("&");

    const secureHash = crypto
        .createHmac("sha512", secret)
        .update(signData, "utf-8")
        .digest("hex");

    return `${signData}&vnp_SecureHash=${secureHash}`;
};

const verifyVnpaySignature = (query) => {
    const secret = process.env.VNPAY_HASH_SECRET;

    if (!secret) {
        return false;
    }

    const params = { ...query };
    const receivedHash = params.vnp_SecureHash;
    delete params.vnp_SecureHash;
    delete params.vnp_SecureHashType;

    const sorted = {};
    const keys = Object.keys(params).sort();
    keys.forEach((key) => {
        sorted[key] = encodeURIComponent(params[key]).replace(/%20/g, "+");
    });
    const signData = Object.entries(sorted)
        .map(([key, value]) => `${key}=${value}`)
        .join("&");

    const expectedHash = crypto
        .createHmac("sha512", secret)
        .update(signData, "utf-8")
        .digest("hex");

    return receivedHash === expectedHash;
};

const getClientIp = (req) => {
    const forwardedFor = req.headers["x-forwarded-for"];
    let ip = forwardedFor 
        ? forwardedFor.split(",")[0].trim() 
        : (req.socket?.remoteAddress || "127.0.0.1");

    ip = ip.replace("::ffff:", "");
    if (ip === "::1" || ip === "localhost") {
        ip = "127.0.0.1";
    }
    return ip;
};

export const createVnpayPaymentUrl = async (booking, req) => {
    const tmnCode = process.env.VNPAY_TMN_CODE;
    const hashSecret = process.env.VNPAY_HASH_SECRET;
    const paymentUrl = process.env.VNPAY_PAYMENT_URL || "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
    const returnUrl = process.env.VNPAY_RETURN_URL || `${req.protocol}://${req.get("host")}/api/payments/vnpay-return`;

    if (!tmnCode || !hashSecret) {
        throw new Error("Thieu cau hinh VNPAY_TMN_CODE hoac VNPAY_HASH_SECRET");
    }

    const payment = await Payment.findOneAndUpdate(
        { bookingId: booking._id },
        {
            bookingId: booking._id,
            method: "vnpay",
            status: "pending",
            amount: booking.priceBreakdown.total,
            currency: VNPAY_CURRENCY
        },
        { new: true, upsert: true }
    );

    const now = new Date();
    const params = {
        vnp_Version: VNPAY_VERSION,
        vnp_Command: VNPAY_COMMAND,
        vnp_TmnCode: tmnCode,
        vnp_Locale: VNPAY_LOCALE,
        vnp_CurrCode: VNPAY_CURRENCY,
        vnp_TxnRef: payment._id.toString(),
        vnp_OrderInfo: `Thanh toan booking ${booking._id}`,
        vnp_OrderType: VNPAY_ORDER_TYPE,
        vnp_Amount: Math.round(booking.priceBreakdown.total) * 100,
        vnp_ReturnUrl: returnUrl,
        vnp_IpAddr: getClientIp(req),
        vnp_CreateDate: formatVnpayDate(now)
    };

    return `${paymentUrl}?${buildSignedQuery(params, hashSecret)}`;
};

const redirectToClient = (res, params) => {
    const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
    const redirectUrl = new URL("/payment-result", clientUrl);

    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
            redirectUrl.searchParams.set(key, String(value));
        }
    });

    return res.redirect(redirectUrl.toString());
};

export const createPaymentForBooking = asyncHandler(async (req, res) => {
    const { bookingId } = req.body;

    const booking = await Booking.findOne({ _id: bookingId, userId: req.user._id });
    if (!booking) {
        return res.status(404).json({ success: false, message: "Khong tim thay booking" });
    }

    if (booking.status === "success") {
        return res.status(400).json({ success: false, message: "Booking da duoc thanh toan" });
    }

    const paymentUrl = await createVnpayPaymentUrl(booking, req);

    return res.status(200).json({
        success: true,
        message: "Tao link thanh toan VNPAY thanh cong",
        data: { paymentUrl }
    });
});

export const handleVnpayReturn = asyncHandler(async (req, res) => {
    const isValidSignature = verifyVnpaySignature(req.query);

    if (!isValidSignature) {
        return redirectToClient(res, {
            status: "failed",
            message: "Chu ky VNPAY khong hop le"
        });
    }

    const paymentId = req.query.vnp_TxnRef;
    const responseCode = req.query.vnp_ResponseCode;
    const transactionStatus = req.query.vnp_TransactionStatus;
    const transactionId = req.query.vnp_TransactionNo;
    const isSuccess = responseCode === "00" && transactionStatus === "00";

    const payment = await Payment.findById(paymentId);
    if (!payment) {
        return redirectToClient(res, {
            status: "failed",
            message: "Khong tim thay giao dich"
        });
    }

    payment.status = isSuccess ? "success" : "failed";
    payment.transactionId = transactionId;
    payment.paidAt = isSuccess ? new Date() : payment.paidAt;
    await payment.save();

    const booking = await Booking.findByIdAndUpdate(
        payment.bookingId,
        { status: isSuccess ? "success" : "failed" },
        { new: true }
    );

    return redirectToClient(res, {
        status: isSuccess ? "success" : "failed",
        bookingId: booking?._id,
        paymentId: payment._id,
        code: responseCode
    });
});
