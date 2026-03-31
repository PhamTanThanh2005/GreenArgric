import express from "express"
import pool, { sql } from "../db.js"

const router = express.Router()

// =======================
// LOGIN
// =======================
router.post("/login", async (req, res) => {
    const { username, password } = req.body

    if (!username || !password) {
        return res.status(400).json({
            error: "Missing username or password"
        })
    }

    try {
        const result = await pool.request()
            .input("username", sql.NVarChar, username)
            .input("password", sql.NVarChar, password)
            .query(`
                SELECT id, name, role
                FROM [User]
                WHERE username = @username AND password = @password
            `)

        if (result.recordset.length === 0) {
            return res.status(401).json({
                error: "Sai tài khoản hoặc mật khẩu"
            })
        }

        const user = result.recordset[0]

        res.json({
            message: "Login successful",
            user: {
                id: user.id,
                name: user.name,
                role: user.role
            }
        })

    } catch (err) {
        res.status(500).json({
            error: err.message
        })
    }
})

export default router