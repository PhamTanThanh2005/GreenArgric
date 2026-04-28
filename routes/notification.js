import express from "express";
import { verifyToken } from "../middleware/auth.js";
import pool, { sql } from "../db.js";

const router = express.Router();

// =======================
// GET Danh sách thông báo chưa đọc
// =======================
router.get("/", verifyToken, async (req, res) => {
    const userId = req.user.id; // Lấy thông báo của user đang đăng nhập
    try {
        const result = await pool.request()
            .input("user_id", sql.Int, userId)
            .query(`
                SELECT id, title, message, type, created_at 
                FROM Notification
                WHERE user_id = @user_id AND is_read = 0
                ORDER BY created_at DESC
            `);

        res.json(result.recordset);
    } catch (error) {
        console.error("Error fetching notifications:", error);
        res.status(500).json({ error: "Lỗi server nội bộ" });
    }
});

// =======================
// POST Đánh dấu đã đọc
// =======================
router.post("/:id/read", verifyToken, async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    try {
        await pool.request()
            .input("id", sql.Int, id)
            .input("user_id", sql.Int, userId)
            .query(`
                UPDATE Notification
                SET is_read = 1
                WHERE id = @id AND user_id = @user_id
            `);
        res.json({ message: "Đã đánh dấu thông báo là đã đọc" });
    } catch (error) {
        console.error("Error updating notification:", error);
        res.status(500).json({ error: "Lỗi server nội bộ" });
    }
});

export default router;