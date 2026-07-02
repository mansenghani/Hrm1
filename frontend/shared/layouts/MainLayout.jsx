import React, { useState, useEffect, useRef } from 'react';
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
  PlusCircle,
  User,
  Globe,
  ChevronDown,
  Moon,
  Sun
} from 'lucide-react';
import { io } from 'socket.io-client';
import { API_BASE_URL } from '@shared/services/api';

const MainLayout = ({ children, navItems, userRole, userName, onLogout }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
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
  const [liveNotifications, setLiveNotifications] = useState([]);
  const notificationRef = React.useRef(null);
  const searchRef = React.useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  const toggleTheme = () => {
    const nextDark = !isDarkMode;
    document.documentElement.classList.add('theme-transitioning');
    setIsDarkMode(nextDark);
    document.documentElement.classList.toggle('dark', nextDark);
    localStorage.setItem('theme', nextDark ? 'dark' : 'light');
    setTimeout(() => {
      document.documentElement.classList.remove('theme-transitioning');
    }, 350);
  };

  const role = sessionStorage.getItem('role') || 'admin';
  const token = sessionStorage.getItem('token');
  const [userProfile, setUserProfile] = useState(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchDebounceRef = React.useRef(null);

  // 🛡️ DYNAMIC ROLE DERIVATION (URL-FIRST)
  const pathRole = location.pathname.split('/')[1];
  const roleMap = { admin: 'admin', hr: 'hr', manager: 'manager', employee: 'employee' };
  const activeRole = roleMap[pathRole] ? pathRole : role;

  // ── SEARCH HANDLER ──────────────────────────────────────────
  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (!query.trim()) { setSearchResults([]); setIsSearchOpen(false); return; }
    setIsSearchOpen(true);
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const headers = { Authorization: `Bearer ${token}` };
        const q = query.toLowerCase();
        const results = [];

        // Search Employees
        try {
          const empRes = await axios.get('/api/employees', { headers });
          const emps = Array.isArray(empRes.data) ? empRes.data : [];
          emps.filter(e => {
            const name = (e.userId?.name || e.fullName || '').toLowerCase();
            const id = (e.employeeId || '').toLowerCase();
            const dept = (e.department || '').toLowerCase();
            return name.includes(q) || id.includes(q) || dept.includes(q);
          }).slice(0, 4).forEach(e => results.push({
            category: 'Employee',
            title: e.userId?.name || e.fullName || 'Unknown',
            subtitle: `${e.employeeId || ''} · ${e.department || e.role || ''}`,
            path: `/${activeRole}/employees/view/${e._id || e.id}`,
            icon: '👤'
          }));
        } catch (_) { }

        // Search Leave Requests
        try {
          const leaveRes = await axios.get('/api/leaves', { headers });
          const leaves = Array.isArray(leaveRes.data) ? leaveRes.data : (leaveRes.data?.data || []);
          leaves.filter(l => {
            const type = (l.leaveType || l.type || '').toLowerCase();
            const status = (l.status || '').toLowerCase();
            const emp = (l.employee?.name || '').toLowerCase();
            return type.includes(q) || status.includes(q) || emp.includes(q);
          }).slice(0, 3).forEach(l => results.push({
            category: 'Leave',
            title: `${l.leaveType || l.type || 'Leave'} — ${l.employee?.name || 'Employee'}`,
            subtitle: `Status: ${l.status} · ${new Date(l.startDate || l.createdAt).toLocaleDateString()}`,
            path: `/${activeRole}/leave`,
            icon: '📅'
          }));
        } catch (_) { }

        // Search Payroll
        try {
          const payRes = await axios.get('/api/payroll', { headers });
          const payrolls = Array.isArray(payRes.data) ? payRes.data : [];
          payrolls.filter(p => {
            const name = (p.employeeId?.userId?.name || p.employeeName || '').toLowerCase();
            return name.includes(q);
          }).slice(0, 3).forEach(p => results.push({
            category: 'Payroll',
            title: p.employeeId?.userId?.name || p.employeeName || 'Employee',
            subtitle: `Net: ${p.netSalary || p.basicSalary || 'N/A'} · ${p.month || ''}`,
            path: `/${activeRole}/payroll`,
            icon: '💰'
          }));
        } catch (_) { }

        // Quick nav page suggestions — full list from all roles
        const allPages = [
          { label: 'Dashboard', path: `/${activeRole}/dashboard` },
          { label: 'Employees', path: `/${activeRole}/employees` },
          { label: 'Departments', path: `/${activeRole}/departments` },
          { label: 'Leave Management', path: `/${activeRole}/leave` },
          { label: 'Attendance', path: `/${activeRole}/attendance` },
          { label: 'Time Tracker', path: `/${activeRole}/time-tracker` },
          { label: 'Payroll', path: `/${activeRole}/payroll` },
          { label: 'Performance', path: `/${activeRole}/performance` },
          { label: 'Tasks', path: `/${activeRole}/tasks` },
          { label: 'Daily Tasks Board', path: `/${activeRole}/tasks` },
          { label: 'Task Management', path: `/${activeRole}/task-management` },
          { label: 'Reports', path: `/${activeRole}/reports` },
          { label: 'Notifications', path: `/${activeRole}/notifications` },
          { label: 'Settings', path: `/${activeRole}/settings` },
          { label: 'Monitoring Logs', path: `/${activeRole}/screenshots` },
          { label: 'Team Chat', path: `/${activeRole}/chat` },
          { label: 'Global Chat', path: `/${activeRole}/chat` },
          { label: 'Profile', path: `/${activeRole}/profile` },
          { label: 'Create User', path: `/${activeRole}/create-user` },
        ];
        const navSuggestions = allPages.filter(s => s.label.toLowerCase().includes(q));

        navSuggestions.slice(0, 3).forEach(s => results.push({
          category: 'Page',
          title: s.label,
          subtitle: 'Go to page',
          path: s.path,
          icon: '🔗'
        }));

        setSearchResults(results);
      } catch (err) {
        console.error('[SEARCH ERROR]', err);
      } finally {
        setIsSearching(false);
      }
    }, 350);
  };

  // Close search on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);


  useEffect(() => {
    const fetchNotifications = async () => {
      if (!token) return;
      try {
        const res = await axios.get('/api/notifications', { headers: { Authorization: `Bearer ${token}` } });
        const items = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data?.notifications)
            ? res.data.notifications
            : Array.isArray(res.data?.data)
              ? res.data.data
              : [];
        const alerts = items.map(n => ({
          id: n._id,
          type: n.type || 'task',
          text: n.message,
          read: n.read || false,
          time: n.createdAt ? new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recently',
          path: `/${activeRole}/notifications`
        }));
        setLiveNotifications(alerts.slice(0, 10));
      } catch (err) { console.error('Notification fetch failed:', err); }
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

  // 🔔 REAL-TIME SOCKET NOTIFICATIONS
  useEffect(() => {
    if (!token) return;
    const userId = (() => { try { return JSON.parse(atob(token.split('.')[1]))?.id; } catch { return null; } })();
    if (!userId) return;

    const socket = io(API_BASE_URL, { transports: ['websocket', 'polling'] });

    socket.on('connect', () => {
      socket.emit('join_notifications', { userId, role });
    });

    socket.on('new_notification', (notif) => {
      const formatted = {
        id: notif._id,
        type: notif.type || 'announcement',
        text: notif.message,
        read: false,
        batchId: notif.batchId,
        time: new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        path: `/${activeRole}/notifications`
      };
      setLiveNotifications(prev => [formatted, ...prev].slice(0, 10));

      // Show Native OS Desktop Notification
      if ('Notification' in window) {
        if (Notification.permission === 'granted') {
          new Notification('New Announcement', { body: notif.message });
        } else if (Notification.permission !== 'denied') {
          Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
              new Notification('New Announcement', { body: notif.message });
            }
          });
        }
      }
    });

    socket.on('update_notification', (notif) => {
      setLiveNotifications(prev => prev.map(n =>
        (n.id === notif._id || (n.batchId && n.batchId === notif.batchId)) ? { ...n, text: notif.message } : n
      ));
    });

    socket.on('delete_notification', (notif) => {
      setLiveNotifications(prev => prev.filter(n =>
        !(n.id === notif._id || (n.batchId && n.batchId === notif.batchId))
      ));
    });

    return () => socket.disconnect();
  }, [token, role, activeRole]);

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
          { name: 'Attendance', path: '/hr/attendance', icon: Calendar },
          { name: 'Time Tracker', path: '/hr/time-tracker', icon: Clock },
          { name: 'Team Chat', path: '/hr/chat', icon: MessageSquare },
          { name: 'Payroll', path: '/hr/payroll', icon: Wallet },
          { name: 'Performance', path: '/hr/performance', icon: TrendingUp },
          { name: 'Tasks', path: '/hr/tasks', icon: CheckSquare },
          { name: 'Reports', path: '/hr/reports', icon: BarChart3 },
          { name: 'Notifications', path: '/hr/notifications', icon: Bell },
          { name: 'Settings', path: '/hr/settings', icon: Settings },
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
          { name: 'Team Attendance', path: '/manager/attendance', icon: Calendar },
          { name: 'Monitoring Logs', path: '/manager/screenshots', icon: Camera },
          { name: 'Notifications', path: '/manager/notifications', icon: Bell },
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
          { name: 'Attendance', path: `/${currentRole}/attendance`, icon: Calendar },
          { name: 'Time Tracker', path: `/${currentRole}/time-tracker`, icon: Clock },
          { name: 'Global Chat', path: `/${currentRole}/chat`, icon: MessageSquare },
          { name: 'Payroll', path: `/${currentRole}/payroll`, icon: Wallet },
          { name: 'Performance', path: `/${currentRole}/performance`, icon: TrendingUp },
          { name: 'Reports', path: `/${currentRole}/reports`, icon: BarChart3 },
          { name: 'Monitoring Logs', path: `/${currentRole}/screenshots`, icon: Camera },
          { name: 'Notifications', path: `/${currentRole}/notifications`, icon: Bell },
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
  const [trackerRawStatus, setTrackerRawStatus] = useState('offline');

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
      setTrackerRawStatus(data.status || 'paused');
    });

    s.on('timer_resumed', () => {
      setIsTrackingActive(true);
      setIsPausedByIdle(false);
      setTrackerRawStatus('active');
    });

    setSocket(s);
    return () => s.disconnect();
  }, [token, activeRole]);

  // 🛡️ STATUS FETCH & POLLING ONLY (Let desktop app handle tracking and idle events)
  useEffect(() => {
    const fetchStatus = async () => {
      if (!token) return;
      try {
        const res = await axios.get('/api/time/status', { headers: { Authorization: `Bearer ${token}` } });
        setIsTrackingActive(!!res.data?.isRunning);
        if (res.data?.status === 'idle') setIsPausedByIdle(true);
        setTrackerRawStatus(res.data?.status || 'offline');

        if (res.data?.lastActiveTime && res.data?.serverTime) {
          const serverNow = Date.parse(res.data.serverTime);
          const serverLast = Date.parse(res.data.lastActiveTime);
          const localNow = Date.now();

          if (!isNaN(serverNow) && !isNaN(serverLast)) {
            const sinceLast = serverNow - serverLast;
            const adjustedLastActivity = localNow - sinceLast;
            if (adjustedLastActivity > lastActivity) {
              setLastActivity(adjustedLastActivity);
            }
          }
        }
      } catch (err) { console.error('Status fetch failed:', err); }
    };
    fetchStatus();
    const interval = setInterval(fetchStatus, 10000); // Poll status every 10s
    return () => clearInterval(interval);
  }, [token, lastActivity]);

  const handleResume = async () => {
    try {
      await axios.post('/api/time/resume', {}, { headers: { Authorization: `Bearer ${token}` } });
      setLastActivity(Date.now());
      setIsPausedByIdle(false);
    } catch (err) { console.error('Resume failed:', err); }
  };

  const getImageUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http') || path.startsWith('data:')) return path;
    const normalized = path.replace(/\\/g, '/');
    return normalized.startsWith('/') ? normalized : `/${normalized}`;
  };

  const employeeOverviewItems = [
    { name: 'Dashboard', path: '/employee/dashboard', icon: LayoutDashboard },
  ];

  const employeeMeItems = [
    { name: 'My Profile', path: '/employee/profile', icon: User },
    { name: 'My Attendance', path: '/employee/time-tracker', icon: Clock },
    { name: 'My Leave', path: '/employee/leave', icon: Calendar },
    { name: 'My Payslips', path: '/employee/payslips', icon: Wallet },
    { name: 'My Documents', path: '/employee/documents', icon: FileText },
    { name: 'My Performance', path: '/employee/performance', icon: Target },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#fffefb] dark:bg-[#08100e] text-[#201515] dark:text-[#e2e8f0] transition-colors duration-300 ease-in-out">
      <header className="sticky top-0 w-full z-50 border-b border-[#c5c0b1] dark:border-[#1a2d29] bg-white/80 dark:bg-[#08100e]/80 backdrop-blur-md transition-colors duration-300 ease-in-out">
        <div className="flex items-center h-[56px] w-full px-6">
          <div className="flex items-center gap-6 mr-6">
            <Link to={`/${activeRole}/dashboard`} className="flex items-center gap-3 no-underline">
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
              onClick={toggleSidebar}
              className="flex items-center justify-center w-10 h-10 hover:bg-[#eceae3] rounded-[5px] text-[#36342e] transition-all cursor-pointer border-none bg-transparent"
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
            <Plus size={15} strokeWidth={2.8} />
            <span>Quick action</span>
          </button>

          <div className="ml-auto flex items-center h-full gap-2">
            {/* ⏱️ GLOBAL INACTIVITY TRACKER */}
            {isPausedByIdle && (
              <button
                onClick={handleResume}
                className="flex items-center gap-2 px-4 py-1.5 bg-[#ff4f00] text-white rounded-full border-none cursor-pointer hover:bg-[#e64600] transition-all animate-pulse mr-2"
              >
                <Play size={14} fill="currentColor" />
                <span className="text-[10px] font-black uppercase tracking-widest">Resume Timer</span>
              </button>
            )}
            {isTrackingActive && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-[#eceae3] rounded-full border border-[#c5c0b1] mr-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#24a148]"></div>
                <span className="text-[10px] font-black text-[#201515] uppercase tracking-widest tabular-nums">
                  Active
                </span>
              </div>
            )}
            {!isTrackingActive && !isPausedByIdle && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-[#eceae3] rounded-full border border-[#c5c0b1] opacity-50 mr-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#939084]"></div>
                <span className="text-[10px] font-black text-[#201515] uppercase tracking-widest">Offline</span>
              </div>
            )}

            {/* Utility panel icons */}
            <button className="w-9 h-9 flex items-center justify-center text-gray-500 hover:text-gray-800 transition-colors rounded-full hover:bg-gray-100 border-none bg-transparent cursor-pointer">
              <Globe size={18} />
            </button>

            <button
              onClick={toggleTheme}
              className="w-9 h-9 flex items-center justify-center text-gray-500 hover:text-gray-800 transition-colors rounded-full hover:bg-gray-100 border-none bg-transparent cursor-pointer"
            >
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <button
              onClick={() => navigate(`/${activeRole}/chat`)}
              className="w-9 h-9 flex items-center justify-center text-gray-500 hover:text-gray-800 transition-colors rounded-full hover:bg-gray-100 border-none bg-transparent cursor-pointer"
            >
              <MessageSquare size={18} />
            </button>

            <div className="relative" ref={notificationRef}>
              <button
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className={`w-9 h-9 flex items-center justify-center rounded-full transition-all relative border-none bg-transparent cursor-pointer ${isNotificationsOpen ? 'bg-[#00a76b] text-white shadow-lg' : 'text-gray-500 hover:bg-gray-100'}`}
              >
                <Bell size={18} />
                {liveNotifications.length > 0 && (
                  <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                )}
              </button>

              {isNotificationsOpen && (
                <div className="absolute top-[48px] right-0 w-80 bg-white dark:bg-[#111c18] border border-[#c5c0b1] dark:border-[#1a2d29] rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.3)] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-[100]">
                  <div className="p-4 border-b border-[#eceae3] dark:border-[#1a2d29] bg-[#fffdf9] dark:bg-[#162722] flex justify-between items-center">
                    <span className="text-[11px] font-black uppercase tracking-widest text-[#201515] dark:text-white">Intelligence Alerts</span>
                    {liveNotifications.length > 0 && (
                      <span className="px-2 py-0.5 bg-[#00a76b]/10 text-[#00a76b] text-[8px] font-black rounded-full uppercase">
                        {liveNotifications.length} New
                      </span>
                    )}
                  </div>
                  <div className="max-h-[320px] overflow-y-auto">
                    {liveNotifications.length === 0 ? (
                      <div className="p-8 text-center opacity-40">
                        <p className="text-[10px] font-black uppercase tracking-widest text-[#939084] dark:text-[#a3b3af]">No Active Alerts</p>
                      </div>
                    ) : (
                      liveNotifications.map((n, i) => (
                        <div
                          key={i}
                          onClick={() => {
                            navigate(n.path);
                            setIsNotificationsOpen(false);
                          }}
                          className="p-4 border-b border-[#eceae3] dark:border-[#1a2d29] hover:bg-[#fffdf9] dark:hover:bg-[#162722]/50 transition-all cursor-pointer group"
                        >
                          <div className="flex gap-3">
                            <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${n.type === 'rework' ? 'bg-red-500' : 'bg-[#00a76b]'}`}></div>
                            <div>
                              <p className="text-[12px] font-bold text-[#201515] dark:text-[#e2e8f0] leading-tight group-hover:text-[#00a76b] transition-colors">{n.text}</p>
                              <p className="text-[9px] font-black text-[#939084] dark:text-[#a3b3af] uppercase tracking-widest mt-1">{n.time}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  <button
                    onClick={() => { navigate(`/${role}/dashboard`); setIsNotificationsOpen(false); }}
                    className="w-full py-3 bg-[#eceae3] dark:bg-[#162722] text-[10px] font-black text-[#201515] dark:text-white uppercase tracking-[0.2em] hover:bg-[#c5c0b1] dark:hover:bg-[#111c18] transition-all border-none cursor-pointer"
                  >
                    View All Notifications
                  </button>
                </div>
              )}
            </div>

            {/* Profile Dropdown Component */}
            <div className="relative">
              <div
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className="hidden md:flex items-center gap-3 px-3 h-11 hover:bg-gray-100 dark:hover:bg-[#111c18] rounded-full cursor-pointer transition-all select-none"
              >
                <div className="w-8 h-8 rounded-full border-2 border-[#00a76b] flex items-center justify-center bg-[#201515] text-[#fffefb] font-bold text-[13px] overflow-hidden">
                  {userProfile?.profileImage ? (
                    <img src={getImageUrl(userProfile.profileImage)} alt="" className="w-full h-full object-cover" />
                  ) : (
                    initials
                  )}
                </div>
                <div className="flex flex-col items-start leading-none">
                  <span className="text-[12px] font-bold text-[#201515] dark:text-white truncate max-w-[120px]">{displayName}</span>
                  <span className="text-[9px] font-bold text-[#939084] dark:text-[#a3b3af] uppercase tracking-wider mt-1">{displayRole}</span>
                </div>
                <ChevronDown size={14} className="text-gray-500" />
              </div>

              {isProfileDropdownOpen && (
                <div className="absolute top-[48px] right-0 w-48 bg-white dark:bg-[#111c18] border border-[#c5c0b1] dark:border-[#1a2d29] rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.08)] overflow-hidden z-[100] py-1">
                  <button
                    onClick={() => { navigate(`/${activeRole}/profile`); setIsProfileDropdownOpen(false); }}
                    className="w-full px-4 py-2.5 text-left text-sm font-semibold text-gray-700 dark:text-[#cbd5e1] hover:bg-[#f2fbf6] dark:hover:bg-[#162722] hover:text-[#00a76b] transition-all border-none bg-transparent cursor-pointer"
                  >
                    My Profile
                  </button>
                  <button
                    onClick={() => { navigate(`/${activeRole}/settings`); setIsProfileDropdownOpen(false); }}
                    className="w-full px-4 py-2.5 text-left text-sm font-semibold text-gray-700 dark:text-[#cbd5e1] hover:bg-[#f2fbf6] dark:hover:bg-[#162722] hover:text-[#00a76b] transition-all border-none bg-transparent cursor-pointer"
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
        <aside
          className="flex flex-col shrink-0 border-r border-[#c5c0b1] dark:border-[#1a2d29] transition-[width] duration-300 ease-in-out overflow-y-auto scrollbar-hide hidden md:flex sticky top-[56px] h-[calc(100vh-56px)]"
          style={{
            width: isSidebarOpen ? '220px' : '64px',
            backgroundColor: isDarkMode ? '#050c0a' : (activeRole === 'employee' ? '#f2fbf6' : '#fffefb'),
            transition: 'width 0.3s ease-in-out, background-color 0.3s ease, border-color 0.3s ease'
          }}
        >
          <div className="flex flex-col pb-12 w-full">
            {activeRole === 'employee' ? (
              <nav className="flex-1 space-y-4 pt-[10px] px-3">
                {/* OVERVIEW Group */}
                <div>
                  {isSidebarOpen && (
                    <p className="px-4 text-[10px] font-black text-[#939084] dark:text-[#527068] uppercase tracking-[0.2em] mb-2">
                      Overview
                    </p>
                  )}
                  <div className="space-y-1">
                    {employeeOverviewItems.map((item) => {
                      const isActive = location.pathname === item.path;
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.path}
                          to={item.path}
                          className={`flex items-center h-12 text-[15px] font-bold no-underline rounded-[999px] transition-all group ${isSidebarOpen ? 'px-4 gap-3 w-full' : 'px-0 justify-center w-full'} ${isActive ? 'text-white bg-[#00a76b] shadow-sm' : 'text-[#201515] dark:text-[#a3b3af] hover:bg-[#eceae3]/60 dark:hover:bg-[#111c18]'}`}
                          title={!isSidebarOpen ? item.name : ""}
                        >
                          <div className={`shrink-0 flex items-center justify-center transition-all ${isSidebarOpen ? 'w-5' : 'w-12'}`}>
                            <Icon size={20} className={isActive ? 'text-white' : 'text-[#36342e] dark:text-[#a3b3af]'} />
                          </div>
                          {isSidebarOpen && <span className="truncate whitespace-nowrap overflow-hidden transition-opacity duration-200">{item.name}</span>}
                        </Link>
                      );
                    })}
                  </div>
                </div>

                {/* ME Group */}
                <div>
                  {isSidebarOpen && (
                    <p className="px-4 text-[10px] font-black text-[#939084] dark:text-[#527068] uppercase tracking-[0.2em] mb-2 mt-4">
                      Me
                    </p>
                  )}
                  <div className="space-y-1">
                    {employeeMeItems.map((item) => {
                      const isActive = location.pathname === item.path;
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.name}
                          to={item.path}
                          className={`flex items-center h-12 text-[15px] font-bold no-underline rounded-[999px] transition-all group ${isSidebarOpen ? 'px-4 gap-3 w-full' : 'px-0 justify-center w-full'} ${isActive ? 'text-white bg-[#00a76b] shadow-sm' : 'text-[#201515] dark:text-[#a3b3af] hover:bg-[#eceae3]/60 dark:hover:bg-[#111c18]'}`}
                          title={!isSidebarOpen ? item.name : ""}
                        >
                          <div className={`shrink-0 flex items-center justify-center transition-all ${isSidebarOpen ? 'w-5' : 'w-12'}`}>
                            <Icon size={20} className={isActive ? 'text-white' : 'text-[#36342e] dark:text-[#a3b3af]'} />
                          </div>
                          {isSidebarOpen && <span className="truncate whitespace-nowrap overflow-hidden transition-opacity duration-200">{item.name}</span>}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </nav>
            ) : (
              <nav className="flex-1 space-y-2 pt-[10px] px-3">
                {menuItems.map((item) => {
                  const isActive = location.pathname === item.path;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center h-12 text-[15px] font-bold no-underline rounded-[5px] transition-all border border-transparent group ${isSidebarOpen ? 'px-4 gap-3 w-full' : 'px-0 justify-center w-full'} ${isActive ? 'text-[#ff4f00] bg-[#fffdf9] !border-[#ff4f00] shadow-sm' : 'text-[#201515] dark:text-[#a3b3af] hover:bg-[#eceae3] dark:hover:bg-[#111c18] hover:border-[#c5c0b1] dark:hover:border-[#1a2d29]'}`}
                      title={!isSidebarOpen ? item.name : ""}
                    >
                      <div className={`shrink-0 flex items-center justify-center transition-all ${isSidebarOpen ? 'w-5' : 'w-12'}`}>
                        <Icon size={20} className={isActive ? 'text-[#ff4f00]' : 'text-[#939084] dark:text-[#a3b3af]'} />
                      </div>
                      {isSidebarOpen && <span className="truncate whitespace-nowrap overflow-hidden transition-opacity duration-200">{item.name}</span>}
                    </Link>
                  );
                })}
              </nav>
            )}
          </div>
        </aside>
        <main className="flex-1 min-w-0 overflow-hidden bg-[#fffefb] dark:bg-[#08100e] relative flex flex-col">
          {location.pathname.endsWith('/chat') ? (
            <div className="h-[calc(100vh-56px)] relative overflow-hidden">
              <Outlet />
              {children}
            </div>
          ) : (
            <div className="animate-fade-in w-full min-h-full flex flex-col">
              <div className="flex-1">
                <Outlet />
                {children}
              </div>
            </div>
          )}
        </main>
      </div>
      {!location.pathname.endsWith('/chat') && (
        <footer className="py-6 px-12 border-t border-[#c5c0b1] dark:border-[#1a2d29] bg-[#fffefb] dark:bg-[#08100e] flex justify-between items-center text-[11px] text-[#939084] dark:text-[#a3b3af] font-bold uppercase tracking-widest z-50">
          <div className="flex gap-10 items-center">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-[#ff4f00] rounded-full animate-pulse"></div>
              <span className="text-[#201515] dark:text-white">Connected</span>
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
