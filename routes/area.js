import express from "express";
import pool, { sql } from "../db.js";
import { verifyToken, requireAdmin } from "../middleware/auth.js";

const router = express.Router();

// =======================
// GET Danh sách khu vực (Cho cả Admin và Owner)
// =======================
router.get("/", verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;

        const result = await pool.request()
            .input("user_id", sql.Int, userId)
            .input("role", sql.NVarChar, userRole)
            .query(`
                SELECT a.id, a.name, a.description 
                FROM Area a
                WHERE @role = 'admin' 
                   OR a.id IN (SELECT area_id FROM User_Area WHERE user_id = @user_id)
            `);
        res.json(result.recordset);
    } catch (error) {
        res.status(500).json({ error: "Lỗi server nội bộ" });
    }
});

// =======================
// POST Thêm khu vực mới (Chỉ Admin)
// =======================
router.post("/", verifyToken, requireAdmin, async (req, res) => {
    const { name, description, owner_id } = req.body;
    
    if (!name) return res.status(400).json({ error: "Tên khu vực không được để trống" });

    try {
        // Tạo Area mới và lấy ID vừa tạo (dùng OUTPUT inserted.id)
        const result = await pool.request()
            .input("name", sql.NVarChar, name)
            .input("description", sql.NVarChar, description)
            .query(`
                INSERT INTO Area (name, description) 
                OUTPUT inserted.id 
                VALUES (@name, @description)
            `);
        
        const newAreaId = result.recordset[0].id;

        // Nếu có truyền owner_id, gán quyền cho chủ nông trại đó luôn
        if (owner_id) {
            await pool.request()
                .input("user_id", sql.Int, owner_id)
                .input("area_id", sql.Int, newAreaId)
                .input("access_level", sql.NVarChar, 'OWNER')
                .query(`
                    INSERT INTO User_Area (user_id, area_id, access_level) 
                    VALUES (@user_id, @area_id, @access_level)
                `);
        }

        res.json({ message: "Tạo khu vực thành công", area_id: newAreaId });
    } catch (error) {
        res.status(500).json({ error: "Lỗi server nội bộ" });
    }
});

// Bạn có thể tự bổ sung thêm PUT (Sửa) và DELETE (Xóa) tại đây
export default router;