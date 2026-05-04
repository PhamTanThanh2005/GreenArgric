// routes/activity.js
import express from "express";
import pool, { sql } from "../db.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

// ==================================================
// GET /activity - Lấy lịch sử hoạt động của thiết bị
// ==================================================
router.get("/", verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;
        const { limit = 50 } = req.query;

        const result = await pool.request()
            .input("user_id", sql.Int, userId)
            .input("role", sql.NVarChar, userRole)
            .input("limit", sql.Int, parseInt(limit))
            .query(`
                SELECT TOP (@limit) 
                    al.id, 
                    al.device_id, 
                    d.name AS device_name, 
                    d.type AS device_type,
                    al.mode, 
                    al.source, 
                    al.time,
                    a.name AS area_name
                FROM ActivityLog al
                JOIN Device d ON al.device_id = d.id
                JOIN Area a ON d.area_id = a.id
                WHERE @role = 'admin' 
                   OR a.id IN (SELECT area_id FROM User_Area WHERE user_id = @user_id)
                ORDER BY al.time DESC
            `);

        res.json(result.recordset);
    } catch (error) {
        console.error("Lỗi lấy danh sách ActivityLog:", error);
        res.status(500).json({ error: "Lỗi server nội bộ" });
    }
});

// ==================================================
// GET /activity/:device_id - Lấy lịch sử theo 1 thiết bị cụ thể
// ==================================================
router.get("/:device_id", verifyToken, async (req, res) => {
    try {
        const { device_id } = req.params;
        const userId = req.user.id;
        const userRole = req.user.role;
        const { limit = 20 } = req.query;

        const result = await pool.request()
            .input("device_id", sql.Int, device_id)
            .input("user_id", sql.Int, userId)
            .input("role", sql.NVarChar, userRole)
            .input("limit", sql.Int, parseInt(limit))
            .query(`
                SELECT TOP (@limit) 
                    al.id, al.mode, al.source, al.time
                FROM ActivityLog al
                JOIN Device d ON al.device_id = d.id
                JOIN Area a ON d.area_id = a.id
                WHERE al.device_id = @device_id
                  AND (@role = 'admin' OR a.id IN (SELECT area_id FROM User_Area WHERE user_id = @user_id))
                ORDER BY al.time DESC
            `);

        res.json(result.recordset);
    } catch (error) {
        console.error("Lỗi lấy lịch sử thiết bị:", error);
        res.status(500).json({ error: "Lỗi server nội bộ" });
    }
});

// // ==================================================
// // POST /activity - Thêm dữ liệu lịch sử mới cho thiết bị
// // ==================================================
// router.post("/", verifyToken, async (req, res) => {
//     const { device_id, mode, source = 'auto' } = req.body;

//     if (!device_id || !mode) {
//         return res.status(400).json({ error: "Thiếu thông tin device_id hoặc mode" });
//     }

//     try {
//         await pool.request()
//             .input("device_id", sql.Int, device_id)
//             .input("mode", sql.NVarChar, mode)
//             .input("source", sql.NVarChar, source)
//             .query(`
//                 INSERT INTO ActivityLog (device_id, mode, source)
//                 VALUES (@device_id, @mode, @source)
//             `);
        
//         res.json({ message: "Lưu lịch sử hoạt động thiết bị thành công" });
//     } catch (error) {
//         console.error("Lỗi lưu ActivityLog:", error);
//         res.status(500).json({ error: "Lỗi server nội bộ" });
//     }
// });

export default router;