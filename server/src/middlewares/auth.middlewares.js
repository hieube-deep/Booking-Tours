import jwt from "jsonwebtoken";
import User from "../models/users.model.js";
const protect = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.startsWith('Bearer') ?
            req.headers.authorization.split('')[1] : null;

        if (!token) {
            return res.status(401).json({ message: 'false', message: " chưa đăng nhập" })
        }

        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        req.user = await User.findById(decoded.id);

        if (!req.user) {
            return res.status(401).json({ message: 'false', message: "token không hợp lệ" });
        }

        next();
    }
    catch (error) {
        return res.status(500).json({ message: 'false', message: "lỗi server" + error.message })
    }
}

const adminOnly = (req, res, next) => {
    if (req.user.role !== "admin") {
        return res.status(403).json({ message: "falsed", message: "không có quyền truy cập" })
    }
    next();
}

export { protect, adminOnly }