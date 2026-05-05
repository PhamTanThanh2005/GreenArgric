import React, { useState, useEffect, useMemo } from 'react';
import { 
  Map, Cpu, Plus, Edit, Trash2, Search, Filter, RefreshCw, X, Save, 
  Thermometer, Droplets, Sun, Wind, Settings, Sprout
} from 'lucide-react';
import axios from 'axios';

import { areaApi, type AreaData } from '../features/dashboard/api/areaApi';
import { fetchDevices, createDevice, updateDevice, deleteDevice } from '../features/device/api/deviceApi';
import { thresholdApi, type ThresholdData } from '../features/threshold/api/thresholdApi';
import { userApi, type UserProfile } from '../features/user/userApi';
import { cn } from '../utils';
interface DeviceData {
  id: number;
  device_name: string;
  type: string;
  status: boolean | number;
  area_id: number;
  area_name: string;
}

const SENSOR_TYPES = [
  { id: 'temp', label: 'Nhiệt độ', icon: <Thermometer className="text-brand-red" />, unit: '°C' },
  { id: 'light', label: 'Ánh sáng', icon: <Sun className="text-brand-red" />, unit: 'Lux' },
  { id: 'moisture', label: 'Độ ẩm KK', icon: <Droplets className="text-blue-800" />, unit: '%' },
  { id: 'soil_moisture', label: 'Độ ẩm đất', icon: <Sprout className="text-brand-green" />, unit: '%' },
];

export const ManageDevicesPage: React.FC = () => {

  const [loading, setLoading] = useState(true);
  const [areas, setAreas] = useState<AreaData[]>([]);
  const [devices, setDevices] = useState<DeviceData[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]); 
  
  const [selectedAreaId, setSelectedAreaId] = useState<number | null>(null);
  const [areaSearch, setAreaSearch] = useState('');
  const [ownerFilter, setOwnerFilter] = useState<string>('all'); 

  const [isAreaModalOpen, setIsAreaModalOpen] = useState(false);
  const [areaModalMode, setAreaModalMode] = useState<'add' | 'edit'>('add');
  const [areaFormData, setAreaFormData] = useState({ id: 0, name: '', description: '', owner_id: '' });

  const [isDeviceModalOpen, setIsDeviceModalOpen] = useState(false);
  const [deviceModalMode, setDeviceModalMode] = useState<'add' | 'edit'>('add');
  const [deviceFormData, setDeviceFormData] = useState({ id: 0, name: '', type: 'pump', status: 1 });

  const [isThresholdModalOpen, setIsThresholdModalOpen] = useState(false);
  const [loadingThresholds, setLoadingThresholds] = useState(false);
  const [savingThresholds, setSavingThresholds] = useState(false);
  const [thresholds, setThresholds] = useState<Record<string, { min: string; max: string }>>({
    temp: { min: '', max: '' },
    light: { min: '', max: '' },
    moisture: { min: '', max: '' },
    soil_moisture: { min: '', max: '' }
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [areasRes, devicesRes, usersRes] = await Promise.all([
        areaApi.getAll(),
        fetchDevices(),
        userApi.getAllUsers()
      ]);
      
      setAreas(areasRes);
      setDevices(devicesRes);
      setUsers(usersRes.filter(u => u.role === 'owner')); 
      
      if (areasRes.length > 0 && !selectedAreaId) {
        setSelectedAreaId(areasRes[0].id);
      }
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const filteredAreas = useMemo(() => {
    return areas.filter(a => {
      const matchesSearch = a.name.toLowerCase().includes(areaSearch.toLowerCase());
      const matchesOwner = 
        ownerFilter === 'all' || 
        (ownerFilter === 'unassigned' && !a.owner_id) || 
        (a.owner_id?.toString() === ownerFilter);
      return matchesSearch && matchesOwner;
    });
  }, [areas, areaSearch, ownerFilter]);

  const currentAreaDevices = useMemo(() => {
    if (!selectedAreaId) return [];
    return devices.filter(d => d.area_id === selectedAreaId);
  }, [devices, selectedAreaId]);

  const handleSaveArea = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name: areaFormData.name,
        description: areaFormData.description,
        owner_id: areaFormData.owner_id ? parseInt(areaFormData.owner_id) : null
      };

      if (areaModalMode === 'add') {
        await areaApi.createArea(payload);
        alert("Thêm khu vực thành công!");
      } else {
        await areaApi.updateArea(areaFormData.id, payload);
        alert("Cập nhật khu vực thành công!");
      }
      setIsAreaModalOpen(false);
      loadData();
    } catch (error) {
      alert(`Lỗi: ${axios.isAxiosError(error) ? error.response?.data?.error : 'Không thể lưu khu vực'}`);
    }
  };

  const handleDeleteArea = async (id: number, name: string) => {
    if (!window.confirm(`Bạn có chắc muốn xóa khu vực "${name}"? Các thiết bị bên trong sẽ bị ảnh hưởng.`)) return;
    try {
      await areaApi.deleteArea(id);
      if (selectedAreaId === id) setSelectedAreaId(null);
      loadData();
    } catch (error) {
      alert(`Lỗi: ${axios.isAxiosError(error) ? error.response?.data?.error : 'Khu vực này đang chứa thiết bị, không thể xóa'}`);
    }
  };

  const handleSaveDevice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAreaId) return;

    try {
      if (deviceModalMode === 'add') {
        await createDevice({ name: deviceFormData.name, type: deviceFormData.type, area_id: selectedAreaId, status: deviceFormData.status });
        alert("Thêm thiết bị thành công!");
      } else {
        await updateDevice(deviceFormData.id, { name: deviceFormData.name, type: deviceFormData.type, status: deviceFormData.status });
        alert("Cập nhật thiết bị thành công!");
      }
      setIsDeviceModalOpen(false);
      loadData();
    } catch (error) {
      alert(`Lỗi: ${axios.isAxiosError(error) ? error.response?.data?.error : 'Không thể lưu thiết bị'}`);
    }
  };

  const handleDeleteDevice = async (id: number, name: string) => {
    if (!window.confirm(`Xóa thiết bị "${name}"? Hành động này không thể hoàn tác.`)) return;
    try {
      await deleteDevice(id);
      loadData();
    } catch (error) {
      alert(`Lỗi: ${axios.isAxiosError(error) ? error.response?.data?.error : 'Không thể xóa thiết bị'}`);
    }
  };

  const handleOpenThresholdModal = async () => {
    if (!selectedAreaId) return;
    setIsThresholdModalOpen(true);
    setLoadingThresholds(true);
    
    try {
      const data = await thresholdApi.getAreaThresholds(selectedAreaId);
      const newState: Record<string, { min: string; max: string }> = {
        temp: { min: '', max: '' },
        light: { min: '', max: '' },
        moisture: { min: '', max: '' },
        soil_moisture: { min: '', max: '' }
      };

      data.forEach((t: ThresholdData) => {
        if (newState[t.sensor_type]) {
          newState[t.sensor_type] = {
            min: t.min_value !== null ? t.min_value.toString() : '',
            max: t.max_value !== null ? t.max_value.toString() : ''
          };
        }
      });
      setThresholds(newState);
    } catch (error) {
      console.error("Lỗi tải ngưỡng:", error);
    } finally {
      setLoadingThresholds(false);
    }
  };

  const handleSaveThresholds = async () => {
    if (!selectedAreaId) return;
    setSavingThresholds(true);
    try {
      const savePromises = SENSOR_TYPES.map(sensor => {
        const data = thresholds[sensor.id];
        if (data.min === '' && data.max === '') return Promise.resolve();
        return thresholdApi.saveThreshold({
          area_id: selectedAreaId,
          sensor_type: sensor.id,
          min_value: data.min !== '' ? parseFloat(data.min) : null,
          max_value: data.max !== '' ? parseFloat(data.max) : null
        });
      });

      await Promise.all(savePromises);
      alert("Đã lưu cấu hình ngưỡng thành công!");
      setIsThresholdModalOpen(false);
    } catch (error) {
      console.error("Lỗi khi lưu ngưỡng:", error);
      alert("Đã xảy ra lỗi khi lưu cấu hình!");
    } finally {
      setSavingThresholds(false);
    }
  };

  const handleThresholdChange = (sensorId: string, field: 'min' | 'max', value: string) => {
    setThresholds(prev => ({ ...prev, [sensorId]: { ...prev[sensorId], [field]: value } }));
  };

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'pump': return <Droplets className="text-blue-800" />;
      case 'light': return <Sun className="text-brand-red" />;
      case 'fan': return <Wind className="text-brand-green" />;
      case 'sensor': return <Thermometer className="text-purple-800" />;
      default: return <Cpu className="text-gray-500" />;
    }
  };

  return (
    <div className="p-8 flex-1 flex flex-col gap-6 bg-gray-50 overflow-hidden h-full relative">
    
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-brand-green uppercase">Khu vực và Thiết bị</h2>
        </div>
        <button onClick={loadData} className="p-2.5 bg-white border border-gray-200 rounded-xl text-brand-green hover:bg-gray-100 shadow-sm transition-colors cursor-pointer">
          <RefreshCw size={20} className={cn(loading && "animate-spin")} />
        </button>
      </div>

      <div className="flex flex-1 gap-6 overflow-hidden">
        
        <div className="w-1/2 bg-white rounded-3xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
          
          <div className="p-5 border-b border-gray-100 bg-gray-50 flex justify-between items-center shrink-0">
            <h3 className="font-bold text-gray-800 flex items-center gap-2"><Map size={18} /> Phân khu</h3>
            <button 
              onClick={() => { setAreaModalMode('add'); setAreaFormData({ id: 0, name: '', description: '', owner_id: '' }); setIsAreaModalOpen(true); }}
              className="p-1.5 bg-brand-green text-white rounded-lg hover:bg-green-700 transition-colors cursor-pointer" title="Thêm khu vực mới"
            >
              <Plus size={18} />
            </button>
          </div>
          
          <div className="p-4 border-b border-gray-100 flex flex-col gap-3 shrink-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input type="text" placeholder="Tìm kiếm..." value={areaSearch} onChange={(e) => setAreaSearch(e.target.value)} className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-brand-green transition-all" />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <select value={ownerFilter} onChange={(e) => setOwnerFilter(e.target.value)} className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-brand-green appearance-none cursor-pointer text-gray-700">
                <option value="all">Tất cả chủ vườn</option>
                <option value="unassigned">⚠️ Chưa gán chủ vườn</option>
                {users.map(u => <option key={u.id} value={u.id.toString()}>👤 {u.name}</option>)}
              </select>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2 custom-scrollbar">
            {filteredAreas.length === 0 ? (
              <p className="text-center text-gray-400 text-sm mt-4">Không tìm thấy khu vực nào</p>
            ) : (
              filteredAreas.map(area => (
                <div 
                  key={area.id} onClick={() => setSelectedAreaId(area.id)}
                  className={cn("p-4 rounded-xl border-2 cursor-pointer transition-all flex justify-between items-start group", selectedAreaId === area.id ? "border-brand-green bg-green-50" : "border-transparent bg-gray-50 hover:bg-gray-100")}
                >
                  <div className="flex-1 pr-2">
                    <p className={cn("font-bold text-base", selectedAreaId === area.id ? "text-brand-green" : "text-gray-800")}>{area.name}</p>
                    <div className="mt-1.5 flex items-center gap-1.5">
                       {area.owner_name ? <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-100 text-blue-700">👤 {area.owner_name}</span> : <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-gray-200 text-gray-500">⚠️ Chưa gán chủ vườn</span>}
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <button onClick={(e) => { e.stopPropagation(); setAreaModalMode('edit'); setAreaFormData({ id: area.id, name: area.name, description: area.description, owner_id: area.owner_id ? area.owner_id.toString() : '' }); setIsAreaModalOpen(true); }} className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-md transition-colors"><Edit size={16} /></button>
                    <button onClick={(e) => { e.stopPropagation(); handleDeleteArea(area.id, area.name); }} className="p-1.5 text-red-600 hover:bg-red-100 rounded-md transition-colors"><Trash2 size={16} /></button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="w-1/2 bg-white rounded-3xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
          {!selectedAreaId ? (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
              <Map size={48} className="mb-4 text-gray-300" />
              <p className="font-semibold text-lg">Chưa chọn khu vực</p>
            </div>
          ) : (
            <>
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white shrink-0">
                <div>
                  <h3 className="text-xl font-bold text-gray-800">Thiết bị trong khu vực</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Đang xem: <span className="font-bold text-brand-green">{areas.find(a => a.id === selectedAreaId)?.name}</span>
                  </p>
                </div>
                
                <div className="flex gap-3">
                  <button 
                    onClick={handleOpenThresholdModal}
                    className="flex items-center gap-2 bg-red-50 text-brand-red border border-red-200 px-4 py-2.5 rounded-xl font-bold hover:bg-red-100 transition-colors shadow-sm cursor-pointer"
                  >
                    <Settings size={18} /> Ngưỡng
                  </button>

                  <button 
                    onClick={() => { setDeviceModalMode('add'); setDeviceFormData({ id: 0, name: '', type: 'pump', status: 1 }); setIsDeviceModalOpen(true); }}
                    className="flex items-center gap-2 bg-brand-green text-white px-4 py-2.5 rounded-xl font-bold hover:bg-green-700 transition-colors shadow-sm cursor-pointer"
                  >
                    <Plus size={18} /> Thiết bị
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                {currentAreaDevices.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400">
                    <Cpu size={48} className="mb-4 text-gray-200" />
                    <p className="font-semibold">Khu vực này chưa có thiết bị nào</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {currentAreaDevices.map(device => (
                      <div key={device.id} className="p-4 bg-gray-50 border border-gray-200 rounded-2xl flex items-center justify-between group hover:border-brand-green transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center border border-gray-100">
                            {getDeviceIcon(device.type)}
                          </div>
                          <div>
                            <p className="font-bold text-gray-800">{device.device_name}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs font-semibold text-gray-500 uppercase">{device.type}</span>
                              <span className="text-gray-300">•</span>
                              <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-bold uppercase", device.status ? "bg-green-100 text-brand-green" : "bg-red-100 text-red-700")}>
                                {device.status ? 'Hoạt động' : 'Bảo trì'}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => { setDeviceModalMode('edit'); setDeviceFormData({ id: device.id, name: device.device_name, type: device.type, status: device.status ? 1 : 0 }); setIsDeviceModalOpen(true); }} className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-md transition-colors"><Edit size={16} /></button>
                          <button onClick={() => handleDeleteDevice(device.id, device.device_name)} className="p-1.5 text-red-600 hover:bg-red-100 rounded-md transition-colors"><Trash2 size={16} /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {isAreaModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-brand-green">{areaModalMode === 'add' ? 'Thêm Phân Khu Mới' : 'Chỉnh Sửa Phân Khu'}</h3>
              <button onClick={() => setIsAreaModalOpen(false)} className="text-gray-400 hover:text-red-500"><X size={20} /></button>
            </div>
            <form onSubmit={handleSaveArea} className="p-5 flex flex-col gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Tên khu vực <span className="text-red-500">*</span></label>
                <input type="text" required value={areaFormData.name} onChange={e => setAreaFormData({...areaFormData, name: e.target.value})} className="w-full px-4 py-2 bg-gray-50 border rounded-xl focus:border-brand-green focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Mô tả chi tiết</label>
                <textarea rows={3} value={areaFormData.description} onChange={e => setAreaFormData({...areaFormData, description: e.target.value})} className="w-full px-4 py-2 bg-gray-50 border rounded-xl focus:border-brand-green focus:outline-none custom-scrollbar" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Gán cho Chủ vườn (Tùy chọn)</label>
                <select value={areaFormData.owner_id} onChange={e => setAreaFormData({...areaFormData, owner_id: e.target.value})} className="w-full px-4 py-2 bg-gray-50 border rounded-xl focus:border-brand-green focus:outline-none cursor-pointer">
                  <option value="">-- Không gán --</option>
                  {users.map(u => <option key={u.id} value={u.id}>{u.name} (@{u.username})</option>)}
                </select>
              </div>
              <div className="mt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsAreaModalOpen(false)} className="px-4 py-2 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200">Hủy</button>
                <button type="submit" className="px-4 py-2 rounded-xl font-bold text-white bg-brand-green hover:bg-green-700 flex items-center gap-2"><Save size={16} /> Lưu thông tin</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isDeviceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-brand-green">{deviceModalMode === 'add' ? 'Thêm Thiết Bị' : 'Chỉnh Sửa Thiết Bị'}</h3>
              <button onClick={() => setIsDeviceModalOpen(false)} className="text-gray-400 hover:text-red-500"><X size={20} /></button>
            </div>
            <form onSubmit={handleSaveDevice} className="p-5 flex flex-col gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Tên thiết bị <span className="text-red-500">*</span></label>
                <input type="text" required value={deviceFormData.name} onChange={e => setDeviceFormData({...deviceFormData, name: e.target.value})} className="w-full px-4 py-2 bg-gray-50 border rounded-xl focus:border-brand-green focus:outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Loại phần cứng <span className="text-red-500">*</span></label>
                  <select value={deviceFormData.type} onChange={e => setDeviceFormData({...deviceFormData, type: e.target.value})} className="w-full px-4 py-2 bg-gray-50 border rounded-xl focus:border-brand-green focus:outline-none cursor-pointer">
                    <option value="pump">Máy bơm nước</option>
                    <option value="light">Hệ thống đèn</option>
                    <option value="fan">Quạt thông gió</option>
                    <option value="sensor">Cảm biến</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Trạng thái mã <span className="text-red-500">*</span></label>
                  <select value={deviceFormData.status} onChange={e => setDeviceFormData({...deviceFormData, status: parseInt(e.target.value)})} className="w-full px-4 py-2 bg-gray-50 border rounded-xl focus:border-brand-green focus:outline-none cursor-pointer">
                    <option value={1}>Sẵn sàng</option>
                    <option value={0}>Đang bảo trì/Lỗi</option>
                  </select>
                </div>
              </div>
              <div className="mt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsDeviceModalOpen(false)} className="px-4 py-2 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200">Hủy</button>
                <button type="submit" className="px-4 py-2 rounded-xl font-bold text-white bg-brand-green hover:bg-green-700 flex items-center gap-2"><Save size={16} /> Lưu thiết bị</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isThresholdModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-2xl overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-amber-50">
              <div className="flex items-center gap-2">
                <Settings className="text-amber-600" size={20} />
                <h3 className="font-bold text-amber-700">
                  Cấu hình ngưỡng tự động - {areas.find(a => a.id === selectedAreaId)?.name}
                </h3>
              </div>
              <button onClick={() => setIsThresholdModalOpen(false)} className="text-gray-400 hover:text-red-500"><X size={20} /></button>
            </div>
            
            <div className="p-6 max-h-[60vh] overflow-y-auto custom-scrollbar bg-gray-50">
              {loadingThresholds ? (
                <div className="flex justify-center p-8"><RefreshCw className="animate-spin text-brand-green" /></div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {SENSOR_TYPES.map(sensor => (
                    <div key={sensor.id} className="p-4 bg-white border border-gray-200 rounded-2xl shadow-sm hover:border-brand-green transition-colors">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="p-1.5 bg-gray-50 rounded-lg">{sensor.icon}</div>
                        <h4 className="font-bold text-gray-700 text-sm">{sensor.label}</h4>
                      </div>
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Min</label>
                          <input 
                            type="number" step="0.1" placeholder={`Trống`}
                            value={thresholds[sensor.id].min}
                            onChange={e => handleThresholdChange(sensor.id, 'min', e.target.value)}
                            className="w-full px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-brand-green text-sm font-medium"
                          />
                        </div>
                        <div className="flex-1">
                          <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Max</label>
                          <input 
                            type="number" step="0.1" placeholder={`Trống`}
                            value={thresholds[sensor.id].max}
                            onChange={e => handleThresholdChange(sensor.id, 'max', e.target.value)}
                            className="w-full px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-brand-green text-sm font-medium"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-5 border-t border-gray-100 bg-white flex justify-end gap-3">
              <button onClick={() => setIsThresholdModalOpen(false)} className="px-5 py-2 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200">Hủy</button>
              <button 
                onClick={handleSaveThresholds} disabled={savingThresholds || loadingThresholds}
                className="px-5 py-2 rounded-xl font-bold text-white bg-brand-green hover:bg-green-700 flex items-center gap-2 disabled:opacity-70"
              >
                {savingThresholds ? <RefreshCw size={18} className="animate-spin" /> : <Save size={18} />}
                Lưu cấu hình
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};