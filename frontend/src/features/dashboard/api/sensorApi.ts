// src/features/dashboard/api/sensorApi.ts
import axiosClient from '../../../services/axiosClient';

export interface LatestSensorData {
  sensor_id: number;
  sensor_name: string;
  type: string; 
  value: number;
  time: string;
}

export interface SensorHistoryData {
  value: number;
  time: string;
}

export interface SensorData {
  id: number;
  sensor_name: string;
  type: string;
  area_id: number;
  area_name: string;
}

export const sensorApi = {
  getAllSensors: async (): Promise<SensorData[]> => {
    const response = await axiosClient.get('/sensor/');
    return response.data;
  },

  getLatestByArea: async (areaId: number | string): Promise<LatestSensorData[]> => {
    const response = await axiosClient.get(`/sensor/area/${areaId}/latest`);
    return response.data;
  },

  getHistoryByAreaAndType: async (areaId: number | string, type: string): Promise<SensorHistoryData[]> => {
    const response = await axiosClient.get(`/sensor/area/${areaId}/history/${type}`);
    return response.data;
  }
};