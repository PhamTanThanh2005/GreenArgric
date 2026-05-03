// src/features/dashboard/api/areaApi.ts
import axiosClient from '../../../services/axiosClient';

export interface AreaData {
  id: number;
  name: string;
  description: string;
  owner_id?: number;
  owner_name?: string;
  owner_username?: string;
}

export const areaApi = {
  getAll: async (): Promise<AreaData[]> => {
    const response = await axiosClient.get('/area');
    return response.data;
  },
  createArea: async (data: { name: string; description: string; owner_id?: number | null }) => {
    const response = await axiosClient.post('/area', data);
    return response.data;
  },
  
  updateArea: async (id: number, data: { name: string; description: string; owner_id?: number | null }) => {
    const response = await axiosClient.put(`/area/${id}`, data);
    return response.data;
  },
  deleteArea: async (id: number) => {
    const response = await axiosClient.delete(`/area/${id}`);
    return response.data;
  },
};