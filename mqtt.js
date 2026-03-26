import mqtt from "mqtt"
import pool, { sql } from "./db.js"

// ===== MQTT CONFIG =====
const client = mqtt.connect("wss://mqtt.ohstem.vn:8084/mqtt", {
    username: "MinhTriDADN",
    password: "",
    clientId: "server_" + Math.random().toString(16).substring(2, 10)
})

const TOPIC_SENSOR = "MinhTriDADN/feeds/V1" // cảm biến nhiệt
const TOPIC_SENSORc = "MinhTriDADN/feeds/V2" // cảm biến độ ẩm kk
const TOPIC_CONTROL = "MinhTriDADN/feeds/V11" // máy bơm

// ===== CONNECT =====
client.on("connect", () => {
    console.log("MQTT Backend connected")

    client.subscribe(TOPIC_SENSOR, (err) => {
        if (err) console.error("Subscribe error:", err)
        else console.log("Subscribed to sensor topic")
    })

    client.subscribe(TOPIC_SENSORc, (err) => {
        if (err) console.error("Subscribe error:", err)
        else console.log("Subscribed to sensor topic")
    })
}) 

// ===== HANDLE MESSAGE =====
client.on("message", async (topic, message) => {
    let sensor_id

    if (topic === TOPIC_SENSOR) {
        sensor_id = 1   // nhiệt độ
    } else if (topic === TOPIC_SENSORc) {
        sensor_id = 2   // độ ẩm
    } else {
        return
    }

    const value = parseFloat(message.toString())

    console.log(`Sensor ${sensor_id} value:`, value)

    try {
        // =======================
        // 1. Lưu SensorData
        // =======================
        await pool.request()
            .input("sensor_id", sql.Int, sensor_id)
            .input("value", sql.Float, value)
            .query(`
                INSERT INTO SensorData(sensor_id, value)
                VALUES (@sensor_id, @value)
            `)

        // =======================
        // 2. Lấy loại sensor
        // =======================
        const sensorResult = await pool.request()
            .input("sensor_id", sql.Int, sensor_id)
            .query(`
                SELECT type FROM Sensor WHERE id = @sensor_id
            `)

        if (sensorResult.recordset.length === 0) return

        const sensorType = sensorResult.recordset[0].type

        // =======================
        // 3. Lấy device liên quan
        // =======================
        const deviceResult = await pool.request()
            .input("sensor_id", sql.Int, sensor_id)
            .query(`
                SELECT d.id, d.type, d.user_id
                FROM Device d
                JOIN SensorDevice sd ON d.id = sd.device_id
                WHERE sd.sensor_id = @sensor_id
            `)

        // =======================
        // 4. Duyệt từng device
        // =======================
        for (const device of deviceResult.recordset) {

            // lấy threshold
            const thresholdResult = await pool.request()
                .input("device_id", sql.Int, device.id)
                .input("sensor_type", sql.NVarChar, sensorType)
                .query(`
                    SELECT min_value, max_value
                    FROM ThresholdConfig
                    WHERE device_id = @device_id
                    AND sensor_type = @sensor_type
                `)

            if (thresholdResult.recordset.length === 0) continue

            const { min_value, max_value } = thresholdResult.recordset[0]

            // =======================
            // 5. Check vượt ngưỡng
            // =======================
            if (value < min_value || value > max_value) {

                const mode = "ON"
                const payload = mode === "ON" ? "1" : "0"

                console.log(`⚠️ Vượt ngưỡng → ${device.type} ${mode}`)

                // =======================
                // 6. Gửi lệnh MQTT tới device
                // =======================
                client.publish(TOPIC_CONTROL, payload, { retain: true })

                // =======================
                // 7. ActivityLog
                // =======================
                await pool.request()
                    .input("device_id", sql.Int, device.id)
                    .input("mode", sql.NVarChar, mode)
                    .input("source", sql.NVarChar, "auto")
                    .query(`
                        INSERT INTO ActivityLog(device_id, mode, source)
                        VALUES (@device_id, @mode, @source)
                    `)

                // =======================
                // 8. Reminder
                // =======================
                await pool.request()
                    .input("user_id", sql.Int, device.user_id)
                    .input("desc", sql.NVarChar,
                        `Sensor ${sensorType} vượt ngưỡng (${value}) → ${device.type} ${mode}`)
                    .query(`
                        INSERT INTO Reminder(user_id, description, time)
                        VALUES (@user_id, @desc, GETDATE())
                    `)
            } else {
                // Nếu trong ngưỡng, tắt thiết bị
                const mode = "OFF"
                const payload = "0"

                client.publish(TOPIC_CONTROL, payload, { retain: true })
            }
        }

    } catch (err) {
        console.error("❌ MQTT processing error:", err)
    }
})

export default client