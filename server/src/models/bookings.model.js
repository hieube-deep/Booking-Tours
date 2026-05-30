import mongoose from "mongoose";
const { Schema } = mongoose
const bookingSchema = new Schema({
    departureId: { type: Schema.Types.ObjectId, ref: 'Departure' },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['pending', 'success', 'failed', 'cancelled'], default: 'pending' },
    passengers: [{
        fullName: { type: String, required: true },
        dob: { type: Date },
        gender: { type: String, enum: ['male', 'female', 'other'] },
        idNumber: { type: String },
        type: { type: String, enum: ['adult', 'child', 'infant'], default: 'adult' },
        passportNumber: { type: String },
        passportExpiry: { type: Date }
    }],
    contactInfo: {
        name: { type: String, required: true },
        phone: { type: String, required: true },
        email: { type: String, required: true }
    },
    specialRequests: { type: String },
    totalAdults: { type: Number, default: 1 },
    totalChildren: { type: Number, default: 0 },
    totalInfants: { type: Number, default: 0 },
    priceBreakdown: {
        adultTotal: { type: Number, required: true },
        childTotal: { type: Number, default: 0 },
        singleRoomSurcharge: { type: Number, default: 0 },
        discount: { type: Number, default: 0 },
        total: { type: Number, required: true }
    },
    promoCode: { type: String }
}, { timestamps: true });

const Booking = mongoose.model('Booking', bookingSchema);
export default Booking;