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
                SELECT 
                    a.id, 
                    a.name, 
                    a.description,
                    u.id AS owner_id,
                    u.name AS owner_name,
                    u.username AS owner_username
                FROM Area a
                -- Kết nối với User_Area và User để lấy thông tin Chủ vườn
                LEFT JOIN User_Area ua ON a.id = ua.area_id AND ua.access_level = 'OWNER'
                LEFT JOIN [User] u ON ua.user_id = u.id
                WHERE @role = 'admin' 
                   OR a.id IN (SELECT area_id FROM User_Area WHERE user_id = @user_id)
            `);
        res.json(result.recordset);
    } catch (error) {
        console.error("Lỗi lấy danh sách Area:", error);
        res.status(500).json({ error: "Lỗi server nội bộ" });
    }
});

// =======================
// POST Thêm khu vực mới
// =======================
router.post("/", verifyToken, requireAdmin, async (req, res) => {
    const { name, description, owner_id } = req.body;
    
    if (!name) return res.status(400).json({ error: "Tên khu vực không được để trống" });

    try {
        const result = await pool.request()
            .input("name", sql.NVarChar, name)
            .input("description", sql.NVarChar, description)
            .query(`
                INSERT INTO Area (name, description) 
                OUTPUT inserted.id 
                VALUES (@name, @description)
            `);
        
        const newAreaId = result.recordset[0].id;

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

// =======================
// PUT Cập nhật khu vực (Admin)
// =======================
router.put("/:id", verifyToken, requireAdmin, async (req, res) => {
    const { id } = req.params;
    const { name, description, owner_id } = req.body; 

    try {
        const result = await pool.request()
            .input("id", sql.Int, id)
            .input("name", sql.NVarChar, name)
            .input("description", sql.NVarChar, description)
            .query(`
                UPDATE Area 
                SET name = ISNULL(@name, name), 
                    description = ISNULL(@description, description)
                WHERE id = @id
            `);

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ error: "Không tìm thấy khu vực để cập nhật" });
        }

        if (owner_id !== undefined) {

            await pool.request()
                .input("area_id", sql.Int, id)
                .query(`
                    DELETE FROM User_Area 
                    WHERE area_id = @area_id AND access_level = 'OWNER'
                `);

            if (owner_id !== null) {
                await pool.request()
                    .input("user_id", sql.Int, owner_id)
                    .input("area_id", sql.Int, id)
                    .input("access_level", sql.NVarChar, 'OWNER')
                    .query(`
                        -- Dùng IF EXISTS để kiểm tra xem ông này đã có mặt trong khu vực chưa
                        IF EXISTS (SELECT 1 FROM User_Area WHERE user_id = @user_id AND area_id = @area_id)
                        BEGIN
                            -- Nếu có rồi (dù là VIEWER hay EDITOR) thì nâng cấp quyền ổng lên OWNER
                            UPDATE User_Area 
                            SET access_level = @access_level 
                            WHERE user_id = @user_id AND area_id = @area_id
                        END
                        ELSE
                        BEGIN
                            -- Nếu chưa từng dính dáng gì tới khu vực này thì Insert mới
                            INSERT INTO User_Area (user_id, area_id, access_level) 
                            VALUES (@user_id, @area_id, @access_level)
                        END
                    `);
            }
        }

        res.json({ message: "Cập nhật khu vực thành công" });
    } catch (error) {
        console.error("Lỗi cập nhật khu vực:", error);
        res.status(500).json({ error: error.message || "Lỗi server nội bộ" });
    }
});

// =======================
// DELETE Xóa khu vực (Admin)
// =======================
router.delete("/:id", verifyToken, requireAdmin, async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.request()
            .input("id", sql.Int, id)
            .query("DELETE FROM Area WHERE id = @id");

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ error: "Không tìm thấy khu vực để xóa" });
        }

        res.json({ message: "Xóa khu vực thành công" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Lỗi server nội bộ (Có thể do khu vực vẫn còn thiết bị/cảm biến)" });
    }
});

export default router;