import mongoose from "mongoose";
const { Schema } = mongoose;

const guideSchema = new Schema({
    name: { type: String, required: true },
    avatar: { type: String },
    phone: { type: String },
    email: { type: String },
    licenseNumber: { type: String },
    languages: [{ type: String }],
    specialties: [{ type: String }],
    rating: { type: Number, default: 0 },
    totalTours: { type: Number, default: 0 },
    isAvailable: { type: Boolean, default: true },
}, { timestamps: true });

const Guide = mongoose.model('Guide', guideSchema);
export default Guide;