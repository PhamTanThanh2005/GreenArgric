// src/features/auth/components/LoginForm.tsx

import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../api/auth'; 

interface LoginFormProps {
  role: string;
}

export const LoginForm: React.FC<LoginFormProps> = ({ role }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const data = await loginUser({ username, password });

      console.log("Dữ liệu Backend trả về:", data);
      
      localStorage.setItem('token', data.token);
      localStorage.setItem('role', data.user.role); 
      localStorage.setItem('user_name', data.user.username);

      const userRole = data.user.role; 
      if (userRole === 'owner') {
        navigate('/dashboard'); 
      } else if (userRole === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/dashboard'); 
      }

    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Đã xảy ra lỗi không xác định từ máy chủ.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full h-110 flex">
      {/* CỘT TRÁI: Form nhập thông tin */}
      <div className="w-2/3 px-12 flex flex-col justify-center">
        <p className="text-sm text-black font-medium font-playwrite mb-1">
          Xin chào {role === 'Quản trị viên' ? 'admin' : 'Chủ vườn'},
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