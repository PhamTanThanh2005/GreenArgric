import React from 'react';
import { useLogin } from '../hooks/useLogin'; // Import hook login mới
import { Modal } from '../../../components/Modal/Modal'; // Import Modal dùng chung
import { LoginForm } from './LoginForm'; // Import Form đăng nhập cụ thể

export const LoginOptions: React.FC = () => {
  // Lấy data và hàm từ hook mới ra dùng
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

      {/* HIỂN THỊ DANH SÁCH VAI TRÒ (LUÔN CỐ ĐỊNH Ở ĐÂY) */}
      <div className="w-full space-y-4 mt-4">
        <button 
          onClick={() => handleSelectRole('Chủ vườn')}
          className="w-full py-3.5 text-base bg-white text-[#1b5e3a] border-2 border-[#1b5e3a] rounded hover:bg-[#f0fdf4] font-semibold transition-colors"
        >
          Chủ vườn / Quản lý nhà kính
          {/* Hiển thị tiêu đề là selectedRole trong hình ảnh */}
        </button>
        <button 
          onClick={() => handleSelectRole('Quản trị viên')}
          className="w-full py-3.5 text-base bg-white text-[#1b5e3a] border-2 border-[#1b5e3a] rounded hover:bg-[#f0fdf4] font-semibold transition-colors"
        >
          Quản trị viên
          {/* Hiển thị tiêu đề là selectedRole trong hình ảnh */}
        </button>
      </div>

      {/* GỌI MODAL Ở ĐÂY (SẼ HIỂN THỊ ĐÈ LÊN TRANG CHÍNH KHI ĐƯỢC MỞ) */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal}
        className="w-180" // Tùy chỉnh độ rộng cụ thể cho modal đăng nhập
      >
        {/* Truyền component LoginForm cụ thể vào làm nội dung */}
        <LoginForm role={selectedRole} />
      </Modal>

    </div>
  );
};