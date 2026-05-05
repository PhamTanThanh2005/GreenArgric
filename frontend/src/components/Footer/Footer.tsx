import React from 'react';
import wage from "../../assets/wage.png"

export const Footer: React.FC = () => {
  return (
    <div className="relative mt-auto w-full z-10">
      <div className="relative z-0 w-full overflow-hidden drop-shadow-[0_-15px_30px_rgba(0,0,0,0.08)] -mb-1">
        <img
          src={wage}
          alt="Lượn sóng boundary"
          className="w-full object-cover" 
        />
      </div>
      
      <div className="relative z-10 bg-white w-full">
        
        <div className="max-w-7xl mx-auto pt-8 pb-12 px-8 flex justify-between items-center">
          
          <div className="max-w-3xl">
            <p className="text-brand-green text-xl leading-relaxed">
              <strong className="text-2xl font-extrabold mr-2">GREEN ARGRIC</strong>
              là hệ thống giám sát và điều chỉnh môi trường nhà kính thông minh,
              cho phép theo dõi <strong className="font-bold">nhiệt độ, độ ẩm và ánh sáng</strong> theo
              thời gian thực và <strong className="font-bold">điều khiển thiết bị từ xa</strong> qua web,
              giúp tối ưu việc chăm sóc cây trồng.
            </p>
          </div>
          
          <div className="w-45 h-45 rounded-full bg-brand-green flex items-center justify-center shrink-0 shadow-lg">
            <img
              src="images/logo-green.png"
              alt="Green Agric Logo"
              className="w-30 h-30 object-contain"
            />
          </div>

        </div>
      </div>
      
    </div>
  );
};