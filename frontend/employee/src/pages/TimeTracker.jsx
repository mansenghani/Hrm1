
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
  Search, RefreshCcw, Play, Pause, Square,
  ChevronLeft, ChevronRight, Clock, Calendar as CalendarIcon
} from 'lucide-react';
import useAuthStore from '@shared/store/authStore';

const API_BASE = '/api/time';

const TimeTracker = () => {
  const { user } = useAuthStore();
  const [currentTime, setCurrentTime] = useState(new Date());

  // Timer State
  const [sessionStatus, setSessionStatus] = useState(null); // { hasActiveSession, status, activeTime, isRunning }
  const [displaySeconds, setDisplaySeconds] = useState(0);

  // Calendar & Table State
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [calendarData, setCalendarData] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [dailyData, setDailyData] = useState(null);

  const [isLoading, setIsLoading] = useState(false);

  const token = () => sessionStorage.getItem('token');
  const auth = { headers: { Authorization: `Bearer ${token()}` } };

  // Fetch Session Status (poll)
  const fetchStatus = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE}/status`, auth);
      setSessionStatus(res.data);
      if (res.data.hasActiveSession && res.data.activeTime != null) {
        const s = res.data;
        if (s.isRunning) {
          const baseTime = s.activeTime || 0;
          const startTime = new Date(s.segmentStart || Date.now()).getTime();
          const elapsed = Math.floor((Date.now() - startTime) / 1000);
          setDisplaySeconds(baseTime + Math.max(0, elapsed));
        } else {
          setDisplaySeconds(s.activeTime);
        }
      } else {
        setDisplaySeconds(0);
      }
    } catch (err) {
      console.error('Failed to fetch status', err);
    }
  }, []);

  // Poll status every 10 seconds to keep timer updated with backend authority
  useEffect(() => {
    fetchStatus();
    const interval = setInterval(() => {
      fetchStatus();
    }, 10000);
    return () => clearInterval(interval);
  }, [fetchStatus]);

  // Timer Engine for local elapsed time
  useEffect(() => {
    if (!sessionStatus || !sessionStatus.isRunning) return;

    const baseTime = sessionStatus.activeTime || 0;
    const startTime = new Date(sessionStatus.segmentStart || Date.now()).getTime();

    const interval = setInterval(() => {
      const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
      setDisplaySeconds(baseTime + Math.max(0, elapsedSeconds));
    }, 1000);

    const initialElapsed = Math.floor((Date.now() - startTime) / 1000);
    setDisplaySeconds(baseTime + Math.max(0, initialElapsed));

    return () => clearInterval(interval);
  }, [sessionStatus?.isRunning, sessionStatus?.segmentStart, sessionStatus?.activeTime]);

  // Fetch Calendar Data (Dots)
  const fetchCalendarData = useCallback(async () => {
    try {
      if (!user) return;
      const monthStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}`;
      const userId = user.id || user._id;
      if (!userId) return;
      const res = await axios.get(`${API_BASE}/calendar/${userId}?month=${monthStr}`, auth);
      setCalendarData(res.data);
    } catch (err) {
      console.error('Failed to fetch calendar data', err);
    }
  }, [currentMonth, user]);

  useEffect(() => {
    fetchCalendarData();
  }, [fetchCalendarData]);

  // Fetch Daily Log
  const fetchDailyData = useCallback(async () => {
    try {
      if (!user) return;
      const userId = user.id || user._id;
      if (!userId) return;
      const res = await axios.get(`${API_BASE}/daily/${userId}/${selectedDate}`, auth);
      setDailyData(res.data);
    } catch (err) {
      if (err.response?.status === 404) {
        setDailyData(null);
      } else {
        console.error('Failed to fetch daily data', err);
      }
    }
  }, [selectedDate, user]);

  useEffect(() => {
    fetchDailyData();
  }, [fetchDailyData, sessionStatus?.status]); // Re-fetch when status changes

  // Action Handlers
  const handleAction = async (action) => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      let endpoint = '';
      if (action === 'start') endpoint = '/start';
      else if (action === 'pause') endpoint = '/pause';
      else if (action === 'resume') endpoint = '/resume';
      else if (action === 'stop') endpoint = '/stop';

      if (endpoint) {
        await axios.post(`${API_BASE}${endpoint}`, {}, auth);
        await fetchStatus();
        await fetchDailyData();
        await fetchCalendarData();
      }
    } catch (err) {
      console.error(`Action ${action} failed`, err);
    } finally {
      setIsLoading(false);
    }
  };

  // Format Helpers
  const formatTime = (totalSeconds) => {
    if (totalSeconds == null) return "00:00:00";
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = Math.floor(totalSeconds % 60);
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const formatHoursMinutes = (totalMinutes) => {
    if (!totalMinutes) return '0h 0m';
    const h = Math.floor(totalMinutes / 60);
    const m = Math.floor(totalMinutes % 60);
    return `${h}h ${m}m`;
  };

  const getStatusBadge = () => {
    if (!sessionStatus || !sessionStatus.hasActiveSession || sessionStatus.status === 'completed') {
      return <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm font-semibold">Not Started</span>;
    }
    if (sessionStatus.status === 'active') {
      return <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">Working</span>;
    }
    if (sessionStatus.status === 'paused') {
      return <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-semibold">On Break</span>;
    }
    if (sessionStatus.status === 'idle') {
      return <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm font-semibold">Idle</span>;
    }
    return null;
  };

  // Calendar Helpers
  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();

  const handlePrevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  const handleNextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));

  // Determine today's running row for table
  const todayStr = new Date().toISOString().split('T')[0];
  const isTodayRunning = sessionStatus?.hasActiveSession && sessionStatus?.status !== 'completed' && selectedDate === todayStr;

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans text-gray-900" style={{ colorScheme: 'light' }}>

      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Smart Time Tracker</h1>
          <p className="text-sm text-gray-500">{currentTime.toLocaleString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input type="text" placeholder="Search personnel..." className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500" />
          </div>
          <button onClick={() => { fetchStatus(); fetchDailyData(); fetchCalendarData(); }} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
            <RefreshCcw size={16} className="text-gray-600" />
            Sync Registry
          </button>
        </div>
      </div>

      {/* TOP ROW: 60/40 SPLIT */}
      <div className="flex flex-col lg:flex-row gap-6 mb-8">

        {/* TIME TRACKER CARD (60%) */}
        <div className="lg:w-[60%] bg-white rounded-2xl border border-gray-100 shadow-sm p-8 flex flex-col justify-center">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-1">Current Session</h2>
              {getStatusBadge()}
            </div>
            <Clock size={24} className="text-gray-300" />
          </div>

          <div className="text-center mb-10">
            <div className="text-6xl font-bold text-gray-800 font-mono tracking-tight mb-2">
              {formatTime(displaySeconds)}
            </div>
            <p className="text-sm text-gray-400 font-medium tracking-wide uppercase">Total Time Tracked</p>
          </div>

          <div className="flex justify-center gap-4">
            {(!sessionStatus?.hasActiveSession || sessionStatus?.status === 'completed') ? (
              <button
                onClick={() => handleAction('start')} disabled={isLoading}
                className="flex items-center gap-2 px-8 py-3 bg-[#10B981] text-white rounded-xl font-semibold shadow-md hover:bg-[#059669] transition-all disabled:opacity-50">
                <Play size={18} fill="currentColor" />
                START
              </button>
            ) : (
              <>
                {sessionStatus.status === 'active' ? (
                  <button
                    onClick={() => handleAction('pause')} disabled={isLoading}
                    className="flex items-center gap-2 px-8 py-3 bg-amber-500 text-white rounded-xl font-semibold shadow-md hover:bg-amber-600 transition-all disabled:opacity-50">
                    <Pause size={18} fill="currentColor" />
                    PAUSE
                  </button>
                ) : (
                  <button
                    onClick={() => handleAction('resume')} disabled={isLoading}
                    className="flex items-center gap-2 px-8 py-3 bg-[#10B981] text-white rounded-xl font-semibold shadow-md hover:bg-[#059669] transition-all disabled:opacity-50">
                    <Play size={18} fill="currentColor" />
                    RESUME
                  </button>
                )}

                <button
                  onClick={() => handleAction('stop')} disabled={isLoading}
                  className="flex items-center gap-2 px-8 py-3 bg-gray-800 text-white rounded-xl font-semibold shadow-md hover:bg-gray-900 transition-all disabled:opacity-50">
                  <Square size={18} fill="currentColor" />
                  STOP
                </button>
              </>
            )}
          </div>
        </div>

        {/* DYNAMIC CALENDAR (40%) */}
        <div className="lg:w-[40%] bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <CalendarIcon size={18} className="text-[#10B981]" />
              {currentMonth.toLocaleString('en-US', { month: 'long', year: 'numeric' })}
            </h2>
            <div className="flex gap-2">
              <button onClick={handlePrevMonth} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"><ChevronLeft size={18} className="text-gray-600" /></button>
              <button onClick={handleNextMonth} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"><ChevronRight size={18} className="text-gray-600" /></button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center mb-2">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
              <div key={d} className="text-xs font-semibold text-gray-400 py-1">{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1 text-center">
            {Array.from({ length: firstDayOfMonth }).map((_, i) => <div key={`empty-${i}`} />)}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

              const dayData = calendarData.find(d => d.date === dateStr);
              const hasLog = !!dayData;
              const isSelected = dateStr === selectedDate;
              const isToday = dateStr === todayStr;

              return (
                <button
                  key={day}
                  onClick={() => setSelectedDate(dateStr)}
                  className={`
                    relative w-full aspect-square flex items-center justify-center text-sm rounded-lg transition-all
                    ${isSelected ? 'bg-[#10B981] text-white font-bold shadow-md' : 'hover:bg-gray-50 text-gray-700'}
                    ${isToday && !isSelected ? 'border border-[#10B981] text-[#10B981] font-bold' : ''}
                  `}
                >
                  {day}
                  {hasLog && !isSelected && (
                    <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#10B981] rounded-full"></div>
                  )}
                  {hasLog && isSelected && (
                    <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-white rounded-full"></div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Mini Stats under calendar based on selected date */}
          <div className="mt-6 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">Logged on {new Date(selectedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
            <p className="text-xl font-bold text-gray-800">
              {dailyData?.totalWorkedDuration ? formatHoursMinutes(dailyData.totalWorkedDuration) : '0h 0m'}
            </p>
          </div>
        </div>

      </div>

      {/* DAILY ACTIVITY LOG TABLE */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white">
          <h2 className="text-lg font-semibold text-gray-800">Daily Activity Log</h2>
          <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-md text-xs font-semibold">{selectedDate}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Check-in Time</th>
                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">No. of Pauses</th>
                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Break Time</th>
                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Stop Time</th>
                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Total Hours Worked</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {dailyData ? (
                <tr className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 px-6 text-sm text-gray-800 font-medium">
                    {new Date(dailyData.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    {isTodayRunning && <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-[#10B981]/10 text-[#10B981]">LIVE</span>}
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-600">
                    {dailyData.startTime ? new Date(dailyData.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--'}
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-600">
                    {dailyData.pauseEvents?.length || 0}
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-600">
                    {formatHoursMinutes(dailyData.totalPauseDuration || 0)}
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-600">
                    {dailyData.endTime ? (
                      <div className="flex items-center gap-2">
                        {new Date(dailyData.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        {dailyData.isAutoStop && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-gray-200 text-gray-700">AUTO</span>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-400 italic">--</span>
                    )}
                  </td>
                  <td className="py-4 px-6 text-sm font-semibold text-gray-800 text-right">
                    {isTodayRunning
                      ? formatTime(displaySeconds)
                      : formatHoursMinutes(dailyData.totalWorkedDuration || 0)}
                  </td>
                </tr>
              ) : (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-gray-400 text-sm">
                    No activity recorded for this date.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default TimeTracker;
