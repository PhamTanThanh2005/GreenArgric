import sql from "mssql";
import pool from "../db.js";

// Ghi log hoạt động của thiết bị
export async function logActivity(device_id, mode, source) {
    await pool.request()
        .input("device_id", sql.Int, device_id)
        .input("mode", sql.NVarChar, mode)
        .input("source", sql.NVarChar, source)
        .query(`
            INSERT INTO ActivityLog (device_id, mode, source)
            VALUES (@device_id, @mode, @source)
        `);
}

// Gửi thông báo cho tất cả người dùng quản lý một khu vực
export async function notifyAreaOwners(area_id, title, message, type = "INFO") {
    const owners = await pool.request()
        .input("area_id", sql.Int, area_id)
        .query("SELECT user_id FROM User_Area WHERE area_id = @area_id");

    for (let owner of owners.recordset) {
        await pool.request()
            .input("user_id", sql.Int, owner.user_id)
            .input("title", sql.NVarChar, title)
            .input("message", sql.NVarChar, message)
            .input("type", sql.NVarChar, type)
            .query(`
                INSERT INTO Notification (user_id, title, message, type)
                VALUES (@user_id, @title, @message, @type)
            `);
    }
}