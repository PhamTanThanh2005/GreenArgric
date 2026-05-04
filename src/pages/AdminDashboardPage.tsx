import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, Cpu, Server, CheckCircle2,
  RefreshCw, UserPlus, Sliders, Activity,
  PowerOff
} from 'lucide-react';

// APIs & Utils
import axiosClient from '../services/axiosClient';
import { StatCard } from '../features/dashboard/components/StatCard';
import { areaApi } from '../features/dashboard/api/areaApi';
import { fetchDevices } from '../features/device/api/deviceApi';
import { activityApi } from '../features/dashboard/api/activityApi';

interface UserData {
  id: number;
  username: string;
  name: string;
  email: string;
  phone: string;
  role: string;
}

interface DeviceData {
  id: number;
  device_name: string;
  type: string;
  status: number;
  area_name: string;
  mode: 'ON' | 'OFF';
}

export const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    totalUsers: 0,
    adminCount: 0,
    ownerCount: 0,
    totalZones: 0,
  });

  const [deviceHealth, setDeviceHealth] = useState({
    total: 0,
    on: 0,
    off: 0
  });


  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [usersData, areas, devicesRaw] = await Promise.all([
        axiosClient.get('/user').then(res => res.data as UserData[]).catch(() => []),
        areaApi.getAll().catch(() => []),
        fetchDevices().catch(() => []),
        activityApi.getAll().catch(() => [])
      ]);

      const devices = devicesRaw as DeviceData[];
      const admins = usersData.filter(u => u.role === 'admin').length;
      const owners = usersData.filter(u => u.role === 'owner').length;
      const devicesOn = devices.filter(d => d.mode === 'ON').length;

      setStats({
        totalUsers: usersData.length,
        adminCount: admins,
        ownerCount: owners,
        totalZones: areas.length,
      });

      setDeviceHealth({
        total: devices.length,
        on: devicesOn,
        off: devices.length - devicesOn
      });


    } catch (error) {
      console.error("Lỗi khi tải dữ liệu Admin Dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
    const interval = setInterval(loadAdminData, 60000); // Refesh sau 1 phút
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex justify-center items-center bg-gray-50">
        <RefreshCw className="w-8 h-8 text-brand-green animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-8 flex-1 flex flex-col gap-6 bg-gray-50 overflow-y-auto h-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-4xl font-bold text-brand-green uppercase">Tổng quan Quản trị</h2>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/admin/users')} className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-xl shadow-sm text-gray-700 hover:bg-gray-50 border border-gray-200 transition-all font-semibold cursor-pointer">
            <UserPlus size={18} className="text-blue-600" /> Quản lý User
          </button>
          <button onClick={() => navigate('/admin/thresholds')} className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-xl shadow-sm text-gray-700 hover:bg-gray-50 border border-gray-200 transition-all font-semibold cursor-pointer">
            <Sliders size={18} className="text-orange-500" /> Cài đặt ngưỡng
          </button>
          <button onClick={loadAdminData} className="flex items-center gap-2 bg-brand-green px-4 py-2.5 rounded-xl shadow-sm text-white hover:bg-green-700 transition-all font-bold cursor-pointer">
            <RefreshCw size={18} /> Làm mới
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Server} label="Phân khu hoạt động" value={stats.totalZones.toString()} unit="Khu" />
        <StatCard icon={Users} label="Tổng Tài khoản" value={stats.totalUsers.toString()} unit="User" />
        <StatCard icon={Cpu} label="Thiết bị phần cứng" value={deviceHealth.total.toString()} unit="Máy" />
        <StatCard icon={Activity} label="Thiết bị đang BẬT" value={deviceHealth.on.toString()} unit="Máy" />
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="flex flex-col gap-6">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
              <Cpu className="text-brand-green" /> Trạng thái hoạt động thiết bị
            </h3>

            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 font-medium">Tỷ lệ thiết bị đang BẬT</span>
              <span className="text-xl font-extrabold text-brand-green">
                {deviceHealth.total > 0 ? Math.round((deviceHealth.on / deviceHealth.total) * 100) : 0}%
              </span>
            </div>

            <div className="w-full h-4 bg-gray-100 rounded-full overflow-hidden flex mb-6">
              <div
                className="bg-brand-green h-full transition-all duration-1000"
                style={{ width: `${(deviceHealth.on / deviceHealth.total) * 100}%` }}
              ></div>
              <div
                className="bg-gray-300 h-full transition-all duration-1000"
                style={{ width: `${(deviceHealth.off / deviceHealth.total) * 100}%` }}
              ></div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-green-50 border border-green-100 flex items-center gap-4">
                <div className="p-3 bg-green-100 text-green-600 rounded-xl"><CheckCircle2 size={24} /></div>
                <div>
                  <p className="text-sm text-gray-500 font-semibold">Đang BẬT</p>
                  <p className="text-2xl font-bold text-green-700">{deviceHealth.on}</p>
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 flex items-center gap-4">
                <div className="p-3 bg-gray-200 text-gray-500 rounded-xl"><PowerOff size={24} /></div>
                <div>
                  <p className="text-sm text-gray-500 font-semibold">Đang TẮT</p>
                  <p className="text-2xl font-bold text-gray-700">{deviceHealth.off}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <Users className="text-blue-500" /> Cơ cấu Người dùng
              </h3>
              <button onClick={() => navigate('/admin/users')} className="text-sm font-bold text-blue-600 hover:underline cursor-pointer">
                Quản lý chi tiết
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex justify-between items-center p-4 border border-gray-100 rounded-xl">
                <span className="font-semibold text-gray-600">Quản trị viên (Admin)</span>
                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-bold">{stats.adminCount}</span>
              </div>
              <div className="flex justify-between items-center p-4 border border-gray-100 rounded-xl">
                <span className="font-semibold text-gray-600">Chủ vườn (Owner)</span>
                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full font-bold">{stats.ownerCount}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};