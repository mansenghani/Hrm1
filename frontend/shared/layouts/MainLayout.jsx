import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import ErrorBoundary from '@shared/components/ErrorBoundary';
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
  Sun,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Building2,
  GraduationCap,
  IdCard,
  Plug,
  Award
} from 'lucide-react';
import { io } from 'socket.io-client';
import { API_BASE_URL, getImageUrl } from '@shared/services/api';

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
  const profileRef = React.useRef(null);
  const searchRef = React.useRef(null);
  const triggerRef = React.useRef(null);
  const dropdownRef = React.useRef(null);
  const quickActionRef = React.useRef(null);
  const languageRef = React.useRef(null);

  const [isQuickActionOpen, setIsQuickActionOpen] = useState(false);
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState('English');

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
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState(null);

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
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchResults(null);
      }
      if (quickActionRef.current && !quickActionRef.current.contains(event.target)) {
        setIsQuickActionOpen(false);
      }
      if (languageRef.current && !languageRef.current.contains(event.target)) {
        setIsLanguageOpen(false);
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

  // 🔍 REAL-TIME GLOBAL SEARCH DEBOUNCE HOOK
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults(null);
      return;
    }
    const delayDebounce = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await axios.get(`/api/search/global?q=${encodeURIComponent(searchQuery)}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSearchResults(res.data);
      } catch (err) {
        console.error('Search failed:', err);
      } finally {
        setIsSearching(false);
      }
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [searchQuery, token]);

  // 🛡️ KEYBOARD ACCESSIBILITY HANDLERS
  const handleDropdownKeyDown = (e) => {
    if (e.key === 'Escape') {
      setIsProfileDropdownOpen(false);
      triggerRef.current?.focus();
      return;
    }

    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      const focusableElements = dropdownRef.current?.querySelectorAll('button, [role="menuitem"]');
      if (!focusableElements || focusableElements.length === 0) return;

      const activeElement = document.activeElement;
      const index = Array.from(focusableElements).indexOf(activeElement);

      let nextIndex = index;
      if (e.key === 'ArrowDown') {
        nextIndex = (index + 1) % focusableElements.length;
      } else if (e.key === 'ArrowUp') {
        nextIndex = (index - 1 + focusableElements.length) % focusableElements.length;
      }

      focusableElements[nextIndex]?.focus();
    }
  };

  useEffect(() => {
    if (isProfileDropdownOpen) {
      // Focus on the first item in dropdown for keyboard accessibility
      const firstItem = dropdownRef.current?.querySelector('button, [role="menuitem"]');
      firstItem?.focus();
    }
  }, [isProfileDropdownOpen]);

  const displayRole = userRole || (activeRole === 'hr' ? 'HR Manager' : (role ? role.toUpperCase() : 'ADMIN'));

  useEffect(() => {
    const fetchLatestProfile = async () => {
      if (!token) {
        setIsProfileLoading(false);
        return;
      }
      try {
        setIsProfileLoading(true);
        setProfileError(null);
        const response = await axios.get('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.data) {
          setUserProfile(response.data);
          sessionStorage.setItem('user', JSON.stringify(response.data));
        } else {
          throw new Error('No profile data returned');
        }
      } catch (err) {
        console.error('Profile fetch failed:', err);
        const stored = sessionStorage.getItem('user');
        if (stored && stored !== 'undefined' && stored !== 'null') {
          try {
            setUserProfile(JSON.parse(stored));
          } catch (e) {
            setProfileError('Unable to load profile');
          }
        } else {
          setProfileError('Unable to load profile');
        }
      } finally {
        setIsProfileLoading(false);
      }
    };
    fetchLatestProfile();

    window.addEventListener('profileUpdated', fetchLatestProfile);
    return () => window.removeEventListener('profileUpdated', fetchLatestProfile);
  }, [token]);

  const displayName = userProfile?.name || userProfile?.fullName || userName || 'User';

  const displayEmail = userProfile?.email || 'user@company.com';

  const userRealRole = userProfile?.position || (
    userProfile?.role === 'admin' ? 'Super Admin' :
      userProfile?.role === 'hr' ? 'HR Manager' :
        userProfile?.role === 'manager' ? 'Team Manager' :
          userProfile?.role === 'employee' ? 'Employee' : 'User'
  );

  const activeRoleTitle = activeRole === 'admin' ? 'Super Admin' :
    activeRole === 'hr' ? 'HR Manager' :
      activeRole === 'manager' ? 'Team Manager' :
        activeRole === 'employee' ? 'Employee' : 'User';

  const initials = displayName.split(' ').filter(Boolean).map(n => n[0]).join('').toUpperCase().substring(0, 2) || 'U';

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const baseTitle = 'Verdant HR';
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
          { name: 'Monitoring Logs', path: '/hr/screenshots', icon: Camera },
          { name: 'Notifications', path: '/hr/notifications', icon: Bell },
          { name: 'Settings', path: '/hr/settings', icon: Settings },
        ];
      case 'employee':
        return [
          { name: 'Dashboard', path: '/employee/dashboard', icon: LayoutDashboard },
          { name: 'Time Tracker', path: '/employee/time-tracker', icon: Clock },
          { name: 'Team Chat', path: '/employee/chat', icon: MessageSquare },
          { name: 'Create Task', path: '/employee/task-management/create', icon: PlusCircle },
          { name: 'My Documents', path: '/employee/documents', icon: FileText },
        ];
      case 'manager':
        return [
          { name: 'Dashboard', path: '/manager/dashboard', icon: LayoutDashboard },
          { name: 'Team / Employees', path: '/manager/employees', icon: Users },
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

  const getCategorizedMenuItems = (role) => {
    const categorized = {
      'Overview': [],
      'Workspace': [],
      'Administration': []
    };

    menuItems.forEach(item => {
      const n = item.name.toLowerCase();
      if (n.includes('dashboard') || n.includes('chat') || n.includes('notifications')) {
        categorized['Overview'].push(item);
      } else if (n.includes('settings') || n.includes('log') || n.includes('create user')) {
        categorized['Administration'].push(item);
      } else {
        categorized['Workspace'].push(item);
      }
    });

    const result = {};
    for (const [key, items] of Object.entries(categorized)) {
      if (items.length > 0) result[key] = items;
    }
    return result;
  };

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

  const handleRoleSwitch = (targetRole) => {
    sessionStorage.setItem('role', targetRole);
    const storedUser = sessionStorage.getItem('user');
    if (storedUser) {
      try {
        const userObj = JSON.parse(storedUser);
        userObj.role = targetRole;
        sessionStorage.setItem('user', JSON.stringify(userObj));
      } catch (e) {
        console.error('Failed to sync user role in session:', e);
      }
    }
    setIsProfileDropdownOpen(false);
    navigate(`/${targetRole}/dashboard`);
    window.location.reload();
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
        const res = await axios.get('/api/time/time/status', { headers: { Authorization: `Bearer ${token}` } });
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
      await axios.post('/api/time/timer/update', { type }, { headers: { Authorization: `Bearer ${token}` } });
      setLastServerSync(now);
    } catch (err) { console.error('Heartbeat failed:', err); }
  };

  // 🛡️ NOTIFICATION LOGIC REMOVED PER USER REQUEST
  // Absolute silence protocol active. No browser notifications will be sent.

  const pauseTimer = async () => {
    try {
      await axios.post('/api/time/timer/update', { type: 'idle' }, { headers: { Authorization: `Bearer ${token}` } });
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



  return (
    <div className="flex min-h-screen bg-[#f8fafc] dark:bg-[#08100e] text-[#201515] dark:text-[#e2e8f0] transition-colors duration-300 ease-in-out">
      {/* Mobile Drawer Overlay */}
      {isSidebarOpen && (
        <div
          onClick={toggleSidebar}
          className="fixed inset-0 bg-black/40 z-30 md:hidden animate-in fade-in duration-200"
        />
      )}

      {/* 1. LEFT SIDEBAR (Full height sticky sidebar / slide-out drawer on mobile) */}
      <aside
        className={`flex flex-col shrink-0 border-r transition-all duration-300 ease-in-out h-screen overflow-hidden z-40 fixed md:sticky top-0 ${isSidebarOpen
          ? 'left-0 w-[250px] translate-x-0'
          : '-left-[250px] md:left-0 md:translate-x-0 md:w-[72px]'
          }`}
        style={{
          backgroundColor: isDarkMode ? '#050c0a' : '#f4f9f6',
          borderColor: isDarkMode ? '#1a2d29' : '#e2eae7'
        }}
      >
        {/* Brand Block */}
        <div className={`px-6 py-5 flex items-center border-b ${isSidebarOpen ? 'gap-3' : 'justify-center'}`} style={{ height: '70px', borderColor: isDarkMode ? '#1a2d29' : '#e2eae7' }}>
          <div className="w-10 h-10 bg-[#00a76b] rounded-full flex items-center justify-center flex-shrink-0 shadow-sm transition-all duration-300 hover:scale-105">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3c0 4.5-4.5 9-9 9 4.5 0 9 4.5 9 9 0-4.5 4.5-9 9-9-4.5 0-9-4.5-9-9z" />
              <path d="M18 5h4M20 3v4" strokeWidth="2" />
            </svg>
          </div>
          {isSidebarOpen && (
            <div className="flex flex-col items-start leading-tight animate-fade-in">
              <span className="text-[16px] font-bold text-[#1f2937] dark:text-white tracking-tight">Verdant HR</span>
              <span className="text-[11px] font-semibold text-[#829e92] dark:text-[#a3b3af]">Workforce OS</span>
            </div>
          )}
        </div>

        {/* Sidebar Navigation */}
        <div className="flex-1 flex flex-col pb-12 w-full pt-6 px-4 space-y-6 overflow-y-auto scrollbar-hide">
          {(() => {
            const categorized = getCategorizedMenuItems(activeRole);
            return Object.entries(categorized).map(([category, items]) => (
              <div key={category} className="space-y-1.5">
                {isSidebarOpen && (
                  <p className="px-4 text-[11px] font-bold text-[#829e92] dark:text-[#527068] uppercase tracking-[0.15em] mb-2.5 mt-1">
                    {category}
                  </p>
                )}
                <div className="space-y-1.5">
                  {items.map((item) => {
                    const isSettingsPath = item.path.includes('/settings');
                    const hasTabParam = item.path.includes('?tab=');

                    let isActive = false;
                    if (isSettingsPath) {
                      const params = new URLSearchParams(location.search);
                      const currentTab = params.get('tab') || 'company-settings';
                      if (hasTabParam) {
                        const tabVal = item.path.split('?tab=')[1];
                        isActive = currentTab === tabVal;
                      } else {
                        isActive = currentTab === 'company-settings';
                      }
                    } else {
                      const isDashboard = item.name === 'Dashboard';
                      if (isDashboard) {
                        isActive = location.pathname === item.path ||
                          location.pathname === `/${activeRole}` ||
                          location.pathname === `/${activeRole}/` ||
                          location.pathname.startsWith(item.path + '/');
                      } else {
                        isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
                      }
                    }
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => {
                          if (window.innerWidth < 768) {
                            setIsSidebarOpen(false);
                          }
                        }}
                        className={`flex items-center h-12 text-[15px] font-semibold no-underline rounded-full transition-all group ${isSidebarOpen ? 'px-4 gap-3.5 w-full' : 'px-0 justify-center w-full'} ${isActive ? 'text-white bg-[#00a76b] shadow-sm' : 'text-[#475569] dark:text-[#a3b3af] hover:bg-[#eceae3]/40 dark:hover:bg-[#111c18]/50 hover:text-[#00a76b]'}`}
                        title={!isSidebarOpen ? item.name : ""}
                      >
                        <div className={`shrink-0 flex items-center justify-center transition-all ${isSidebarOpen ? 'w-5' : 'w-12'}`}>
                          <Icon size={18} className={isActive ? 'text-white' : 'text-slate-500 dark:text-[#829e92] group-hover:text-[#00a76b] transition-colors'} />
                        </div>
                        {isSidebarOpen && <span className="truncate whitespace-nowrap overflow-hidden transition-opacity duration-200">{item.name}</span>}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ));
          })()}
        </div>
      </aside>

      {/* 2. RIGHT CONTENT AREA (Header + main page content) */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 w-full z-[150] border-b bg-white dark:bg-[#08100e] transition-colors duration-300 ease-in-out" style={{ height: '70px', borderColor: isDarkMode ? '#1a2d29' : '#e2eae7' }}>
          <div className="flex items-center h-full w-full px-6">
            <button
              onClick={toggleSidebar}
              className="md:hidden flex items-center justify-center w-10 h-10 hover:bg-slate-100 dark:hover:bg-slate-800/80 rounded-full text-[#374151] dark:text-[#cbd5e1] transition-all cursor-pointer border-none bg-transparent mr-4"
            >
              <Menu size={22} />
            </button>

            {/* Search bar in the center-left (hidden on mobile) */}
            <div className="hidden sm:block flex-1 max-w-[340px] relative" ref={searchRef}>
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Search size={18} />
              </div>
              <input
                type="text"
                placeholder="Search employees, requests, payroll..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-[#f3f4f6] dark:bg-[#111c18] border-none rounded-full text-sm font-semibold text-gray-700 dark:text-[#a3b3af] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00a76b]/20 focus:bg-white dark:focus:bg-[#162722] transition-all"
              />
              {isSearching && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <RefreshCw size={14} className="animate-spin text-[#00a76b]" />
                </div>
              )}

              {/* SEARCH RESULTS DROPDOWN */}
              {searchResults && (searchQuery.trim().length > 0) && (
                <div className="absolute top-[45px] left-0 w-[450px] bg-white dark:bg-[#0c1512] border border-[#eceae3] dark:border-[#1a2d29] rounded-[20px] shadow-[0_20px_50px_rgba(0,0,0,0.15)] overflow-hidden z-[110] max-h-[400px] overflow-y-auto p-4 space-y-4">
                  {/* Category: Employees */}
                  {searchResults.employees && searchResults.employees.length > 0 && (
                    <div>
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-[#00a76b] mb-1.5">Employees</h4>
                      <div className="space-y-1">
                        {searchResults.employees.map(emp => (
                          <div
                            key={emp._id}
                            onClick={() => { navigate(`/${activeRole}/employees/view/${emp._id}`); setSearchQuery(''); }}
                            className="flex items-center justify-between p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-[#162722] cursor-pointer"
                          >
                            <span className="text-xs font-bold text-gray-800 dark:text-white">{emp.fullName}</span>
                            <span className="text-[10px] text-gray-400 dark:text-[#829e92] font-semibold">{emp.position || emp.role}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Category: Leave Requests */}
                  {searchResults.leaves && searchResults.leaves.length > 0 && (
                    <div>
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-amber-500 mb-1.5">Leave Requests</h4>
                      <div className="space-y-1">
                        {searchResults.leaves.map(l => (
                          <div
                            key={l._id}
                            onClick={() => { navigate(`/${activeRole}/leave`); setSearchQuery(''); }}
                            className="flex items-center justify-between p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-[#162722] cursor-pointer"
                          >
                            <span className="text-xs font-bold text-gray-800 dark:text-white">
                              {l.user?.name || 'Employee'} - {l.leaveType}
                            </span>
                            <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${l.status === 'approved' ? 'bg-green-100 text-green-700 dark:bg-green-950/20 dark:text-green-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400'
                              }`}>
                              {l.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Category: Payroll */}
                  {searchResults.payroll && searchResults.payroll.length > 0 && (
                    <div>
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-blue-500 mb-1.5">Payroll</h4>
                      <div className="space-y-1">
                        {searchResults.payroll.map(p => (
                          <div
                            key={p._id}
                            onClick={() => { navigate(activeRole === 'employee' ? '/employee/payslips' : `/${activeRole}/payroll`); setSearchQuery(''); }}
                            className="flex items-center justify-between p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-[#162722] cursor-pointer"
                          >
                            <span className="text-xs font-bold text-gray-800 dark:text-white">
                              {p.user?.name || 'Employee'} ({p.month} {p.year})
                            </span>
                            <span className="text-xs font-extrabold text-[#00a76b]">${p.netSalary}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Category: Documents */}
                  {searchResults.documents && searchResults.documents.length > 0 && (
                    <div>
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-purple-500 mb-1.5">Documents</h4>
                      <div className="space-y-1">
                        {searchResults.documents.map(d => (
                          <div
                            key={d.id}
                            onClick={() => { navigate(`/${activeRole}/documents`); setSearchQuery(''); }}
                            className="flex items-center justify-between p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-[#162722] cursor-pointer"
                          >
                            <span className="text-xs font-bold text-gray-800 dark:text-white truncate max-w-[280px]">{d.name}</span>
                            <span className="text-[10px] text-gray-400 dark:text-[#829e92] font-semibold">{d.date}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Empty state */}
                  {(!searchResults.employees || searchResults.employees.length === 0) &&
                    (!searchResults.leaves || searchResults.leaves.length === 0) &&
                    (!searchResults.payroll || searchResults.payroll.length === 0) &&
                    (!searchResults.documents || searchResults.documents.length === 0) && (
                      <p className="text-xs text-center text-gray-400 py-4 font-bold uppercase tracking-widest">No matching records found</p>
                    )}
                </div>
              )}
            </div>

            {/* + Quick Action button */}
            <div className="relative" ref={quickActionRef}>
              <button
                onClick={() => setIsQuickActionOpen(!isQuickActionOpen)}
                className="ml-4 flex items-center justify-center gap-1.5 px-3 py-2 sm:px-4 sm:py-2 bg-[#00a76b] hover:bg-[#00915c] text-white rounded-full font-bold text-xs transition-all cursor-pointer border-none shadow-sm mr-2 sm:mr-4 shrink-0"
              >
                <Plus size={15} strokeWidth={2.8} />
                <span className="hidden sm:inline">Quick action</span>
              </button>

              {isQuickActionOpen && (
                <div className="absolute top-[45px] left-4 w-56 bg-white dark:bg-[#0c1512] border border-[#eceae3] dark:border-[#1a2d29] rounded-[20px] shadow-[0_20px_50px_rgba(0,0,0,0.15)] overflow-hidden z-[110] p-2 flex flex-col">
                  <button
                    onClick={() => { setIsQuickActionOpen(false); navigate(`/${activeRole}/employees/add`); }}
                    className="w-full text-left px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-[#162722] text-xs font-bold text-gray-700 dark:text-slate-300 rounded-xl transition-colors border-none bg-transparent cursor-pointer"
                  >
                    Add Employee
                  </button>
                  <button
                    onClick={() => { setIsQuickActionOpen(false); navigate(`/${activeRole}/leave`); }}
                    className="w-full text-left px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-[#162722] text-xs font-bold text-gray-700 dark:text-slate-300 rounded-xl transition-colors border-none bg-transparent cursor-pointer"
                  >
                    Apply Leave
                  </button>
                  <button
                    onClick={() => { setIsQuickActionOpen(false); toast.success('Announcement Drafted'); }}
                    className="w-full text-left px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-[#162722] text-xs font-bold text-gray-700 dark:text-slate-300 rounded-xl transition-colors border-none bg-transparent cursor-pointer"
                  >
                    Create Announcement
                  </button>
                  <button
                    onClick={() => { setIsQuickActionOpen(false); navigate(`/${activeRole}/payroll`); }}
                    className="w-full text-left px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-[#162722] text-xs font-bold text-gray-700 dark:text-slate-300 rounded-xl transition-colors border-none bg-transparent cursor-pointer"
                  >
                    Generate Payroll
                  </button>
                  <button
                    onClick={() => { setIsQuickActionOpen(false); navigate(`/${activeRole}/recruitment`); }}
                    className="w-full text-left px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-[#162722] text-xs font-bold text-gray-700 dark:text-slate-300 rounded-xl transition-colors border-none bg-transparent cursor-pointer"
                  >
                    Schedule Interview
                  </button>
                  <button
                    onClick={() => { setIsQuickActionOpen(false); navigate(`/${activeRole}/task-management/create`); }}
                    className="w-full text-left px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-[#162722] text-xs font-bold text-gray-700 dark:text-slate-300 rounded-xl transition-colors border-none bg-transparent cursor-pointer"
                  >
                    Assign Task
                  </button>
                </div>
              )}
            </div>

            <div className="ml-auto flex items-center h-full gap-2">
              {/* ⏱️ GLOBAL INACTIVITY TRACKER */}
              {isPausedByIdle && (
                <button
                  onClick={handleResume}
                  className="flex items-center gap-2 px-4 py-1.5 bg-[#00a76b] text-white rounded-full border-none cursor-pointer hover:bg-[#e64600] transition-all animate-pulse mr-2"
                >
                  <Play size={14} fill="currentColor" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Resume Timer</span>
                </button>
              )}
              {isTrackingActive && (
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-[#eceae3] dark:bg-[#111c18] rounded-full border border-[#c5c0b1] dark:border-[#1a2d29] mr-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#24a148]"></div>
                  <span className="text-[10px] font-black text-[#201515] dark:text-[#e2e8f0] uppercase tracking-widest tabular-nums">
                    Active
                  </span>
                </div>
              )}
              {!isTrackingActive && !isPausedByIdle && (
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-[#eceae3] dark:bg-[#111c18] rounded-full border border-[#c5c0b1] dark:border-[#1a2d29] opacity-50 mr-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#939084]"></div>
                  <span className="text-[10px] font-black text-[#201515] dark:text-[#e2e8f0] uppercase tracking-widest">Offline</span>
                </div>
              )}

              {/* Language Selector */}
              <div className="relative" ref={languageRef}>
                <button
                  onClick={() => setIsLanguageOpen(!isLanguageOpen)}
                  className="w-9 h-9 flex items-center justify-center text-gray-500 hover:text-gray-800 dark:text-slate-400 dark:hover:text-white transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 border-none bg-transparent cursor-pointer"
                >
                  <Globe size={18} />
                </button>
                {isLanguageOpen && (
                  <div className="absolute top-[45px] right-0 w-36 bg-white dark:bg-[#0c1512] border border-[#eceae3] dark:border-[#1a2d29] rounded-[20px] shadow-[0_20px_50px_rgba(0,0,0,0.15)] overflow-hidden z-[110] p-1 flex flex-col">
                    {['English', 'Spanish', 'French', 'German'].map(lang => (
                      <button
                        key={lang}
                        onClick={() => {
                          setCurrentLang(lang);
                          setIsLanguageOpen(false);
                          toast.success(`Language set to ${lang}`);
                        }}
                        className={`w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-[#162722] text-xs font-bold rounded-xl transition-colors border-none bg-transparent cursor-pointer ${currentLang === lang ? 'text-[#00a76b]' : 'text-gray-700 dark:text-slate-300'
                          }`}
                      >
                        {lang}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={toggleTheme}
                className="w-9 h-9 flex items-center justify-center text-gray-500 hover:text-gray-800 transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 border-none bg-transparent cursor-pointer"
              >
                {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
              </button>

              <button
                onClick={() => navigate(`/${activeRole}/chat`)}
                className="w-9 h-9 flex items-center justify-center text-gray-500 hover:text-gray-800 transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 border-none bg-transparent cursor-pointer"
              >
                <MessageSquare size={18} />
              </button>

              <div className="relative" ref={notificationRef}>
                <button
                  onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                  className={`w-9 h-9 flex items-center justify-center rounded-full transition-all relative border-none bg-transparent cursor-pointer ${isNotificationsOpen ? 'bg-[#00a76b] text-white shadow-lg' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800'}`}
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
              <div className="relative" ref={profileRef}>
                {isProfileLoading ? (
                  <div
                    className="flex items-center gap-3 px-1 md:px-3 h-11 rounded-full select-none opacity-60 animate-pulse bg-gray-50 dark:bg-[#111c18]"
                  >
                    <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-slate-700 shrink-0"></div>
                    <div className="hidden md:flex flex-col gap-1 items-start leading-none">
                      <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-16"></div>
                      <div className="h-2 bg-gray-200 dark:bg-slate-700 rounded w-10 mt-1"></div>
                    </div>
                    <ChevronDown size={14} className="hidden md:block text-gray-400" />
                  </div>
                ) : (
                  <button
                    ref={triggerRef}
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setIsProfileDropdownOpen(prev => !prev);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setIsProfileDropdownOpen(prev => !prev);
                      }
                    }}
                    className={`flex items-center gap-3 px-1 md:px-3 h-11 rounded-full cursor-pointer transition-all select-none border-none bg-transparent outline-none focus-visible:ring-2 focus-visible:ring-[#00a76b]/50 ${isProfileDropdownOpen ? 'bg-gray-100 dark:bg-[#111c18]' : 'hover:bg-gray-100 dark:hover:bg-[#111c18]'}`}
                    aria-expanded={isProfileDropdownOpen}
                    aria-haspopup="true"
                  >
                    <div className="w-8 h-8 rounded-full flex items-center justify-center bg-[#00a76b] text-white font-bold text-[13px] overflow-hidden shrink-0">
                      {userProfile?.profileImage ? (
                        <img src={getImageUrl(userProfile.profileImage)} alt="" className="w-full h-full object-cover" />
                      ) : (
                        initials
                      )}
                    </div>
                    <div className="hidden md:flex flex-col items-start leading-none">
                      <span className="text-[12px] font-bold text-[#201515] dark:text-white truncate max-w-[120px]">{displayName}</span>
                      <span className="text-[9px] font-bold text-[#939084] dark:text-[#a3b3af] uppercase tracking-wider mt-1">{activeRoleTitle}</span>
                    </div>
                    <ChevronDown size={14} className={`hidden md:block text-gray-500 transition-transform duration-200 ${isProfileDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                )}

                {isProfileDropdownOpen && (
                  <div
                    ref={dropdownRef}
                    onKeyDown={handleDropdownKeyDown}
                    className="absolute top-[48px] right-0 w-72 bg-white dark:bg-[#111c18] border border-gray-100 dark:border-[#1a2d29] rounded-[20px] shadow-[0_10px_40px_rgba(0,0,0,0.08)] dark:shadow-[0_15px_40px_rgba(0,0,0,0.3)] overflow-hidden z-[100] focus:outline-none"
                    role="menu"
                    aria-orientation="vertical"
                    aria-labelledby="user-menu-button"
                    tabIndex="-1"
                  >
                    {/* User Details Header inside Dropdown */}
                    {isProfileLoading ? (
                      <div className="px-6 py-4 flex flex-col gap-1.5 animate-pulse">
                        <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-24"></div>
                        <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-32 mt-1"></div>
                      </div>
                    ) : profileError || !userProfile ? (
                      <div className="px-6 py-4 text-left">
                        <span className="text-xs font-bold text-red-600 dark:text-red-400">Unable to load profile</span>
                      </div>
                    ) : (
                      <div className="px-6 pt-5 pb-4 flex flex-col">
                        <span className="text-[17px] font-semibold text-slate-900 dark:text-white leading-tight">{displayName}</span>
                        <span className="text-[13px] text-slate-500 dark:text-slate-400 mt-1 leading-none">{displayEmail}</span>
                      </div>
                    )}

                    <div className="h-px bg-slate-100 dark:bg-slate-800/80 w-full" />

                    {/* Dropdown Options */}
                    <div className="flex flex-col animate-fade-in">
                      <button
                        role="menuitem"
                        onClick={() => {
                          setIsProfileDropdownOpen(false);
                          navigate(`/${activeRole}/profile`);
                        }}
                        className="w-full px-6 py-2.5 flex items-center gap-3.5 text-left text-[13px] font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#162722]/50 hover:text-slate-900 dark:hover:text-white transition-colors border-none bg-transparent cursor-pointer outline-none"
                      >
                        <User size={16} className="text-slate-400 dark:text-[#829e92]" />
                        <span>My Profile</span>
                      </button>

                      <button
                        role="menuitem"
                        onClick={() => {
                          setIsProfileDropdownOpen(false);
                          const empId = userProfile?.employeeId || userProfile?._id || '';
                          navigate(empId ? `/${activeRole}/employees/view/${empId}` : `/${activeRole}/profile`);
                        }}
                        className="w-full px-6 py-2.5 flex items-center gap-3.5 text-left text-[13px] font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#162722]/50 hover:text-slate-900 dark:hover:text-white transition-colors border-none bg-transparent cursor-pointer outline-none"
                      >
                        <User size={16} className="text-slate-400 dark:text-[#829e92]" />
                        <span>Employee Info</span>
                      </button>

                      <button
                        role="menuitem"
                        onClick={() => {
                          setIsProfileDropdownOpen(false);
                          navigate(`/${activeRole}/settings`);
                        }}
                        className="w-full px-6 py-2.5 flex items-center gap-3.5 text-left text-[13px] font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#162722]/50 hover:text-slate-900 dark:hover:text-white transition-colors border-none bg-transparent cursor-pointer outline-none"
                      >
                        <Settings size={16} className="text-slate-400 dark:text-[#829e92]" />
                        <span>Settings</span>
                      </button>

                      <button
                        role="menuitem"
                        onClick={() => {
                          setIsProfileDropdownOpen(false);
                          navigate(`/${activeRole}/profile?tab=security`);
                        }}
                        className="w-full px-6 py-2.5 flex items-center gap-3.5 text-left text-[13px] font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#162722]/50 hover:text-slate-900 dark:hover:text-white transition-colors border-none bg-transparent cursor-pointer outline-none"
                      >
                        <ShieldCheck size={16} className="text-slate-400 dark:text-[#829e92]" />
                        <span>Change Password</span>
                      </button>

                      <button
                        role="menuitem"
                        onClick={() => {
                          setIsProfileDropdownOpen(false);
                          navigate(`/${activeRole}/settings?tab=audit-logs`);
                        }}
                        className="w-full px-6 py-2.5 flex items-center gap-3.5 text-left text-[13px] font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#162722]/50 hover:text-slate-900 dark:hover:text-white transition-colors border-none bg-transparent cursor-pointer outline-none"
                      >
                        <FileText size={16} className="text-slate-400 dark:text-[#829e92]" />
                        <span>Activity Log</span>
                      </button>

                      <div className="h-px bg-slate-100 dark:bg-slate-800/80 w-full my-1" />

                      <button
                        role="menuitem"
                        onClick={() => {
                          if (window.confirm("Are you sure you want to sign out?")) {
                            handleLogout();
                            setIsProfileDropdownOpen(false);
                          }
                        }}
                        className="w-full px-6 py-3 flex items-center gap-3.5 text-left text-[13px] font-semibold text-[#EF4444] dark:text-red-400 hover:bg-red-50/50 dark:hover:bg-red-950/20 transition-colors border-none bg-transparent cursor-pointer outline-none"
                      >
                        <LogOut size={16} className="text-[#EF4444] dark:text-red-400" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Main Workspace content */}
        <main className="flex-1 min-w-0 overflow-y-auto bg-[#f8fafc] dark:bg-[#08100e] relative flex flex-col p-6 md:p-8">
          {location.pathname.endsWith('/chat') ? (
            <div className="h-[calc(100vh-70px)] relative overflow-hidden">
              <ErrorBoundary>
                <Outlet />
              </ErrorBoundary>
              {children}
            </div>
          ) : (
            <div className="animate-fade-in w-full min-h-full flex flex-col">
              <div className="flex-1 max-w-[1440px] mx-auto w-full">
                <ErrorBoundary>
                  <Outlet />
                </ErrorBoundary>
                {children}
              </div>
            </div>
          )}
        </main>

        {!location.pathname.endsWith('/chat') && (
          <footer className="py-6 px-12 border-t border-[#c5c0b1] dark:border-[#1a2d29] bg-[#fffefb] dark:bg-[#08100e] flex justify-between items-center text-[11px] text-[#939084] dark:text-[#a3b3af] font-bold uppercase tracking-widest z-50" style={{ borderColor: isDarkMode ? '#1a2d29' : '#e2eae7' }}>
            <div className="flex gap-10 items-center">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-[#00a76b] rounded-full animate-pulse"></div>
                <span className="text-[#201515] dark:text-white">Connected</span>
              </div>
              <span>v2.4.0 Automator</span>
            </div>
            <span>© 2026 Verdant HR Infrastructure</span>
          </footer>
        )}
      </div>
    </div>
  );
};

export default MainLayout;
