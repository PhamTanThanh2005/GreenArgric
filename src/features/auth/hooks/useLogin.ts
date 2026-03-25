import { useState } from 'react';
// import { useNavigate } from 'react-router-dom'; // Tạm thời comment

export const useLogin = () => {
  // const navigate = useNavigate();
  
  // State quản lý Modal và Vai trò
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>('');
  
  // Logic xử lý ở đây
  const handleSelectRole = (role: string) => {
    setSelectedRole(role); // Lưu vai trò đã chọn
    setIsModalOpen(true);   // Mở Modal
  };

  const handleCloseModal = () => {
    setIsModalOpen(false); // Đóng Modal
  };

  // Trả về (export) những gì UI cần dùng
  return {
    isModalOpen,
    selectedRole,
    handleSelectRole,
    handleCloseModal
  };
};