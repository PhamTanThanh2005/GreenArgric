// src/features/auth/api/auth.ts

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface UserInfo {
  id: number;
  username: string;
  role: string;
}

export interface LoginResponse {
  message: string;
  token: string;
  user: UserInfo;
}

export const loginUser = async (credentials: LoginCredentials): Promise<LoginResponse> => {
  const response = await fetch('http://localhost:3000/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Tài khoản hoặc mật khẩu không chính xác!');
  }

  return data as LoginResponse; 
};