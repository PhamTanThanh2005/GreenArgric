import express from "express";
import pool, { sql } from "../db.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

// ==================================================
// GET /task - Lấy danh sách các công việc (có thể lọc theo khu)
// ==================================================
router.get("/", verifyToken, async(req, res)=> {
    try {
        const userId = req.user.id;
        const areaId = req.query.area_id; // /task?area_id=1

        let queryStr = `
            SELECT id, title, description, scheduled_at, status, is_done, area_id 
            FROM Task
            WHERE user_id = @user_id
        `;

        const request = pool.request().input("user_id", sql.Int, userId);

        if (areaId) {
            queryStr += ` AND area_id = @area_id`;
            request.input("area_id", sql.Int, areaId);
        }

        queryStr += ` ORDER BY scheduled_at DESC`;

        const result = await request.query(queryStr);
        res.json(result.recordset);

    } catch (error) {
        console.error("Lỗi lấy danh sách Task:", error);
        res.status(500).json({error : "Lỗi server nội bộ"});
    }
});

// ==================================================
// POST /task - Tạo công việc cần làm
// ==================================================
router.post("/", verifyToken, async(req, res) => {
    try {
        const userId = req.user.id;
        const { title, description, scheduled_at, status, is_done, area_id } = req.body;

        if (!title || !scheduled_at || !area_id) {
            return res.status(400).json({ error: "Thiếu thông tin bắt buộc: title, scheduled_at, hoặc area_id" });
        }

        const taskStatus = status ? status.toUpperCase() : 'PENDING';

        const result = await pool.request()
            .input("user_id", sql.Int, userId)
            .input("area_id", sql.Int, area_id)
            .input("title", sql.NVarChar, title)
            .input("description", sql.NVarChar, description || "")
            .input("scheduled_at", sql.DateTime2, scheduled_at)
            .input("status", sql.NVarChar, taskStatus)
            .input("is_done", sql.Bit, is_done !== undefined ? is_done : 0)
            .query(`
                INSERT INTO Task (user_id, area_id, title, description, scheduled_at, status, is_done)
                OUTPUT INSERTED.id
                VALUES (@user_id, @area_id, @title, @description, @scheduled_at, @status, @is_done)
            `);
        
        res.status(201).json({ 
            message: "Tạo công việc thành công", 
            taskId: result.recordset[0].id 
        });

    } catch (error) {
        console.error("Lỗi tạo Task:", error);
        res.status(500).json({ error: "Lỗi server nội bộ" });
    }
});

// ==================================================
// PUT /task/:id - Cập nhật công việc
// ==================================================
router.put("/:id", verifyToken, async(req, res) => {
    try {
        const userId = req.user.id;
        const taskId = req.params.id;
        const { title, description, scheduled_at, status, is_done, area_id } = req.body;

        const taskStatus = status ? status.toUpperCase() : null;

        const result = await pool.request()
            .input("id", sql.Int, taskId)
            .input("user_id", sql.Int, userId)
            .input("area_id", sql.Int, area_id)
            .input("title", sql.NVarChar, title)
            .input("description", sql.NVarChar, description)
            .input("scheduled_at", sql.DateTime2, scheduled_at)
            .input("status", sql.NVarChar, taskStatus)
            .input("is_done", sql.Bit, is_done)
            .query(`
                UPDATE Task
                SET 
                    title = ISNULL(@title, title),
                    description = ISNULL(@description, description),
                    scheduled_at = ISNULL(@scheduled_at, scheduled_at),
                    status = ISNULL(@status, status),
                    is_done = ISNULL(@is_done, is_done),
                    area_id = ISNULL(@area_id, area_id)
                WHERE id = @id AND user_id = @user_id
            `);

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ error: "Không tìm thấy công việc hoặc bạn không có quyền sửa" });
        }

        res.json({ message: "Cập nhật công việc thành công" });

    } catch (error) {
        console.error("Lỗi cập nhật Task:", error);
        res.status(500).json({ error: "Lỗi server nội bộ" });
    }
});

// ==================================================
// DELETE /task/:id - Xóa công việc
// ==================================================
router.delete("/:id", verifyToken, async(req, res) => {
    try {
        const userId = req.user.id;
        const taskId = req.params.id;

        const result = await pool.request()
            .input("id", sql.Int, taskId)
            .input("user_id", sql.Int, userId)
            .query(`
                DELETE FROM Task
                WHERE id = @id AND user_id = @user_id
            `);

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ error: "Không tìm thấy công việc hoặc bạn không có quyền xóa" });
        }

        res.json({ message: "Xóa công việc thành công" });

    } catch (error) {
        console.error("Lỗi xóa Task:", error);
        res.status(500).json({ error: "Lỗi server nội bộ" });
    }
});

// ==================================================
// PATCH /task/:id/status - Cập nhật nhanh trạng thái công việc
// ==================================================
router.patch("/:id/status", verifyToken, async(req, res) => {
    try {
        const userId = req.user.id;
        const taskId = req.params.id;
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({ error: "Thiếu thông tin status" });
        }

        const taskStatus = status.toUpperCase();
        const validStatuses = ['PENDING', 'IN_PROGRESS', 'COMPLETED'];
        
        if (!validStatuses.includes(taskStatus)) {
            return res.status(400).json({ error: "Status chỉ được phép là PENDING, IN_PROGRESS hoặc COMPLETED" });
        }

        const isDone = (taskStatus === 'COMPLETED') ? 1 : 0;

        const result = await pool.request()
            .input("id", sql.Int, taskId)
            .input("user_id", sql.Int, userId)
            .input("status", sql.NVarChar, taskStatus)
            .input("is_done", sql.Bit, isDone)
            .query(`
                UPDATE Task
                SET 
                    status = @status,
                    is_done = @is_done
                WHERE id = @id AND user_id = @user_id
            `);

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ error: "Không tìm thấy công việc hoặc bạn không có quyền sửa" });
        }

        res.json({ 
            message: "Cập nhật trạng thái thành công",
            data: {
                status: taskStatus,
                is_done: isDone === 1
            }
        });

    } catch (error) {
        console.error("Lỗi cập nhật trạng thái Task:", error);
        res.status(500).json({ error: "Lỗi server nội bộ" });
    }
});

export default router;