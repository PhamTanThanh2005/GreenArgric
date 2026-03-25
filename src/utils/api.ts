// src/utils/api.ts

export const fetchWithAuth = async (endpoint: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('token'); // Đã có sẵn chữ "Bearer " ở bước đăng nhập
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
    ...(token ? { Authorization: token } : {}), 
  };

  const response = await fetch(`http://localhost:8080${endpoint}`, {
    ...options,
    headers,
  });

  // Nếu token hết hạn hoặc sai (401)
  if (response.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    window.location.href = '/'; // Đuổi về trang chủ
  }

  return response;
};

// CÁCH DÙNG TẠI DASHBOARD: 
// const res = await fetchWithAuth('/api/sensors/data'); 
// const data = await res.json();