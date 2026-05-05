import axiosClient from '../../services/axiosClient';

export interface AppTask {
  id: number;
  title: string;
  description: string;
  scheduled_at: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  is_done: boolean;
  area_id: number;
}

export const taskApi = {
  getAll: async (): Promise<AppTask[]> => {
    const response = await axiosClient.get('/task');
    return response.data;
  },
  create: async (data: Partial<AppTask>) => {
    const response = await axiosClient.post('/task', data);
    return response.data;
  },
  update: async (id: number, data: Partial<AppTask>) => {
    const response = await axiosClient.put(`/task/${id}`, data);
    return response.data;
  },
  delete: async (id: number) => {
    const response = await axiosClient.delete(`/task/${id}`);
    return response.data;
  },
  updateStatus: async (id: number, status: string) => {
    const response = await axiosClient.patch(`/task/${id}/status`, { status });
    return response.data;
  }
};