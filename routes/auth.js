// routes/auth.js
import express from "express";
import pool, { sql } from "../db.js";
import jwt from "jsonwebtoken";

const router = express.Router();
const SECRET_KEY = process.env.JWT_SECRET || "my_secret_key";

router.post("/login", async (req, res) => {
    console.log("BODY:", req.body); 
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Vui lòng nhập đầy đủ tài khoản và mật khẩu!" });
    }

    try {
        const result = await pool.request()
            .input("username", sql.NVarChar, username)
            .query(`
                SELECT id, username, password, role 
                FROM [User] 
                WHERE username = @username
            `);

        const user = result.recordset[0];

        if (!user || password !== user.password) {
            return res.status(401).json({ message: "Sai tài khoản hoặc mật khẩu!" });
        }

        const token = jwt.sign(
            { 
                id: user.id, 
                role: user.role, 
                username: user.username 
            },
            SECRET_KEY,
            { expiresIn: "1d" } // Expire time: 1 day
        );

        res.status(200).json({
            message: "Đăng nhập thành công",
            token,
            user: { 
                id: user.id, 
                role: user.role, 
                username: user.username 
            }
        });

    } catch (error) {
        console.error("Lỗi đăng nhập:", error);
        res.status(500).json({ message: "Lỗi server nội bộ!" });
    }
});

export default router;