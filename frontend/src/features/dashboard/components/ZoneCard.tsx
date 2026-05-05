import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ThermometerSun, Droplets } from 'lucide-react';

interface ZoneCardProps {
    id: string;
    name: string;
    temp: number;
    humidity: number;
    status: 'normal' | 'warning' | 'error';
    image?: string;
}

const DEFAULT_IMAGE = "../../../../images/default-zone.jpg";

export const ZoneCard: React.FC<ZoneCardProps> = ({
    id,
    name,
    temp,
    humidity,
    status,
    image = DEFAULT_IMAGE
}) => {
    const navigate = useNavigate();

    const statusColors = {
        normal: 'bg-brand-green text-white border-brand-green',
        warning: 'bg-yellow-600 text-white border-yellow-600',
        error: 'bg-brand-red text-white border-brand-red',
    };

    return (
        <div
            onClick={() => navigate(`/zones/${id}`)}
            className="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md cursor-pointer transition-all duration-200 flex flex-row items-center gap-6"
        >

            <div className="w-1/3 shrink-0 h-32 overflow-hidden rounded-xl bg-gray-100">
                <img
                    src={image}
                    alt={name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
            </div>

            <div className="flex-1 flex flex-col justify-center">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-gray-800">{name}</h3>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium border ${statusColors[status]}`}>
                        {status === 'normal' ? 'Tốt' : status === 'warning' ? 'Cảnh báo' : 'Lỗi'}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-orange-50 rounded-lg text-brand-red">
                            <ThermometerSun size={20} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-700">Nhiệt độ</p>
                            <p className="font-semibold text-brand-green text-xl">{temp}°C</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-blue-50 rounded-lg text-blue-700">
                            <Droplets size={20} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-700">Độ ẩm</p>
                            <p className="font-semibold text-brand-green text-xl">{humidity}%</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};