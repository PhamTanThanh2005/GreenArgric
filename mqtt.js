import mqtt from "mqtt";
import pool, { sql } from "./db.js";
import "dotenv/config";
import { runAutomationForArea } from "./core/automation.js";
import { notifyAreaOwners } from "./core/utils.js";

const FEED_BASE = process.env.MQTT_FEED || "MinhTriDADN/feeds";

// ===== MQTT CONFIG =====
export const client = mqtt.connect(process.env.MQTT_BROKER || "wss://mqtt.ohstem.vn:8084/mqtt", {
    username: process.env.MQTT_USERNAME || "MinhTriDADN",
    password: process.env.MQTT_PASSWORD || "",
    clientId: "server_" + Math.random().toString(16).substring(2, 10)
});

const lastSavedValues = {};

const DELTA_THRESHOLDS = {
    'temp': 0.5,           // Nhiệt độ: Chênh 0.5°C
    'soil_moisture': 2.0,  // Độ ẩm đất: Chênh 2%
    'moisture': 2.0,       // Độ ẩm KK: Chênh 2%
    'light': 1.0         // Ánh sáng: Chênh 1%
};

client.on("connect", () => {
    console.log("\x1b[32m%s\x1b[0m", " MQTT Backend connected");
    client.subscribe(`${FEED_BASE}/+`, (err) => {
        if (!err) console.log("Đã Subscribe tất cả thiết bị/cảm biến!");
    });
});

// ===== XỬ LÝ MESSAGE & KÍCH HOẠT AUTOMATION =====
client.on("message", async (topic, message) => {
    const parts = topic.split('/');
    const feed_key = parts[parts.length - 1]; 
    const value = parseFloat(message.toString());

    try {
        const sensorRes = await pool.request()
            .input("feed_key", sql.NVarChar, feed_key)
            .query("SELECT id, area_id, type, name FROM Sensor WHERE feed_key = @feed_key");

        if (sensorRes.recordset.length === 0) return; 

        const { id: sensor_id, area_id, type: sensor_type, name: sensor_name } = sensorRes.recordset[0];

        const lastValue = lastSavedValues[sensor_id];
        const delta = DELTA_THRESHOLDS[sensor_type] || 1.0; 

        if (lastValue === undefined || Math.abs(value - lastValue) >= delta) {

            await pool.request()
                .input("sensor_id", sql.Int, sensor_id)
                .input("value", sql.Float, value)
                .query("INSERT INTO SensorData(sensor_id, value) VALUES (@sensor_id, @value)");

            lastSavedValues[sensor_id] = value;
            console.log(`[DB] Đã lưu: ${sensor_name} (ID: ${sensor_id}) - Giá trị mới: ${value}`);

            const thresholdRes = await pool.request()
                .input("area_id", sql.Int, area_id)
                .input("sensor_type", sql.NVarChar, sensor_type)
                .query("SELECT min_value, max_value FROM ThresholdConfig WHERE area_id = @area_id AND sensor_type = @sensor_type");

            if (thresholdRes.recordset.length > 0) {
                const { min_value, max_value } = thresholdRes.recordset[0];
                const isTooHigh = max_value !== null && value > max_value;
                const isTooLow = min_value !== null && value < min_value;

                if (isTooHigh || isTooLow) {
                    await notifyAreaOwners(
                        area_id, 
                        `Cảnh báo khẩn: ${sensor_name}`, 
                        `${sensor_name} có giá trị ${value} đã vượt ngưỡng an toàn (${min_value} - ${max_value})`, 
                        "warning" 
                    );
                }
            }
            await runAutomationForArea(area_id);
            
        }

    } catch (error) {
        console.error("\x1b[31mError processing MQTT message:\x1b[0m", error);
    }
});