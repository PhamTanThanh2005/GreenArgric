import express from "express";
import pool, { sql } from "../db.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

// =======================
// GET: Lấy cấu hình ngưỡng của 1 khu vực
// =======================
router.get("/:area_id", verifyToken, async (req, res) => {
    const { area_id } = req.params;
    const userId = req.user.id;
    const role = req.user.role;

    try {
        if (role === 'owner') {
            const check = await pool.request()
                .input("user_id", sql.Int, userId)
                .input("area_id", sql.Int, area_id)
                .query("SELECT 1 FROM User_Area WHERE user_id = @user_id AND area_id = @area_id");
            
            if (check.recordset.length === 0) {
                return res.status(403).json({ error: "Bạn không có quyền truy cập khu vực này" });
            }
        }

        const result = await pool.request()
            .input("area_id", sql.Int, area_id)
            .query("SELECT sensor_type, min_value, max_value FROM ThresholdConfig WHERE area_id = @area_id");
        
        res.json(result.recordset);
    } catch (error) {
        console.error("Lỗi lấy cấu hình ngưỡng:", error);
        res.status(500).json({ error: "Lỗi server nội bộ" });
    }
});

// =======================
// POST: UPSERT Ngưỡng môi trường
// =======================
router.post("/", verifyToken, async (req, res) => {
    const { area_id, sensor_type, min_value, max_value } = req.body;
    const userId = req.user.id;
    const role = req.user.role;

    if (!area_id || !sensor_type) {
        return res.status(400).json({ error: "Thiếu area_id hoặc sensor_type" });
    }
    if (min_value == null && max_value == null) {
        return res.status(400).json({ error: "Phải nhập ít nhất min_value hoặc max_value" });
    }

    try {
        if (role === 'owner') {
            const check = await pool.request()
                .input("user_id", sql.Int, userId)
                .input("area_id", sql.Int, area_id)
                .query("SELECT 1 FROM User_Area WHERE user_id = @user_id AND area_id = @area_id");
            if (check.recordset.length === 0) {
                return res.status(403).json({ error: "Bạn không có quyền thao tác trên khu vực này" });
            }
        } else {
            const areaCheck = await pool.request()
                .input("area_id", sql.Int, area_id)
                .query("SELECT id FROM Area WHERE id = @area_id");
            if (areaCheck.recordset.length === 0) {
                return res.status(404).json({ error: "Khu vực không tồn tại" });
            }
        }

        await pool.request()
            .input("area_id", sql.Int, area_id)
            .input("sensor_type", sql.NVarChar, sensor_type)
            .input("min_value", sql.Float, min_value)
            .input("max_value", sql.Float, max_value)
            .query(`
                UPDATE ThresholdConfig
                SET min_value = @min_value, max_value = @max_value
                WHERE area_id = @area_id AND sensor_type = @sensor_type;

                -- Nếu UPDATE không trúng dòng nào (tức là chưa có cấu hình) thì INSERT
                IF @@ROWCOUNT = 0
                BEGIN
                    INSERT INTO ThresholdConfig (area_id, sensor_type, min_value, max_value)
                    VALUES (@area_id, @sensor_type, @min_value, @max_value);
                END
            `);

        res.json({ message: "Thiết lập ngưỡng thành công" });
    } catch (err) {
        console.error("Lỗi lưu ngưỡng:", err);
        res.status(500).json({ error: "Lỗi server nội bộ" });
    }
});

export default router;