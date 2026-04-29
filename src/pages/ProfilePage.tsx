// src/features/user/ProfilePage.tsx

import React, { useState, useEffect } from 'react';
import { 
  User, Mail, Phone, Shield, Lock, Bell, 
  Smartphone, CheckCircle2, Edit3, RefreshCw 
} from 'lucide-react';
import { userApi, type UserProfile } from '../features/user/userApi';
import { cn } from '../utils';

export const ProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // States giả lập cho phần Cài đặt (UI Mockup)
  const [emailNotif, setEmailNotif] = useState(true);
  const [smsNotif, setSmsNotif] = useState(false);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        const data = await userApi.getProfile();
        setProfile(data);
      } catch (err) {
        setError("Không thể tải thông tin cá nhân. Vui lòng thử lại sau.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  const getRoleName = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin': return 'Quản trị viên hệ thống';
      case 'owner': return 'Chủ nông trại';
    //   case 'staff': return 'Nhân viên vận hành';
      default: return role;
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 h-full">
        <RefreshCw className="w-8 h-8 text-brand-green animate-spin mb-4" />
        <p className="text-gray-500 font-medium">Đang tải thông tin...</p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 h-full">
        <p className="text-red-500 font-bold text-lg">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-8 flex-1 flex flex-col gap-6 bg-gray-50 overflow-y-auto min-h-screen">
      {/* Tiêu đề */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-brand-green uppercase">Hồ sơ cá nhân</h2>
          <p className="text-gray-500 font-medium">Quản lý thông tin tài khoản và tùy chọn bảo mật</p>
        </div>
        <button className="flex items-center gap-2 bg-brand-green text-white px-5 py-2.5 rounded-xl font-bold hover:bg-green-700 transition-colors shadow-md">
          <Edit3 size={18} />
          <span>Chỉnh sửa hồ sơ</span>
        </button>
      </div>

      {/* Lưới Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* CỘT TRÁI: Thông tin cơ bản */}
        <div className="col-span-1 flex flex-col gap-6">
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col items-center text-center">
            <div className="relative mb-4">
              <div className="w-32 h-32 bg-linear-to-tr from-brand-green to-green-300 rounded-full flex items-center justify-center border-4 border-white shadow-xl">
                <User className="w-14 h-14 text-white" />
              </div>
              <div className="absolute bottom-1 right-1 w-6 h-6 bg-green-500 border-2 border-white rounded-full"></div>
            </div>
            
            <h3 className="text-2xl font-extrabold text-gray-800">{profile.name}</h3>
            <p className="text-gray-500 font-medium mt-1">@{profile.username}</p>
            <span className="bg-brand-green/10 text-brand-green px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mt-4 inline-block">
              {getRoleName(profile.role)}
            </span>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 border-b border-gray-50 pb-2">Liên hệ</h4>
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
                  <Mail size={18} />
                </div>
                <div className="overflow-hidden">
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-semibold text-gray-800 truncate">{profile.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                  <Phone size={18} />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Số điện thoại</p>
                  <p className="font-semibold text-gray-800">{profile.phone}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CỘT PHẢI: Cài đặt và Bảo mật */}
        <div className="col-span-1 lg:col-span-2 flex flex-col gap-6">
          
          {/* Card: Bảo mật tài khoản */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <Shield className="text-brand-green" /> Bảo mật tài khoản
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border border-gray-100 p-5 rounded-2xl flex flex-col gap-3 hover:border-brand-green transition-colors">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2 text-gray-700 font-bold">
                    <Lock size={20} className="text-gray-400" /> Mật khẩu
                  </div>
                </div>
                <p className="text-sm text-gray-500">Cập nhật mật khẩu định kỳ để bảo vệ tài khoản của bạn.</p>
                <button className="mt-auto self-start text-sm font-bold text-brand-green hover:underline">
                  Đổi mật khẩu
                </button>
              </div>

              <div className="border border-gray-100 p-5 rounded-2xl flex flex-col gap-3 hover:border-brand-green transition-colors">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2 text-gray-700 font-bold">
                    <Smartphone size={20} className="text-gray-400" /> Xác thực 2 lớp (2FA)
                  </div>
                  <CheckCircle2 size={20} className="text-green-500" />
                </div>
                <p className="text-sm text-gray-500">Tài khoản của bạn đang được bảo vệ bởi lớp bảo mật thứ hai.</p>
                <button className="mt-auto self-start text-sm font-bold text-brand-green hover:underline">
                  Quản lý 2FA
                </button>
              </div>
            </div>
          </div>

          {/* Card: Tùy chọn thông báo */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <Bell className="text-brand-green" /> Tùy chọn thông báo Nông trại
            </h3>

            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <h4 className="font-bold text-gray-800">Cảnh báo vượt ngưỡng</h4>
                  <p className="text-sm text-gray-500">Nhận email khi nhiệt độ, độ ẩm vượt mức an toàn</p>
                </div>
                {/* Nút Toggle tự làm bằng Tailwind */}
                <button 
                  onClick={() => setEmailNotif(!emailNotif)}
                  className={cn(
                    "w-12 h-6 rounded-full transition-colors relative",
                    emailNotif ? "bg-brand-green" : "bg-gray-300"
                  )}
                >
                  <span className={cn(
                    "absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform",
                    emailNotif ? "translate-x-6" : "translate-x-0"
                  )}></span>
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <h4 className="font-bold text-gray-800">Cảnh báo Thiết bị (SMS)</h4>
                  <p className="text-sm text-gray-500">Nhận tin nhắn khi máy bơm/đèn LED bị lỗi kết nối</p>
                </div>
                <button 
                  onClick={() => setSmsNotif(!smsNotif)}
                  className={cn(
                    "w-12 h-6 rounded-full transition-colors relative",
                    smsNotif ? "bg-brand-green" : "bg-gray-300"
                  )}
                >
                  <span className={cn(
                    "absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform",
                    smsNotif ? "translate-x-6" : "translate-x-0"
                  )}></span>
                </button>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};