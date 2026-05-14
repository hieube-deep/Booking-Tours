import mongoose from "mongoose";

const { Schema } = mongoose;

const userSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },             // null nếu đăng nhập OAuth
    phone: { type: String },
    avatar: { type: String },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    isVerified: { type: Boolean, default: false },
    googleId: { type: String },             // cho Google OAuth
}, { timestamps: true });

const User = mongoose.model("User", userSchema);
export default User