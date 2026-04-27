import React, { useEffect, useState } from 'react';
import axios from 'axios';

const formatTime = (seconds = 0) => {
  const totalSeconds = Math.max(0, Number(seconds) || 0);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const TimeTrackerWidget = () => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = sessionStorage.getItem('token');
  const auth = token ? { headers: { Authorization: `Bearer ${token}` } } : null;

  const fetchStatus = async () => {
    if (!auth) {
      setSession(null);
      setLoading(false);
      setError('Please log in to view time tracking.');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get('/api/time/status', auth);
      setSession(response.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load tracker status.');
      setSession(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 10000);
    return () => clearInterval(interval);
  }, [token]);

  return (
    <div className="max-w-md mx-auto p-5 rounded-3xl border border-[#e6e1da] bg-white shadow-lg">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#939084]">Desktop Tracker</p>
          <h2 className="text-xl font-black text-[#201515]">Live Timer</h2>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#ff4f00]">
          {session?.status ? session.status.toUpperCase() : 'OFFLINE'}
        </span>
      </div>

      {loading ? (
        <div className="text-center py-12 text-sm text-[#939084]">Loading tracker status…</div>
      ) : error ? (
        <div className="rounded-2xl bg-[#fff4f2] border border-[#ffdfd8] p-4 text-sm text-[#d24542]">{error}</div>
      ) : (
        <div className="space-y-5">
          <div className="rounded-3xl bg-[#f7f5f0] p-6 text-center">
            <p className="text-[10px] uppercase tracking-[0.35em] text-[#939084] mb-2">Active Work Time</p>
            <p className="text-4xl font-black text-[#201515] tracking-[-0.05em]">{formatTime(session?.activeTime)}</p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm text-[#201515]">
            <div className="rounded-3xl bg-[#fff] border border-[#e6e1da] p-4">
              <p className="text-[10px] uppercase tracking-[0.35em] text-[#939084]">Idle Time</p>
              <p className="mt-2 font-bold text-[#201515]">{formatTime(session?.idleTime)}</p>
            </div>
            <div className="rounded-3xl bg-[#fff] border border-[#e6e1da] p-4">
              <p className="text-[10px] uppercase tracking-[0.35em] text-[#939084]">Last Sync</p>
              <p className="mt-2 font-bold text-[#201515]">{session?.startTime ? new Date(session.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimeTrackerWidget;
