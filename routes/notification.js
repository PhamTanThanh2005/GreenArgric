import express from "express";
import { verifyToken } from "../middleware/auth.js";
import pool, { sql } from "../db.js";

const router = express.Router();

// =======================
// GET Danh sách thông báo
// =======================
router.get("/", verifyToken, async (req, res) => {
    const userId = req.user.id;
    try {
        const result = await pool.request()
            .input("user_id", sql.Int, userId)
            .query(`
                SELECT id, title, message, type, created_at, is_read 
                FROM Notification
                WHERE user_id = @user_id
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

    const id = parseInt(req.params.id, 10);
    const userId = req.user.id;

    if (isNaN(id)) {
        return res.status(400).json({ error: "ID thông báo không hợp lệ" });
    }

    try {
        const result = await pool.request()
            .input("id", sql.Int, id)
            .input("user_id", sql.Int, userId)
            .query(`
                UPDATE Notification
                SET is_read = 1
                WHERE id = @id AND user_id = @user_id
            `);

        if (result.rowsAffected[0] === 0) {
            console.log(`Update thất bại: Notification ID ${id} của User ${userId} không tồn tại hoặc đã bị xóa.`);
            return res.status(404).json({ 
                error: "Không tìm thấy thông báo, hoặc thông báo này không thuộc về bạn!" 
            });
        }

        res.json({ message: "Đã đánh dấu thông báo là đã đọc" });
    } catch (error) {
        console.error("Error updating notification:", error);
        res.status(500).json({ error: "Lỗi server nội bộ" });
    }
});

export default router;