import React from 'react';
// Import hình ảnh của bạn vào đây (nhớ sửa lại đường dẫn cho đúng thực tế)
import wage from "../../assets/wage.png"

export const Footer: React.FC = () => {
  return (
    <div className="relative mt-auto w-full z-10">
      
      {/* Phần hình sóng */}
      <div className="relative z-0 w-full overflow-hidden drop-shadow-[0_-15px_30px_rgba(0,0,0,0.08)] -mb-1">
        <img
          src={wage}
          alt="Lượn sóng boundary"
          className="w-full object-cover" 
        />
      </div>

      {/* TÁCH RA LÀM 2 THẺ DIV Ở ĐÂY */}
      
      {/* Thẻ 1 (Lớp ngoài): Trải dài full màn hình để lấp đầy màu trắng 2 bên mép */}
      <div className="relative z-10 bg-white w-full">
        
        {/* Thẻ 2 (Lớp trong): Giới hạn chiều rộng và căn giữa nội dung */}
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