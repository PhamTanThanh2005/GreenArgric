import express from "express"
import pool, { sql } from "../db.js"
import { mockAuth, requireAdmin } from "../middleware/auth.js"

const router = express.Router()

// =======================
// UPSERT ThresholdConfig
// =======================
router.post("/", mockAuth, requireAdmin, async (req, res) => {
    const { device_id, sensor_type, min_value, max_value } = req.body

    // ===== Validate =====
    if (!device_id || !sensor_type) {
        return res.status(400).json({
            error: "Thiếu device_id hoặc sensor_type"
        })
    }

    if (min_value == null && max_value == null) {
        return res.status(400).json({
            error: "Phải có ít nhất min_value hoặc max_value"
        })
    }

    try {
        // ===== Check device tồn tại =====
        const deviceCheck = await pool.request()
            .input("device_id", sql.Int, device_id)
            .query(`
                SELECT * FROM Device WHERE id = @device_id
            `)

        if (deviceCheck.recordset.length === 0) {
            return res.status(404).json({
                error: "Device không tồn tại"
            })
        }

        // ===== UPSERT =====
        await pool.request()
            .input("device_id", sql.Int, device_id)
            .input("sensor_type", sql.NVarChar, sensor_type)
            .input("min_value", sql.Float, min_value)
            .input("max_value", sql.Float, max_value)
            .query(`
                IF EXISTS (
                    SELECT 1 FROM ThresholdConfig
                    WHERE device_id = @device_id AND sensor_type = @sensor_type
                )
                BEGIN
                    UPDATE ThresholdConfig
                    SET min_value = @min_value,
                        max_value = @max_value
                    WHERE device_id = @device_id
                    AND sensor_type = @sensor_type
                END
                ELSE
                BEGIN
                    INSERT INTO ThresholdConfig(device_id, sensor_type, min_value, max_value)
                    VALUES (@device_id, @sensor_type, @min_value, @max_value)
                END
            `)

        res.json({
            message: "Cập nhật ngưỡng thành công"
        })

    } catch (err) {
        console.error(err)
        res.status(500).json({
            error: err.message
        })
    }
})

export default router