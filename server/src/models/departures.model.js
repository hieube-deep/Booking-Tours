import mongoose from "mongoose";
const { Schema } = mongoose;

const departureSchema = new Schema({
    tourId: { type: Schema.Types.ObjectId, ref: 'Tour', required: true },
    departureDate: { type: Date, required: true },
    returnDate: { type: Date, required: true },
    status: { type: String, enum: ['open', 'confirmed', 'full', 'cancelled'], default: 'open' },
    maxSlots: { type: Number, required: true },
    bookedSlots: { type: Number, default: 0 },
    availableSlots: { type: Number },
    priceOverride: {
        adult: { type: Number },
        child: { type: Number }
    },
    guide: {
        name: { type: String },
        phone: { type: String },
        avatar: { type: String }
    },
    vehicle: { type: String },
    notes: { type: String },
}, { timestamps: true });

const Departure = mongoose.model('Departure', departureSchema);
export default Departure;