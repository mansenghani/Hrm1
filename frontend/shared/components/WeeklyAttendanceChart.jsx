import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { ChevronDown } from 'lucide-react';

const datasets = {
  this_week: [
    { name: 'Mon', Present: 140, Leave: 10, Absent: 8 },
    { name: 'Tue', Present: 148, Leave: 6, Absent: 5 },
    { name: 'Wed', Present: 150, Leave: 5, Absent: 3 },
    { name: 'Thu', Present: 144, Leave: 8, Absent: 6 },
    { name: 'Fri', Present: 138, Leave: 12, Absent: 9 },
    { name: 'Sat', Present: 60, Leave: 2, Absent: 1 },
    { name: 'Sun', Present: 0, Leave: 0, Absent: 0 },
  ],
  last_week: [
    { name: 'Mon', Present: 138, Leave: 12, Absent: 9 },
    { name: 'Tue', Present: 142, Leave: 8, Absent: 6 },
    { name: 'Wed', Present: 146, Leave: 4, Absent: 3 },
    { name: 'Thu', Present: 140, Leave: 10, Absent: 5 },
    { name: 'Fri', Present: 145, Leave: 7, Absent: 4 },
    { name: 'Sat', Present: 55, Leave: 3, Absent: 2 },
    { name: 'Sun', Present: 0, Leave: 0, Absent: 0 },
  ]
};

const CustomTooltip = ({ active, payload, label, isDark, isZapTheme }) => {
  if (active && payload && payload.length) {
    const bgClass = isDark 
      ? (isZapTheme ? 'bg-[#141212] border-[#2d2a2a] text-white' : 'bg-[#0B1220] border-slate-800 text-white') 
      : 'bg-white border-gray-100 text-gray-800';
    return (
      <div className={`border p-3.5 rounded-xl shadow-lg min-w-[130px] text-xs animate-in fade-in duration-200 ${bgClass}`}>
        <p className="font-bold mb-2">{label}</p>
        <div className="space-y-1.5">
          {payload.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                <span className={isDark ? 'text-slate-400 font-semibold' : 'text-gray-500 font-semibold'}>{item.name}:</span>
              </div>
              <span className={`font-extrabold`}>{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

const WeeklyAttendanceChart = ({
  className,
  isZapTheme = false,
  gridColor,
  tickColor
}) => {
  const [week, setWeek] = useState('this_week');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'));

  // Sync theme status reactively
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const data = datasets[week];
  
  const resolvedGrid = gridColor || (isDark ? (isZapTheme ? '#2d2a2a' : '#1a2d29') : (isZapTheme ? '#eceae3' : '#E5E7EB'));
  const resolvedTick = tickColor || (isDark ? (isZapTheme ? '#a3a094' : '#a3b3af') : (isZapTheme ? '#939084' : '#9CA3AF'));

  return (
    <div className={className || `border rounded-2xl p-6 shadow-sm flex flex-col w-full transition-all duration-300 ${
      isDark ? 'bg-[#111c18] border-[#1a2d29]' : 'bg-white border-[#E5E7EB]'
    }`}>
      {/* HEADER & FILTER */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className={`text-[16px] font-bold tracking-tight transition-colors ${
            isDark ? 'text-white' : 'text-gray-800'
          }`}>
            Weekly Attendance
          </h3>
          <p className={`text-[11px] mt-1 transition-colors ${
            isDark ? 'text-slate-500' : 'text-gray-400'
          }`}>
            Summary of daily personnel sync traces
          </p>
        </div>

        {/* Interactive Selector Dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all outline-none cursor-pointer ${
              isDark 
                ? 'bg-[#111c18] hover:bg-[#1a2d29] text-slate-300 border-[#1a2d29]' 
                : 'bg-[#F3F4F6] hover:bg-[#E5E7EB] text-gray-700 border-transparent'
            }`}
          >
            <span>{week === 'this_week' ? 'This Week' : 'Last Week'}</span>
            <ChevronDown size={14} className={`transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {dropdownOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)}></div>
              <div className={`absolute right-0 mt-1.5 w-36 border rounded-lg shadow-lg z-50 py-1 overflow-hidden ${
                isDark ? 'bg-[#0B1220] border-[#1a2d29]' : 'bg-white border-[#E5E7EB]'
              }`}>
                <button
                  onClick={() => { setWeek('this_week'); setDropdownOpen(false); }}
                  className={`w-full text-left px-3 py-2 text-xs font-semibold transition-all ${
                    week === 'this_week' 
                      ? 'text-[#10B981] bg-slate-900/60' 
                      : (isDark ? 'text-slate-400 hover:bg-[#111c18]' : 'text-gray-700 hover:bg-[#F9FAFB]')
                  }`}
                >
                  This Week
                </button>
                <button
                  onClick={() => { setWeek('last_week'); setDropdownOpen(false); }}
                  className={`w-full text-left px-3 py-2 text-xs font-semibold transition-all ${
                    week === 'last_week' 
                      ? 'text-[#10B981] bg-slate-900/60' 
                      : (isDark ? 'text-slate-400 hover:bg-[#111c18]' : 'text-gray-700 hover:bg-[#F9FAFB]')
                  }`}
                >
                  Last Week
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* CHART CONTENT */}
      <div className="w-full select-none">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart 
            key={isDark ? 'dark' : 'light'} 
            data={data} 
            margin={{ top: 10, right: 10, left: -25, bottom: 0 }} 
            barGap={6}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={resolvedGrid} />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: resolvedTick, fontSize: 12, fontWeight: 500 }}
              dy={8}
            />
            <YAxis
              domain={[0, 160]}
              ticks={[0, 40, 80, 120, 160]}
              axisLine={false}
              tickLine={false}
              tick={{ fill: resolvedTick, fontSize: 12, fontWeight: 500 }}
              dx={-5}
            />
            <Tooltip
              content={<CustomTooltip isDark={isDark} isZapTheme={isZapTheme} />}
              cursor={{ fill: isDark ? '#1E293B' : '#F3F4F6', opacity: isDark ? 0.15 : 0.4 }}
            />
            <Legend
              verticalAlign="top"
              align="right"
              iconSize={8}
              iconType="circle"
              wrapperStyle={{ fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', paddingBottom: '15px' }}
              formatter={(value) => <span className={isDark ? "text-slate-400" : "text-gray-500"}>{value}</span>}
            />
            <Bar dataKey="Present" fill="#10B981" radius={[4, 4, 0, 0]} barSize={12} isAnimationActive={true} animationDuration={700} />
            <Bar dataKey="Leave" fill="#F59E0B" radius={[4, 4, 0, 0]} barSize={12} isAnimationActive={true} animationDuration={700} />
            <Bar dataKey="Absent" fill="#EF4444" radius={[4, 4, 0, 0]} barSize={12} isAnimationActive={true} animationDuration={700} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default WeeklyAttendanceChart;
