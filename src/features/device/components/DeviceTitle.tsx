import React from 'react';
import device from "../../../assets/device/device.png"

export const DeviceCard: React.FC = () => {
    return (
        <div className="relative rounded-2xl overflow-hidden shadow-lg h-72">
            <img
                src={device}
                alt="Background"
                className="w-full h-full object-cover"
            />
            <div className="absolute bottom-2 left-6">
                <h1 className="text-white text-7xl font-extrabold tracking-tight">Thiết bị</h1>
            </div>
        </div>
    );
};