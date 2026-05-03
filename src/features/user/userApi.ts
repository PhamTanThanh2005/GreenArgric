// src/features/user/api/userApi.ts

import axiosClient from '../../services/axiosClient';

export interface UserProfile {
  id: number;
  username: string;
  name: string;
  email: string;
  phone: string;
  role: string;
}

export const userApi = {
  getProfile: async (): Promise<UserProfile> => {
    try {
      const response = await axiosClient.get('/user/profile');
      return response.data;
    } catch (error) {
      console.error('Lỗi khi lấy thông tin Profile:', error);
      throw error;
    }
  },

  updateProfile: async (data: { name: string; email: string; phone: string }) => {
    try {
      const response = await axiosClient.put('/user/profile', data);
      return response.data;
    } catch (error) {
      console.error('Cập nhật thông tin Profile:', error);
      throw error;
    }
  }
};