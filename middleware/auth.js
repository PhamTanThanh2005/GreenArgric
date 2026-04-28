// middleware/auth.js
import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.JWT_SECRET || "your_secret_key";

export const verifyToken = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({ message: "Bạn chưa đăng nhập!" });
    }

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        // Lưu thông tin giải mã vào req.user (gồm id, role, username)
        req.user = decoded; 
        next();
    } catch (err) {
        return res.status(403).json({ message: "Phiên đăng nhập hết hạn hoặc không hợp lệ!" });
    }
};

export const requireAdmin = (req, res, next) => {
    if (req.user?.role !== "admin") {
        return res.status(403).json({ message: "Chỉ quản trị viên mới có quyền này" });
    }
    next();
};

export const requireOwner = (req, res, next) => {
    if (req.user?.role !== "owner") {
        return res.status(403).json({ message: "Chỉ chủ nông trại mới có quyền này" });
    }
    next();
};