import React, { Fragment } from 'react';
import { X } from 'lucide-react'; // Cài thư viện lucide-react nếu chưa có
import { cn } from '../../utils';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
    className?: string; // Tùy chỉnh thêm style cho hộp nội dung
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, className }) => {
    if (!isOpen) return null; 

    return (
        <Fragment>
            <div
                className="fixed inset-0 bg-black/50 z-100 transition-opacity duration-300"
                onClick={onClose}
            />
            <div className="fixed inset-0 z-110 flex items-center justify-center p-4">
                <div
                    className={cn(
                        "bg-white rounded-2xl shadow-2xl relative transition-all duration-300 transform scale-100",
                        className
                    )}
                    onClick={(e) => e.stopPropagation()} 
                >
                    <div className="absolute -top-4 -right-4 z-20 overflow-visible">
                        <button
                            onClick={onClose}
                            className="w-12 h-12 flex items-center justify-center rounded-full bg-white shadow-md text-brand-green hover:bg-gray-100 hover:text-gray-800 transition-all"
                        >
                            <X size={26} />
                        </button>
                    </div>

                    {/* Nội dung cụ thể bên trong modal */}
                    {children}
                </div>
            </div>
        </Fragment>
    );
};