import axiosClient from '../../../services/axiosClient';

export interface ActivityLog {
  id: number;
  device_id: number;
  device_name: string;
  device_type: string;
  mode: 'ON' | 'OFF';
  source: 'manual' | 'auto';
  time: string;
  area_name: string;
}

export const activityApi = {
  // Lấy toàn bộ lịch sử
  getAll: async (): Promise<ActivityLog[]> => {
    const response = await axiosClient.get('/activity');
    return response.data;
  },
  // Lấy lịch sử theo 1 thiết bị cụ thể
  getByDevice: async (deviceId: number | string): Promise<ActivityLog[]> => {
    const response = await axiosClient.get(`/activity/${deviceId}`);
    return response.data;
  }
};