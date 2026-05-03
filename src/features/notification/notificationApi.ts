import axiosClient from '../../services/axiosClient';

export interface AppNotification {
  id: number;
  title: string;
  message: string;
  type: string; // VD: 'WARNING', 'SUCCESS', 'INFO'
  is_read: boolean | number;
  created_at: string;
}

export const notificationApi = {
  // Lấy tất cả thông báo
  getAll: async (): Promise<AppNotification[]> => {
    const response = await axiosClient.get('/notification');
    return response.data;
  },
  
  // Đánh dấu đã đọc
  markAsRead: async (id: number): Promise<void> => {
    await axiosClient.post(`/notification/${id}/read`);
  }
};