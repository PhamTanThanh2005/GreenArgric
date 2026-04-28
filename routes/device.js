import express from "express";
import { verifyToken, requireAdmin } from "../middleware/auth.js";
import pool, { sql } from "../db.js";
import { client } from "../mqtt.js";
import { CONTROL_PUMP, CONTROL_LIGHT } from "../core/const.js";

const router = express.Router();

// =======================
// GET Danh sách thiết bị (Cho Admin & Owner)
// =======================
router.get("/", verifyToken, async (req, res) => {
    try {
        const userRole = req.user.role;
        const result = await pool.request()
            .input("role", sql.NVarChar, userRole)
            .query(`
                SELECT 
                    d.id, 
                    d.name AS device_name, 
                    d.type, 
                    d.status,
                    d.area_id,
                    ar.name AS area_name,
                    ISNULL(a.mode, 'OFF') AS mode,
                    a.time AS last_updated
                FROM Device d
                JOIN Area ar ON d.area_id = ar.id
                LEFT JOIN (
                    SELECT device_id, mode, time,
                        ROW_NUMBER() OVER (PARTITION BY device_id ORDER BY time DESC) AS rn
                    FROM ActivityLog
                ) a ON d.id = a.device_id AND a.rn = 1
                WHERE @role IN ('admin', 'owner')
            `);

        res.json(result.recordset);
    } catch (error) {
        console.error("Error fetching devices:", error);
        res.status(500).json({ error: "Lỗi server nội bộ" });
    }
});

// =======================
// POST Điều khiển thủ công (Manual Override)
// =======================
router.post("/override", verifyToken, async (req, res) => {
    const { device_id, mode, expire_time } = req.body;
    const userId = req.user.id;

    try {
        // 1. UPSERT vào ManualOverride (Composite Key: user_id, device_id)
        await pool.request()
            .input("user_id", sql.Int, userId)
            .input("device_id", sql.Int, device_id)
            .input("mode", sql.NVarChar, mode)
            .input("expire_time", sql.DateTime, expire_time)
            .query(`
                IF EXISTS (SELECT 1 FROM ManualOverride WHERE user_id = @user_id AND device_id = @device_id)
                    UPDATE ManualOverride 
                    SET mode = @mode, expire_time = @expire_time, created_at = GETDATE()
                    WHERE user_id = @user_id AND device_id = @device_id
                ELSE
                    INSERT INTO ManualOverride (user_id, device_id, mode, expire_time)
                    VALUES (@user_id, @device_id, @mode, @expire_time)
            `);

        // 2. Ghi nhận ActivityLog
        await pool.request()
            .input("device_id", sql.Int, device_id)
            .input("mode", sql.NVarChar, mode)
            .input("source", sql.NVarChar, "manual")
            .query(`
                INSERT INTO ActivityLog (device_id, mode, source)
                VALUES (@device_id, @mode, @source)
            `);
        
        // 3. Truy vấn loại thiết bị để gửi đúng lệnh MQTT
        const devRes = await pool.request()
            .input("device_id", sql.Int, device_id)
            .query("SELECT type FROM Device WHERE id = @device_id");
            
        if (devRes.recordset.length > 0) {
            const devType = devRes.recordset[0].type;
            const payload = mode === "ON" ? "1" : "0";

            if (devType === 'pump') {
                client.publish(CONTROL_PUMP, payload, { retain: true });
            } else if (devType === 'light') {
                client.publish(CONTROL_LIGHT, payload, { retain: true });
            }
        }

        res.json({ message: "Gửi lệnh điều khiển thành công" });
    } catch (error) {
        console.error("Error creating manual override:", error);
        res.status(500).json({ error: "Lỗi server nội bộ" });
    }
});
// =======================
// POST /device - Thêm thiết bị mới (Admin)
// =======================
router.post("/", verifyToken, requireAdmin, async (req, res) => {
    const { name, type, area_id, status = 1 } = req.body;

    if (!name || !type || !area_id) {
        return res.status(400).json({ error: "Thiếu thông tin name, type hoặc area_id" });
    }

    try {
        await pool.request()
            .input("name", sql.NVarChar, name)
            .input("type", sql.NVarChar, type)
            .input("status", sql.Bit, status)
            .input("area_id", sql.Int, area_id)
            .query(`
                INSERT INTO Device (name, type, status, area_id)
                VALUES (@name, @type, @status, @area_id)
            `);
        res.json({ message: "Thêm thiết bị thành công" });
    } catch (error) {
        console.error("Lỗi thêm thiết bị:", error);
        res.status(500).json({ error: "Lỗi server nội bộ" });
    }
});

// =======================
// PUT /device/:id - Chỉnh sửa thiết bị (Admin)
// =======================
router.put("/:id", verifyToken, requireAdmin, async (req, res) => {
    const { id } = req.params;
    const { name, type, status, area_id } = req.body;

    try {
        await pool.request()
            .input("id", sql.Int, id)
            .input("name", sql.NVarChar, name)
            .input("type", sql.NVarChar, type)
            .input("status", sql.Bit, status)
            .input("area_id", sql.Int, area_id)
            .query(`
                UPDATE Device
                SET name = ISNULL(@name, name),
                    type = ISNULL(@type, type),
                    status = ISNULL(@status, status),
                    area_id = ISNULL(@area_id, area_id)
                WHERE id = @id
            `);
        res.json({ message: "Cập nhật thiết bị thành công" });
    } catch (error) {
        console.error("Lỗi cập nhật thiết bị:", error);
        res.status(500).json({ error: "Lỗi server nội bộ" });
    }
});

// =======================
// DELETE /device/:id - Xóa thiết bị (Admin)
// =======================
router.delete("/:id", verifyToken, requireAdmin, async (req, res) => {
    const { id } = req.params;

    try {
        await pool.request()
            .input("id", sql.Int, id)
            .query("DELETE FROM Device WHERE id = @id");
            
        res.json({ message: "Xóa thiết bị thành công" });
    } catch (error) {
        console.error("Lỗi xóa thiết bị:", error);
        res.status(500).json({ error: "Lỗi server nội bộ" });
    }
});

export default router;