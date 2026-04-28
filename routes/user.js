// routes/user.js
import express from "express";
import pool, { sql } from "../db.js";
import { verifyToken, requireAdmin } from "../middleware/auth.js";

const router = express.Router();

// ==========================================
// GET /user - Lấy danh sách tất cả người dùng
// Phân quyền: Chỉ dành cho Admin quản lý
// ==========================================
router.get("/", verifyToken, requireAdmin, async (req, res) => {
    try {
        const result = await pool.request()
            .query(`
                SELECT id, username, name, email, phone, role 
                FROM [User]
            `);

        res.json(result.recordset);
    } catch (error) {
        console.error("Lỗi lấy danh sách user:", error);
        res.status(500).json({ error: "Lỗi server nội bộ" });
    }
});

// ==========================================
// GET /user/profile - Lấy thông tin cá nhân
// Phân quyền: Mọi user đã đăng nhập
// ==========================================
router.get("/profile", verifyToken, async (req, res) => {
    try {
        const userId = req.user.id; // Lấy ID từ Token đã giải mã

        const result = await pool.request()
            .input("id", sql.Int, userId)
            .query(`
                SELECT id, username, name, email, phone, role 
                FROM [User] 
                WHERE id = @id
            `);

        if (result.recordset.length === 0) {
            return res.status(404).json({ message: "Người dùng không tồn tại" });
        }

        res.json(result.recordset[0]);
    } catch (error) {
        console.error("Lỗi lấy profile:", error);
        res.status(500).json({ error: "Lỗi server nội bộ" });
    }
});

export default router;