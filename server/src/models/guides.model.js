import mongoose from "mongoose";
const { Schema } = mongoose;

const guideSchema = new Schema({
    name,
    avatar,
    phone,
    email,
    licenseNumber,        // số thẻ HDV
    languages: [String],  // ["Tiếng Anh", "Tiếng Trung"]
    specialties: [String],// ["Miền Bắc", "Văn hóa", "Mạo hiểm"]
    rating, totalTours,
    isAvailable,
});

const Guide = mongoose.model('Guide', guideSchema);
export default Guide;