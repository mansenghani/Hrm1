import React, { useState, useEffect } from 'react';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';

const MainLayout = ({ children, navItems, userRole, userName, onLogout }) => {
  const [collapsed, setCollapsed] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const location = useLocation();
  const navigate = useNavigate();

  const role = sessionStorage.getItem('role') || 'admin';
  const displayRole = userRole || (role ? role.charAt(0).toUpperCase() + role.slice(1) : 'Admin');
  const displayName = userName || 'Platform Lead';

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const capitalizedRole = role.charAt(0).toUpperCase() + role.slice(1);
    document.title = `FluidHR | ${capitalizedRole}`;
  }, [role]);



  const getMenuItemsByRole = (currentRole) => {
    switch (currentRole) {
      case 'hr':
        return [
          { name: 'Dashboard', icon: 'monitoring', path: '/hr/dashboard' },
          { name: 'Attendance', icon: 'receipt_long', path: '/hr/attendance' },
          { name: 'Leave Management', icon: 'security', path: '/hr/leave' },
        ];
      case 'employee':
        return [
          { name: 'Dashboard', icon: 'monitoring', path: '/employee/dashboard' },
          { name: 'Time Tracker', icon: 'timer', path: '/employee/time-tracker' },
          { name: 'Leave Management', icon: 'security', path: '/employee/leave' },
        ];
      case 'manager':
        return [
          { name: 'Dashboard', icon: 'monitoring', path: '/manager/dashboard' },
          { name: 'Team Attendance', icon: 'receipt_long', path: '/manager/attendance' },
          { name: 'Review Leaves', icon: 'security', path: '/manager/leave' },
        ];
      case 'admin':
      default:
        return [
          { name: 'Dashboard', icon: 'monitoring', path: `/${currentRole}/dashboard` },
          { name: 'Employees', icon: 'account_tree', path: `/${currentRole}/employees` },
          { name: 'Departments', icon: 'hub', path: `/${currentRole}/departments` },
          { name: 'Leave Management', icon: 'security', path: `/${currentRole}/leave` },
          { name: 'Attendance', icon: 'receipt_long', path: `/${currentRole}/attendance` },
          { name: 'Time Tracker', icon: 'timer', path: `/${currentRole}/time-tracker` },
          { name: 'Payroll', icon: 'payments', path: `/${currentRole}/payroll` },
          { name: 'Performance', icon: 'trending_up', path: `/${currentRole}/performance` },
          { name: 'Reports', icon: 'leaderboard', path: `/${currentRole}/reports` },
          { name: 'Settings', icon: 'settings', path: `/${currentRole}/settings` },
        ];
    }
  };

  const defaultMenuItems = getMenuItemsByRole(role);

  const menuItems = navItems ? navItems.map(item => ({
    name: item.label || item.name,
    icon: typeof item.icon === 'string' ? item.icon : 'analytics',
    path: item.path,
    lucideIcon: (item.icon && typeof item.icon !== 'string') ? item.icon : null
  })) : defaultMenuItems;

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
      sessionStorage.removeItem('role');
      navigate('/login');
      window.location.reload();
    }
  };

  return (
    <div className="flex min-h-screen bg-white font-sans text-[#1E2026] selection:bg-[#F0B90B] selection:text-[#1E2026]">

      {/* SIDEBAR */}
      <aside
        onMouseEnter={() => setCollapsed(false)}
        onMouseLeave={() => setCollapsed(true)}
        className={`fixed left-0 top-0 h-full z-50 bg-[#222126] transition-all duration-300 ease-in-out flex flex-col ${collapsed ? 'w-20' : 'w-72'}`}
      >
        <div className="h-16 flex items-center px-6 shrink-0 border-b border-white/5">
          <Link to={`/${role}/dashboard`} className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#F0B90B] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[#1E2026] text-xl font-bold">currency_exchange</span>
            </div>
            {!collapsed && (
              <div className="animate-in fade-in slide-in-from-left-2 duration-300">
                <h2 className="text-white font-extrabold text-lg tracking-tight leading-none">FluidHR</h2>
                <p className="text-[#F0B90B] text-[9px] font-bold uppercase tracking-[0.2em] mt-1">SaaS Protocol</p>
              </div>
            )}
          </Link>
        </div>

        <nav className="flex-1 py-6 space-y-0.5 overflow-y-auto scrollbar-hide">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`relative flex items-center h-12 px-6 transition-all duration-150 group ${isActive ? 'bg-white/5' : 'hover:bg-white/5'}`}
              >
                <div className={`shrink-0 flex items-center justify-center w-6 h-6 ${isActive ? 'text-[#F0B90B]' : 'text-[#848E9C] group-hover:text-white'}`}>
                  {item.lucideIcon ? item.lucideIcon : (
                    <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}>{item.icon}</span>
                  )}
                </div>

                {!collapsed && (
                  <span className={`ml-4 text-[13px] font-semibold tracking-tight ${isActive ? 'text-white' : 'text-[#848E9C] group-hover:text-white'}`}>
                    {item.name}
                  </span>
                )}

                {isActive && (
                  <div className="absolute left-0 w-1 h-6 bg-[#F0B90B] rounded-r-full"></div>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-6 border-t border-white/5 shrink-0">
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-4 p-3 rounded-lg text-[#848E9C] hover:text-[#F6465D] hover:bg-white/5 transition-all group ${collapsed ? 'justify-center' : ''}`}
          >
            <span className="material-symbols-outlined text-xl">logout</span>
            {!collapsed && <span className="text-[12px] font-black tracking-widest uppercase">Eject Hub</span>}
          </button>
        </div>
      </aside>

      {/* VIEWPORT */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${collapsed ? 'ml-20' : 'ml-72'}`}>

        {/* TOPBAR */}
        <header className="h-16 bg-white flex items-center justify-between px-8 sticky top-0 z-40 border-b border-[#E6E8EA] transition-all">
          <div className="flex-1 max-w-xl">
            <div className="relative group">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-[#848E9C] text-xl">search</span>
              <input
                type="text"
                placeholder="Query personnel, markets, or protocol logs..."
                className="w-full pl-12 pr-6 py-2 bg-slate-50 border-2 border-orange-400/60 focus:ring-2 focus:ring-orange-500/40 rounded-lg text-[13px] font-medium text-[#1E2026] placeholder:text-[#848E9C] focus:outline-none focus:bg-white transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden lg:flex items-center gap-4 bg-[#F5F5F5] px-6 py-2 rounded-xl border border-[#E6E8EA]">
              <div className="w-1.5 h-1.5 bg-[#0ECB81] rounded-full animate-pulse shadow-[0_0_8px_#0ECB81]"></div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase text-[#848E9C] tracking-[0.2em] leading-none mb-1">Active Protocol Time</span>
                <span className="text-[14px] font-black text-[#1E2026] tabular-nums tracking-tighter leading-none">
                  {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-8">
              <button className="w-10 h-10 rounded-lg flex items-center justify-center text-[#848E9C] hover:bg-[#F5F5F5] transition-all relative">
                <span className="material-symbols-outlined text-xl">notifications</span>
                <div className="absolute top-2 right-2 w-2 h-2 bg-[#F6465D] border-2 border-white rounded-full"></div>
              </button>

              <div className="flex items-center gap-4 border-l border-[#E6E8EA] pl-8">
                <Link to={`/${role}/profile`} className="flex items-center gap-4 group">
                  <div className="w-9 h-9 rounded-full bg-[#1E2026] flex items-center justify-center overflow-hidden shrink-0 border-2 border-[#F0B90B] group-hover:scale-105 transition-transform shadow-lg shadow-[#F0B90B]/10">
                    <img src={`https://ui-avatars.com/api/?name=${displayName}&background=1E2026&color=F0B90B&bold=true`} className="w-full h-full object-cover" alt="User" />
                  </div>
                  <div className="text-left hidden md:block">
                    <p className="text-[12px] font-black text-[#1E2026] uppercase leading-none mb-1 group-hover:text-[#F0B90B] transition-colors">{displayName}</p>
                    <p className="text-[10px] font-bold text-[#848E9C] uppercase tracking-widest leading-none">Security Node</p>
                  </div>
                </Link>

                {role === 'admin' && (
                  <button
                    onClick={() => navigate(`/${role}/create-user`)}
                    className="ml-4 px-8 py-2.5 bg-[#F0B90B] text-[#1E2026] rounded-full text-[11px] font-black uppercase tracking-widest hover:bg-[#FFD000] transition-all shadow-md shadow-[#F0B90B]/10 active:scale-95"
                  >
                    Create Account
                  </button>
                )}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-white p-10">
          <div className="max-w-7xl mx-auto">
            {children || <Outlet />}
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
