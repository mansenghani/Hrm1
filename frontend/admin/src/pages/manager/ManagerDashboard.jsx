import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import UnifiedDashboardPanel from '@shared/components/UnifiedDashboardPanel';

const ManagerDashboard = () => {
  const [userName, setUserName] = useState('Priya');
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = sessionStorage.getItem('user');
    if (storedUser) {
      try {
        const u = JSON.parse(storedUser);
        setUserName(u.name?.split(' ')[0] || u.fullName?.split(' ')[0] || 'Priya');
      } catch (e) {}
    }
  }, []);

  const getGreeting = () => {
    const hr = new Date().getHours();
    if (hr < 12) return 'Good morning';
    if (hr < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const pathRole = window.location.pathname.split('/')[1] || 'manager';

  return (
    <div className="animate-fade-in flex flex-col gap-6 pb-20">
      {/* HEADER BANNER SECTION */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-4">
        <div>
          <h1 className="text-[28px] font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
            {getGreeting()} {userName} 👋
          </h1>
          <p className="text-sm text-slate-500 dark:text-[#a3b3af] mt-1 font-semibold">
            Your people operations at a glance.
          </p>
        </div>
        <button 
          onClick={() => navigate(`/${pathRole}/reports`)}
          className="px-6 py-2.5 bg-[#00a76b] hover:bg-[#00915c] text-white rounded-full font-bold text-sm transition-all cursor-pointer border-none shadow-sm flex items-center gap-1.5"
        >
          <span>View reports</span>
        </button>
      </div>

      {/* CORE OPERATIONAL ENGINE */}
      <UnifiedDashboardPanel />
    </div>
  );
};

export default ManagerDashboard;
