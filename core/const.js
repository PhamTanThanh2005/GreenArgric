import "dotenv/config";

const FEED_BASE = process.env.MQTT_FEED || "MinhTriDADN/feeds";

// Khai báo tập trung các topic cảm biến
export const SENSOR_TOPICS = {
    RT: `${FEED_BASE}/V1`,   // Nhiệt độ
    SM: `${FEED_BASE}/V2`,   // Độ ẩm đất
    RH: `${FEED_BASE}/V3`,   // Độ ẩm không khí
    LUX: `${FEED_BASE}/V4`,  // Ánh sáng
};

export const CONTROL_PUMP = `${FEED_BASE}/V10`; // Máy bơm
export const CONTROL_LIGHT = `${FEED_BASE}/V11`; // Đèn