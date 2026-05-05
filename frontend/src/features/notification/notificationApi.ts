import axiosClient from '../../services/axiosClient';

export interface AppNotification {
  id: number;
  title: string;
  message: string;
  type: string; // VD: 'WARNING', 'ERROR', 'INFO'
  is_read: boolean | number;
  created_at: string;
}

export const notificationApi = {
  getAll: async (): Promise<AppNotification[]> => {
    const response = await axiosClient.get('/notification');
    return response.data;
  },
  
  markAsRead: async (id: number): Promise<void> => {
    await axiosClient.post(`/notification/${id}/read`);
  }
};