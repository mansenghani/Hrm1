import React, { useState, useEffect, useRef } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

const CustomDatePicker = ({ name, value, onChange, maxDate, className, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Parse initial date carefully
  const getInitialDate = () => {
    if (value) {
      const [y, m, d] = value.split('-');
      return new Date(y, m - 1, d);
    }
    return new Date();
  };

  const [currentMonth, setCurrentMonth] = useState(getInitialDate());
  const wrapperRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const startDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const handlePrevMonth = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const pad = (n) => n.toString().padStart(2, '0');

  const handleDateSelect = (day) => {
    const dateString = `${currentMonth.getFullYear()}-${pad(currentMonth.getMonth() + 1)}-${pad(day)}`;
    if (maxDate && dateString > maxDate) return;
    onChange({ target: { name, value: dateString } });
    setIsOpen(false);
  };

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const totalDays = daysInMonth(year, month);
  const startDay = startDayOfMonth(year, month);

  const days = [];
  for (let i = 0; i < startDay; i++) {
    days.push(null);
  }
  for (let i = 1; i <= totalDays; i++) {
    days.push(i);
  }

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const displayValue = value ? value.split('-').reverse().join('-') : '';
  const todayString = `${new Date().getFullYear()}-${pad(new Date().getMonth() + 1)}-${pad(new Date().getDate())}`;

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <div
        className={`${className} flex items-center cursor-pointer select-none`}
        onClick={() => setIsOpen(!isOpen)}
        tabIndex={0}
      >
        <Calendar size={18} className="absolute left-4 text-[#939084]" />
        <div className="pl-12 pr-4 w-full text-left">
          {displayValue ? (
            <span className="text-[#201515]">{displayValue}</span>
          ) : (
            <span className="text-gray-400">{placeholder}</span>
          )}
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-50 mt-2 p-5 bg-white border border-[#eceae3] rounded-2xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] w-80">
          <div className="flex justify-between items-center mb-6">
            <button type="button" onClick={handlePrevMonth} className="p-2 hover:bg-[#eceae3] rounded-full transition-colors cursor-pointer">
              <ChevronLeft size={20} className="text-[#201515]" />
            </button>
            <div className="flex items-center gap-1 font-bold text-[#201515] text-[16px] tracking-wide">
              <select
                value={month}
                onChange={(e) => {
                  e.stopPropagation();
                  setCurrentMonth(new Date(year, parseInt(e.target.value), 1));
                }}
                className="bg-transparent outline-none cursor-pointer hover:text-[#ff4f00] transition-colors appearance-none text-center px-1"
              >
                {monthNames.map((m, i) => (
                  <option key={m} value={i} className="text-[#201515]">{m}</option>
                ))}
              </select>
              <select
                value={year}
                onChange={(e) => {
                  e.stopPropagation();
                  setCurrentMonth(new Date(parseInt(e.target.value), month, 1));
                }}
                className="bg-transparent outline-none cursor-pointer hover:text-[#ff4f00] transition-colors appearance-none text-center px-1"
              >
                {Array.from({ length: 120 }, (_, i) => new Date().getFullYear() - 100 + i).map(y => (
                  <option key={y} value={y} className="text-[#201515]">{y}</option>
                ))}
              </select>
            </div>
            <button type="button" onClick={handleNextMonth} className="p-2 hover:bg-[#eceae3] rounded-full transition-colors cursor-pointer">
              <ChevronRight size={20} className="text-[#201515]" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-2 mb-3">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
              <div key={d} className="text-center text-[11px] font-bold text-[#939084] uppercase tracking-wider">{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-y-2 gap-x-1">
            {days.map((day, idx) => {
              if (!day) return <div key={`empty-${idx}`} className="h-9 w-9"></div>;

              const dateString = `${year}-${pad(month + 1)}-${pad(day)}`;
              const isSelected = value === dateString;
              const isToday = todayString === dateString;
              const isDisabled = maxDate && dateString > maxDate;

              return (
                <button
                  type="button"
                  key={idx}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (!isDisabled) handleDateSelect(day);
                  }}
                  disabled={isDisabled}
                  className={`
                    h-9 w-9 flex mx-auto items-center justify-center rounded-full text-[14px] font-semibold transition-all
                    ${isDisabled ? 'text-[#c5c0b1] opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                    ${isSelected ? 'bg-[#ff4f00] text-white shadow-lg shadow-[#ff4f00]/30 scale-110' : ''}
                    ${!isSelected && !isDisabled ? 'hover:bg-[#fffdf9] hover:border hover:border-[#ff4f00] text-[#201515]' : ''}
                    ${isToday && !isSelected ? 'border-2 border-[#ff4f00]/30 text-[#ff4f00]' : ''}
                  `}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomDatePicker;
