import mqtt from "mqtt";
import pool, { sql } from "./db.js";
import "dotenv/config";
import { SENSOR_TOPICS } from "./core/const.js";
import { runAutomationForArea } from "./core/automation.js";
import { notifyAreaOwners } from "./core/utils.js";

// ===== MQTT CONFIG =====
export const client = mqtt.connect(process.env.MQTT_BROKER || "wss://mqtt.ohstem.vn:8084/mqtt", {
    username: process.env.MQTT_USERNAME || "MinhTriDADN",
    password: process.env.MQTT_PASSWORD || "",
    clientId: "server_" + Math.random().toString(16).substring(2, 10)
});

const TOPIC_TO_SENSOR_ID = {
    [SENSOR_TOPICS.RT]: 1, // Nhiệt độ
    [SENSOR_TOPICS.SM]: 2, // Độ ẩm đất
    [SENSOR_TOPICS.RH]: 3, // Độ ẩm KK
    [SENSOR_TOPICS.LUX]: 4 // Ánh sáng
};

client.on("connect", () => {
    console.log("\x1b[32m%s\x1b[0m", " MQTT Backend connected");
    client.subscribe(Object.values(SENSOR_TOPICS), (err) => {
        if (err) console.error("\x1b[31mSubscribe error:\x1b[0m", err);
        else console.log("Đã subscribe các topic cảm biến");
    });
});

// ===== XỬ LÝ MESSAGE & KÍCH HOẠT AUTOMATION =====
client.on("message", async (topic, message) => {
    const sensor_id = TOPIC_TO_SENSOR_ID[topic];
    if (!sensor_id) return;

    const value = parseFloat(message.toString());

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

        const thresholdRes = await pool.request()
            .input("area_id", sql.Int, area_id)
            .input("sensor_type", sql.NVarChar, sensor_type)
            .query("SELECT min_value, max_value FROM ThresholdConfig WHERE area_id = @area_id AND sensor_type = @sensor_type");

        if (thresholdRes.recordset.length > 0) {
            const { min_value, max_value } = thresholdRes.recordset[0];
            if (value > max_value || value < min_value) {
                await notifyAreaOwners(
                    area_id, 
                    `Cảnh báo khẩn: ${sensor_name}`, 
                    `Giá trị ${value} đã vượt ngưỡng an toàn (${min_value} - ${max_value})`, 
                    "WARNING"
                );
            }
        }

        await runAutomationForArea(area_id);

    } catch (error) {
        console.error("\x1b[31mError processing MQTT message:\x1b[0m", error);
    }
});