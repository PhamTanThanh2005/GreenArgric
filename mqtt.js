import mqtt from "mqtt";
import pool, { sql } from "./db.js";
import "dotenv/config";
import { CONTROL_PUMP, CONTROL_LIGHT } from "./core/const.js";

// ===== MQTT CONFIG =====
export const client = mqtt.connect(process.env.MQTT_BROKER || "wss://mqtt.ohstem.vn:8084/mqtt", {
    username: process.env.MQTT_USERNAME || "MinhTriDADN",
    password: process.env.MQTT_PASSWORD || "",
    clientId: "server_" + Math.random().toString(16).substring(2, 10)
});

const SENSOR_RT = `${process.env.MQTT_FEED || "MinhTriDADN/feeds"}/V1`; // Nhiệt độ
const SENSOR_RH = `${process.env.MQTT_FEED || "MinhTriDADN/feeds"}/V2`; // Độ ẩm kk
const SENSOR_SM = `${process.env.MQTT_FEED || "MinhTriDADN/feeds"}/V3`; // Độ ẩm đất
const SENSOR_LUX = `${process.env.MQTT_FEED || "MinhTriDADN/feeds"}/V4`; // Ánh sáng

client.on("connect", () => {
    console.log("\x1b[32m%s\x1b[0m", " MQTT Backend connected");
    client.subscribe([SENSOR_RT, SENSOR_RH, SENSOR_SM, SENSOR_LUX], (err) => {
        if (err) console.error("\x1b[31mSubscribe error:\x1b[0m", err);
        else console.log("Đã subscribe các topic cảm biến");
    });
});

// ===== XỬ LÝ MESSAGE & LOGIC TỰ ĐỘNG =====
client.on("message", async (topic, message) => {
    let sensor_id;
    const value = parseFloat(message.toString());

    if (topic === SENSOR_RT) sensor_id = 1;
    else if (topic === SENSOR_RH) sensor_id = 3; 
    else if (topic === SENSOR_SM) sensor_id = 2;
    else if (topic === SENSOR_LUX) sensor_id = 4;
    else return;

    try {
        await pool.request()
            .input("sensor_id", sql.Int, sensor_id)
            .input("value", sql.Float, value)
            .query("INSERT INTO SensorData(sensor_id, value) VALUES (@sensor_id, @value)");

        const sensorInfo = await pool.request()
            .input("sensor_id", sql.Int, sensor_id)
            .query("SELECT area_id, type, name FROM Sensor WHERE id = @sensor_id");
            
        if (sensorInfo.recordset.length === 0) return;
        const { area_id, type: sensor_type, name: sensor_name } = sensorInfo.recordset[0];

        const threshold = await pool.request()
            .input("area_id", sql.Int, area_id)
            .input("sensor_type", sql.NVarChar, sensor_type)
            .query("SELECT min_value, max_value FROM ThresholdConfig WHERE area_id = @area_id AND sensor_type = @sensor_type");

        if (threshold.recordset.length > 0) {
            const { min_value, max_value } = threshold.recordset[0];

            if (value > max_value || value < min_value) {
                const owners = await pool.request()
                    .input("area_id", sql.Int, area_id)
                    .query("SELECT user_id FROM User_Area WHERE area_id = @area_id");

                for (let owner of owners.recordset) {
                    await pool.request()
                        .input("user_id", sql.Int, owner.user_id)
                        .input("title", sql.NVarChar, `Cảnh báo ${sensor_name}`)
                        .input("message", sql.NVarChar, `Giá trị ${value} đã vượt ngưỡng an toàn (${min_value} - ${max_value})`)
                        .input("type", sql.NVarChar, "WARNING")
                        .query(`
                            INSERT INTO Notification (user_id, title, message, type)
                            VALUES (@user_id, @title, @message, @type)
                        `);
                }
            }

            await pool.request().query("DELETE FROM ManualOverride WHERE expire_time < GETDATE()");


            if (sensor_type === 'soil_moisture' && value < min_value) {
                await autoControlDevice(area_id, 'pump', 'ON', CONTROL_PUMP, '1');
            }
            else if (sensor_type === 'soil_moisture' && value >= max_value) {
                await autoControlDevice(area_id, 'pump', 'OFF', CONTROL_PUMP, '0');
            }

        }

    } catch (error) {
        console.error("\x1b[31mError processing MQTT message:\x1b[0m", error);
    }
});

async function autoControlDevice(area_id, device_type, mode, mqtt_topic, mqtt_payload) {
    const deviceResult = await pool.request()
        .input("area_id", sql.Int, area_id)
        .input("type", sql.NVarChar, device_type)
        .query("SELECT id FROM Device WHERE area_id = @area_id AND type = @type AND status = 1");

    if (deviceResult.recordset.length === 0) return;
    const device_id = deviceResult.recordset[0].id;

    const overrideCheck = await pool.request()
        .input("device_id", sql.Int, device_id)
        .query("SELECT * FROM ManualOverride WHERE device_id = @device_id");

    if (overrideCheck.recordset.length > 0) return;

    const lastState = await pool.request()
        .input("device_id", sql.Int, device_id)
        .query("SELECT TOP 1 mode FROM ActivityLog WHERE device_id = @device_id ORDER BY time DESC");

    if (lastState.recordset.length > 0 && lastState.recordset[0].mode === mode) return;

    client.publish(mqtt_topic, mqtt_payload, { retain: true });

    await pool.request()
        .input("device_id", sql.Int, device_id)
        .input("mode", sql.NVarChar, mode)
        .input("source", sql.NVarChar, "auto")
        .query("INSERT INTO ActivityLog (device_id, mode, source) VALUES (@device_id, @mode, @source)");
    
    console.log(`[AUTO] Đã ${mode} ${device_type} ở Khu vực ${area_id}`);
}