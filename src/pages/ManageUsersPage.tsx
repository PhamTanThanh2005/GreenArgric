import React, { useState, useEffect, useMemo } from 'react';
import { 
  UserPlus, Edit, Trash2, Mail, Phone, 
  Search, Filter, RefreshCw, Shield, User, X, Save, Map
} from 'lucide-react';
import { userApi, type UserProfile, type UserPayload } from '../features/user/userApi';
import { areaApi, type AreaData } from '../features/dashboard/api/areaApi';
import { cn } from '../utils';

interface AxiosErrorResponse {
  response?: {
    data?: {
      message?: string;
    };
  };
}

export const ManageUsersPage: React.FC = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [areas, setAreas] = useState<AreaData[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [viewAreasUser, setViewAreasUser] = useState<UserProfile | null>(null);

  const [formData, setFormData] = useState<UserPayload>({
    username: '',
    password: '',
    name: '',
    email: '',
    phone: '',
    role: 'owner'
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [usersData, areasData] = await Promise.all([
        userApi.getAllUsers(),
        areaApi.getAll()
      ]);
      setUsers(usersData);
      setAreas(areasData);
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDelete = async (id: number, name: string) => {
    const isConfirm = window.confirm(`Bạn có chắc chắn muốn xóa tài khoản "${name}" không? Hành động này không thể hoàn tác.`);
    if (!isConfirm) return;

    try {
      await userApi.deleteUser(id);
      alert("Xóa người dùng thành công!");
      loadData(); 
    } catch (error: unknown) {
      console.error("Lỗi khi xóa người dùng:", error);
      const err = error as AxiosErrorResponse;
      const backendMessage = err.response?.data?.message || "Xóa thất bại. Vui lòng thử lại.";
      alert(`Lỗi: ${backendMessage}`);
    }
  };

  const handleOpenAddModal = () => {
    setModalMode('add');
    setFormData({ username: '', password: '', name: '', email: '', phone: '', role: 'owner' });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (user: UserProfile) => {
    setModalMode('edit');
    setSelectedUserId(user.id);
    setFormData({
      username: user.username,
      password: '', 
      name: user.name,
      email: user.email || '',
      phone: user.phone || '',
      role: user.role
    });
    setIsModalOpen(true);
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (modalMode === 'add') {
        await userApi.createUser(formData);
        alert("Thêm người dùng thành công!");
      } else if (selectedUserId !== null) {
        const { password, ...restData } = formData;
        const updatePayload: Partial<UserPayload> = password ? { password, ...restData } : restData;
        
        await userApi.updateAdminUser(selectedUserId, updatePayload);
        alert("Cập nhật thông tin thành công!");
      }
      
      setIsModalOpen(false);
      loadData();
    } catch (error: unknown) {
      console.error("Lỗi khi lưu người dùng:", error);
      const err = error as AxiosErrorResponse;
      const backendMessage = err.response?.data?.message || "Đã xảy ra lỗi khi lưu. Vui lòng kiểm tra lại thông tin.";
      alert(`Thất bại: ${backendMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesRole = roleFilter === 'all' || user.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [users, searchTerm, roleFilter]);

  const getRoleBadge = (role: string) => {
    if (role === 'admin') return <span className="flex items-center gap-1.5 w-fit px-3 py-1 bg-red-50 border border-red-200 text-brand-red rounded-full text-xs font-bold uppercase"><Shield size={12} /> Admin</span>;
    if (role === 'owner') return <span className="flex items-center gap-1.5 w-fit px-3 py-1 bg-green-50 border border-green-200 text-brand-green rounded-full text-xs font-bold uppercase"><User size={12} /> Chủ vườn</span>;
    return <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-bold uppercase">{role}</span>;
  };

  return (
    <div className="p-8 flex-1 flex flex-col gap-6 bg-gray-50 overflow-y-auto h-full relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-3xl font-bold text-brand-green uppercase">Quản lý Người dùng</h2>
          <p className="text-gray-500 mt-1">Quản lý tài khoản, phân quyền và liên hệ trong hệ thống</p>
        </div>
        
        <div className="flex gap-3">
          <button onClick={loadData} className="flex items-center justify-center p-2.5 bg-white border border-gray-200 rounded-xl text-brand-green hover:bg-gray-50 transition-colors shadow-sm cursor-pointer">
            <RefreshCw size={20} className={cn(loading && "animate-spin")} />
          </button>
          <button onClick={handleOpenAddModal} className="flex items-center gap-2 bg-brand-green text-white px-5 py-2.5 rounded-xl font-bold hover:bg-green-700 transition-colors shadow-md cursor-pointer">
            <UserPlus size={18} />
            <span>Thêm tài khoản</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 flex flex-col flex-1 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row gap-4 justify-between items-center bg-white">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Tìm kiếm tên, username, email..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-brand-green focus:ring-1 focus:ring-brand-green transition-all text-sm"
            />
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <Filter size={18} className="text-gray-400" />
            <select 
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-xl focus:ring-brand-green focus:border-brand-green block w-full p-2.5 outline-none cursor-pointer"
            >
              <option value="all">Tất cả vai trò</option>
              <option value="admin">Quản trị viên (Admin)</option>
              <option value="owner">Chủ vườn (Owner)</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto flex-1">
          {loading ? (
            <div className="flex justify-center items-center h-64"><RefreshCw className="w-8 h-8 text-brand-green animate-spin" /></div>
          ) : (
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-gray-50/50 text-gray-500 text-xs uppercase tracking-wider">
                  <th className="px-6 py-4 font-bold border-b border-gray-100">Người dùng</th>
                  <th className="px-6 py-4 font-bold border-b border-gray-100">Liên hệ</th>
                  <th className="px-6 py-4 font-bold border-b border-gray-100">Vai trò</th>
                  <th className="px-6 py-4 font-bold border-b border-gray-100 text-center">Quản lý Khu vực</th>
                  <th className="px-6 py-4 font-bold border-b border-gray-100 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      <div className="flex flex-col items-center justify-center">
                        <Search size={40} className="text-gray-300 mb-3" />
                        <p className="text-base font-semibold text-gray-600">Không tìm thấy người dùng nào</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => {
                    const ownerAreas = areas.filter(a => a.owner_id === user.id);

                    return (
                      <tr key={user.id} className="hover:bg-green-50/30 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-linear-to-tr from-brand-green to-green-300 flex items-center justify-center text-white font-bold shadow-sm">
                              {user.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-bold text-gray-800">{user.name}</p>
                              <p className="text-xs text-gray-500 font-medium">@{user.username}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1.5 text-sm text-gray-600">
                            <div className="flex items-center gap-2"><Mail size={14} className="text-gray-400" /> {user.email || <span className="text-gray-400 italic">Chưa cập nhật</span>}</div>
                            <div className="flex items-center gap-2"><Phone size={14} className="text-gray-400" /> {user.phone || <span className="text-gray-400 italic">Chưa cập nhật</span>}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4">{getRoleBadge(user.role)}</td>
                        
                        <td className="px-6 py-4 text-center">
                          {user.role === 'owner' ? (
                            <button 
                              onClick={() => setViewAreasUser(user)}
                              className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-green-50 text-brand-green hover:bg-green-100 hover:text-green-700 rounded-lg text-sm font-semibold transition-colors border border-green-100 cursor-pointer"
                              title="Nhấn để xem chi tiết"
                            >
                              <Map size={14} />
                              {ownerAreas.length} Khu vực
                            </button>
                          ) : (
                            <span className="text-gray-300">-</span>
                          )}
                        </td>

                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => handleOpenEditModal(user)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer" title="Chỉnh sửa"><Edit size={18} /></button>
                            {user.role !== 'admin' && (
                              <button onClick={() => handleDelete(user.id, user.name)} className="p-2 text-brand-red hover:bg-red-50 rounded-lg transition-colors cursor-pointer" title="Xóa tài khoản"><Trash2 size={18} /></button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>


      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-lg overflow-hidden transform transition-all">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="text-xl font-bold text-brand-green">{modalMode === 'add' ? 'Thêm Tài Khoản Mới' : 'Chỉnh Sửa Thông Tin'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-red-500 transition-colors cursor-pointer"><X size={24} /></button>
            </div>
            <form onSubmit={handleSubmitForm} className="p-6 flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Tên đăng nhập <span className="text-red-500">*</span></label>
                  <input type="text" required disabled={modalMode === 'edit'} value={formData.username} onChange={(e) => setFormData({...formData, username: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-brand-green focus:ring-1 focus:ring-brand-green transition-all disabled:opacity-60" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Mật khẩu {modalMode === 'add' && <span className="text-red-500">*</span>}</label>
                  <input type="password" required={modalMode === 'add'} placeholder={modalMode === 'edit' ? '(Giữ nguyên)' : ''} value={formData.password || ''} onChange={(e) => setFormData({...formData, password: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-brand-green focus:ring-1 focus:ring-brand-green transition-all" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Họ và Tên hiển thị <span className="text-red-500">*</span></label>
                <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-brand-green focus:ring-1 focus:ring-brand-green transition-all" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Email</label>
                  <input type="email" value={formData.email || ''} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-brand-green focus:ring-1 focus:ring-brand-green transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Số điện thoại</label>
                  <input type="text" value={formData.phone || ''} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-brand-green focus:ring-1 focus:ring-brand-green transition-all" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Vai trò (Phân quyền) <span className="text-red-500">*</span></label>
                <select value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-brand-green focus:ring-1 focus:ring-brand-green transition-all cursor-pointer">
                  <option value="owner">Chủ vườn (Owner)</option>
                  <option value="admin">Quản trị viên hệ thống (Admin)</option>
                </select>
              </div>
              <div className="mt-4 flex gap-3 justify-end">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer">Hủy bỏ</button>
                <button type="submit" disabled={isSubmitting} className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-white bg-brand-green hover:bg-green-700 transition-colors disabled:opacity-70 cursor-pointer">
                  {isSubmitting ? <RefreshCw size={18} className="animate-spin" /> : <Save size={18} />}
                  <span>{modalMode === 'add' ? 'Tạo Tài Khoản' : 'Lưu Thay Đổi'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {viewAreasUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden transform transition-all">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-brand-green text-white">
              <div className="flex items-center gap-2">
                <Map size={20} />
                <h3 className="text-lg font-bold">Khu vực của {viewAreasUser.name}</h3>
              </div>
              <button onClick={() => setViewAreasUser(null)} className="text-white/70 hover:text-white transition-colors cursor-pointer"><X size={24} /></button>
            </div>
            
            <div className="p-5 max-h-[60vh] overflow-y-auto custom-scrollbar bg-gray-50">
              {areas.filter(a => a.owner_id === viewAreasUser.id).length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <Map size={40} className="mx-auto mb-3 opacity-50" />
                  <p className="font-medium text-gray-500">Chủ vườn này chưa quản lý khu vực nào.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {areas.filter(a => a.owner_id === viewAreasUser.id).map(area => (
                    <div key={area.id} className="p-4 bg-white border border-gray-200 rounded-xl shadow-sm hover:border-brand-green transition-colors">
                      <p className="font-bold text-gray-800 text-base">{area.name}</p>
                      <p className="text-sm text-gray-500 mt-1">{area.description || 'Không có mô tả'}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="p-4 border-t border-gray-100 bg-white flex justify-end">
              <button onClick={() => setViewAreasUser(null)} className="px-5 py-2 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer">
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};