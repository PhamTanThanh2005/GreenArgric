import express from "express"
import sensorRouter from "./routes/sensor.js"
import thresholdRouter from "./routes/threshold.js"
import authRouter from "./routes/auth.js"
import reminder from "./routes/reminder.js"
import divice from "./routes/device.js"

import "./mqtt.js"
import "./core/check.js"
import cors from 'cors';

const app = express()

app.use(cors({
    origin: 'http://localhost:5173', // Cho phép Frontend của bạn
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));

app.use(express.json())

app.use("/sensor", sensorRouter)
app.use("/threshold", thresholdRouter)
app.use("/auth", authRouter)
app.use("/reminder", reminder)
app.use("/device", divice)

app.listen(3000, () => {
    console.log("Server chạy tại http://localhost:3000")
})