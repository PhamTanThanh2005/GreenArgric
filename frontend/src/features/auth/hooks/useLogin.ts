import { useState } from 'react';

export const useLogin = () => {

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>('');

  const handleSelectRole = (role: string) => {
    setSelectedRole(role); 
    setIsModalOpen(true);   
  };

  const handleCloseModal = () => {
    setIsModalOpen(false); 
  };
  return {
    isModalOpen,
    selectedRole,
    handleSelectRole,
    handleCloseModal
  };
};