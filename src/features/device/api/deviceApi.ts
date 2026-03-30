// src/features/device/api/deviceApi.ts

const API_URL = 'http://localhost:3000';

const getHeaders = () => {
  return {
    'Content-Type': 'application/json',
    'role': 'owner',
    'user_id': '1'
  };
};

export const fetchDevices = async () => {
  try {
    const response = await fetch(`${API_URL}/device`, {
      method: 'GET',
      headers: getHeaders()
    });
    
    if (!response.ok) throw new Error('Lỗi lấy danh sách thiết bị');
    
    return await response.json();
  } catch (error) {
    console.error(error);
    return[];
  }
};

export const overrideDevice = async (deviceId: number, mode: 'ON' | 'OFF', expireTime: string) => {
  try {
    const response = await fetch(`${API_URL}/override`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        device_id: deviceId,
        mode: mode,
        expire_time: expireTime
      })
    });

    if (!response.ok) throw new Error('Lỗi điều khiển thiết bị');
    
    return await response.json();
  } catch (error) {
    console.error(error);
    throw error;
  }
};