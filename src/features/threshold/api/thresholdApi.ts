import axiosClient from '../../../services/axiosClient';

export interface ThresholdData {
  sensor_type: string;
  min_value: number | null;
  max_value: number | null;
}

export const thresholdApi = {
  getAreaThresholds: async (areaId: number): Promise<ThresholdData[]> => {
    const response = await axiosClient.get(`/threshold/${areaId}`);
    return response.data;
  },
  
  saveThreshold: async (data: { area_id: number; sensor_type: string; min_value: number | null; max_value: number | null }) => {
    const response = await axiosClient.post('/threshold', data);
    return response.data;
  }
};