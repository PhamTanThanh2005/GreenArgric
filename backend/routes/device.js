import express from "express";
import { verifyToken, requireAdmin } from "../middleware/auth.js";
import pool, { sql } from "../db.js";
import { client } from "../mqtt.js";
import { logActivity } from "../core/utils.js";
const FEED_BASE = process.env.MQTT_FEED || "MinhTriDADN/feeds";


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

// =======================================
// POST /device/override - Điều khiển thiết bị thủ công
// =======================================
router.post("/override", verifyToken, async (req, res) => {
    const { device_id, mode, expire_time } = req.body;
    const user_id = req.user.id;

    try {
        const deviceRes = await pool.request()
            .input("device_id", sql.Int, device_id)
            .query("SELECT id, type, feed_key FROM Device WHERE id = @device_id");

        if (deviceRes.recordset.length === 0) return res.status(404).json({ error: "Không tìm thấy thiết bị" });
        const device = deviceRes.recordset[0];

        if (!device.feed_key) return res.status(400).json({ error: "Thiết bị chưa được cấu hình Feed Key (Vxx)" });

        await pool.request()
            .input("user_id", sql.Int, user_id)
            .input("device_id", sql.Int, device_id)
            .input("mode", sql.NVarChar, mode)
            .input("expire_time", sql.DateTime, new Date(expire_time))
            .query(`
                IF EXISTS (SELECT 1 FROM ManualOverride WHERE user_id = @user_id AND device_id = @device_id)
                    UPDATE ManualOverride SET mode = @mode, expire_time = @expire_time, created_at = GETDATE() WHERE user_id = @user_id AND device_id = @device_id
                ELSE
                    INSERT INTO ManualOverride (user_id, device_id, mode, expire_time) VALUES (@user_id, @device_id, @mode, @expire_time)
            `);

        const mqttTopic = `${FEED_BASE}/${device.feed_key}`; // VD: MinhTriDADN/feeds/V10
        const payload = mode === 'ON' ? "1" : "0";
        
        client.publish(mqttTopic, payload, { retain: true });
        console.log(`[MANUAL] Bắn ${payload} ra Topic: ${mqttTopic}`);

        await logActivity(device_id, mode, "manual");
        res.json({ message: "Gửi lệnh thành công" });
    } catch (error) {
        console.error("Lỗi Override:", error);
        console.error("==== LỖI CHI TIẾT OVERRIDE DEVICE ====");
        console.error(error); 
        console.error("=====================================");
        res.status(500).json({ error: "Lỗi server" });
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