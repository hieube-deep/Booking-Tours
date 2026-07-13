import Promotion from "../models/promotions.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getPagination = (req) => {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);
    const skip = (page - 1) * limit;

    return { page, limit, skip };
};

export const computeDiscount = (promotion, subtotal) => {
    if (promotion.type === "percent") {
        const raw = (subtotal * promotion.value) / 100;
        return promotion.maxDiscount ? Math.min(raw, promotion.maxDiscount) : raw;
    }

    return Math.min(promotion.value, subtotal);
};

export const findValidPromotion = async ({ code, tourId, subtotal }) => {
    if (!code) {
        return { error: "Vui long nhap ma giam gia" };
    }

    const promotion = await Promotion.findOne({ code: code.trim().toUpperCase() });
    if (!promotion || !promotion.isActive) {
        return { error: "Ma giam gia khong ton tai hoac da bi vo hieu hoa" };
    }

    const now = new Date();
    if (promotion.startDate && now < promotion.startDate) {
        return { error: "Ma giam gia chua den thoi gian ap dung" };
    }
    if (promotion.endDate && now > promotion.endDate) {
        return { error: "Ma giam gia da het han" };
    }
    if (promotion.usageLimit && promotion.usedCount >= promotion.usageLimit) {
        return { error: "Ma giam gia da het luot su dung" };
    }
    if (promotion.minOrderValue && subtotal < promotion.minOrderValue) {
        return { error: `Don hang toi thieu ${promotion.minOrderValue.toLocaleString('vi-VN')}d de ap dung ma nay` };
    }
    if (promotion.applicableTours?.length > 0 && tourId) {
        const applies = promotion.applicableTours.some((id) => id.toString() === tourId.toString());
        if (!applies) {
            return { error: "Ma giam gia khong ap dung cho tour nay" };
        }
    }

    return { promotion };
};

export const validatePromoCode = asyncHandler(async (req, res) => {
    const { code, tourId, subtotal } = req.body;

    if (!subtotal || subtotal <= 0) {
        return res.status(400).json({ success: false, message: "Thieu thong tin don hang de kiem tra ma giam gia" });
    }

    const { promotion, error } = await findValidPromotion({ code, tourId, subtotal });
    if (error) {
        return res.status(400).json({ success: false, message: error });
    }

    const discount = computeDiscount(promotion, subtotal);

    return res.status(200).json({
        success: true,
        message: "Ap dung ma giam gia thanh cong",
        data: { code: promotion.code, discount }
    });
});

export const getAdminPromotions = asyncHandler(async (req, res) => {
    const { page, limit, skip } = getPagination(req);

    const [promotions, total] = await Promise.all([
        Promotion.find({}).sort({ createdAt: -1 }).skip(skip).limit(limit),
        Promotion.countDocuments({})
    ]);

    return res.status(200).json({
        success: true,
        data: promotions,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit) || 1
        }
    });
});

export const createPromotion = asyncHandler(async (req, res) => {
    const promotion = await Promotion.create({ ...req.body });

    return res.status(201).json({
        success: true,
        message: "Tao ma giam gia thanh cong",
        data: promotion
    });
});

export const updatePromotion = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const promotion = await Promotion.findByIdAndUpdate(id, { ...req.body }, { new: true });

    if (!promotion) {
        return res.status(404).json({ success: false, message: "Khong tim thay ma giam gia" });
    }

    return res.status(200).json({
        success: true,
        message: "Cap nhat ma giam gia thanh cong",
        data: promotion
    });
});

export const deletePromotion = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const promotion = await Promotion.findByIdAndDelete(id);

    if (!promotion) {
        return res.status(404).json({ success: false, message: "Khong tim thay ma giam gia" });
    }

    return res.status(200).json({
        success: true,
        message: "Xoa ma giam gia thanh cong",
        data: promotion
    });
});
