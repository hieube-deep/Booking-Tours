import mongoose from "mongoose";
const { Schema } = mongoose;

const reviewSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    tourId: { type: Schema.Types.ObjectId, ref: 'Tour', required: true },
    bookingId: { type: Schema.Types.ObjectId, ref: 'Booking' },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String },
}, { timestamps: true });

const Review = mongoose.model('Review', reviewSchema);
export default Review;