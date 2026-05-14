import mongoose from "mongoose";
const { Schema } = mongoose;

const promotionSchema = new Schema({
    code,                 // "SUMMER2025"
    type,                 // "percent" | "fixed"
    value,                // 20 (%) hoặc 500000 (VNĐ)
    minOrderValue,
    maxDiscount,          // giảm tối đa
    usageLimit,
    usedCount,
    applicableTours: [],  // [] = áp dụng tất cả
    startDate, endDate,
    isActive,
});

const Promotion = mongoose.model('Promotion', promotionSchema);
export default Promotion;
