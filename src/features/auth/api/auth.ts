// src/features/auth/api/auth.ts

export interface LoginCredentials {
  username: string;
  password: string;
  role?: string; 
}

export interface LoginResponse {
  message: string;
  role: string;
  access_token: string;
}

export const loginUser = async (credentials: LoginCredentials): Promise<LoginResponse> => {
  const response = await fetch('http://localhost:3001/users/login', {
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

  return data;
};