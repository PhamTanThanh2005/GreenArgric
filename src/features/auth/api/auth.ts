// src/features/auth/api/auth.ts

export interface LoginCredentials {
  username: string;
  password: string;
  // Xóa thuộc tính role ở đây vì API backend không yêu cầu
}

export interface UserInfo {
  id: number;
  name: string;
  role: string; // Sẽ là "owner" hoặc "admin"
}

export interface LoginResponse {
  message: string;
  access_token: string; // Backend trả về thẳng access_token
  user: UserInfo;
}

export const loginUser = async (credentials: LoginCredentials): Promise<LoginResponse> => {
  const response = await fetch('http://localhost:3000/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials), // Chỉ gửi username và password
  });

  const data = await response.json();

  if (!response.ok) {
    // Quăng lỗi để bên LoginForm.tsx bắt (catch) được
    throw new Error(data.message || 'Tài khoản hoặc mật khẩu không chính xác!');
  }

  return data as LoginResponse; 
};