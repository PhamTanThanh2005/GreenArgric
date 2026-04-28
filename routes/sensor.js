import express from "express";
import pool, { sql } from "../db.js";
import { verifyToken, requireAdmin } from "../middleware/auth.js";

const router = express.Router();
// =======================
// GET Lấy tất cả cảm biến (Admin & Owner)
// =======================
router.get("/", verifyToken, async (req, res) => {
    const userRole = req.user.role;

    try {
        const result = await pool.request()
            .input("role", sql.NVarChar, userRole)
            .query(`
                SELECT 
                    s.id, 
                    s.name AS sensor_name, 
                    s.type, 
                    s.area_id,
                    a.name AS area_name
                FROM Sensor s
                JOIN Area a ON s.area_id = a.id
                WHERE @role IN ('admin', 'owner')
                ORDER BY s.id DESC
            `);

        res.json(result.recordset);
    } catch (error) {
        console.error("Lỗi lấy danh sách cảm biến:", error);
        res.status(500).json({ error: "Lỗi server nội bộ" });
    }
});
// =======================
// GET Dữ liệu mới nhất theo Khu vực
// =======================
router.get("/area/:area_id/latest", verifyToken, async (req, res) => {
    const { area_id } = req.params;
    const userRole = req.user.role;

    try {
        const result = await pool.request()
            .input("area_id", sql.Int, area_id)
            .input("role", sql.NVarChar, userRole)
            .query(`
                SELECT 
                    s.id AS sensor_id,
                    s.name AS sensor_name,
                    s.type,
                    sd.value,
                    sd.time
                FROM Sensor s
                LEFT JOIN (
                    SELECT sensor_id, value, time,
                           ROW_NUMBER() OVER (PARTITION BY sensor_id ORDER BY time DESC) as rn
                    FROM SensorData
                ) sd ON s.id = sd.sensor_id AND sd.rn = 1
                WHERE s.area_id = @area_id
                AND @role IN ('admin', 'owner')
            `);
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// =======================
// GET Lịch sử theo Khu vực và Loại cảm biến
// =======================
router.get("/area/:area_id/history/:type", verifyToken, async (req, res) => {
    const { area_id, type } = req.params;
    const userRole = req.user.role;

    try {
        const result = await pool.request()
            .input("area_id", sql.Int, area_id)
            .input("type", sql.NVarChar, type)
            .input("role", sql.NVarChar, userRole)
            .query(`
                SELECT sd.value, sd.time
                FROM SensorData sd
                JOIN Sensor s ON sd.sensor_id = s.id
                WHERE s.area_id = @area_id 
                  AND s.type = @type
                  AND @role IN ('admin', 'owner')
                ORDER BY sd.time DESC
            `);
        res.json(result.recordset);
    } catch (error) {
        res.status(500).json({ error: "Lỗi server nội bộ" });
    }
});

// =======================
// POST Test Thêm dữ liệu cảm biến
// =======================
router.post("/data", verifyToken, async (req, res) => {
    const { sensor_id, value } = req.body;
    if (!sensor_id || value == null) {
        return res.status(400).json({ error: "Thiếu sensor_id hoặc value" });
    }

    try {
        await pool.request()
            .input("sensor_id", sql.Int, sensor_id)
            .input("value", sql.Float, value)
            .query(`
                INSERT INTO SensorData (sensor_id, value)
                VALUES (@sensor_id, @value)
            `);
        res.json({ message: "Thêm dữ liệu thành công" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// =======================
// POST /sensor - Thêm cảm biến mới (Admin)
// =======================
router.post("/", verifyToken, requireAdmin, async (req, res) => {
    const { name, type, area_id } = req.body;

    if (!name || !type || !area_id) {
        return res.status(400).json({ error: "Thiếu thông tin name, type hoặc area_id" });
    }

    try {
        await pool.request()
            .input("name", sql.NVarChar, name)
            .input("type", sql.NVarChar, type)
            .input("area_id", sql.Int, area_id)
            .query(`
                INSERT INTO Sensor (name, type, area_id)
                VALUES (@name, @type, @area_id)
            `);
        res.json({ message: "Thêm cảm biến thành công" });
    } catch (error) {
        console.error("Lỗi thêm cảm biến:", error);
        res.status(500).json({ error: "Lỗi server nội bộ" });
    }
});

// =======================
// PUT /sensor/:id - Chỉnh sửa cảm biến (Admin)
// =======================
router.put("/:id", verifyToken, requireAdmin, async (req, res) => {
    const { id } = req.params;
    const { name, type, area_id } = req.body;

    try {
        await pool.request()
            .input("id", sql.Int, id)
            .input("name", sql.NVarChar, name)
            .input("type", sql.NVarChar, type)
            .input("area_id", sql.Int, area_id)
            .query(`
                UPDATE Sensor
                SET name = ISNULL(@name, name),
                    type = ISNULL(@type, type),
                    area_id = ISNULL(@area_id, area_id)
                WHERE id = @id
            `);
        res.json({ message: "Cập nhật cảm biến thành công" });
    } catch (error) {
        console.error("Lỗi cập nhật cảm biến:", error);
        res.status(500).json({ error: "Lỗi server nội bộ" });
    }
});

// =======================
// DELETE /sensor/:id - Xóa cảm biến (Admin)
// =======================
router.delete("/:id", verifyToken, requireAdmin, async (req, res) => {
    const { id } = req.params;

    try {
        await pool.request()
            .input("id", sql.Int, id)
            .query("DELETE FROM Sensor WHERE id = @id");
            
        res.json({ message: "Xóa cảm biến thành công" });
    } catch (error) {
        console.error("Lỗi xóa cảm biến:", error);
        res.status(500).json({ error: "Lỗi server nội bộ" });
    }
});

export default router;