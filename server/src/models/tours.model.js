import mongoose from "mongoose";
const { Schema } = mongoose
const tourSchema = new Schema({
    title: { type: String, required: true },
    slug: { type: String, unique: true },
    description: { type: String },
    highlights: [{ type: String }],
    destination: { type: String },
    departureFrom: { type: String },
    duration: {
        days: { type: Number, required: true },
        nights: { type: Number, required: true }
    },
    type: { type: String, enum: ["domestic", "international", "adventure", "cultural"] },
    maxGroupSize: { type: Number },
    minGroupSize: { type: Number },
    price: {
        adult: { type: Number, required: true },
        child: { type: Number },
        infant: { type: Number },
        singleRoomSurcharge: { type: Number }
    },
    includes: [{ type: String }],
    excludes: [{ type: String }],
    itinerary: [{
        day: { type: Number },
        title: { type: String },
        description: { type: String },
        meals: {
            breakfast: { type: Boolean, default: false },
            lunch: { type: Boolean, default: false },
            dinner: { type: Boolean, default: false }
        },
        accommodation: { type: String }
    }],
    images: [{ type: String }],
    thumbnail: { type: String },
    rating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    tags: [{ type: String }]
}, { timestamps: true });

const Tour = mongoose.model('Tour', tourSchema);
export default Tour;