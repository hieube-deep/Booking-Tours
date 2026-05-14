import mongoose from "mongoose";
const { Schema } = mongoose
const wishListSchema = new Schema({
    userId,
    tours: [{ tourId, addedAt }],
});

const Wishlist = mongoose.model('WishList', wishListSchema);
export default Wishlist;