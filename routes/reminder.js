import express from "express"
import { mockAuth, requireOwner } from "../middleware/auth.js"
import pool from "../db.js"

const router = express.Router()

// =======================
// GET Reminders
// =======================
router.get("/", mockAuth, requireOwner, async (req, res) => {
    try {
        const result = await pool.request().query(`
            SELECT id, description, time FROM Reminder
            WHERE is_done = 0
            ORDER BY time DESC
        `)

        res.json(result.recordset)
    } catch (error) {
        console.error("Error fetching reminders:", error)
        res.status(500).json({ error: "Internal Server Error" })
    }
})

// =======================
// POST is done Reminder
// =======================
router.post("/:id", mockAuth, requireOwner, async (req, res) => {
    const { id } = req.params

    try {
        await pool.request()
            .input("id", id)
            .query(`
                UPDATE Reminder
                SET is_done = 1
                WHERE id = @id
            `)
        res.json({ message: "Reminder marked as done" })
    } catch (error) {
        console.error("Error updating reminder:", error)
        res.status(500).json({ error: "Internal Server Error" })
    }
})

export default router
    