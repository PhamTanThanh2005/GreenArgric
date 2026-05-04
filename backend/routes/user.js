// routes/user.js
import express from "express";
import pool, { sql } from "../db.js";
import { verifyToken, requireAdmin } from "../middleware/auth.js";

import bcrypt from "bcrypt";

const router = express.Router();

// ==========================================
// GET /user - Lấy danh sách tất cả người dùng (Admin)
// ==========================================
router.get("/", verifyToken, requireAdmin, async (req, res) => {
    try {
        const result = await pool.request()
            .query(`
                SELECT id, username, name, email, phone, role 
                FROM [User]
            `);

        res.json(result.recordset);
    } catch (error) {
        console.error("Lỗi lấy danh sách user:", error);
        res.status(500).json({ error: "Lỗi server nội bộ" });
    }
});

// ==========================================
// GET /user/profile - Lấy thông tin cá nhân
// ==========================================
router.get("/profile", verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;

        const result = await pool.request()
            .input("id", sql.Int, userId)
            .query(`
                SELECT id, username, name, email, phone, role 
                FROM [User] 
                WHERE id = @id
            `);

        if (result.recordset.length === 0) {
            return res.status(404).json({ message: "Người dùng không tồn tại" });
        }

        res.json(result.recordset[0]);
    } catch (error) {
        console.error("Lỗi lấy profile:", error);
        res.status(500).json({ error: "Lỗi server nội bộ" });
    }
});

// ==========================================
// PUT /user/profile - Thay đổi thông tin
// ==========================================
router.put("/profile", verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { name, email, phone } = req.body;

        if (!name && !email && !phone) {
            return res.status(400).json({ message: "Vui lòng cung cấp thông tin cần cập nhật" });
        }

        const result = await pool.request()
            .input("id", sql.Int, userId)
            .input("name", sql.NVarChar, name || null)
            .input("email", sql.VarChar, email || null)
            .input("phone", sql.VarChar, phone || null)
            .query(`
                UPDATE [User] 
                SET 
                    name = ISNULL(@name, name),
                    email = ISNULL(@email, email),
                    phone = ISNULL(@phone, phone)
                WHERE id = @id
            `);

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ message: "Người dùng không tồn tại" });
        }

        res.json({ message: "Cập nhật thông tin cá nhân thành công" });
    } catch (error) {
        console.error("Lỗi cập nhật profile:", error);
        res.status(500).json({ error: "Lỗi server nội bộ" });
    }
});

// ==========================================
// POST /user - Thêm người dùng mới (Admin)
// ==========================================
router.post("/", verifyToken, requireAdmin, async (req, res) => {
    try {
        const { username, password, name, email, phone, role } = req.body;

        if (!username || !password || !name || !role) {
            return res.status(400).json({ message: "Vui lòng nhập đầy đủ username, password, name và role" });
        }

        const checkExist = await pool.request()
            .input("username", sql.VarChar, username)
            .query(`SELECT id FROM [User] WHERE username = @username`);

        if (checkExist.recordset.length > 0) {
            return res.status(409).json({ message: "Tên đăng nhập đã tồn tại" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        await pool.request()
            .input("username", sql.VarChar, username)
            .input("password", sql.VarChar, hashedPassword)
            .input("name", sql.NVarChar, name)
            .input("email", sql.VarChar, email || null)
            .input("phone", sql.VarChar, phone || null)
            .input("role", sql.VarChar, role)
            .query(`
                INSERT INTO [User] (username, password, name, email, phone, role)
                VALUES (@username, @password, @name, @email, @phone, @role)
            `);

        res.status(201).json({ message: "Tạo người dùng thành công" });
    } catch (error) {
        console.error("Lỗi thêm user:", error);
        res.status(500).json({ error: "Lỗi server nội bộ" });
    }
});

// ==========================================
// PUT /user/:id - Chỉnh sửa thông tin người dùng (Admin)
// ==========================================
router.put("/:id", verifyToken, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, phone, role, password } = req.body;

        const request = pool.request().input("id", sql.Int, id);
        let updateQuery = `
            UPDATE [User] 
            SET 
                name = ISNULL(@name, name),
                email = ISNULL(@email, email),
                phone = ISNULL(@phone, phone),
                role = ISNULL(@role, role)
        `;

        request.input("name", sql.NVarChar, name || null);
        request.input("email", sql.VarChar, email || null);
        request.input("phone", sql.VarChar, phone || null);
        request.input("role", sql.VarChar, role || null);

        if (password) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            updateQuery += `, password = @password`;
            request.input("password", sql.VarChar, hashedPassword);
        }

        updateQuery += ` WHERE id = @id`;

        const result = await request.query(updateQuery);

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ message: "Người dùng không tồn tại" });
        }

        res.json({ message: "Cập nhật người dùng thành công" });
    } catch (error) {
        console.error("Lỗi cập nhật user:", error);
        res.status(500).json({ error: "Lỗi server nội bộ" });
    }
});

// ==========================================
// DELETE /user/:id - Xóa người dùng (Admin)
// ==========================================
router.delete("/:id", verifyToken, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;

        if (parseInt(id) === req.user.id) {
            return res.status(400).json({ message: "Bạn không thể tự xóa tài khoản của chính mình" });
        }

        const result = await pool.request()
            .input("id", sql.Int, id)
            .query(`DELETE FROM [User] WHERE id = @id`);

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ message: "Người dùng không tồn tại" });
        }

        res.json({ message: "Xóa người dùng thành công" });
    } catch (error) {
        console.error("Lỗi xóa user:", error);

        if (error.number === 547) { 
            return res.status(400).json({ message: "Không thể xóa người dùng này vì dữ liệu đang được liên kết với hệ thống." });
        }
        res.status(500).json({ error: "Lỗi server nội bộ" });
    }
});

export default router;