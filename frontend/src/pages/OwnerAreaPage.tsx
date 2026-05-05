
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Map, Cpu, RefreshCw, X, Save, 
  Thermometer, Droplets, Sun, Wind, Settings, Sprout,
  ListTodo, Plus, Trash2, Edit2, CheckCircle2, Circle, Clock
} from 'lucide-react';
import axios from 'axios';

import { areaApi, type AreaData } from '../features/dashboard/api/areaApi';
import { fetchDevices } from '../features/device/api/deviceApi';
import { thresholdApi, type ThresholdData } from '../features/threshold/api/thresholdApi';
import { taskApi, type AppTask } from '../features/task/taskApi';
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
  { id: 'temp', label: 'Nhiệt độ', icon: <Thermometer className="text-red-500" />, unit: '°C' },
  { id: 'light', label: 'Ánh sáng', icon: <Sun className="text-orange-500" />, unit: '%' },
  { id: 'moisture', label: 'Độ ẩm KK', icon: <Droplets className="text-blue-500" />, unit: '%' },
  { id: 'soil_moisture', label: 'Độ ẩm đất', icon: <Sprout className="text-emerald-500" />, unit: '%' },
];

export const OwnerAreaPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'devices' | 'tasks'>('devices');
  
  const [areas, setAreas] = useState<AreaData[]>([]);
  const [devices, setDevices] = useState<DeviceData[]>([]);
  const [tasks, setTasks] = useState<AppTask[]>([]);
  const [selectedAreaId, setSelectedAreaId] = useState<number | null>(null);

  const [isThresholdModalOpen, setIsThresholdModalOpen] = useState(false);
  const [loadingThresholds, setLoadingThresholds] = useState(false);
  const [savingThresholds, setSavingThresholds] = useState(false);
  const [thresholds, setThresholds] = useState<Record<string, { min: string; max: string }>>({
    temp: { min: '', max: '' }, light: { min: '', max: '' },
    moisture: { min: '', max: '' }, soil_moisture: { min: '', max: '' }
  });

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [savingTask, setSavingTask] = useState(false);
  const [editingTask, setEditingTask] = useState<AppTask | null>(null);
  const [taskForm, setTaskForm] = useState<{
    title: string;
    description: string;
    scheduled_at: string;
    status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  }>({
    title: '', description: '', scheduled_at: '', status: 'PENDING'
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [areasRes, devicesRes, tasksRes] = await Promise.all([
        areaApi.getAll(), fetchDevices(), taskApi.getAll()
      ]);
      setAreas(areasRes);
      setDevices(devicesRes);
      setTasks(tasksRes);
      if (areasRes.length > 0 && !selectedAreaId) setSelectedAreaId(areasRes[0].id);
    } catch (error) {
      console.error("Lỗi:", error);
      alert( axios.isAxiosError(error) ? error.response?.data?.error : "Đã xảy ra lỗi!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const currentAreaDevices = useMemo(() => {
    if (!selectedAreaId) return [];
    return devices.filter(d => d.area_id === selectedAreaId);
  }, [devices, selectedAreaId]);

  const currentAreaTasks = useMemo(() => {
    if (!selectedAreaId) return [];
    return tasks.filter(t => t.area_id === selectedAreaId);
  }, [tasks, selectedAreaId]);

  // ===================== LOGIC NGƯỠNG =====================
  const handleOpenThresholdModal = async () => {
    if (!selectedAreaId) return;
    setIsThresholdModalOpen(true);
    setLoadingThresholds(true);
    try {
      const data = await thresholdApi.getAreaThresholds(selectedAreaId);
      const newState: Record<string, { min: string; max: string }> = {
        temp: { min: '', max: '' }, light: { min: '', max: '' },
        moisture: { min: '', max: '' }, soil_moisture: { min: '', max: '' }
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
      console.error(error);
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
          area_id: selectedAreaId, sensor_type: sensor.id,
          min_value: data.min !== '' ? parseFloat(data.min) : null,
          max_value: data.max !== '' ? parseFloat(data.max) : null
        });
      });
      await Promise.all(savePromises);
      setIsThresholdModalOpen(false);
    } catch (error) {
      console.error("Lỗi:", error);
      alert( axios.isAxiosError(error) ? error.response?.data?.error : "Đã xảy ra lỗi!");
    } finally {
      setSavingThresholds(false);
    }
  };

  const handleThresholdChange = (sensorId: string, field: 'min' | 'max', value: string) => {
    setThresholds(prev => ({ ...prev, [sensorId]: { ...prev[sensorId], [field]: value } }));
  };

  // ===================== LOGIC CÔNG VIỆC =====================
  const handleOpenTaskModal = (task?: AppTask) => {
    if (task) {
      setEditingTask(task);
      const localTime = new Date(task.scheduled_at);
      const formattedTime = new Date(localTime.getTime() - localTime.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
      
      setTaskForm({
        title: task.title,
        description: task.description || '',
        scheduled_at: formattedTime,
        status: task.status
      });
    } else {
      setEditingTask(null);
      setTaskForm({ title: '', description: '', scheduled_at: '', status: 'PENDING' });
    }
    setIsTaskModalOpen(true);
  };

  const handleSaveTask = async () => {
    if (!selectedAreaId || !taskForm.title || !taskForm.scheduled_at) {
      alert("Vui lòng điền Tiêu đề và Thời gian!");
      return;
    }
    setSavingTask(true);
    try {
      const payload = { ...taskForm, area_id: selectedAreaId };
      if (editingTask) {
        await taskApi.update(editingTask.id, payload);
      } else {
        await taskApi.create(payload);
      }
      await loadData();
      setIsTaskModalOpen(false);
    } catch (error) {
      alert( axios.isAxiosError(error) ? error.response?.data?.error : "Đã xảy ra lỗi!");
    } finally {
      setSavingTask(false);
    }
  };

  const handleDeleteTask = async (id: number) => {
    if (!window.confirm("Bạn có chắc muốn xóa công việc này?")) return;
    try {
      await taskApi.delete(id);
      await loadData();
    } catch (error) {
      console.error("Lỗi:", error);
      alert( axios.isAxiosError(error) ? error.response?.data?.error : "Đã xảy ra lỗi!");
    }
  };

  const handleToggleTaskStatus = async (task: AppTask) => {
    const newStatus = task.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
    try {
      await taskApi.updateStatus(task.id, newStatus);
      await loadData();
    } catch (error) {
      console.error("Lỗi:", error);
      alert( axios.isAxiosError(error) ? error.response?.data?.error : "Đã xảy ra lỗi!");
    }
  };

  // Helper UI
  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'pump': return <Droplets className="text-blue-500" />;
      case 'light': return <Sun className="text-orange-500" />;
      case 'fan': return <Wind className="text-teal-500" />;
      case 'sensor': return <Thermometer className="text-purple-500" />;
      default: return <Cpu className="text-gray-500" />;
    }
  };

  return (
    <div className="p-8 flex-1 flex flex-col gap-6 bg-gray-50 overflow-hidden h-full relative">
      
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-brand-green uppercase">Khu vực của tôi</h2>
        </div>
        <button onClick={loadData} className="p-2.5 bg-white border border-gray-200 rounded-xl text-brand-green hover:bg-gray-100 shadow-sm transition-colors cursor-pointer">
          <RefreshCw size={20} className={cn(loading && "animate-spin")} />
        </button>
      </div>

      <div className="flex flex-1 gap-6 overflow-hidden">
        <div className="w-1/3 bg-white rounded-3xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
          <div className="p-5 border-b border-gray-100 bg-gray-50 flex items-center gap-2 shrink-0">
            <Map size={18} className="text-gray-700" />
            <h3 className="font-bold text-gray-800">Danh sách Phân khu</h3>
          </div>

          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 custom-scrollbar">
            {areas.length === 0 ? (
              <div className="text-center mt-10 text-gray-400 text-sm">Chưa có khu vực nào.</div>
            ) : (
              areas.map(area => (
                <div 
                  key={area.id} onClick={() => setSelectedAreaId(area.id)}
                  className={cn("p-4 rounded-xl border-2 cursor-pointer transition-all", selectedAreaId === area.id ? "border-brand-green bg-green-50" : "border-transparent bg-gray-50 hover:bg-gray-100")}
                >
                  <p className={cn("font-bold text-base", selectedAreaId === area.id ? "text-brand-green" : "text-gray-800")}>{area.name}</p>
                  <p className="text-xs text-gray-500 mt-1.5 line-clamp-2">{area.description || 'Chưa có mô tả'}</p>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="w-2/3 bg-white rounded-3xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
          {!selectedAreaId ? (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
              <Map size={48} className="mb-4 text-gray-300" />
              <p className="font-semibold text-lg">Chưa chọn khu vực</p>
            </div>
          ) : (
            <>
              <div className="border-b border-gray-100 bg-white shrink-0 px-6 pt-4">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">{areas.find(a => a.id === selectedAreaId)?.name}</h3>
                  </div>
                  {activeTab === 'devices' ? (
                    <button onClick={handleOpenThresholdModal} className="flex items-center gap-2 bg-brand-green text-white px-4 py-2 rounded-xl font-bold hover:bg-green-700 text-sm cursor-pointer transition-colors">
                      <Settings size={16} /> Ngưỡng tự động
                    </button>
                  ) : (
                    <button onClick={() => handleOpenTaskModal()} className="flex items-center gap-2 bg-brand-green text-white px-4 py-2 rounded-xl font-bold hover:bg-green-700 text-sm cursor-pointer transition-colors">
                      <Plus size={16} /> Thêm công việc
                    </button>
                  )}
                </div>

                <div className="flex gap-6">
                  <button onClick={() => setActiveTab('devices')} className={cn("pb-3 px-1 font-bold border-b-2 transition-colors", activeTab === 'devices' ? "border-brand-green text-brand-green" : "border-transparent text-gray-400 hover:text-gray-600")}>
                    Thiết bị IoT
                  </button>
                  <button onClick={() => setActiveTab('tasks')} className={cn("pb-3 px-1 font-bold border-b-2 transition-colors", activeTab === 'tasks' ? "border-brand-green text-brand-green" : "border-transparent text-gray-400 hover:text-gray-600")}>
                    Lịch trình ({currentAreaTasks.length})
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50 custom-scrollbar">

                {activeTab === 'devices' && (
                  currentAreaDevices.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400">
                      <Cpu size={48} className="mb-4 text-gray-200" />
                      <p className="font-semibold">Khu vực này chưa lắp đặt thiết bị nào</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                      {currentAreaDevices.map(device => (
                        <div key={device.id} className="p-4 bg-white border border-gray-100 rounded-2xl flex items-center justify-between shadow-sm">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-100">
                              {getDeviceIcon(device.type)}
                            </div>
                            <div>
                              <p className="font-bold text-gray-800">{device.device_name}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-[10px] px-2 py-0.5 rounded-md font-bold uppercase bg-gray-100 text-gray-600">{device.type}</span>
                                <span className={cn("text-[10px] px-2 py-0.5 rounded-md font-bold uppercase", device.status ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700")}>
                                  {device.status ? 'Kết nối' : 'Mất tín hiệu'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                )}

                {activeTab === 'tasks' && (
                  currentAreaTasks.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400">
                      <ListTodo size={48} className="mb-4 text-gray-200" />
                      <p className="font-semibold">Chưa có công việc nào được lên lịch</p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {currentAreaTasks.map(task => (
                        <div key={task.id} className={cn("p-4 bg-white border rounded-2xl flex items-start gap-4 transition-all shadow-sm hover:shadow-md", task.status === 'COMPLETED' ? "border-gray-200 opacity-60" : "border-gray-100")}>
                          <button onClick={() => handleToggleTaskStatus(task)} className="mt-1 shrink-0 cursor-pointer">
                            {task.status === 'COMPLETED' ? <CheckCircle2 size={24} className="text-brand-green" /> : <Circle size={24} className="text-gray-300 hover:text-brand-green" />}
                          </button>
                          
                          <div className="flex-1 min-w-0">
                            <p className={cn("font-bold text-base truncate", task.status === 'COMPLETED' ? "text-gray-500 line-through" : "text-gray-800")}>{task.title}</p>
                            {task.description && <p className="text-sm text-gray-500 mt-1 line-clamp-1">{task.description}</p>}
                            <div className="flex items-center gap-3 mt-2">
                              <span className="flex items-center gap-1 text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
                                <Clock size={12} />
                                {new Date(task.scheduled_at).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' })}
                              </span>
                              <span className={cn("text-[10px] font-bold px-2 py-1 rounded-md", 
                                task.status === 'PENDING' ? 'bg-orange-100 text-orange-700' : 
                                task.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                              )}>
                                {task.status}
                              </span>
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <button onClick={() => handleOpenTaskModal(task)} className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"><Edit2 size={16} /></button>
                            <button onClick={() => handleDeleteTask(task.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"><Trash2 size={16} /></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                )}

              </div>
            </>
          )}
        </div>
      </div>

      {/* ===================== MODAL CẤU HÌNH NGƯỠNG ===================== */}
      {isThresholdModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            {/* Giữ nguyên phần Modal ngưỡng của bạn ở đây... */}
             <div className="bg-white rounded-3xl shadow-xl w-full max-w-2xl overflow-hidden">
             <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-brand-green">
               <div className="flex items-center gap-2 text-white">
                 <Settings size={20} />
                 <h3 className="font-bold">
                   Cấu hình ngưỡng - {areas.find(a => a.id === selectedAreaId)?.name}
                 </h3>
               </div>
               <button onClick={() => setIsThresholdModalOpen(false)} className="text-white/70 hover:text-white cursor-pointer"><X size={20} /></button>
             </div>
             
             <div className="p-6 max-h-[60vh] overflow-y-auto custom-scrollbar bg-gray-50">
               {loadingThresholds ? (
                 <div className="flex justify-center p-8"><RefreshCw className="animate-spin text-brand-green" /></div>
               ) : (
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                   {SENSOR_TYPES.map(sensor => (
                     <div key={sensor.id} className="p-4 bg-white border border-gray-200 rounded-2xl shadow-sm focus-within:border-brand-green transition-colors">
                       <div className="flex items-center gap-2 mb-4">
                         <div className="p-1.5 bg-gray-50 border border-gray-100 rounded-lg">{sensor.icon}</div>
                         <h4 className="font-bold text-gray-700 text-sm">{sensor.label}</h4>
                       </div>
                       <div className="flex gap-3">
                         <div className="flex-1">
                           <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">Min</label>
                           <div className="relative">
                             <input 
                               type="number" step="0.1" placeholder="Trống"
                               value={thresholds[sensor.id].min}
                               onChange={e => handleThresholdChange(sensor.id, 'min', e.target.value)}
                               className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-brand-green text-sm font-bold text-gray-700"
                             />
                           </div>
                         </div>
                         <div className="flex-1">
                           <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">Max</label>
                           <div className="relative">
                             <input 
                               type="number" step="0.1" placeholder="Trống"
                               value={thresholds[sensor.id].max}
                               onChange={e => handleThresholdChange(sensor.id, 'max', e.target.value)}
                               className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-brand-green text-sm font-bold text-gray-700"
                             />
                           </div>
                         </div>
                       </div>
                     </div>
                   ))}
                 </div>
               )}
             </div>
 
             <div className="p-5 border-t border-gray-100 bg-white flex justify-end gap-3">
               <button onClick={() => setIsThresholdModalOpen(false)} className="px-5 py-2.5 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 cursor-pointer transition-colors">Hủy bỏ</button>
               <button 
                 onClick={handleSaveThresholds} disabled={savingThresholds || loadingThresholds}
                 className="px-6 py-2.5 rounded-xl font-bold text-white bg-brand-green hover:bg-green-700 flex items-center gap-2 disabled:opacity-70 cursor-pointer transition-colors"
               >
                 {savingThresholds ? <RefreshCw size={18} className="animate-spin" /> : <Save size={18} />}
                 Lưu
               </button>
             </div>
           </div>
        </div>
      )}

      {/* ===================== MODAL THÊM/SỬA CÔNG VIỆC ===================== */}
      {isTaskModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-brand-green">
              <div className="flex items-center gap-2 text-white">
                <ListTodo size={20} />
                <h3 className="font-bold">
                  {editingTask ? 'Cập nhật công việc' : 'Thêm công việc mới'}
                </h3>
              </div>
              <button onClick={() => setIsTaskModalOpen(false)} className="text-white/70 hover:text-white cursor-pointer"><X size={20} /></button>
            </div>
            
            <div className="p-6 flex flex-col gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Tiêu đề <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  value={taskForm.title} onChange={e => setTaskForm({...taskForm, title: e.target.value})}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-brand-green text-gray-800"
                  placeholder="Vd: Tưới nước luống số 1"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Thời gian thực hiện <span className="text-red-500">*</span></label>
                <input 
                  type="datetime-local" 
                  value={taskForm.scheduled_at} onChange={e => setTaskForm({...taskForm, scheduled_at: e.target.value})}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-brand-green text-gray-800"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Trạng thái</label>
                <select 
                  value={taskForm.status} onChange={e => setTaskForm({...taskForm, status: e.target.value as 'PENDING' | 'IN_PROGRESS' | 'COMPLETED'})}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-brand-green text-gray-800"
                >
                  <option value="PENDING">Đang chờ (Pending)</option>
                  <option value="IN_PROGRESS">Đang làm (In Progress)</option>
                  <option value="COMPLETED">Hoàn thành (Completed)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Mô tả thêm</label>
                <textarea 
                  rows={3}
                  value={taskForm.description} onChange={e => setTaskForm({...taskForm, description: e.target.value})}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-brand-green text-gray-800 custom-scrollbar"
                  placeholder="Ghi chú thêm (không bắt buộc)"
                />
              </div>
            </div>

            <div className="p-5 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
              <button onClick={() => setIsTaskModalOpen(false)} className="px-5 py-2.5 rounded-xl font-bold text-gray-600 bg-white border border-gray-200 hover:bg-gray-100 cursor-pointer transition-colors">Hủy</button>
              <button 
                onClick={handleSaveTask} disabled={savingTask}
                className="px-6 py-2.5 rounded-xl font-bold text-white bg-brand-green hover:bg-green-700 flex items-center gap-2 disabled:opacity-70 cursor-pointer transition-colors"
              >
                {savingTask ? <RefreshCw size={18} className="animate-spin" /> : <Save size={18} />}
                Lưu công việc
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};