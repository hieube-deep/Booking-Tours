import mongoose from "mongoose";
const { Schema } = mongoose
const paymentSchema = new Schema({
    bookingId: { type: ObjectId, ref: 'Booking', required: true, unique: true },
    method: { type: String, enum: ['stripe', 'vnpay', 'cash'] },
    status: { type: String, enum: ['pending', 'success', 'failed', 'refunded'], default: 'pending' },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'VND' },
    transactionId: { type: String },
    paidAt: { type: Date },
}, { timestamps: true });

const Payment = mongoose.model('Payment', paymentSchema);
export default Payment;