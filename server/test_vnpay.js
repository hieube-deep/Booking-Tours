import dotenv from "dotenv";
import crypto from "crypto";

dotenv.config();

const VNPAY_VERSION = "2.1.0";
const VNPAY_COMMAND = "pay";
const VNPAY_ORDER_TYPE = "other";
const VNPAY_LOCALE = "vn";
const VNPAY_CURRENCY = "VND";

const sortObject = (obj) => {
    const sorted = {};
    Object.keys(obj)
        .sort()
        .forEach((key) => {
            sorted[key] = obj[key];
        });
    return sorted;
};

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
    const sortedParams = sortObject(params);
    const signData = new URLSearchParams(sortedParams).toString();
    const secureHash = crypto
        .createHmac("sha512", secret)
        .update(signData, "utf-8")
        .digest("hex");

    return `${signData}&vnp_SecureHash=${secureHash}`;
};

const buildSignedQueryStandard = (params, secret) => {
    let sorted = {};
    let keys = Object.keys(params).sort();
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

const getClientIp = (req) => {
    const forwardedFor = req.headers["x-forwarded-for"];
    if (forwardedFor) {
        return forwardedFor.split(",")[0].trim();
    }

    return req.socket?.remoteAddress?.replace("::ffff:", "") || "127.0.0.1";
};

const run = () => {
    const tmnCode = process.env.VNPAY_TMN_CODE;
    const hashSecret = process.env.VNPAY_HASH_SECRET;
    const paymentUrl = process.env.VNPAY_PAYMENT_URL || "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
    
    console.log("TMN CODE:", tmnCode);
    console.log("HASH SECRET:", hashSecret);
    console.log("PAYMENT URL:", paymentUrl);

    const booking = {
        _id: "64e26710b7f87259ec2162ab",
        priceBreakdown: {
            total: 1500000
        }
    };

    const req = {
        protocol: "http",
        get: () => "localhost:5000",
        headers: {},
        socket: {
            remoteAddress: "127.0.0.1"
        }
    };

    const now = new Date();
    const params = {
        vnp_Version: VNPAY_VERSION,
        vnp_Command: VNPAY_COMMAND,
        vnp_TmnCode: tmnCode,
        vnp_Locale: VNPAY_LOCALE,
        vnp_CurrCode: VNPAY_CURRENCY,
        vnp_TxnRef: "64e26710b7f87259ec2162ac",
        vnp_OrderInfo: `Thanh toan booking ${booking._id}`,
        vnp_OrderType: VNPAY_ORDER_TYPE,
        vnp_Amount: Math.round(booking.priceBreakdown.total) * 100,
        vnp_ReturnUrl: "http://localhost:5000/api/payments/vnpay-return",
        vnp_IpAddr: getClientIp(req),
        vnp_CreateDate: formatVnpayDate(now)
    };

    console.log("vnp_IpAddr is:", params.vnp_IpAddr);
    
    const signedQuerySearchParams = buildSignedQuery(params, hashSecret);
    const signedQueryStandard = buildSignedQueryStandard(params, hashSecret);
    
    console.log("--- URLSearchParams ---");
    console.log("QUERY:", signedQuerySearchParams);
    console.log("HASH:", signedQuerySearchParams.split("vnp_SecureHash=")[1]);

    console.log("--- Standard encodeURIComponent + replace ---");
    console.log("QUERY:", signedQueryStandard);
    console.log("HASH:", signedQueryStandard.split("vnp_SecureHash=")[1]);
    
    console.log("MATCH?:", signedQuerySearchParams.split("vnp_SecureHash=")[1] === signedQueryStandard.split("vnp_SecureHash=")[1]);
};

run();
