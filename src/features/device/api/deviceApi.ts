// src/features/device/api/deviceApi.ts
import axiosClient from '../../../services/axiosClient';

export const fetchDevices = async () => {
  try {
    const response = await axiosClient.get('/device');
    return response.data;
  } catch (error) {
    console.error('Lỗi lấy danh sách thiết bị:', error);
    return [];
  }
};

export const overrideDevice = async (deviceId: number, mode: 'ON' | 'OFF', expireTime: string) => {
  try {
    const response = await axiosClient.post('/device/override', {
      device_id: deviceId,
      mode: mode,
      expire_time: expireTime
    });
    return response.data;
  } catch (error) {
    console.error('Lỗi điều khiển thiết bị:', error);
    throw error;
  }
};