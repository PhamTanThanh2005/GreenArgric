import React, { useState, useEffect } from 'react';
import { 
  User, Mail, Phone, Shield, Lock, Bell, 
  Smartphone, CheckCircle2, Edit3, RefreshCw, X, Save 
} from 'lucide-react';
import { userApi, type UserProfile } from '../features/user/userApi';
import { cn } from '../utils';

export const ProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // States cho chế độ chỉnh sửa
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', email: '', phone: '' });
  const [isSaving, setIsSaving] = useState(false);

  // States giả lập
  const [emailNotif, setEmailNotif] = useState(true);
  const [smsNotif, setSmsNotif] = useState(false);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const data = await userApi.getProfile();
      setProfile(data);
      setEditForm({ name: data.name, email: data.email, phone: data.phone }); // Sync form
    } catch (err) {
      setError("Không thể tải thông tin cá nhân. Vui lòng thử lại sau.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, []);

  const handleEditClick = () => {
    if (profile) {
      setEditForm({ name: profile.name, email: profile.email, phone: profile.phone });
    }
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      // Gọi qua userApi
      await userApi.updateProfile(editForm);
      
      await fetchProfileData();
      setIsEditing(false);
      alert("Cập nhật thông tin thành công!");
    } catch (error) {
      console.error("Lỗi khi lưu profile", error);
      alert("Cập nhật thất bại. Vui lòng kiểm tra lại.");
    } finally {
      setIsSaving(false);
    }
  };

  const getRoleName = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin': return 'Quản trị viên hệ thống';
      case 'owner': return 'Chủ nông trại';
      default: return role;
    }
  };

  if (loading && !profile) {
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
      {/* Tiêu đề & Nút Hành động */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-brand-green uppercase">Hồ sơ cá nhân</h2>
          <p className="text-gray-500 font-medium">Quản lý thông tin tài khoản và tùy chọn bảo mật</p>
        </div>
        
        {!isEditing ? (
          <button onClick={handleEditClick} className="flex items-center gap-2 bg-brand-green text-white px-5 py-2.5 rounded-xl font-bold hover:bg-green-700 transition-colors shadow-md cursor-pointer">
            <Edit3 size={18} />
            <span>Chỉnh sửa hồ sơ</span>
          </button>
        ) : (
          <div className="flex gap-3">
            <button onClick={handleCancelEdit} className="flex items-center gap-2 bg-gray-200 text-gray-700 px-5 py-2.5 rounded-xl font-bold hover:bg-gray-300 transition-colors cursor-pointer">
              <X size={18} />
              <span>Hủy bỏ</span>
            </button>
            <button onClick={handleSaveProfile} disabled={isSaving} className="flex items-center gap-2 bg-brand-green text-white px-5 py-2.5 rounded-xl font-bold hover:bg-green-700 transition-colors shadow-md disabled:opacity-50 cursor-pointer">
              {isSaving ? <RefreshCw size={18} className="animate-spin" /> : <Save size={18} />}
              <span>{isSaving ? "Đang lưu..." : "Lưu thay đổi"}</span>
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* CỘT TRÁI: Avatar & Form Nhập liệu / Hiển thị */}
        <div className="col-span-1 flex flex-col gap-6">
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col items-center text-center">
            <div className="relative mb-4">
              <div className="w-32 h-32 bg-gradient-to-tr from-brand-green to-green-300 rounded-full flex items-center justify-center border-4 border-white shadow-xl">
                <User className="w-14 h-14 text-white" />
              </div>
              <div className="absolute bottom-1 right-1 w-6 h-6 bg-green-500 border-2 border-white rounded-full"></div>
            </div>
            
            {/* Nếu đang sửa thì ẩn tên to đi để sửa form ở dưới */}
            {!isEditing && (
              <>
                <h3 className="text-2xl font-extrabold text-gray-800">{profile.name}</h3>
                <p className="text-gray-500 font-medium mt-1">@{profile.username}</p>
                <span className="bg-brand-green/10 text-brand-green px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mt-4 inline-block">
                  {getRoleName(profile.role)}
                </span>
              </>
            )}
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 border-b border-gray-50 pb-2">
              {isEditing ? "Chỉnh sửa thông tin" : "Liên hệ"}
            </h4>
            
            <div className="flex flex-col gap-4">
              {/* Field: Name (Chỉ hiện form nhập khi Edit) */}
              {isEditing && (
                 <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">Họ và Tên</label>
                    <input 
                      type="text" 
                      value={editForm.name}
                      onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                      className="w-full mt-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-brand-green"
                    />
                 </div>
              )}

              {/* Field: Email */}
              <div className={cn("flex", isEditing ? "flex-col" : "items-center gap-3")}>
                {!isEditing && (
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 shrink-0">
                    <Mail size={18} />
                  </div>
                )}
                <div className="w-full overflow-hidden">
                  <label className={cn("text-xs font-bold text-gray-500 uppercase", !isEditing && "capitalize text-sm font-normal")}>Email</label>
                  {isEditing ? (
                    <input 
                      type="email" 
                      value={editForm.email}
                      onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                      className="w-full mt-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-brand-green"
                    />
                  ) : (
                    <p className="font-semibold text-gray-800 truncate">{profile.email}</p>
                  )}
                </div>
              </div>

              {/* Field: Phone */}
              <div className={cn("flex", isEditing ? "flex-col" : "items-center gap-3")}>
                {!isEditing && (
                  <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600 shrink-0">
                    <Phone size={18} />
                  </div>
                )}
                <div className="w-full">
                  <label className={cn("text-xs font-bold text-gray-500 uppercase", !isEditing && "capitalize text-sm font-normal")}>Số điện thoại</label>
                  {isEditing ? (
                    <input 
                      type="text" 
                      value={editForm.phone}
                      onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                      className="w-full mt-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-brand-green"
                    />
                  ) : (
                    <p className="font-semibold text-gray-800">{profile.phone}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CỘT PHẢI: Cài đặt và Bảo mật (Giữ nguyên giao diện) */}
        <div className="col-span-1 lg:col-span-2 flex flex-col gap-6 opacity-80 pointer-events-none">
          {/* ... (Đoạn này mình giữ lại UI mockup của Cài đặt & Bảo mật nhưng làm mờ nhẹ đi để focus vào phần Edit bên trái) ... */}
           <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <Shield className="text-brand-green" /> Bảo mật tài khoản (Tính năng sắp ra mắt)
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border border-gray-100 p-5 rounded-2xl flex flex-col gap-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2 text-gray-700 font-bold">
                    <Lock size={20} className="text-gray-400" /> Mật khẩu
                  </div>
                </div>
                <p className="text-sm text-gray-500">Cập nhật mật khẩu định kỳ để bảo vệ tài khoản của bạn.</p>
              </div>

              <div className="border border-gray-100 p-5 rounded-2xl flex flex-col gap-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2 text-gray-700 font-bold">
                    <Smartphone size={20} className="text-gray-400" /> Xác thực 2 lớp (2FA)
                  </div>
                  <CheckCircle2 size={20} className="text-green-500" />
                </div>
                <p className="text-sm text-gray-500">Tài khoản của bạn đang được bảo vệ bởi lớp bảo mật thứ hai.</p>
              </div>
            </div>
          </div>

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
                <button className={cn("w-12 h-6 rounded-full transition-colors relative", emailNotif ? "bg-brand-green" : "bg-gray-300")}>
                  <span className={cn("absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform", emailNotif ? "translate-x-6" : "translate-x-0")}></span>
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <h4 className="font-bold text-gray-800">Cảnh báo Thiết bị (SMS)</h4>
                  <p className="text-sm text-gray-500">Nhận tin nhắn khi máy bơm/đèn LED bị lỗi kết nối</p>
                </div>
                <button className={cn("w-12 h-6 rounded-full transition-colors relative", smsNotif ? "bg-brand-green" : "bg-gray-300")}>
                  <span className={cn("absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform", smsNotif ? "translate-x-6" : "translate-x-0")}></span>
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};