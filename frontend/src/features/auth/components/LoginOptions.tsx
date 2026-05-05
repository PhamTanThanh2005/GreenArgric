import React from 'react';
import { useLogin } from '../hooks/useLogin';
import { Modal } from '../../../components/Modal/Modal';
import { LoginForm } from './LoginForm';

export const LoginOptions: React.FC = () => {
  const { 
    isModalOpen, selectedRole, handleSelectRole, handleCloseModal 
  } = useLogin();

  return (
    <div className="w-full flex flex-col items-center">
      {/* Tiêu đề dùng chung */}
      <div className="w-full border-t-2 border-green-200 mb-6 relative flex justify-center mt-2">
         <span className="bg-white px-4 absolute -top-3.5 text-gray-700 font-bold text-lg">
           Đăng nhập tài khoản
         </span>
      </div>

      {/* HIỂN THỊ DANH SÁCH VAI TRÒ */}
      <div className="w-full space-y-4 mt-4">
        <button 
          onClick={() => handleSelectRole('owner')}
          className="w-full py-3.5 text-base bg-white text-[#1b5e3a] border-2 border-[#1b5e3a] rounded hover:bg-[#f0fdf4] font-semibold transition-colors"
        >
          Chủ vườn / Quản lý nhà kính
        </button>
        <button 
          onClick={() => handleSelectRole('admin')}
          className="w-full py-3.5 text-base bg-white text-[#1b5e3a] border-2 border-[#1b5e3a] rounded hover:bg-[#f0fdf4] font-semibold transition-colors"
        >
          Quản trị viên
        </button>
      </div>

      {/* GỌI MODAL */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal}
        className="w-180" 
      >
        {/* Truyền component LoginForm */}
        <LoginForm role={selectedRole} />
      </Modal>

    </div>
  );
};