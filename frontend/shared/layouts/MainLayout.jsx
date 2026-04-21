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
  Target
} from 'lucide-react';

const MainLayout = ({ children, navItems, userRole, userName, onLogout }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  const role = sessionStorage.getItem('role') || 'admin';
  const token = sessionStorage.getItem('token');
  const [userProfile, setUserProfile] = useState(null);

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
          { name: 'Tasks', path: '/hr/tasks', icon: CheckSquare },
          { name: 'Attendance', path: '/hr/attendance', icon: Calendar },
          { name: 'Time Tracker', path: '/hr/time-tracker', icon: Clock },
          { name: 'Personnel Units', path: '/hr/teams', icon: Users },
          { name: 'Project Registry', path: '/hr/projects', icon: Briefcase },
          { name: 'Request For Leave', path: '/hr/leave', icon: FileText },
        ];
      case 'employee':
        return [
          { name: 'Dashboard', path: '/employee/dashboard', icon: LayoutDashboard },
          { name: 'Active Arcs', path: '/employee/projects', icon: Target },
          { name: 'Time Tracker', path: '/employee/time-tracker', icon: Clock },
          { name: 'Request For Leave', path: '/employee/leave', icon: FileText },
        ];
      case 'manager':
        return [
          { name: 'Dashboard', path: '/manager/dashboard', icon: LayoutDashboard },
          { name: 'Deployment', path: '/manager/tasks', icon: ClipboardList },
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
          { name: 'Departments', path: `/${currentRole}/departments`, icon: Layers },
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

  const menuItems = navItems ? navItems.map(item => ({
    name: item.label || item.name,
    path: item.path,
    icon: item.icon || LayoutDashboard
  })) : getMenuItemsByRole(role);

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

  return (
    <div className="flex flex-col min-h-screen bg-[#fffefb]">
      <header className="sticky top-0 w-full z-50 bg-[#fffefb] border-b border-[#c5c0b1]">
        <div className="flex items-center h-[72px] w-full px-8">
          <div className="flex items-center gap-6 mr-12">
            <Link to={`/${role}/dashboard`} className="flex items-center gap-3 no-underline">
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
            <button className="w-10 h-10 flex items-center justify-center text-[#36342e] hover:text-[#ff4f00] transition-colors">
              <Search size={20} />
            </button>
            <div 
              onClick={() => navigate(`/${role}/profile`)}
              className="hidden md:flex items-center gap-3 px-4 h-12 hover:bg-[#eceae3] rounded-[4px] cursor-pointer transition-all"
            >
              <div className="w-8 h-8 bg-[#201515] rounded-full flex items-center justify-center text-[#fffefb] font-bold text-[13px]">
                {initials}
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
