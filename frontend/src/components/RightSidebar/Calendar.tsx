import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../utils';

const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wen', 'Thu', 'Fri', 'Sat'];

export const Calendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const today = new Date();
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); 
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const prevMonthDays = Array.from(
    { length: firstDayIndex }, 
    (_, i) => daysInPrevMonth - firstDayIndex + i + 1
  );
  
  const currentDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  
  const totalDaysSoFar = prevMonthDays.length + currentDays.length;
  const nextMonthDays = Array.from({ length: 42 - totalDaysSoFar }, (_, i) => i + 1);

  const monthName = currentDate.toLocaleString('en-US', { month: 'long' });

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  return (
    <div className="p-4 bg-brand-green/10 rounded-xl flex flex-col gap-4">
      <div className="flex items-center justify-center text-brand-green">
        <h3 className="text-xl font-bold uppercase">Calendar</h3>
      </div>
      
      <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <button onClick={handlePrevMonth} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
              <ChevronLeft size={20} className='text-brand-green'/>
            </button>
            <h4 className="text-lg font-semibold text-black">
              {monthName} {year}
            </h4>
            <button onClick={handleNextMonth} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
              <ChevronRight size={20} className='text-brand-green'/>
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center mb-1">
            {daysOfWeek.map((day, idx) => (
              <div key={idx} className="text-sm font-bold text-brand-green">{day}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-y-2 gap-x-1 text-center">
            
            {prevMonthDays.map((day, idx) => (
               <div key={`prev-${idx}`} className='text-sm text-gray-400 font-medium py-1.5'>
                 {day}
               </div>
            ))}
            
            {currentDays.map((day) => {
              const isToday = 
                day === today.getDate() && 
                month === today.getMonth() && 
                year === today.getFullYear();

              return (
                <div
                  key={`curr-${day}`}
                  className={cn(
                    'text-sm font-medium py-1.5 cursor-pointer hover:bg-brand-green/10 rounded-full transition-colors',
                    isToday ? 'bg-brand-green text-white font-bold hover:bg-brand-green/90 shadow-sm' : 'text-gray-800'
                  )}
                >
                  {day}
                </div>
              );
            })}

            {nextMonthDays.map((day, idx) => (
               <div key={`next-${idx}`} className='text-sm text-gray-400 font-medium py-1.5'>
                 {day}
               </div>
            ))}

          </div>
      </div>
    </div>
  );
};