import express from "express";
import cors from "cors";
import { setupSwagger } from './utils/swagger.js';

import sensorRouter from "./routes/sensor.js";
import thresholdRouter from "./routes/threshold.js";
import authRouter from "./routes/auth.js";
import notificationRouter from "./routes/notification.js"; 
import deviceRouter from "./routes/device.js";
import areaRouter from "./routes/area.js"; 
import userRouter from "./routes/user.js";
import activityLogRouter from './routes/activity.js';
import taskRouter from './routes/task.js';

import "./mqtt.js";

const app = express();

app.use(cors({
    origin: 'http://localhost:5174', // Cho phép Frontend
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true
}));

app.use(express.json());

setupSwagger(app);

// Khai báo các endpoint
app.use("/sensor", sensorRouter);
app.use("/threshold", thresholdRouter);
app.use("/auth", authRouter);
app.use("/notification", notificationRouter);
app.use("/device", deviceRouter);
app.use("/area", areaRouter);
app.use("/user", userRouter);
app.use("/activity", activityLogRouter);
app.use("/task", taskRouter);

app.listen(3000, () => {
    console.log("Server chạy tại http://localhost:3000");
});