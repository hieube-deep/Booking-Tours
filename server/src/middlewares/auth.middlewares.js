import jwt from "jsonwebtoken";
import User from "../models/users.model.js";

const protect = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

        if (!token) {
            return res.status(401).json({ success: false, message: "Chua dang nhap" });
        }

        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        req.user = await User.findById(decoded.id);

        if (!req.user) {
            return res.status(401).json({ success: false, message: "Token khong hop le" });
        }

        next();
    } catch (error) {
        if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
            return res.status(401).json({ success: false, message: "Token khong hop le hoac da het han" });
        }

        return res.status(500).json({ success: false, message: "Loi server: " + error.message });
    }
};

const adminOnly = (req, res, next) => {
    if (!req.user || req.user.role !== "admin") {
        return res.status(403).json({ success: false, message: "Khong co quyen truy cap" });
    }

    next();
};

export { protect, adminOnly };