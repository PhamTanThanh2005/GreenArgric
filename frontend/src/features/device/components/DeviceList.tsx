// src/features/device/components/DeviceList.tsx
import React, { useState } from 'react';
import { DeviceCard } from './DeviceCard';
import denled from '../../../assets/device/denled.png';
import maybom from '../../../assets/device/maybom.png';
import { overrideDevice } from '../api/deviceApi';
import { type DeviceData } from '../../../pages/ControlDevicePage';
import { Clock, X, Zap } from 'lucide-react';

interface DeviceListProps {
  devices: DeviceData[];
  onDeviceUpdate: (deviceId: number, newMode: 'ON' | 'OFF') => void;
}

export const DeviceList: React.FC<DeviceListProps> = ({ devices, onDeviceUpdate }) => {
  const [activeCardId, setActiveCardId] = useState<number | null>(null);
  const [loadingIds, setLoadingIds] = useState<number[]>([]);

  const [deviceToToggle, setDeviceToToggle] = useState<{ id: number, currentMode: 'ON' | 'OFF', name: string } | null>(null);
  const [overrideHours, setOverrideHours] = useState<number>(1);

  const initiateToggle = (deviceId: number, currentMode: 'ON' | 'OFF', deviceName: string) => {
    setDeviceToToggle({ id: deviceId, currentMode, name: deviceName });
    setOverrideHours(1);
  };

  const handleConfirmToggle = async () => {
    if (!deviceToToggle) return;

    const { id: deviceId, currentMode } = deviceToToggle;
    const newMode = currentMode === 'ON' ? 'OFF' : 'ON';

    setDeviceToToggle(null);
    setActiveCardId(deviceId);
    setLoadingIds(prev => [...prev, deviceId]);

    const now = new Date();
    now.setMinutes(now.getMinutes() + Math.round(overrideHours * 60));

    const expireTime = now.toISOString();

    try {
      await overrideDevice(deviceId, newMode, expireTime);
      onDeviceUpdate(deviceId, newMode);
    } catch (error) {
      console.error("Chi tiết lỗi:", error);
      alert("Lỗi! Không thể điều khiển thiết bị. Hãy kiểm tra kết nối MQTT hoặc Server.");
    } finally {
      setLoadingIds(prev => prev.filter(id => id !== deviceId));
    }
  };
  const getDeviceUI = (type: string) => {
    switch (type) {
      case 'pump':
        return { image: maybom };
      case 'light':
        return { image: denled };
      default:
        return { image: denled };
    }
  };

  return (
    <>
      <div className="flex flex-wrap gap-6 py-4 bg-white">

        {devices.map(device => {
          const ui = getDeviceUI(device.type);
          const isLoading = loadingIds.includes(device.id);

          return (
            <DeviceCard
              key={device.id}
              title={device.device_name}
              image={ui.image}
              status={device.mode}
              isActive={activeCardId === device.id}
              isLoading={isLoading}
              onToggleClick={() => initiateToggle(device.id, device.mode, device.device_name)}
              onDetailClick={() => console.log(`Chi tiết: ${device.device_name}`)}
            />
          );
        })}

        <div className="w-85 h-75 rounded-4xl bg-[#eef7ef] border-2 border-dashed border-brand-green/50 flex items-center justify-center cursor-pointer hover:bg-[#e4f3e5] transition-colors">
          <span className="text-brand-green font-bold">+ Thêm thiết bị</span>
        </div>

      </div>

      {deviceToToggle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <div className="flex items-center gap-2 text-brand-green">
                <Zap size={20} className="fill-current" />
                <h3 className="font-bold">Điều khiển thủ công</h3>
              </div>
              <button onClick={() => setDeviceToToggle(null)} className="text-gray-400 hover:text-red-500 transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 flex flex-col gap-4">
              <p className="text-gray-600 text-sm">
                Bạn đang muốn <strong className={deviceToToggle.currentMode === 'ON' ? 'text-red-500' : 'text-brand-green'}>
                  {deviceToToggle.currentMode === 'ON' ? 'TẮT' : 'BẬT'}
                </strong> thiết bị <strong className="text-gray-800">{deviceToToggle.name}</strong>.
                Vui lòng chọn thời gian vô hiệu hóa chế độ tự động:
              </p>

              <div>
                <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                  <Clock size={16} className="text-gray-500" /> Thời gian duy trì (Tiếng)
                </label>
                <select
                  value={overrideHours}
                  onChange={(e) => setOverrideHours(Number(e.target.value))}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-brand-green focus:ring-1 focus:ring-brand-green cursor-pointer font-medium text-gray-700"
                >
                  <option value={1 / 60}>1 phút</option> // Demo
                  <option value={1 / 6}>10 phút</option>
                  <option value={1 / 4}>15 phút</option>
                  <option value={1 / 3}>20 phút</option>
                  <option value={1 / 2}>30 phút</option>
                  <option value={1}>1 tiếng</option>
                  <option value={2}>2 tiếng</option>
                  <option value={4}>4 tiếng</option>
                  <option value={8}>8 tiếng</option>
                  <option value={12}>12 tiếng</option>
                  <option value={24}>24 tiếng (1 ngày)</option>
                </select>
              </div>
            </div>

            <div className="p-5 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
              <button
                onClick={() => setDeviceToToggle(null)}
                className="px-5 py-2.5 rounded-xl font-bold text-gray-600 bg-white border border-gray-200 hover:bg-gray-100 transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleConfirmToggle}
                className="px-5 py-2.5 rounded-xl font-bold text-white bg-brand-green hover:bg-green-700 transition-colors shadow-sm"
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};