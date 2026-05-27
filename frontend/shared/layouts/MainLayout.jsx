import React, { useState, useEffect } from 'react';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  ShieldCheck,
  Search,
  Plus,
  LayoutDashboard,
  Users,
  CheckSquare,
  Layers,
  FileText,
  Calendar,
  Clock,
  Wallet,
  TrendingUp,
  BarChart3,
  Settings,
  ClipboardList,
  Briefcase,
  Menu,
  X,
  Target,
  Bell,
  MessageSquare,
  AlertCircle,
  Play,
  Camera,
  PlusCircle
} from 'lucide-react';
import { io } from 'socket.io-client';
import { API_BASE_URL } from '@shared/services/api';

const MainLayout = ({ children, navItems, userRole, userName, onLogout }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [liveNotifications, setLiveNotifications] = useState([]);
  const notificationRef = React.useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  const role = sessionStorage.getItem('role') || 'admin';
  const token = sessionStorage.getItem('token');
  const [userProfile, setUserProfile] = useState(null);

  // 🛡️ DYNAMIC ROLE DERIVATION (URL-FIRST)
  const pathRole = location.pathname.split('/')[1];
  const roleMap = { admin: 'admin', hr: 'hr', manager: 'manager', employee: 'employee' };
  const activeRole = roleMap[pathRole] ? pathRole : role;

  // 🛡️ SYNC LIVE NOTIFICATIONS
  useEffect(() => {
    const fetchNotifications = async () => {
      if (!token) return;
      try {
        const res = await axios.get('/api/notifications', { headers: { Authorization: `Bearer ${token}` } });
        const items = Array.isArray(res.data) ? res.data : (Array.isArray(res.data?.data) ? res.data.data : []);
        const alerts = items.map(n => ({
          type: n.type || 'task',
          text: n.message,
          time: n.createdAt ? new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recently',
          path: n.type === 'task' ? `/${activeRole}/task-management` : `/${activeRole}/dashboard`
        }));
        setLiveNotifications(alerts.slice(0, 5));
      } catch (err) { console.error('Alert Sync Failed:', err); }
    };
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000); // Back-up poll every min
    return () => clearInterval(interval);
  }, [token, activeRole]);

  // 🛡️ CLICK OUTSIDE HANDLER
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const displayRole = userRole || (role ? role.toUpperCase() : 'ADMIN');

  useEffect(() => {
    const fetchLatestProfile = async () => {
      if (!token) return;
      try {
        const response = await axios.get('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.data) {
          setUserProfile(response.data);
          sessionStorage.setItem('user', JSON.stringify(response.data));
        }
      } catch (err) {
        const stored = sessionStorage.getItem('user');
        if (stored && stored !== 'undefined') {
          setUserProfile(JSON.parse(stored));
        }
      }
    };
    fetchLatestProfile();

    window.addEventListener('profileUpdated', fetchLatestProfile);
    return () => window.removeEventListener('profileUpdated', fetchLatestProfile);
  }, [token]);

  const displayName = userProfile?.name ||
    (userProfile?.profile ? `${userProfile.profile.firstName || ''} ${userProfile.profile.lastName || ''}`.trim() : null) ||
    userName ||
    'System Administrator';

  const initials = displayName.split(' ').filter(Boolean).map(n => n[0]).join('').toUpperCase().substring(0, 2) || 'SA';

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const baseTitle = 'Fluid HR';
    const roleMap = {
      admin: 'Admin',
      hr: 'HR',
      manager: 'Manager',
      employee: 'Employee'
    };
    const pathRole = location.pathname.split('/')[1];
    const activeRole = roleMap[pathRole] ? pathRole : role;
    const roleName = roleMap[activeRole] || 'System';
    document.title = `${baseTitle} | ${roleName}`;
  }, [role, location.pathname]);

  const getMenuItemsByRole = (currentRole) => {
    switch (currentRole) {
      case 'hr':
        return [
          { name: 'Dashboard', path: '/hr/dashboard', icon: LayoutDashboard },
          { name: 'Employees', path: '/hr/employees', icon: Users },
          { name: 'Daily Tasks Board', path: '/hr/tasks', icon: CheckSquare },
          // { name: 'Task Management', path: '/hr/task-management', icon: ClipboardList },
          // { name: 'Attendance', path: '/hr/attendance', icon: Calendar },
          { name: 'Time Tracker', path: '/hr/time-tracker', icon: Clock },
          { name: 'Team Chat', path: '/hr/chat', icon: MessageSquare },
          // { name: 'Project Registry', path: '/hr/projects', icon: Briefcase },
          { name: 'Monitoring Logs', path: '/hr/screenshots', icon: Camera },
          // { name: 'Request For Leave', path: '/hr/leave', icon: FileText },
        ];
      case 'employee':
        return [
          { name: 'Dashboard', path: '/employee/dashboard', icon: LayoutDashboard },
          // { name: 'Task Management', path: '/employee/task-management', icon: ClipboardList },
          // { name: 'Active Projects', path: '/employee/projects', icon: Target },
          { name: 'Time Tracker', path: '/employee/time-tracker', icon: Clock },
          { name: 'Team Chat', path: '/employee/chat', icon: MessageSquare },
          { name: 'Create Task', path: '/employee/task-management/create', icon: PlusCircle },
          // { name: 'Request For Leave', path: '/employee/leave', icon: FileText },
        ];
      case 'manager':
        return [
          { name: 'Dashboard', path: '/manager/dashboard', icon: LayoutDashboard },
          { name: 'Daily Tasks Board', path: '/manager/tasks', icon: CheckSquare },
          // { name: 'Task Management', path: '/manager/task-management', icon: ClipboardList },
          // { name: 'Project Hub', path: '/manager/projects', icon: Briefcase },
          { name: 'Time Tracker', path: '/manager/time-tracker', icon: Clock },
          { name: 'Team Chat', path: '/manager/chat', icon: MessageSquare },
          // { name: 'Team Attendance', path: '/manager/attendance', icon: Calendar },
          { name: 'Monitoring Logs', path: '/manager/screenshots', icon: Camera },
          // { name: 'Review Leaves', path: '/manager/leave', icon: FileText },
        ];
      case 'admin':
      default:
        return [
          { name: 'Dashboard', path: `/${currentRole}/dashboard`, icon: LayoutDashboard },
          { name: 'Employees', path: `/${currentRole}/employees`, icon: Users },
          { name: 'Daily Tasks Board', path: `/${currentRole}/tasks`, icon: CheckSquare },
          // { name: 'Task Management', path: `/${currentRole}/task-management`, icon: ClipboardList },
          // { name: 'Request For Leave', path: `/${currentRole}/leave`, icon: FileText },
          // { name: 'Attendance', path: `/${currentRole}/attendance`, icon: Calendar },
          { name: 'Time Tracker', path: `/${currentRole}/time-tracker`, icon: Clock },
          { name: 'Global Chat', path: `/${currentRole}/chat`, icon: MessageSquare },
          { name: 'Payroll', path: `/${currentRole}/payroll`, icon: Wallet },
          { name: 'Performance', path: `/${currentRole}/performance`, icon: TrendingUp },
          { name: 'Reports', path: `/${currentRole}/reports`, icon: BarChart3 },
          { name: 'Monitoring Logs', path: `/${currentRole}/screenshots`, icon: Camera },
          { name: 'Settings', path: `/${currentRole}/settings`, icon: Settings },
        ];
    }
  };

  const menuItems = navItems ? navItems.map(item => ({
    name: item.label || item.name,
    path: item.path,
    icon: item.icon || LayoutDashboard
  })) : getMenuItemsByRole(activeRole);

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
      sessionStorage.removeItem('role');
      navigate('/login');
    }
  };

  const toggleSidebar = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsSidebarOpen(!isSidebarOpen);
  };

  const [isTrackingActive, setIsTrackingActive] = useState(false);
  const [lastActivity, setLastActivity] = useState(Date.now());
  const [idleTimer, setIdleTimer] = useState(null);
  const [socket, setSocket] = useState(null);
  const [isPausedByIdle, setIsPausedByIdle] = useState(false);

  // 🔌 SOCKET INITIALIZATION
  useEffect(() => {
    if (!token) return;
    const s = io(window.location.origin, { withCredentials: true });

    s.on('connect', () => {
      const user = JSON.parse(sessionStorage.getItem('user'));
      if (user) s.emit('join_notifications', { userId: user._id || user.id, role: user.role });
    });

    s.on('notification', (data) => {
      const newAlert = {
        type: data.type || 'task',
        text: data.message,
        time: 'Just Now',
        path: data.type === 'task' ? `/${activeRole}/task-management` : `/${activeRole}/dashboard`
      };
      setLiveNotifications(prev => [newAlert, ...prev].slice(0, 5));
      toast(data.message, { icon: '🔔', style: { borderRadius: '5px', background: '#201515', color: '#fff', fontWeight: 900, fontSize: '12px' } });
    });

    s.on('timer_paused', (data) => {
      setIsTrackingActive(false);
      if (data.reason === 'inactivity') {
        setIsPausedByIdle(true);
        console.log("Inactivity Trace: Web-side idle state synchronized");
      }
    });

    s.on('timer_resumed', () => {
      setIsTrackingActive(true);
      setIsPausedByIdle(false);
    });

    setSocket(s);
    return () => s.disconnect();
  }, [token, activeRole]);

  // 🛡️ INITIAL STATUS FETCH & POLLING
  useEffect(() => {
    const fetchStatus = async () => {
      if (!token) return;
      try {
        const res = await axios.get('/api/timer/status', { headers: { Authorization: `Bearer ${token}` } });
        setIsTrackingActive(!!res.data?.isRunning);
        if (res.data?.status === 'idle') setIsPausedByIdle(true);

        // 🔄 Sync last activity from server using clock skew compensation
        if (res.data?.lastActiveTime && res.data?.serverTime) {
          const serverNow = Date.parse(res.data.serverTime);
          const serverLast = Date.parse(res.data.lastActiveTime);
          const localNow = Date.now();

          if (!isNaN(serverNow) && !isNaN(serverLast)) {
            const sinceLast = serverNow - serverLast;
            const adjustedLastActivity = localNow - sinceLast;

            if (adjustedLastActivity > lastActivity) {
              setLastActivity(adjustedLastActivity);
              resetIdleTimer(adjustedLastActivity);
            }
          }
        }
      } catch (err) { console.error('Status fetch failed:', err); }
    };
    fetchStatus();
    const interval = setInterval(fetchStatus, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, [token, lastActivity]);

  // 🛡️ REACTIVE IDLE TIMER
  useEffect(() => {
    if (isTrackingActive) {
      resetIdleTimer();
    }
  }, [lastActivity, isTrackingActive]);

  const [lastServerSync, setLastServerSync] = useState(0);

  const reportActivity = async (type = 'heartbeat') => {
    if (!token || !isTrackingActive) return;
    const now = Date.now();
    if (now - lastServerSync < 15000) return; // 15s throttle

    try {
      await axios.post('/api/timer/update', { type }, { headers: { Authorization: `Bearer ${token}` } });
      setLastServerSync(now);
    } catch (err) { console.error('Heartbeat failed:', err); }
  };

  // 🛡️ NOTIFICATION LOGIC REMOVED PER USER REQUEST
  // Absolute silence protocol active. No browser notifications will be sent.

  const pauseTimer = async () => {
    try {
      await axios.post('/api/timer/update', { type: 'idle' }, { headers: { Authorization: `Bearer ${token}` } });
    } catch (err) { console.error('Pause failed:', err); }
  };

  const resetIdleTimer = (manualTime) => {
    if (idleTimer) clearTimeout(idleTimer);

    const referenceTime = manualTime || lastActivity;
    const timeSinceLast = Date.now() - referenceTime;
    const remaining = Math.max(0, (5 * 60 * 1000) - timeSinceLast);

    const timer = setTimeout(() => {
      if (isTrackingActive) {
        pauseTimer();
      }
    }, remaining);

    setIdleTimer(timer);
  };

  // 🔄 GLOBAL ACTIVITY TRACKER
  useEffect(() => {
    const handleActivity = (e) => {
      const now = Date.now();
      setLastActivity(now);
      resetIdleTimer(now);
      reportActivity(e?.type || 'active');
    };

    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('click', handleActivity);
    window.addEventListener('scroll', handleActivity);
    window.addEventListener('focus', handleActivity);

    const handleVisibilityChange = () => {
      if (document.hidden) {
        // handleHidden logic if needed, but we keep tracking
      } else {
        handleActivity();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    resetIdleTimer();

    return () => {
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('click', handleActivity);
      window.removeEventListener('scroll', handleActivity);
      window.removeEventListener('focus', handleActivity);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (idleTimer) clearTimeout(idleTimer);
    };
  }, [isTrackingActive]);

  const handleResume = async () => {
    try {
      await axios.post('/api/time/resume', {}, { headers: { Authorization: `Bearer ${token}` } });
      const now = Date.now();
      setLastActivity(now);
      resetIdleTimer(now);
      setIsPausedByIdle(false);
    } catch (err) { console.error('Resume failed:', err); }
  };

  const getImageUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http') || path.startsWith('data:')) return path;
    const normalized = path.replace(/\\/g, '/');
    return normalized.startsWith('/') ? normalized : `/${normalized}`;
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#fffefb]">
      <header className="sticky top-0 w-full z-50 bg-[#fffefb] border-b border-[#c5c0b1]">
        <div className="flex items-center h-[56px] w-full px-6">
          <div className="flex items-center gap-6 mr-12">
            <Link to={`/${activeRole}/dashboard`} className="flex items-center gap-3 no-underline">
              <div className="w-8 h-8 bg-[#ff4f00] rounded-[4px] flex items-center justify-center">
                <ShieldCheck size={20} className="text-[#fffefb]" />
              </div>
              <span className="text-[24px] font-bold tracking-tight text-[#201515]">FluidHR</span>
            </Link>
            <button
              onClick={toggleSidebar}
              className="flex items-center justify-center w-10 h-10 hover:bg-[#eceae3] rounded-[5px] text-[#36342e] transition-all cursor-pointer border-none bg-transparent"
            >
              <Menu size={22} />
            </button>
          </div>
          <nav className="hidden xl:flex items-center h-full gap-2">
            {menuItems.slice(0, 4).map(item => (
              <Link
                key={item.path}
                to={item.path}
                className={`zap-tab ${location.pathname === item.path ? 'zap-tab-active' : ''}`}
              >
                {item.name}
              </Link>
            ))}
          </nav>
          <div className="ml-auto flex items-center h-full gap-4">
            {/* ⏱️ GLOBAL INACTIVITY TRACKER */}
            {isPausedByIdle && (
              <button
                onClick={handleResume}
                className="flex items-center gap-2 px-4 py-1.5 bg-[#ff4f00] text-white rounded-[5px] border-none cursor-pointer hover:bg-[#e64600] transition-all animate-pulse"
              >
                <Play size={14} fill="currentColor" />
                <span className="text-[10px] font-black uppercase tracking-widest">Resume Timer</span>
              </button>
            )}
            {isTrackingActive && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-[#eceae3] rounded-[5px] border border-[#c5c0b1]">
                <div className="w-1.5 h-1.5 rounded-full bg-[#24a148]"></div>
                <span className="text-[10px] font-black text-[#201515] uppercase tracking-widest tabular-nums">
                  Active
                </span>
              </div>
            )}
            {!isTrackingActive && !isPausedByIdle && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-[#eceae3] rounded-[5px] border border-[#c5c0b1] opacity-50">
                <div className="w-1.5 h-1.5 rounded-full bg-[#939084]"></div>
                <span className="text-[10px] font-black text-[#201515] uppercase tracking-widest">Offline</span>
              </div>
            )}

            <button className="w-10 h-10 flex items-center justify-center text-[#36342e] hover:text-[#ff4f00] transition-colors relative group">
              <Search size={20} />
            </button>

            <div className="relative" ref={notificationRef}>
              <button
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className={`w-10 h-10 flex items-center justify-center rounded-[5px] transition-all relative ${isNotificationsOpen ? 'bg-[#ff4f00] text-white shadow-lg' : 'text-[#36342e] hover:bg-[#eceae3]'}`}
              >
                <Bell size={20} />
                {liveNotifications.length > 0 && (
                  <span className="absolute top-2 right-2 w-2 h-2 bg-[#ff4f00] border-2 border-[#fffefb] rounded-full"></span>
                )}
              </button>

              {isNotificationsOpen && (
                <div className="absolute top-[80px] right-0 w-80 bg-white border border-[#c5c0b1] rounded-[5px] shadow-[0_20px_50px_rgba(0,0,0,0.1)] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-[100]">
                  <div className="p-4 border-b border-[#eceae3] bg-[#fffdf9] flex justify-between items-center">
                    <span className="text-[11px] font-black uppercase tracking-widest text-[#201515]">Intelligence Alerts</span>
                    {liveNotifications.length > 0 && (
                      <span className="px-2 py-0.5 bg-[#ff4f00]/10 text-[#ff4f00] text-[8px] font-black rounded-full uppercase">
                        {liveNotifications.length} New
                      </span>
                    )}
                  </div>
                  <div className="max-h-[320px] overflow-y-auto">
                    {liveNotifications.length === 0 ? (
                      <div className="p-8 text-center opacity-40">
                        <p className="text-[10px] font-black uppercase tracking-widest text-[#939084]">No Active Alerts</p>
                      </div>
                    ) : (
                      liveNotifications.map((n, i) => (
                        <div
                          key={i}
                          onClick={() => {
                            navigate(n.path);
                            setIsNotificationsOpen(false);
                          }}
                          className="p-4 border-b border-[#eceae3] hover:bg-[#fffdf9] transition-all cursor-pointer group"
                        >
                          <div className="flex gap-3">
                            <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${n.type === 'rework' ? 'bg-red-500' : 'bg-[#ff4f00]'}`}></div>
                            <div>
                              <p className="text-[12px] font-bold text-[#201515] leading-tight group-hover:text-[#ff4f00] transition-colors">{n.text}</p>
                              <p className="text-[9px] font-black text-[#939084] uppercase tracking-widest mt-1">{n.time}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  <button
                    onClick={() => { navigate(`/${role}/dashboard`); setIsNotificationsOpen(false); }}
                    className="w-full py-3 bg-[#eceae3] text-[10px] font-black text-[#201515] uppercase tracking-[0.2em] hover:bg-[#c5c0b1] transition-all border-none"
                  >
                    View All Activity
                  </button>
                </div>
              )}
            </div>

            <div
              onClick={() => navigate(`/${role}/profile`)}
              className="hidden md:flex items-center gap-3 px-4 h-12 hover:bg-[#eceae3] rounded-[4px] cursor-pointer transition-all"
            >
              <div className="w-8 h-8 bg-[#201515] rounded-full flex items-center justify-center text-[#fffefb] font-bold text-[13px] overflow-hidden">
                {userProfile?.profileImage ? (
                  <img src={getImageUrl(userProfile.profileImage)} alt="" className="w-full h-full object-cover" />
                ) : (
                  initials
                )}
              </div>
              <div className="flex flex-col items-start leading-none">
                <span className="text-[13px] font-bold text-[#201515] truncate max-w-[150px]">{displayName}</span>
                <span className="text-[10px] font-bold text-[#939084] uppercase tracking-wider mt-1">{displayRole}</span>
              </div>
            </div>
            <button onClick={handleLogout} className="zap-btn zap-btn-orange">Log out</button>
          </div>
        </div>
      </header>
      <div className="flex flex-1 w-full relative">
        <aside
          className="bg-transparent flex flex-col shrink-0 border-r border-[#c5c0b1] transition-[width] duration-300 ease-in-out overflow-y-auto scrollbar-hide hidden md:flex sticky top-[56px] h-[calc(100vh-56px)]"
          style={{ width: isSidebarOpen ? '220px' : '64px' }}
        >
          <div className="flex flex-col pb-12 w-full">
            <nav className="flex-1 space-y-2 pt-[10px] px-3">
              {menuItems.map((item) => {
                const isActive = location.pathname === item.path;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center h-12 text-[15px] font-bold no-underline rounded-[5px] transition-all border border-transparent group ${isSidebarOpen ? 'px-4 gap-3 w-full' : 'px-0 justify-center w-full'} ${isActive ? 'text-[#ff4f00] bg-[#fffdf9] !border-[#ff4f00] shadow-sm' : 'text-[#201515] hover:bg-[#eceae3] hover:border-[#c5c0b1]'}`}
                    title={!isSidebarOpen ? item.name : ""}
                  >
                    <div className={`shrink-0 flex items-center justify-center transition-all ${isSidebarOpen ? 'w-5' : 'w-12'}`}>
                      <Icon size={20} className={isActive ? 'text-[#ff4f00]' : 'text-[#939084]'} />
                    </div>
                    {isSidebarOpen && <span className="truncate whitespace-nowrap overflow-hidden transition-opacity duration-200">{item.name}</span>}
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>
        <main className="flex-1 min-w-0 overflow-hidden bg-[#fffefb] relative flex flex-col">
          {location.pathname.endsWith('/chat') ? (
            <div className="h-[calc(100vh-56px)] relative overflow-hidden">
              <Outlet />
              {children}
            </div>
          ) : (
            <div className="py-6 px-6 lg:px-8 max-w-[1600px] mx-auto animate-fade-in w-full min-h-full flex flex-col">
              <div className="flex-1">
                <Outlet />
                {children}
              </div>
              {/* LARGE VERTICAL SPACER */}
              <div className="h-24 shrink-0"></div>
            </div>
          )}
        </main>
      </div>
      {!location.pathname.endsWith('/chat') && (
      <footer className="py-6 px-12 border-t border-[#c5c0b1] bg-[#fffefb] flex justify-between items-center text-[11px] text-[#939084] font-bold uppercase tracking-widest z-50">
        <div className="flex gap-10 items-center">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-[#ff4f00] rounded-full animate-pulse"></div>
            <span className="text-[#201515]">Connected</span>
          </div>
          <span>v2.4.0 Automator</span>
        </div>
        <span>© 2026 Zapier HR Infrastructure</span>
      </footer>
      )}
    </div>
  );
};

export default MainLayout;
