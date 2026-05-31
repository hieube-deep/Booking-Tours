import jwt from "jsonwebtoken";
import User from "../models/users.model.js";
import bcrypt from "bcrypt";
import { OAuth2Client } from 'google-auth-library';

const generateToken = (id) => jwt.sign({ id }, process.env.SECRET_KEY, { expiresIn: process.env.JWT_EXPIRE || '7d' });
const client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID
);


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
            token: generateToken(user._id),
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
        const token = generateToken(user._id);
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
};

export const googleLogin = async (req, res) => {
    try {
        const token = req.body.token;

        if (!token) {
            return res.status(400).json({ message: "không tìm thấy token" });
        }

        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();

        if (!payload) {
            return res.status(403).json({ message: "token google không đúng" });
        }

        const { sub, email, picture, name } = payload;
        let user = await User.findOne({ email });

        if (!user) {
            const newUser = await User.create({
                name,
                email,
                avatar: picture,
                googleId: sub
            })
        }

        return res.status(200).json({
            success: true,
            message: "đăng nhập thành công",
            token: generateToken(user._id),
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
            }
        })
    } catch (error) {
        return res.status(500).json({ message: "Lỗi hệ thống" + error.message })
    }
};

export const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: "Vui lòng truyền đủ currentPassword và newPassword" });
        }

        const user = await User.findById(req.user._id).select("password");
        if (!user) {
            return res.status(404).json({ message: "không tìm thấy tài khoản" })
        }
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "sai mật khẩu hiện tại" });
        }

        const salt = await bcrypt.hash(newPassword, 10);
        user.password = salt;
        await user.save();
        return res.status(200).json({
            success: true,
            message: "đổi mật khẩu thành công",
            token: generateToken(user._id),
        })

    } catch (error) {
        return res.status(500).json({ message: "lỗi hệ thống" + error.message });
    }
}