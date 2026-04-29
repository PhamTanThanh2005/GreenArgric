import axiosClient from '../../../services/axiosClient';

// Interface cho dữ liệu Khu vực trả về từ API
export interface AreaData {
  id: number;
  name: string;
  description: string;
}

export const areaApi = {
  // Endpoint: GET /area
  getAll: async (): Promise<AreaData[]> => {
    const response = await axiosClient.get('/area');
    return response.data;
  },
  
};