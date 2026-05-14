import mongoose from "mongoose";
const { Schema } = mongoose;

const departureSchema = new Schema({
    tourId,               // ref Tour
    departureDate,        // ngày khởi hành
    returnDate,           // ngày về
    status,               // "open" | "confirmed" | "full" | "cancelled"
    maxSlots,             // tổng chỗ
    bookedSlots,          // đã đặt
    availableSlots,       // tính = maxSlots - bookedSlots
    priceOverride: {      // ghi đè giá nếu có khuyến mãi
        adult, child
    },
    guide: {              // hướng dẫn viên phụ trách
        name, phone, avatar
    },
    vehicle,              // "xe 45 chỗ" | "máy bay VN123"
    notes,
}, { timestamps: true });

const Departure = mongoose.model('Departure', departureSchema);
export default Departure;