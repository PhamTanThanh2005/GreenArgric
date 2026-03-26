import express from "express"
import pool, { sql } from "../db.js"

const router = express.Router()

// =======================
// GET all sensor data
// =======================
router.get("/", async (req, res) => {
    try {
        const result = await pool.request().query(`
            SELECT * FROM SensorData
        `)

        res.json(result.recordset)
    } catch (err) {
        res.status(500).send(err.message)
    }
})

// =======================
// GET latest data
// =======================
router.get("/latest", async (req, res) => {
    try {
        const result = await pool.request().query(`
            SELECT TOP 1 * FROM SensorData
            ORDER BY created_at DESC
        `)

        res.json(result.recordset[0])
    } catch (err) {
        res.status(500).send(err.message)
    }
})

// =======================
// GET by type
// =======================
router.get("/type/:type", async (req, res) => {
    const { type } = req.params

    try {
        const result = await pool.request()
            .input("type", sql.NVarChar, type)
            .query(`
                SELECT * FROM SensorData WHERE type = @type
                ORDER BY created_at DESC
            `)

        res.json(result.recordset)
    } catch (err) {
        res.status(500).send(err.message)
    }
})

// =======================
// POST insert sensor data
// =======================
router.post("/", async (req, res) => {
    const { sensor_id, value } = req.body

    if (!sensor_id || value == null) {
        return res.status(400).json({
            error: "Thiếu sensor_id hoặc value"
        })
    }

    try {
        // 1. Lưu SensorData
        await pool.request()
            .input("sensor_id", sql.Int, sensor_id)
            .input("value", sql.Float, value)
            .query(`
                INSERT INTO SensorData (sensor_id, value)
                VALUES (@sensor_id, @value)
            `)

        // 2. Lấy type của sensor
        const sensorResult = await pool.request()
            .input("sensor_id", sql.Int, sensor_id)
            .query(`
                SELECT type FROM Sensor WHERE id = @sensor_id
            `)

        if (sensorResult.recordset.length === 0) {
            return res.status(404).json({ error: "Sensor không tồn tại" })
        }

        const sensorType = sensorResult.recordset[0].type

        // 3. Lấy các device liên quan
        const deviceResult = await pool.request()
            .input("sensor_id", sql.Int, sensor_id)
            .query(`
                SELECT d.id, d.type, d.user_id
                FROM Device d
                JOIN SensorDevice sd ON d.id = sd.device_id
                WHERE sd.sensor_id = @sensor_id
            `)

        // 4. Duyệt từng device
        for (const device of deviceResult.recordset) {

            // lấy threshold
            const thresholdResult = await pool.request()
                .input("device_id", sql.Int, device.id)
                .input("sensor_type", sql.NVarChar, sensorType)
                .query(`
                    SELECT min_value, max_value
                    FROM ThresholdConfig
                    WHERE device_id = @device_id
                    AND sensor_type = @sensor_type
                `)

            if (thresholdResult.recordset.length === 0) continue

            const { min_value, max_value } = thresholdResult.recordset[0]

            // 5. Check vượt ngưỡng
            if (value < min_value || value > max_value) {

                const mode = value > max_value ? "ON" : "OFF"

                // 6. Insert ActivityLog
                await pool.request()
                    .input("device_id", sql.Int, device.id)
                    .input("mode", sql.NVarChar, mode)
                    .input("source", sql.NVarChar, "auto")
                    .query(`
                        INSERT INTO ActivityLog (device_id, mode, source)
                        VALUES (@device_id, @mode, @source)
                    `)

                // 7. Insert Reminder
                await pool.request()
                    .input("user_id", sql.Int, device.user_id)
                    .input("desc", sql.NVarChar,
                        `Sensor ${sensorType} vượt ngưỡng (${value}) → ${device.type} ${mode}`)
                    .query(`
                        INSERT INTO Reminder (user_id, description, time)
                        VALUES (@user_id, @desc, GETDATE())
                    `)
            }
        }

        res.json({
            message: "Inserted + processed successfully"
        })

    } catch (err) {
        res.status(500).send(err.message)
    }
})

export default router