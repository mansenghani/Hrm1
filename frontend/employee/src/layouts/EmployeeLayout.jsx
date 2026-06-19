import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import axios from 'axios';
import { io } from 'socket.io-client';
import {
  LayoutDashboard, User, Clock, CalendarDays, FileText,
  FolderOpen, TrendingUp, MessageSquare, Bell, Search,
  LogOut, ChevronLeft, ChevronRight, Sun, Moon, Menu, X,
  Play, Zap, PlusCircle, Calendar, Wallet, Target,
  Globe, ChevronDown
} from 'lucide-react';
import useAuthStore from '@shared/store/authStore';

// ─── THEME HOOK ───────────────────────────────────────────────
const useTheme = () => {
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark') {
      document.documentElement.classList.add('dark');
      return true;
    } else if (saved === 'light') {
      document.documentElement.classList.remove('dark');
      return false;
    }
    return document.documentElement.classList.contains('dark');
  });
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
    } else {
      document.documentElement.classList.add('theme-transitioning');
    }
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('theme', dark ? 'dark' : 'light');
    if (!isFirstRender.current) {
      const timer = setTimeout(() => {
        document.documentElement.classList.remove('theme-transitioning');
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [dark]);
  return [dark, setDark];
};

// ─── TOP TABS ─────────────────────────────────────────────────
const NAV_ITEMS = [
  { label: 'Dashboard',    path: '/employee/dashboard',           icon: LayoutDashboard },
  { label: 'Time Tracker', path: '/employee/time-tracker',        icon: Clock },
  { label: 'Team Chat',    path: '/employee/chat',                icon: MessageSquare },
  { label: 'Create Task',  path: '/employee/task-management/create', icon: PlusCircle },
];

// ─── SIDEBAR GROUPS ──────────────────────────────────────────
const SIDEBAR_OVERVIEW_ITEMS = [
  { label: 'Dashboard', path: '/employee/dashboard', icon: LayoutDashboard },
];

const SIDEBAR_ME_ITEMS = [
  { label: 'My Profile', path: '/employee/profile', icon: User },
  { label: 'My Attendance', path: '/employee/attendance', icon: Clock },
  { label: 'My Leave', path: '/employee/leave', icon: Calendar },
  { label: 'My Payslips', path: '/employee/payslips', icon: Wallet },
  { label: 'My Documents', path: '/employee/documents', icon: FileText },
  { label: 'My Performance', path: '/employee/performance', icon: Target },
];

// ─── AVATAR ───────────────────────────────────────────────────
const Avatar = ({ name = '', image, size = 32 }) => {
  const initials = name.split(' ').filter(Boolean).map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';
  const colors = ['#16a34a','#2563eb','#9333ea','#dc2626','#d97706'];
  const color = colors[name.charCodeAt(0) % colors.length] || '#16a34a';

  const getUrl = (p) => {
    if (!p) return null;
    if (p.startsWith('http') || p.startsWith('data:')) return p;
    return p.startsWith('/') ? p : `/${p}`;
  };

  return (
    <div
      className="rounded-full flex items-center justify-center font-semibold text-white overflow-hidden flex-shrink-0"
      style={{ width: size, height: size, background: image ? 'transparent' : color, fontSize: size * 0.38 }}
    >
      {image
        ? <img src={getUrl(image)} alt={name} className="w-full h-full object-cover" />
        : initials
      }
    </div>
  );
};

// ─── MAIN LAYOUT ─────────────────────────────────────────────
const EmployeeLayout = () => {
  const [dark, setDark] = useTheme();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [profile, setProfile] = useState(null);
  const [timerActive, setTimerActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuthStore();
  const token = sessionStorage.getItem('token');
  const notifRef = useRef(null);

  const isChat = location.pathname.endsWith('/chat');

  // ── Fetch Profile ──────────────────────────────────────────
  useEffect(() => {
    if (!token) return;
    axios.get('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => { setProfile(r.data); sessionStorage.setItem('user', JSON.stringify(r.data)); })
      .catch(() => {
        const s = sessionStorage.getItem('user');
        if (s) try { setProfile(JSON.parse(s)); } catch {}
      });
  }, [token]);

  // ── Fetch Notifications ────────────────────────────────────
  useEffect(() => {
    if (!token) return;
    const fetch = () => axios.get('/api/notifications', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => {
        const items = Array.isArray(r.data) ? r.data : (r.data?.data || []);
        setNotifications(items.slice(0, 5));
      }).catch(() => {});
    fetch();
    const id = setInterval(fetch, 60000);
    return () => clearInterval(id);
  }, [token]);

  // ── Timer Status ───────────────────────────────────────────
  useEffect(() => {
    if (!token) return;
    axios.get('/api/time/timer/status', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => { setTimerActive(!!r.data?.isRunning); if (r.data?.status === 'idle') setIsPaused(true); })
      .catch(() => {});
  }, [token]);

  // ── Socket ─────────────────────────────────────────────────
  useEffect(() => {
    if (!token) return;
    const s = io(window.location.origin, { withCredentials: true });
    s.on('connect', () => {
      const u = (() => { try { return JSON.parse(sessionStorage.getItem('user')); } catch { return null; } })();
      if (u) s.emit('join_notifications', { userId: u._id || u.id, role: 'employee' });
    });
    s.on('notification', d => setNotifications(p => [d, ...p].slice(0, 5)));
    s.on('timer_paused', d => { setTimerActive(false); if (d.reason === 'inactivity') setIsPaused(true); });
    s.on('timer_resumed', () => { setTimerActive(true); setIsPaused(false); });
    return () => s.disconnect();
  }, [token]);

  // ── Click Outside Notif ────────────────────────────────────
  useEffect(() => {
    const h = e => { if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const handleLogout = () => { logout(); navigate('/login'); };
  const handleResume = () =>
    axios.post('/api/time/resume', {}, { headers: { Authorization: `Bearer ${token}` } })
      .then(() => { setTimerActive(true); setIsPaused(false); }).catch(() => {});

  const displayName = profile?.name ||
    (profile?.profile ? `${profile.profile.firstName || ''} ${profile.profile.lastName || ''}`.trim() : '') ||
    'Employee';

  const initials = displayName.split(' ').filter(Boolean).map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'BK';

  const unreadCount = notifications.length;

  // ── SIDEBAR CONTENT ────────────────────────────────────────
  const SidebarContent = ({ mobile = false }) => (
    <div className="flex flex-col h-full" style={{ backgroundColor: dark ? '#050c0a' : '#f2fbf6' }}>
      {/* Mobile brand header (logo shown inside sidebar on mobile only) */}
      {mobile && (
        <div className="flex items-center gap-3 px-4 py-5 border-b border-[#eceae3] dark:border-[#1a2d29]">
          <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-[#00a76b]">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="8" />
              <path d="M12 2v2M12 20v2M2 12h2M20 12h2" />
              <circle cx="12" cy="12" r="3" fill="white" />
            </svg>
          </div>
          <span className="font-bold text-[17px] text-[#201515] dark:text-white">FluidHR</span>
          <button onClick={() => setMobileOpen(false)} className="ml-auto p-1 rounded-lg text-[#939084] dark:text-[#a3b3af] cursor-pointer bg-transparent border-none">
            <X size={20} />
          </button>
        </div>
      )}

      {/* Nav links */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-4 scrollbar-hide">
        {/* OVERVIEW Group */}
        <div>
          {(!collapsed || mobile) && (
            <p className="px-4 text-[10px] font-black text-[#939084] dark:text-[#527068] uppercase tracking-[0.2em] mb-2">
              Overview
            </p>
          )}
          <div className="space-y-1">
            {SIDEBAR_OVERVIEW_ITEMS.map(item => {
              const Icon = item.icon;
              const active = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => mobile && setMobileOpen(false)}
                  title={collapsed && !mobile ? item.label : ''}
                  className={`flex items-center h-12 text-[15px] font-bold no-underline rounded-[999px] transition-all group ${collapsed && !mobile ? 'justify-center px-0 w-full' : 'px-4 gap-3 w-full'} ${active ? 'text-white bg-[#00a76b] shadow-sm' : 'text-[#201515] dark:text-[#a3b3af] hover:bg-[#eceae3]/60 dark:hover:bg-[#111c18]'}`}
                >
                  <div className={`shrink-0 flex items-center justify-center transition-all ${collapsed && !mobile ? 'w-12' : 'w-5'}`}>
                    <Icon size={20} className={active ? 'text-white' : 'text-[#36342e] dark:text-[#a3b3af]'} />
                  </div>
                  {(!collapsed || mobile) && <span className="truncate whitespace-nowrap overflow-hidden">{item.label}</span>}
                </Link>
              );
            })}
          </div>
        </div>

        {/* ME Group */}
        <div>
          {(!collapsed || mobile) && (
            <p className="px-4 text-[10px] font-black text-[#939084] dark:text-[#527068] uppercase tracking-[0.2em] mb-2 mt-4">
              Me
            </p>
          )}
          <div className="space-y-1">
            {SIDEBAR_ME_ITEMS.map(item => {
              const Icon = item.icon;
              const active = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => mobile && setMobileOpen(false)}
                  title={collapsed && !mobile ? item.label : ''}
                  className={`flex items-center h-12 text-[15px] font-bold no-underline rounded-[999px] transition-all group ${collapsed && !mobile ? 'justify-center px-0 w-full' : 'px-4 gap-3 w-full'} ${active ? 'text-white bg-[#00a76b] shadow-sm' : 'text-[#201515] dark:text-[#a3b3af] hover:bg-[#eceae3]/60 dark:hover:bg-[#111c18]'}`}
                >
                  <div className={`shrink-0 flex items-center justify-center transition-all ${collapsed && !mobile ? 'w-12' : 'w-5'}`}>
                    <Icon size={20} className={active ? 'text-white' : 'text-[#36342e] dark:text-[#a3b3af]'} />
                  </div>
                  {(!collapsed || mobile) && <span className="truncate whitespace-nowrap overflow-hidden">{item.label}</span>}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Dark mode toggle at bottom */}
      <div className="p-3 border-t border-[#c5c0b1] dark:border-[#1a2d29] space-y-2">
        <button
          onClick={() => setDark(d => !d)}
          className={`flex items-center gap-2 p-2 rounded-lg text-sm font-medium w-full text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 ${collapsed && !mobile ? 'justify-center px-0' : ''}`}
        >
          {dark ? <Sun size={18} /> : <Moon size={18} />}
          {(!collapsed || mobile) && <span>{dark ? 'Light Mode' : 'Dark Mode'}</span>}
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-[#fffefb] dark:bg-[#08100e] text-[#201515] dark:text-[#e2e8f0] transition-colors duration-300 ease-in-out">
      {/* ── TOPBAR (Full Width) ────────────────────────── */}
      <header className="sticky top-0 w-full z-50 border-b border-[#c5c0b1] dark:border-[#1a2d29] bg-white/80 dark:bg-[#08100e]/80 backdrop-blur-md transition-colors duration-300 ease-in-out">
        <div className="flex items-center h-[56px] w-full px-6">
          <div className="flex items-center gap-6 mr-6">
            <Link to="/employee/dashboard" className="flex items-center gap-3 no-underline">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-[#00a76b] rounded-full flex items-center justify-center">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="8" />
                    <path d="M12 2v2M12 20v2M2 12h2M20 12h2" />
                    <circle cx="12" cy="12" r="3" fill="white" />
                  </svg>
                </div>
                <div className="flex flex-col items-start leading-tight">
                  <span className="text-[17px] font-black text-[#201515] dark:text-white tracking-tight">FluidHR</span>
                  <span className="text-[10px] font-bold text-[#939084] dark:text-[#a3b3af] uppercase tracking-wider">Workforce OS</span>
                </div>
              </div>
            </Link>
            <button
              onClick={() => setCollapsed(c => !c)}
              className="hidden md:flex items-center justify-center w-10 h-10 hover:bg-[#eceae3] rounded-[5px] text-[#36342e] transition-all cursor-pointer border-none bg-transparent"
            >
              <Menu size={22} />
            </button>
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden flex items-center justify-center w-10 h-10 hover:bg-[#eceae3] rounded-[5px] text-[#36342e] transition-all cursor-pointer border-none bg-transparent"
            >
              <Menu size={22} />
            </button>
          </div>

          {/* Search bar in the center-left */}
          <div className="flex-1 max-w-[340px] relative mx-4">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <Search size={18} />
            </div>
            <input
              type="text"
              placeholder="Search employees, requests, payroll..."
              className="w-full pl-10 pr-4 py-2 bg-[#f3f4f6] dark:bg-[#111c18] border-none rounded-full text-sm font-semibold text-gray-700 dark:text-[#a3b3af] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00a76b]/20 focus:bg-white dark:focus:bg-[#162722] transition-all"
            />
          </div>

          {/* + Quick action button */}
          <button className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-[#00b27a] to-[#00915c] hover:from-[#00c285] hover:to-[#00a368] text-white rounded-full font-bold text-xs transition-all cursor-pointer border-none shadow-sm mr-4">
            <PlusCircle size={15} strokeWidth={2.8} />
            <span>Quick action</span>
          </button>
          
          <div className="ml-auto flex items-center h-full gap-2">
            {/* Inactivity banner / timer controls */}
            {isPaused && (
              <button
                onClick={handleResume}
                className="flex items-center gap-2 px-4 py-1.5 bg-[#ff4f00] text-white rounded-full border-none cursor-pointer hover:bg-[#e64600] transition-all animate-pulse mr-2"
              >
                <Play size={14} fill="currentColor" />
                <span className="text-[10px] font-black uppercase tracking-widest">Resume Timer</span>
              </button>
            )}
            {timerActive && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-[#eceae3] rounded-full border border-[#c5c0b1] mr-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#24a148]"></div>
                <span className="text-[10px] font-black text-[#201515] uppercase tracking-widest tabular-nums">
                  Active
                </span>
              </div>
            )}
            {!timerActive && !isPaused && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-[#eceae3] rounded-full border border-[#c5c0b1] opacity-50 mr-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#939084]"></div>
                <span className="text-[10px] font-black text-[#201515] uppercase tracking-widest">Offline</span>
              </div>
            )}

            {/* Utility Icons */}
            <button className="w-9 h-9 flex items-center justify-center text-gray-500 hover:text-gray-800 transition-colors rounded-full hover:bg-gray-100 border-none bg-transparent cursor-pointer">
              <Globe size={18} />
            </button>

            <button
              onClick={() => setDark(d => !d)}
              className="w-9 h-9 flex items-center justify-center text-gray-500 hover:text-gray-800 transition-colors rounded-full hover:bg-gray-100 border-none bg-transparent cursor-pointer"
            >
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <button
              onClick={() => navigate('/employee/chat')}
              className="w-9 h-9 flex items-center justify-center text-gray-500 hover:text-gray-800 transition-colors rounded-full hover:bg-gray-100 border-none bg-transparent cursor-pointer"
            >
              <MessageSquare size={18} />
            </button>

            {/* Notifications Alert Dropdown */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className={`w-9 h-9 flex items-center justify-center rounded-full transition-all relative border-none bg-transparent cursor-pointer ${notifOpen ? 'bg-[#00a76b] text-white shadow-lg' : 'text-gray-500 hover:bg-gray-100'}`}
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                )}
              </button>

              {notifOpen && (
                <div className="absolute top-[48px] right-0 w-80 bg-white dark:bg-[#111c18] border border-[#c5c0b1] dark:border-[#1a2d29] rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.3)] overflow-hidden z-[100]">
                  <div className="p-4 border-b border-[#eceae3] dark:border-[#1a2d29] bg-[#fffdf9] dark:bg-[#162722] flex justify-between items-center">
                    <span className="text-[11px] font-black uppercase tracking-widest text-[#201515] dark:text-white">Intelligence Alerts</span>
                    {unreadCount > 0 && (
                      <span className="px-2 py-0.5 bg-[#00a76b]/10 text-[#00a76b] text-[8px] font-black rounded-full uppercase">
                        {unreadCount} New
                      </span>
                    )}
                  </div>
                  <div className="max-h-[320px] overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center opacity-40">
                        <p className="text-[10px] font-black uppercase tracking-widest text-[#939084] dark:text-[#a3b3af]">No Active Alerts</p>
                      </div>
                    ) : (
                      notifications.map((n, i) => (
                        <div
                          key={i}
                          onClick={() => {
                            navigate(n.path || '/employee/dashboard');
                            setNotifOpen(false);
                          }}
                          className="p-4 border-b border-[#eceae3] dark:border-[#1a2d29] hover:bg-[#fffdf9] dark:hover:bg-[#162722]/50 transition-all cursor-pointer group"
                        >
                          <div className="flex gap-3">
                            <div className="w-2 h-2 rounded-full mt-1.5 shrink-0 bg-[#00a76b]"></div>
                            <div>
                              <p className="text-[12px] font-bold text-[#201515] dark:text-[#e2e8f0] leading-tight group-hover:text-[#00a76b] transition-colors">{n.message || n.text}</p>
                              <p className="text-[9px] font-black text-[#939084] dark:text-[#a3b3af] uppercase tracking-widest mt-1">
                                {n.createdAt ? new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recently'}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Avatar details */}
            <div className="relative">
              <div
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className="hidden sm:flex items-center gap-3 px-3 h-11 hover:bg-gray-100 dark:hover:bg-[#111c18] rounded-full cursor-pointer transition-all select-none"
              >
                <Avatar name={displayName} image={profile?.profileImage} size={30} />
                <div className="hidden lg:block text-left leading-none">
                  <div className="text-xs font-semibold text-[#201515] dark:text-white truncate max-w-[120px]">{displayName}</div>
                  <div className="text-[9px] font-medium text-[#00a76b] mt-1">Employee</div>
                </div>
                <ChevronDown size={14} className="text-gray-500" />
              </div>

              {isProfileDropdownOpen && (
                <div className="absolute top-[48px] right-0 w-48 bg-white dark:bg-[#111c18] border border-[#c5c0b1] dark:border-[#1a2d29] rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.08)] overflow-hidden z-[100] py-1">
                  <button
                    onClick={() => { navigate('/employee/profile'); setIsProfileDropdownOpen(false); }}
                    className="w-full px-4 py-2.5 text-left text-sm font-semibold text-gray-700 dark:text-[#cbd5e1] hover:bg-[#f2fbf6] hover:text-[#00a76b] transition-all border-none bg-transparent cursor-pointer"
                  >
                    My Profile
                  </button>
                  <button
                    onClick={() => { navigate('/employee/settings'); setIsProfileDropdownOpen(false); }}
                    className="w-full px-4 py-2.5 text-left text-sm font-semibold text-gray-700 dark:text-[#cbd5e1] hover:bg-[#f2fbf6] hover:text-[#00a76b] transition-all border-none bg-transparent cursor-pointer"
                  >
                    Settings
                  </button>
                  <div className="border-t border-[#eceae3] dark:border-[#1a2d29] my-1"></div>
                  <button
                    onClick={() => { handleLogout(); setIsProfileDropdownOpen(false); }}
                    className="w-full px-4 py-2.5 text-left text-sm font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all border-none bg-transparent cursor-pointer"
                  >
                    Log out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 w-full relative">
        {/* Desktop Sidebar */}
        <aside
          className="hidden md:flex flex-col border-r flex-shrink-0 transition-all duration-300 ease-in-out relative"
          style={{
            width: collapsed ? '64px' : '220px',
            borderColor: dark ? '#1a2d29' : 'var(--border)',
            backgroundColor: dark ? '#050c0a' : '#f2fbf6',
          }}
        >
          <SidebarContent />
        </aside>

        {/* Mobile Sidebar Drawer */}
        {mobileOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
            <aside className="absolute left-0 top-0 bottom-0 w-64 border-r animate-slide-in-left"
              style={{ background: dark ? '#050c0a' : '#f2fbf6', borderColor: dark ? '#1a2d29' : 'var(--border)' }}>
              <SidebarContent mobile />
            </aside>
          </div>
        )}

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-[#fffefb] dark:bg-[#08100e] relative flex flex-col">
          {isChat ? (
            <div className="h-full relative overflow-hidden"><Outlet /></div>
          ) : (
            <div className="p-4 md:p-6 lg:p-8 max-w-[1440px] mx-auto animate-fade-in w-full">
              <Outlet />
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default EmployeeLayout;
