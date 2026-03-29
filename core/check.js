import sql from "mssql"

import pool from "../db.js"
import { client } from "../mqtt.js"
import { logActivity } from "./utils.js"


import { CONTROL_PUMP, CONTROL_LIGHT } from "./const.js"

// client.on("message", async () => {
    try {
        const result = await pool.request().query(`
            SELECT s.type, sd.value, sd.time
            FROM SensorData sd
            JOIN Sensor s ON sd.sensor_id = s.id
            JOIN (
                SELECT sensor_id, MAX(time) AS max_time
                FROM SensorData
                GROUP BY sensor_id
            ) latest 
            ON sd.sensor_id = latest.sensor_id 
            AND sd.time = latest.max_time
        `)

        const data = {}

        result.recordset.forEach(row => {
            data[row.type] = row.value
        })

        console.log(data)

        // ======== PUMP CHECK ========
        console.log("\x1b[33m=====PUMP CHECK=====\x1b[0m")
        const pumpDeviceResult = await pool.request()
            .input("type", sql.NVarChar, 'pump')
            .query(`
                SELECT id, user_id, type 
                FROM Device 
                WHERE type = @type
            `)

        const pumpOverride = await pool.request()
            .input("device_id", sql.Int, pumpDeviceResult.recordset[0].id)
            .query(`
                SELECT TOP 1 *
                FROM ManualOverride
                WHERE device_id = @device_id
                ORDER BY expire_time DESC
            `)

        const pumpThreshold = await pool.request()
            .input("device_id", sql.Int, pumpDeviceResult.recordset[0].id)
            .query(`
                SELECT sensor_type, min_value, max_value
                FROM ThresholdConfig
                WHERE device_id = @device_id
            `)

        const pumpThresholdData = {}

        pumpThreshold.recordset.forEach(row => {
            pumpThresholdData[row.sensor_type] = {
                min: row.min_value,
                max: row.max_value
            }
        })
        
        console.log("Pump Threshold:", pumpThresholdData)

        // last mode
        const lastModePump = await pool.request()
            .input("device_id", sql.Int, pumpDeviceResult.recordset[0].id)
            .query(`
                SELECT TOP 1 mode 
                FROM ActivityLog 
                WHERE device_id = @device_id 
                ORDER BY time DESC
            `)

        console.log("Last mode in pump:", lastModePump.recordset.length > 0 ? lastModePump.recordset[0].mode : null)

        // logic check
        const lastModeInPump = lastModePump.recordset.length > 0 ? lastModePump.recordset[0].mode : null

        if (pumpOverride.recordset.length > 0 &&
            new Date(pumpOverride.recordset[0].expire_time) > new Date()) {
            console.log("Manual override active -> skip auto")
        }
        else if (lastModeInPump === 'OFF') {
            if (data["soil_moisture"] < pumpThresholdData["soil_moisture"].min) {
                console.log("Pump ON")
                client.publish(CONTROL_PUMP, "ON", { retain: true })
                // Insert ActivityLog
                logActivity(pumpDeviceResult.recordset[0].id, "ON", "auto")

                // Insert Reminder
                await pool.request()
                    .input("user_id", sql.Int, pumpDeviceResult.recordset[0].user_id)
                    .input("desc", sql.NVarChar,
                        `Sensor soil_moisture dưới ngưỡng (${pumpThresholdData["soil_moisture"].min}) -> ${pumpDeviceResult.recordset[0].type} ON`)
                    .query(`
                        INSERT INTO Reminder (user_id, description, time)
                        VALUES (@user_id, @desc, GETDATE())
                    `)
            } else if (data["soil_moisture"] < pumpThresholdData["soil_moisture"].min + 10 && data["temp"] > pumpThresholdData["temp"].max) {
                console.log("Pump ON")
                client.publish(CONTROL_PUMP, "ON", { retain: true })
                // Insert ActivityLog
                logActivity(pumpDeviceResult.recordset[0].id, "ON", "auto")

                // Insert Reminder
                await pool.request()
                    .input("user_id", sql.Int, pumpDeviceResult.recordset[0].user_id)
                    .input("desc", sql.NVarChar,
                        `Sensor soil_moisture dưới ngưỡng (${pumpThresholdData["soil_moisture"].min + 10}) và temp vượt ngưỡng (${pumpThresholdData["temp"].max}) -> ${pumpDeviceResult.recordset[0].type} ON`)
                    .query(`
                        INSERT INTO Reminder (user_id, description, time)
                        VALUES (@user_id, @desc, GETDATE())
                    `)
            } else if (data["soil_moisture"] < pumpThresholdData["soil_moisture"].min + 10 && data["moisture"] > pumpThresholdData["moisture"].max) {
                console.log("Pump ON")
                client.publish(CONTROL_PUMP, "ON", { retain: true })
                // Insert ActivityLog
                logActivity(pumpDeviceResult.recordset[0].id, "ON", "auto")

                // Insert Reminder
                await pool.request()
                    .input("user_id", sql.Int, pumpDeviceResult.recordset[0].user_id)
                    .input("desc", sql.NVarChar,
                        `Sensor soil_moisture dưới ngưỡng (${pumpThresholdData["soil_moisture"].min + 10}) và moisture vượt ngưỡng (${pumpThresholdData["moisture"].max}) -> ${pumpDeviceResult.recordset[0].type} ON`)
                    .query(`
                        INSERT INTO Reminder (user_id, description, time)
                        VALUES (@user_id, @desc, GETDATE())
                    `)
            }
        } // ===== ON -> OFF =====
        else if (lastModeInPump === 'ON') {
            if (data["soil_moisture"] > pumpThresholdData["soil_moisture"].max) {
                console.log("Pump OFF")
                client.publish(CONTROL_PUMP, "OFF", { retain: true })
                // Insert ActivityLog
                logActivity(pumpDeviceResult.recordset[0].id, "OFF", "auto")

                // Insert Reminder
                await pool.request()
                    .input("user_id", sql.Int, pumpDeviceResult.recordset[0].user_id)
                    .input("desc", sql.NVarChar,
                        `Sensor soil_moisture vượt ngưỡng (${pumpThresholdData["soil_moisture"].max}) -> ${pumpDeviceResult.recordset[0].type} OFF`)
                    .query(`
                        INSERT INTO Reminder (user_id, description, time)
                        VALUES (@user_id, @desc, GETDATE())
                    `)
            }
        }

        // ======== LIGHT CHECK ========
        console.log("\x1b[33m=====LIGHT CHECK=====\x1b[0m")
        const lightDeviceResult = await pool.request()
            .input("type", sql.NVarChar, 'light')
            .query(`
                SELECT id, user_id, type 
                FROM Device 
                WHERE type = @type
            `)

        const lightOverride = await pool.request()
            .input("device_id", sql.Int, lightDeviceResult.recordset[0].id)
            .query(`
                SELECT TOP 1 *
                FROM ManualOverride
                WHERE device_id = @device_id
                ORDER BY expire_time DESC
            `)

        const lightThreshold = await pool.request()
            .input("device_id", sql.Int, lightDeviceResult.recordset[0].id)
            .query(`
                SELECT sensor_type, min_value, max_value
                FROM ThresholdConfig
                WHERE device_id = @device_id
            `)

        const lightThresholdData = {}

        lightThreshold.recordset.forEach(row => {
            lightThresholdData[row.sensor_type] = {
                min: row.min_value,
                max: row.max_value
            }
        })
        
        console.log("Light Threshold:", lightThresholdData)

        // last mode
        const lastModeLight = await pool.request()
            .input("device_id", sql.Int, lightDeviceResult.recordset[0].id)
            .query(`
                SELECT TOP 1 mode 
                FROM ActivityLog 
                WHERE device_id = @device_id 
                ORDER BY time DESC
            `)

        // logic check
        const lastModeInLight = lastModeLight.recordset.length > 0 ? lastModeLight.recordset[0].mode : null
        console.log("Last mode in light:", lastModeInLight)

        if (lightOverride.recordset.length > 0 &&
            new Date(lightOverride.recordset[0].expire_time) > new Date()) {
            console.log("Manual override active -> skip auto")
        }
        else if (lastModeInLight === 'OFF') {
            if (data["light"] < lightThresholdData["light"].min) {
                console.log("Light ON")
                client.publish(CONTROL_LIGHT, "ON", { retain: true })

                // Insert ActivityLog
                logActivity(lightDeviceResult.recordset[0].id, "ON", "auto")

                // Insert Reminder
                await pool.request()
                    .input("user_id", sql.Int, lightDeviceResult.recordset[0].user_id)
                    .input("desc", sql.NVarChar,
                        `Sensor light dưới ngưỡng (${lightThresholdData["light"].min}) -> ${lightDeviceResult.recordset[0].type} OFF`)
                    .query(`
                        INSERT INTO Reminder (user_id, description, time)
                        VALUES (@user_id, @desc, GETDATE())
                    `)
            } 
        } // ON -> OFF 
        else if (lastModeInLight === 'ON') {
            if (data["light"] > lightThresholdData["light"].max) {
                console.log("Light OFF")
                client.publish(CONTROL_LIGHT, "OFF", { retain: true })

                // Insert ActivityLog
                logActivity(lightDeviceResult.recordset[0].id, "OFF", "auto")
                
                // Insert Reminder
                await pool.request()
                    .input("user_id", sql.Int, lightDeviceResult.recordset[0].user_id)
                    .input("desc", sql.NVarChar,
                        `Sensor light vượt ngưỡng (${lightThresholdData["light"].max}) -> ${lightDeviceResult.recordset[0].type} OFF`)
                    .query(`
                        INSERT INTO Reminder (user_id, description, time)
                        VALUES (@user_id, @desc, GETDATE())
                    `)
            }
        }

    } catch (error) {
        console.error("Error fetching last sensor data:", error)
    }
// })

    