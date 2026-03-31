import express from "express"
import { mockAuth, requireOwner } from "../middleware/auth.js"
import pool, { sql } from "../db.js"
import { client } from "../mqtt.js"
import { CONTROL_PUMP, CONTROL_LIGHT } from "../core/const.js"

const router = express.Router()

// =======================
// GET Devices
// =======================
// router.get("/", mockAuth, requireOwner, async (req, res) => {
//     try {
//         const user_id = req.headers["user_id"]
//         const result = await pool.request()
//             .input("user_id", sql.Int, user_id)
//             .query(`
//                 SELECT id, type 
//                 FROM Device
//                 WHERE user_id = @user_id
//             `)

//         res.json(result.recordset)
//     } catch (error) {
//         console.error("Error fetching devices:", error)
//         res.status(500).json({ error: "Internal Server Error" })
//     }
// })
router.get("/", mockAuth, requireOwner, async (req, res) => {
    try {
        const user_id = req.headers["user_id"]
        const result = await pool.request()
            .input("user_id", sql.Int, user_id)
            .query(`
                SELECT d.type, a.mode, a.time, d.id
                FROM (
                    SELECT *,
                        ROW_NUMBER() OVER (PARTITION BY device_id ORDER BY time DESC) AS rn
                    FROM ActivityLog
                ) a
                JOIN Device d ON a.device_id = d.id
                WHERE rn = 1
            `)

        res.json(result.recordset)
    } catch (error) {
        console.error("Error fetching devices:", error)
        res.status(500).json({ error: "Internal Server Error" })
    }
})

// =======================
// POST Manual Override
// =======================
router.post("/override", mockAuth, requireOwner, async (req, res) => {
    const { device_id, mode, expire_time } = req.body

    try {
        // Insert ManualOverride
        await pool.request()
            .input("device_id", sql.Int, device_id)
            .input("mode", sql.NVarChar, mode)
            .input("expire_time", sql.DateTime, expire_time)
            .query(`
                INSERT INTO ManualOverride (device_id, mode, expire_time)
                VALUES (@device_id, @mode, @expire_time)
            `)
        // Insert ActivityLog
        await pool.request()
            .input("device_id", sql.Int, device_id)
            .input("mode", sql.NVarChar, mode)
            .input("source", sql.NVarChar, "manual")
            .query(`
                INSERT INTO ActivityLog (device_id, mode, source)
                VALUES (@device_id, @mode, @source)
            `)
        
        const payload = mode === "ON" ? "1" : "0"
        
        if (device_id === 1) {
            client.publish(CONTROL_PUMP, payload, { retain: true })
        } else if (device_id === 2) {   
            client.publish(CONTROL_LIGHT, payload, { retain: true })
        }

        res.json({ message: "Manual override created" })
    } catch (error) {
        console.error("Error creating manual override:", error)
        res.status(500).json({ error: "Internal Server Error" })
    }
})

export default router
    