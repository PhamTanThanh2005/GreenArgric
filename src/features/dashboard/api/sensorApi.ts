// src/features/dashboard/api/sensorApi.ts

const BASE_URL = 'http://localhost:3000'; // Đổi lại port nếu Backend của bạn chạy port khác

// ==========================================
// 1. ĐỊNH NGHĨA KIỂU DỮ LIỆU (INTERFACES)
// ==========================================

// Kiểu dữ liệu trả về của API GET /sensor (Lấy cái mới nhất)
export interface LatestSensorData {
  type: string;
  value: number;
  time: string;
}

// Kiểu dữ liệu trả về của API GET /sensor/type/:type (Lấy lịch sử theo type)
export interface SensorHistoryData {
  value: number;
  time: string;
}

// Kiểu dữ liệu gửi lên cho API POST /sensor (Test tạo dữ liệu)
export interface CreateSensorPayload {
  sensor_id: number;
  value: number;
}

// ==========================================
// 2. HELPER: LẤY TOKEN (Nếu có dùng Bearer)
// ==========================================
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': token } : {}), // Tự động gắn token nếu có
  };
};

// ==========================================
// 3. CÁC HÀM GỌI API
// ==========================================

/**
 * GET /sensor
 * Lấy dữ liệu mới nhất của từng loại device.
 * Rất phù hợp để truyền vào component StatCard của bạn.
 */
export const getLatestSensors = async (): Promise<LatestSensorData[]> => {
  const response = await fetch(`${BASE_URL}/sensor`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Lỗi khi lấy dữ liệu sensor mới nhất!');
  }

  return response.json();
};

/**
 * GET /sensor/type/:type
 * Lấy tất cả lịch sử data theo type (VD: 'soil_moisture', 'temperature').
 * Rất phù hợp để vẽ biểu đồ (Chart).
 */
export const getSensorHistoryByType = async (type: string): Promise<SensorHistoryData[]> => {
  const response = await fetch(`${BASE_URL}/sensor/type/${type}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Lỗi khi lấy dữ liệu lịch sử cho loại: ${type}`);
  }

  return response.json();
};

/**
 * POST /sensor
 * Test truyền dữ liệu vào một sensor cụ thể.
 */
export const createSensorReading = async (payload: CreateSensorPayload): Promise<CreateSensorPayload> => {
  const response = await fetch(`${BASE_URL}/sensor`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error('Lỗi khi gửi dữ liệu test cho sensor!');
  }

  return response.json();
};