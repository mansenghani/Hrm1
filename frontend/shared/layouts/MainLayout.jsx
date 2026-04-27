import React, { useState, useEffect } from 'react';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import axios from 'axios';
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
  Bell
} from 'lucide-react';
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

  // 🛡️ SYNC LIVE NOTIFICATIONS
  useEffect(() => {
    const fetchNotifications = async () => {
      if (!token || role !== 'employee') return;
      try {
        const res = await axios.get('/api/tasks/my', { headers: { Authorization: `Bearer ${token}` } });
        const tasks = res.data || [];
        const alerts = tasks.filter(t => t.status === 'rework' || t.status === 'submitted').map(t => ({
          type: t.status === 'rework' ? 'rework' : 'task',
          text: t.status === 'rework' ? `Rework Needed: ${t.title}` : `Status Update: ${t.title}`,
          time: 'Active Now',
          path: `/employee/projects?taskId=${t._id}`
        }));
        setLiveNotifications(alerts.slice(0, 5));
      } catch (err) { console.error('Alert Sync Failed:', err); }
    };
    fetchNotifications();
  }, [token, role]);

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
          { name: 'Tasks', path: '/hr/tasks', icon: CheckSquare },
          { name: 'Attendance', path: '/hr/attendance', icon: Calendar },
          { name: 'Time Tracker', path: '/hr/time-tracker', icon: Clock },
          { name: 'Project Registry', path: '/hr/projects', icon: Briefcase },
          { name: 'Request For Leave', path: '/hr/leave', icon: FileText },
        ];
      case 'employee':
        return [
          { name: 'Dashboard', path: '/employee/dashboard', icon: LayoutDashboard },
          { name: 'Active Tasks', path: '/employee/projects', icon: Target },
          { name: 'Time Tracker', path: '/employee/time-tracker', icon: Clock },
          { name: 'Request For Leave', path: '/employee/leave', icon: FileText },
        ];
      case 'manager':
        return [
          { name: 'Dashboard', path: '/manager/dashboard', icon: LayoutDashboard },
          { name: 'Manage Task', path: '/manager/tasks', icon: ClipboardList },
          { name: 'Project Hub', path: '/manager/projects', icon: Briefcase },
          { name: 'Time Tracker', path: '/manager/time-tracker', icon: Clock },
          { name: 'Team Attendance', path: '/manager/attendance', icon: Calendar },
          { name: 'Review Leaves', path: '/manager/leave', icon: FileText },
        ];
      case 'admin':
      default:
        return [
          { name: 'Dashboard', path: `/${currentRole}/dashboard`, icon: LayoutDashboard },
          { name: 'Employees', path: `/${currentRole}/employees`, icon: Users },
          { name: 'Tasks', path: `/${currentRole}/tasks`, icon: CheckSquare },
          { name: 'Request For Leave', path: `/${currentRole}/leave`, icon: FileText },
          { name: 'Attendance', path: `/${currentRole}/attendance`, icon: Calendar },
          { name: 'Time Tracker', path: `/${currentRole}/time-tracker`, icon: Clock },
          { name: 'Payroll', path: `/${currentRole}/payroll`, icon: Wallet },
          { name: 'Performance', path: `/${currentRole}/performance`, icon: TrendingUp },
          { name: 'Reports', path: `/${currentRole}/reports`, icon: BarChart3 },
          { name: 'Settings', path: `/${currentRole}/settings`, icon: Settings },
        ];
    }
  };

  // 🛡️ DYNAMIC ROLE DERIVATION (URL-FIRST)
  const pathRole = location.pathname.split('/')[1];
  const roleMap = { admin: 'admin', hr: 'hr', manager: 'manager', employee: 'employee' };
  const activeRole = roleMap[pathRole] ? pathRole : role;

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

  const [lastActivity, setLastActivity] = useState(Date.now());
  const [idleDisplay, setIdleDisplay] = useState(0);

  // 🔄 GLOBAL ACTIVITY TRACKER
  useEffect(() => {
    const handleGlobalActivity = () => setLastActivity(Date.now());
    window.addEventListener('mousemove', handleGlobalActivity);
    window.addEventListener('keydown', handleGlobalActivity);
    window.addEventListener('mousedown', handleGlobalActivity);
    window.addEventListener('focus', handleGlobalActivity);

    const interval = setInterval(() => {
      setIdleDisplay(Math.floor((Date.now() - lastActivity) / 1000));
    }, 1000);

    return () => {
      window.removeEventListener('mousemove', handleGlobalActivity);
      window.removeEventListener('keydown', handleGlobalActivity);
      window.removeEventListener('mousedown', handleGlobalActivity);
      window.removeEventListener('focus', handleGlobalActivity);
      clearInterval(interval);
    };
  }, [lastActivity]);

  return (
    <div className="flex flex-col min-h-screen bg-[#fffefb]">
      <header className="sticky top-0 w-full z-50 bg-[#fffefb] border-b border-[#c5c0b1]">
        <div className="flex items-center h-[72px] w-full px-8">
          <div className="flex items-center gap-6 mr-12">
            <Link to={`/${activeRole}/dashboard`} className="flex items-center gap-3 no-underline">
              <div className="w-8 h-8 bg-[#ff4f00] rounded-[4px] flex items-center justify-center">
                <ShieldCheck size={20} className="text-[#fffefb]" />
              </div>
              <span className="text-[24px] font-bold tracking-tight text-[#201515]">FluidHR</span>
            </Link>
            <button
              onClick={toggleSidebar}
              className="flex items-center justify-center w-10 h-10 hover:bg-[#eceae3] rounded-[6px] text-[#36342e] transition-all cursor-pointer border-none bg-transparent"
            >
              <Menu size={22} />
            </button>
          </div>
          <nav className="hidden lg:flex items-center h-full gap-2">
            {menuItems.slice(0, 4).map(item => (
              <Link
                key={item.path}
                to={item.path}
                className={`zap-tab ${location.pathname.startsWith(item.path) ? 'zap-tab-active' : ''}`}
              >
                {item.name}
              </Link>
            ))}
          </nav>
          <div className="ml-auto flex items-center h-full gap-4">
            {/* ⏱️ GLOBAL INACTIVITY TRACKER */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-[#eceae3] rounded-lg border border-[#c5c0b1]">
              <div className={`w-1.5 h-1.5 rounded-full ${idleDisplay > 60 ? 'bg-[#ff4f00] animate-pulse' : 'bg-[#24a148]'}`}></div>
              <span className="text-[10px] font-black text-[#201515] uppercase tracking-widest tabular-nums">
                {idleDisplay > 0 ? `${idleDisplay}s Inactive` : 'Active'}
              </span>
            </div>

            <button className="w-10 h-10 flex items-center justify-center text-[#36342e] hover:text-[#ff4f00] transition-colors relative group">
              <Search size={20} />
            </button>

            <div className="relative" ref={notificationRef}>
              <button
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all relative ${isNotificationsOpen ? 'bg-[#ff4f00] text-white shadow-lg' : 'text-[#36342e] hover:bg-[#eceae3]'}`}
              >
                <Bell size={20} />
                {liveNotifications.length > 0 && (
                  <span className="absolute top-2 right-2 w-2 h-2 bg-[#ff4f00] border-2 border-[#fffefb] rounded-full"></span>
                )}
              </button>

              {isNotificationsOpen && (
                <div className="absolute top-[80px] right-0 w-80 bg-white border border-[#c5c0b1] rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-[100]">
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
                  <img src={`${API_BASE_URL}${userProfile.profileImage}`} alt="" className="w-full h-full object-cover" />
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
      <div className="flex flex-1 w-full overflow-hidden relative">
        <aside
          className="bg-transparent flex flex-col shrink-0 border-r border-[#c5c0b1] transition-[width] duration-300 ease-in-out overflow-hidden hidden md:flex"
          style={{ width: isSidebarOpen ? '280px' : '80px' }}
        >
          <div className="flex flex-col pb-12 w-full">
            <nav className="flex-1 space-y-2 pt-[10px] px-3">
              {menuItems.map((item) => {
                const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center h-12 text-[15px] font-bold no-underline rounded-[6px] transition-all border border-transparent group ${isSidebarOpen ? 'px-4 gap-3 w-full' : 'px-0 justify-center w-full'} ${isActive ? 'text-[#ff4f00] bg-[#fffdf9] !border-[#ff4f00] shadow-sm' : 'text-[#201515] hover:bg-[#eceae3] hover:border-[#c5c0b1]'}`}
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
        <main className="flex-1 overflow-y-auto bg-[#fffefb] relative">
          <div className="py-12 px-8 lg:px-12 max-w-[1600px] mx-auto animate-fade-in w-full min-h-full flex flex-col">
            <div className="flex-1">
              <Outlet />
              {children}
            </div>
            {/* LARGE VERTICAL SPACER */}
            <div className="h-24 shrink-0"></div>
          </div>
        </main>
      </div>
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
    </div>
  );
};

export default MainLayout;
