import express from "express";
import pool, { sql } from "../db.js";
import { verifyToken, requireAdmin } from "../middleware/auth.js";

const router = express.Router();

// =======================
// POST UPSERT Ngưỡng môi trường
// =======================
router.post("/", verifyToken, requireAdmin, async (req, res) => {
    const { area_id, sensor_type, min_value, max_value } = req.body;

    if (!area_id || !sensor_type) {
        return res.status(400).json({ error: "Thiếu area_id hoặc sensor_type" });
    }

    if (min_value == null && max_value == null) {
        return res.status(400).json({ error: "Phải nhập ít nhất min_value hoặc max_value" });
    }

    try {
        // Kiểm tra Khu vực tồn tại
        const areaCheck = await pool.request()
            .input("area_id", sql.Int, area_id)
            .query("SELECT id FROM Area WHERE id = @area_id");

        if (areaCheck.recordset.length === 0) {
            return res.status(404).json({ error: "Khu vực không tồn tại" });
        }

        // UPSERT theo area_id
        await pool.request()
            .input("area_id", sql.Int, area_id)
            .input("sensor_type", sql.NVarChar, sensor_type)
            .input("min_value", sql.Float, min_value)
            .input("max_value", sql.Float, max_value)
            .query(`
                IF EXISTS (
                    SELECT 1 FROM ThresholdConfig
                    WHERE area_id = @area_id AND sensor_type = @sensor_type
                )
                BEGIN
                    UPDATE ThresholdConfig
                    SET min_value = @min_value,
                        max_value = @max_value
                    WHERE area_id = @area_id
                    AND sensor_type = @sensor_type
                END
                ELSE
                BEGIN
                    INSERT INTO ThresholdConfig(area_id, sensor_type, min_value, max_value)
                    VALUES (@area_id, @sensor_type, @min_value, @max_value)
                END
            `);

        res.json({ message: "Thiết lập ngưỡng thành công" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Lỗi server nội bộ" });
    }
});

export default router;