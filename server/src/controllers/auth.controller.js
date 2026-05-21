import jwt from "jsonwebtoken";
import User from "../models/users.model.js";
import bcrypt from "bcrypt";
const gerenateToken = (id) => jwt.sign({ id }, process.env.SECRET_KEY, { expiresIn: process.env.JWT_EXPIRE || '7d' });


export const Register = async (req, res) => {
    try {
        const { name, email, password, phone } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ message: "nhập đầy đủ thông tin" });
        }

        const useExits = await User.findOne({ email });
        if (useExits) {
            return res.status(400).json({ message: "tài khoản đã tồn tại" })
        }
        const harshPassword = await bcrypt.hash(password, 10);
        const user = await User.create({ name, email, password: harshPassword, phone: phone || "" });
        return res.status(201).json({
            success: true,
            message: "đăng ký thành công",
            token: gerenateToken(user._id),
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
            }
        })
    } catch (error) {
        return res.status(500).json({ message: "lỗi hệ thống" + error.message });
    }
}



export const Login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: "chưa nhập mật khẩu và email" });
        }
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "không tồn tại tài khoản này" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "mật khẩu không đúng" });
        }
        const token = gerenateToken(user._id);
        return res.status(200).json({
            success: true,
            message: "đăng nhập thành công",
            token: token,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
            }
        })

    } catch (error) {
        return res.status(500).json({ message: "lỗi hệ thống" + error.message });
    }
}

export const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await User.findById(req.user.id).select("password");
        if (!user) {
            return res.status(404).json({ message: "không tìm thấy tài khoản" })
        }
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "sai mật khẩu" });
        }

        const salt = await bcrypt.hash(newPassword, 10);
        user.password = salt;
        await user.save();
        return res.status(200).json({
            success: true,
            message: "đổi mật khẩu thành công",
            token: gerenateToken(user._id),
        })

    } catch (error) {
        return res.status(500).json({ message: "lỗi hệ thống" + error.message });
    }
}