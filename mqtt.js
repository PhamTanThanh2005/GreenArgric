import mqtt from "mqtt"
import pool, { sql } from "./db.js"
import "dotenv/config"

// ===== MQTT CONFIG =====
export const client = mqtt.connect(process.env.MQTT_BROKER || "wss://mqtt.ohstem.vn:8084/mqtt", {
    username: process.env.MQTT_USERNAME || "MinhTriDADN",
    password: process.env.MQTT_PASSWORD || "",
    clientId: "server_" + Math.random().toString(16).substring(2, 10)
})

const SENSOR_RT = `${process.env.MQTT_FEED || "MinhTriDADN/feeds"}/V1` // cảm biến nhiệt
const SENSOR_RH = `${process.env.MQTT_FEED || "MinhTriDADN/feeds"}/V2` // cảm biến độ ẩm kk
const SENSOR_SM = `${process.env.MQTT_FEED || "MinhTriDADN/feeds"}/V3` // cảm biến độ ẩm đất
const SENSOR_LUX = `${process.env.MQTT_FEED || "MinhTriDADN/feeds"}/V4` // cảm biến ánh sáng

// ===== CONNECT =====
client.on("connect", () => {
    // CONSOLE
    console.log("\x1b[32m%s\x1b[0m", "MQTT Backend connected")

    client.subscribe(SENSOR_RT, (err) => {
        if (err) console.error("\x1b[31mSubscribe error:\x1b[0m", err)
        else console.log("Subscribed to sensor topic:", SENSOR_RT)
    })

    client.subscribe(SENSOR_RH, (err) => {
        if (err) console.error("\x1b[31mSubscribe error:\x1b[0m", err)
        else console.log("Subscribed to sensor topic:", SENSOR_RH)
    })

    client.subscribe(SENSOR_SM, (err) => {
        if (err) console.error("\x1b[31mSubscribe error:\x1b[0m", err)
        else console.log("Subscribed to sensor topic:", SENSOR_SM)
    })

    client.subscribe(SENSOR_LUX, (err) => {
        if (err) console.error("\x1b[31mSubscribe error:\x1b[0m", err)
        else console.log("Subscribed to sensor topic:", SENSOR_LUX)
    })
})

// ===== HANDLE MESSAGE =====
client.on("message", async (topic, message) => {
    let sensor_id

    if (topic === SENSOR_RT) {
        sensor_id = 1   // nhiệt độ
    } else if (topic === SENSOR_RH) {
        sensor_id = 3   // độ ẩm kk
    } else if (topic === SENSOR_SM) {
        sensor_id = 4   // độ ẩm đất
    } else if (topic === SENSOR_LUX) {
        sensor_id = 2   // ánh sáng
    } else {
        console.warn("\x1b[33mReceived message on unknown topic:\x1b[0m", topic)
        return
    }

    // Value
    const value = parseFloat(message.toString())
    // console.log(`Sensor ${sensor_id} value:`, value)
    if (sensor_id === 1) {
        console.log(`\x1b[36mTemperature:\x1b[0m ${value}°C`)
    } else if (sensor_id === 2) {
        console.log(`\x1b[36mLight:\x1b[0m ${value} lux`)
    } else if (sensor_id === 3) {
        console.log(`\x1b[36mHumidity:\x1b[0m ${value}%`)
    } else if (sensor_id === 4) {
        console.log(`\x1b[36mSoil Moisture:\x1b[0m ${value}%`)
    }

    // Insert into DB
    try {
        // Insert SensorData
        await pool.request()
            .input("sensor_id", sql.Int, sensor_id)
            .input("value", sql.Float, value)
            .query(`
                INSERT INTO SensorData(sensor_id, value)
                VALUES (@sensor_id, @value)
            `)
        // Cleanup expired manual overrides
        await pool.request().query(`
            DELETE FROM ManualOverride
            WHERE expire_time < GETDATE()
        `)
    } catch (error) {
        console.error("\x1b[31mError inserting sensor data:\x1b[0m", error)
    }
})