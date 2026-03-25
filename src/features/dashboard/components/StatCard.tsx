import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
    icon: LucideIcon;
    label: string;
    value: string;
    unit: string;
    trend?: 'up' | 'down';
}

export const StatCard: React.FC<StatCardProps> = ({ icon: Icon, label, value, unit, trend }) => {
    const TrendIcon = trend === 'up' ? ArrowUpRight : ArrowDownRight;
    
    return (
        <div className="relative overflow-hidden bg-second-green/20 rounded-xl shadow-md px-8 py-5 flex flex-col gap-3">

            <div className="absolute top-0 right-0 h-11 w-11 bg-second-green/40 rounded-bl-xl flex items-center justify-center">
                <TrendIcon size={25} className="text-brand-green" />
            </div>
      
            <div className="flex items-center justify-between text-brand-green">
                <div className="flex items-center gap-4">
                    <Icon size={24} className="stroke-[1.5px]" />
                    <span className="text-xl font-bold">{label}</span>
                </div>
            </div>

            <div className="flex justify-center items-baseline gap-1 mt-2">
                <span className="text-6xl font-extrabold text-brand-red tracking-tight">{value}</span>
                <span className="text-4xl font-normal text-brand-red tracking-tight">{unit}</span>
            </div>
            
        </div>
    );
};