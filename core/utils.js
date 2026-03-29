import sql from "mssql"

import pool from "../db.js"

export async function logActivity(device_id, mode, source) {
    await pool.request()
        .input("device_id", sql.Int, device_id)
        .input("mode", sql.NVarChar, mode)
        .input("source", sql.NVarChar, source)
        .query(`
            INSERT INTO ActivityLog (device_id, mode, source)
            VALUES (@device_id, @mode, @source)
        `)
}