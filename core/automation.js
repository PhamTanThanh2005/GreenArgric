import sql from "mssql";
import pool from "../db.js";
import { client } from "../mqtt.js";
import { logActivity, notifyAreaOwners } from "./utils.js";

export async function runAutomationForArea(area_id) {
    console.log(`\x1b[36m[AUTO]\x1b[0m Đang kiểm tra tự động cho Khu vực ID: ${area_id}`);

    try {
        const sensorDataRes = await pool.request()
            .input("area_id", sql.Int, area_id)
            .query(`
                SELECT s.type, sd.value
                FROM Sensor s
                JOIN (
                    SELECT sensor_id, value, ROW_NUMBER() OVER(PARTITION BY sensor_id ORDER BY time DESC) as rn
                    FROM SensorData
                ) sd ON s.id = sd.sensor_id AND sd.rn = 1
                WHERE s.area_id = @area_id
            `);

        const data = {};
        sensorDataRes.recordset.forEach(row => { data[row.type] = row.value; });

        const thresholdRes = await pool.request()
            .input("area_id", sql.Int, area_id)
            .query(`SELECT sensor_type, min_value, max_value FROM ThresholdConfig WHERE area_id = @area_id`);
        
        const thresholds = {};
        thresholdRes.recordset.forEach(row => {
            thresholds[row.sensor_type] = { min: row.min_value, max: row.max_value };
        });

        const devicesRes = await pool.request()
            .input("area_id", sql.Int, area_id)
            .query(`SELECT id, type FROM Device WHERE area_id = @area_id AND status = 1`);

        for (const device of devicesRes.recordset) {
            // Check manual override (Ưu tiên quyền thủ công)
            const override = await pool.request()
                .input("device_id", sql.Int, device.id)
                .query(`SELECT TOP 1 device_id FROM ManualOverride WHERE device_id = @device_id AND expire_time > GETDATE()`);
            
            if (override.recordset.length > 0) {
                console.log(`[AUTO] Thiết bị ${device.type} (ID: ${device.id}) đang bị ghi đè thủ công -> Bỏ qua tự động.`);
                continue;
            }

            const lastModeRes = await pool.request()
                .input("device_id", sql.Int, device.id)
                .query(`SELECT TOP 1 mode FROM ActivityLog WHERE device_id = @device_id ORDER BY time DESC`);
            const lastMode = lastModeRes.recordset.length > 0 ? lastModeRes.recordset[0].mode : 'OFF';

            // --- MÁY BƠM ---
            if (device.type === 'pump' && thresholds['soil_moisture']) {
                const sm = data['soil_moisture'];
                const temp = data['temp'] || 0;
                const th = thresholds;

                if (lastMode === 'OFF') {
                    if (sm < th['soil_moisture'].min) {
                        await triggerDevice(device, 'ON', CONTROL_PUMP, `Độ ẩm đất thấp (${sm} < ${th['soil_moisture'].min})`, area_id);
                    } else if (th['temp'] && sm < th['soil_moisture'].min + 10 && temp > th['temp'].max) {
                        await triggerDevice(device, 'ON', CONTROL_PUMP, `Đất khá khô và Nhiệt độ cao (${temp} > ${th['temp'].max})`, area_id);
                    }
                } else if (lastMode === 'ON' && sm > th['soil_moisture'].max) {
                    await triggerDevice(device, 'OFF', CONTROL_PUMP, `Độ ẩm đất đã đạt ngưỡng an toàn (${sm} > ${th['soil_moisture'].max})`, area_id);
                }
            }

            // --- ĐÈN ---
            if (device.type === 'light' && thresholds['light']) {
                const lightVal = data['light'];
                const th = thresholds['light'];

                if (lastMode === 'OFF' && lightVal < th.min) {
                    await triggerDevice(device, 'ON', CONTROL_LIGHT, `Ánh sáng quá yếu (${lightVal} < ${th.min})`, area_id);
                } else if (lastMode === 'ON' && lightVal > th.max) {
                    await triggerDevice(device, 'OFF', CONTROL_LIGHT, `Ánh sáng đã đủ (${lightVal} > ${th.max})`, area_id);
                }
            }
        }
    } catch (error) {
        console.error(`\x1b[31m[ERROR] Lỗi khi chạy Automation cho Area ${area_id}:\x1b[0m`, error);
    }
}

async function triggerDevice(device, mode, mqttTopic, reason, area_id) {
    const payload = mode === 'ON' ? "1" : "0";
    client.publish(mqttTopic, payload, { retain: true });
    
    await logActivity(device.id, mode, "auto");
    await notifyAreaOwners(area_id, `Hệ thống tự động: ${mode} ${device.type.toUpperCase()}`, `${device.type.toUpperCase()} ${mode} vì ${reason}`, "INFO");
    console.log(`[AUTO] Đã ${mode} ${device.type.toUpperCase()} (ID: ${device.id}) - Lý do: ${reason}`);
}