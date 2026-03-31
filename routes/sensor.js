import express from "express"
import pool, { sql } from "../db.js"

const router = express.Router()

// =======================
// GET lastest data of each type
// =======================
router.get("/", async (req, res) => {
    try {
        const result = await pool.request().query(`
            SELECT s.type, sd.value, sd.time
            FROM SensorData sd
            JOIN Sensor s ON sd.sensor_id = s.id
            JOIN (
                SELECT sensor_id, MAX(time) AS max_time
                FROM SensorData
                GROUP BY sensor_id
            ) latest
            ON sd.sensor_id = latest.sensor_id 
            AND sd.time = latest.max_time
        `)

        res.json(result.recordset)
    } catch (err) {
        res.status(500).send(err.message)
    }
})

// =======================
// GET by type to show history data
// =======================
router.get("/type/:type", async (req, res) => {
    const { type } = req.params

    try {
        const result = await pool.request()
            .input("type", sql.NVarChar, type)
            .query(`
                SELECT sd.value, sd.time
                FROM SensorData sd
                JOIN Sensor s ON sd.sensor_id = s.id
                WHERE s.type = @type
                ORDER BY sd.time DESC
            `)

        res.json(result.recordset)
    } catch (error) {
        console.error("Error fetching sensor by type:", error)
        res.status(500).json({ error: "Internal Server Error" })
    }
})

// =======================
// POST insert sensor data - to test
// =======================
router.post("/", async (req, res) => {
    const { sensor_id, value } = req.body

    if (!sensor_id || value == null) {
        return res.status(400).json({
            error: "Thiếu sensor_id hoặc value"
        })
    }

    try {
        // Lưu SensorData
        await pool.request()
            .input("sensor_id", sql.Int, sensor_id)
            .input("value", sql.Float, value)
            .query(`
                INSERT INTO SensorData (sensor_id, value)
                VALUES (@sensor_id, @value)
            `)

        res.json({
            message: "Inserted + processed successfully"
        })

    } catch (err) {
        res.status(500).send(err.message)
    }
})

export default router