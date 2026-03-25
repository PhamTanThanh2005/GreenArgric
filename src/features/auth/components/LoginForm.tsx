// src/features/auth/components/LoginForm.tsx

import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface LoginFormProps {
  role: string; 
}

export const LoginForm: React.FC<LoginFormProps> = ({ role }) => {
  const [username, setUsername] = useState('');
  const[password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const[error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // 1. Gọi API Backend ở cổng 8080
      const response = await fetch('http://localhost:8080/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password, role }), // Gửi kèm role để Backend xác thực
      });

      const data = await response.json();

      // 2. Xử lý nếu đăng nhập thất bại
      if (!response.ok) {
        throw new Error(data.message || 'Tài khoản hoặc mật khẩu không chính xác!');
      }

      // 3. Lưu JWT Token theo chuẩn Bearer vào localStorage
      localStorage.setItem('token', `Bearer ${data.token}`);
      localStorage.setItem('role', data.role);
      
      // 4. Chuyển hướng theo từng Role
      if (data.role === 'Chủ vườn') {
        navigate('/dashboard'); 
      } else if (data.role === 'Quản trị viên') {
        // Tương lai bạn tạo thêm AdminLayout thì trỏ về đây
        navigate('/admin-dashboard'); 
      }

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full h-110 flex">
      {/* CỘT TRÁI: Form nhập thông tin */}
      <div className="w-2/3 px-12 flex flex-col justify-center">
        <p className="text-sm text-black font-medium font-playwrite mb-1">
          Xin chào {role === 'Quản trị viên' ? 'Admin' : 'Chủ vườn'},
        </p>
        <h2 className="text-2xl font-bold text-brand-green mb-8">Đăng nhập tài khoản</h2>
        
        <form onSubmit={handleLogin} className="space-y-4 flex flex-col items-center">
          <input 
            type="text" 
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-3 rounded-md border border-gray-300 focus:border-brand-green focus:ring-1 focus:ring-brand-green outline-none transition-all"
            placeholder="Tên đăng nhập"
            required
          />

          <div className="relative w-full">
            <input 
              type={showPassword ? "text" : "password"} 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-md border border-gray-300 focus:border-brand-green focus:ring-1 focus:ring-brand-green outline-none transition-all"
              placeholder="Mật khẩu"
              required
            />
            <button 
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
            </button>
          </div>

          {error && <p className="text-brand-red text-sm font-medium w-full text-left">{error}</p>}

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full py-3 bg-brand-green text-white border-2 rounded-md hover:bg-white hover:text-brand-green hover:border-2 hover:border-brand-green font-bold transition-colors flex justify-center items-center mt-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Đang xử lý...' : 'Đăng nhập'}
          </button>

          <a href="#" className="text-brand-red text-sm font-medium hover:underline self-start">Quên mật khẩu</a>
        </form>
      </div>

      {/* CỘT PHẢI: Nền xanh và logo */}
      <div className="w-1/3 bg-brand-green p-8 flex items-center justify-center rounded-br-2xl overflow-visible">
        <img src="/images/logo-green.png" alt="" className='w-45 h-45' />
      </div>
    </div>
  );
};