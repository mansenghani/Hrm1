import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { 
  Camera, Search, Calendar, User, 
  Filter, RefreshCw, Download, ExternalLink,
  ChevronLeft, ChevronRight, LayoutGrid, List as ListIcon,
  Trash2, Eye, X, Folder, Users, Shield, History, ArrowLeft
} from 'lucide-react';
import { API_BASE_URL } from '@shared/services/api';

const getToday = () => new Date().toISOString().split('T')[0];

const Screenshots = () => {
  const [screenshots, setScreenshots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterUser, setFilterUser] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // grid, list
  const [selectedImage, setSelectedImage] = useState(null);
  const [navigationPath, setNavigationPath] = useState([]); // ['role', 'name']
  
  const token = sessionStorage.getItem('token');
  const role = sessionStorage.getItem('role');

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/screenshot/all', {
        params: { role, userId: sessionStorage.getItem('userId') },
        headers: { Authorization: `Bearer ${token}` }
      });
      setScreenshots(res.data);
    } catch (err) {
      console.error('Fetch Screenshots Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // 📡 REAL-TIME SYNC ENGINE
    const socket = io(API_BASE_URL.replace('/api', ''), {
       transports: ['websocket']
    });

    socket.on('connect', () => {
       console.log('📡 Connected to Live Surveillance Stream');
       // Join appropriate notification room
       socket.emit('join_notifications', { userId: sessionStorage.getItem('userId'), role });
    });

    socket.on('new_screenshot', (data) => {
       console.log('📸 New Live Trace Captured:', data);
       // Add to the top of the list instantly
       setScreenshots(prev => [data, ...prev]);
    });

    return () => {
       socket.off('new_screenshot');
       socket.disconnect();
    };
  }, [role]);

  // 📁 HIERARCHICAL GROUPING LOGIC
  const getRoles = () => {
    if (role === 'admin') return ['admin', 'hr', 'manager', 'employee'];
    if (role === 'hr') return ['manager', 'employee'];
    return []; // Managers jump straight to names
  };

  const getFilteredData = () => {
    let data = screenshots;
    if (navigationPath.length > 0) {
      data = data.filter(s => s.role === navigationPath[0]);
    }
    if (navigationPath.length > 1) {
      data = data.filter(s => s.employeeName === navigationPath[1]);
    }
    
    // Apply search filters on top of navigation
    return data.filter(s => {
      const matchesUser = s.employeeName?.toLowerCase().includes(filterUser.toLowerCase());
      const matchesDate = filterDate ? s.timestamp.startsWith(filterDate) : true;
      return matchesUser && matchesDate;
    });
  };

  const filtered = getFilteredData();

  // Helper to count entries in a folder
  const countInFolder = (type, value) => {
    if (type === 'role') return screenshots.filter(s => s.role === value).length;
    if (type === 'name') return screenshots.filter(s => s.role === navigationPath[0] && s.employeeName === value).length;
    return 0;
  };

  const getImageUrl = (path) => {
    if (!path) return '';
    const normalized = path.replace(/\\/g, '/');
    return `${API_BASE_URL}/${normalized}`;
  };

  // 📦 BULK DOWNLOAD ENGINE
  const handleDownloadAll = () => {
    if (filtered.length === 0) return;
    if (!window.confirm(`Download all ${filtered.length} screenshots?`)) return;

    filtered.forEach((s, idx) => {
      setTimeout(() => {
        const link = document.createElement('a');
        link.href = getImageUrl(s.imageUrl);
        link.download = `Screenshot-${s.employeeName}-${new Date(s.timestamp).toLocaleDateString()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }, idx * 300); // 🛡️ Staggered to prevent browser blocking
    });
  };

  const setQuickDate = (type) => {
    const now = new Date();
    if (type === 'today') setFilterDate(now.toISOString().split('T')[0]);
    if (type === 'yesterday') {
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      setFilterDate(yesterday.toISOString().split('T')[0]);
    }
    if (type === 'all') setFilterDate('');
  };

  const renderBreadcrumbs = () => (
    <div className="flex items-center gap-3 mb-8 text-[11px] font-black uppercase tracking-[0.2em] text-[#939084]">
       <button onClick={() => setNavigationPath([])} className={`hover:text-[#00a76b] transition-colors ${navigationPath.length === 0 ? 'text-[#201515]' : ''}`}>
          Registry Root
       </button>
       {navigationPath.map((path, idx) => (
         <React.Fragment key={idx}>
            <ChevronRight size={14} className="opacity-40" />
            <button 
              onClick={() => setNavigationPath(navigationPath.slice(0, idx + 1))}
              className={`hover:text-[#00a76b] transition-colors ${idx === navigationPath.length - 1 ? 'text-[#201515]' : ''}`}
            >
               {path}
            </button>
         </React.Fragment>
       ))}
    </div>
  );

  return (
    <div className="animate-fade-in pb-24">
      {/* HEADER SECTION */}
      <div className="mb-12 border-b border-[#c5c0b1] pb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <p className="zap-caption-upper text-[#00a76b] mb-4">Monitoring Logs</p>
          <h1 className="zap-display-hero">Screenshot <span className="text-[#00a76b]">Registry.</span></h1>
        </div>
        <div className="flex gap-3">
          {navigationPath.length > 0 && (
            <button 
              onClick={() => setNavigationPath(prev => prev.slice(0, -1))}
              className="zap-btn zap-btn-light h-14 px-6 gap-2"
            >
               <ArrowLeft size={18} /> BACK
            </button>
          )}
          <div className="flex bg-[#eceae3] p-1 rounded-xl">
             <button 
               onClick={() => setViewMode('grid')}
               className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-[#00a76b]' : 'text-[#939084] hover:text-[#201515]'}`}
             >
                <LayoutGrid size={20} />
             </button>
             <button 
               onClick={() => setViewMode('list')}
               className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-[#00a76b]' : 'text-[#939084] hover:text-[#201515]'}`}
             >
                <ListIcon size={20} />
             </button>
          </div>
          <button onClick={fetchData} className="zap-btn zap-btn-light h-14 px-6">
             <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {renderBreadcrumbs()}

      {/* FILTERS - Only show when viewing final images */}
      {navigationPath.length === (role === 'manager' ? 1 : 2) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 animate-fade-in">
           <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#939084]" size={18} />
              <input 
                type="text" 
                placeholder="Filter by Employee Name..." 
                value={filterUser}
                onChange={(e) => setFilterUser(e.target.value)}
                className="w-full h-14 pl-12 pr-4 bg-white border border-[#c5c0b1] rounded-2xl text-[14px] font-bold text-[#201515] focus:outline-none focus:border-[#00a76b] shadow-sm italic"
              />
           </div>
           <div className="relative">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-[#939084]" size={18} />
              <input 
                type="date" 
                value={filterDate}
                max={getToday()}
                onChange={(e) => setFilterDate(e.target.value)}
                className="w-full h-14 pl-12 pr-4 bg-white border border-[#c5c0b1] rounded-2xl text-[14px] font-bold text-[#201515] focus:outline-none focus:border-[#00a76b] shadow-sm"
              />
           </div>
           <div className="flex items-center justify-between gap-4 px-6 h-14 bg-[#fffdf9] border border-[#eceae3] rounded-2xl">
              <div className="flex items-center gap-4">
                <Filter size={18} className="text-[#00a76b]" />
                <span className="text-[11px] font-black uppercase tracking-widest text-[#201515]">Total Results: {filtered.length} Captures</span>
              </div>
              <button 
                onClick={handleDownloadAll}
                className="flex items-center gap-2 px-4 py-2 bg-[#00a76b] text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-[#201515] transition-all"
              >
                <Download size={14} /> Download All
              </button>
           </div>
        </div>
      )}

      {/* 📅 QUICK DATE FILTERS */}
      {navigationPath.length === (role === 'manager' ? 1 : 2) && (
        <div className="flex gap-3 mb-8 animate-fade-in">
           <button 
             onClick={() => setQuickDate('today')}
             className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filterDate === getToday() ? 'bg-[#00a76b] text-white shadow-lg' : 'bg-[#eceae3] text-[#939084] hover:text-[#201515]'}`}
           >
              Today
           </button>
           <button 
             onClick={() => setQuickDate('yesterday')}
             className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filterDate === new Date(Date.now() - 86400000).toISOString().split('T')[0] ? 'bg-[#00a76b] text-white shadow-lg' : 'bg-[#eceae3] text-[#939084] hover:text-[#201515]'}`}
           >
              Yesterday
           </button>
           <button 
             onClick={() => setQuickDate('all')}
             className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${!filterDate ? 'bg-[#201515] text-white shadow-lg' : 'bg-transparent text-[#939084] hover:text-[#201515] border border-[#eceae3]'}`}
           >
              View All
           </button>
        </div>
      )}

      {/* CONTENT ENGINE */}
      {loading ? (
        <div className="py-32 text-center opacity-40">
           <RefreshCw size={48} className="mx-auto mb-6 animate-spin text-[#00a76b]" />
           <p className="text-[14px] font-black uppercase tracking-[0.2em]">Loading Registry...</p>
        </div>
      ) : (
        <>
          {/* LEVEL 0: ROLE FOLDERS (Admin/HR Only) */}
          {navigationPath.length === 0 && role !== 'manager' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
               {getRoles().map(r => (
                 <div 
                   key={r} 
                   onClick={() => setNavigationPath([r])}
                   className="zap-card group hover:border-[#00a76b] transition-all cursor-pointer p-8 flex flex-col items-center text-center shadow-lg"
                 >
                    <div className="w-20 h-20 rounded-3xl bg-[#eceae3] text-[#201515] group-hover:bg-[#00a76b] group-hover:text-white flex items-center justify-center transition-all mb-6">
                       <Folder size={40} />
                    </div>
                    <h3 className="text-[16px] font-black uppercase tracking-widest text-[#201515]">{r} Folders</h3>
                    <p className="text-[10px] font-bold text-[#939084] mt-2 uppercase tracking-widest italic">{countInFolder('role', r)} Total Captures</p>
                 </div>
               ))}
            </div>
          )}

          {/* LEVEL 1: EMPLOYEE NAME FOLDERS */}
          {((navigationPath.length === 1 && role !== 'manager') || (navigationPath.length === 0 && role === 'manager')) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
               {[...new Set(screenshots
                  .filter(s => role === 'manager' ? true : s.role === navigationPath[0])
                  .map(s => s.employeeName))]
                  .map(name => (
                    <div 
                      key={name} 
                      onClick={() => setNavigationPath(role === 'manager' ? ['employee', name] : [navigationPath[0], name])}
                      className="zap-card group hover:border-[#00a76b] transition-all cursor-pointer p-8 flex items-center gap-6 shadow-lg"
                    >
                       <div className="w-16 h-16 rounded-2xl bg-[#201515] text-white flex items-center justify-center font-black italic text-xl">
                          {name?.[0]}
                       </div>
                       <div className="flex-1">
                          <h3 className="text-[13px] font-black uppercase tracking-widest text-[#201515] mb-1">{name}</h3>
                          <div className="flex items-center gap-2 text-[9px] font-bold text-[#939084] uppercase tracking-widest italic">
                             <History size={12} className="text-[#00a76b]" />
                             {countInFolder('name', name) || screenshots.filter(s => s.employeeName === name).length} captures
                          </div>
                       </div>
                    </div>
                  ))}
            </div>
          )}

          {/* LEVEL 2: ACTUAL SCREENSHOTS (Visible only when a person is selected) */}
          {navigationPath.length === 2 && (
            <>
              {filtered.length === 0 ? (
                <div className="py-32 text-center opacity-40">
                   <Camera size={48} className="mx-auto mb-6 text-[#939084]" />
                   <p className="text-[14px] font-black uppercase tracking-[0.2em]">No screenshots found for {navigationPath[1]}</p>
                </div>
              ) : viewMode === 'grid' ? (
                <div className="space-y-12 animate-fade-in">
                   {Object.entries(
                     filtered.reduce((groups, s) => {
                       const d = new Date(s.timestamp).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
                       if (!groups[d]) groups[d] = [];
                       groups[d].push(s);
                       return groups;
                     }, {})
                   ).map(([date, group]) => (
                     <div key={date} className="space-y-6">
                        <div className="flex items-center gap-4">
                           <h2 className="text-[18px] font-black text-[#201515] italic">{date}</h2>
                           <div className="h-px flex-1 bg-[#eceae3]" />
                           <span className="text-[9px] font-bold text-[#939084] uppercase tracking-widest">{group.length} Captures</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                           {group.map((s) => (
                             <div key={s._id} className="zap-card group p-0 overflow-hidden hover:border-[#00a76b] transition-all cursor-pointer shadow-xl">
                                <div 
                                  className="relative aspect-video bg-[#201515] overflow-hidden"
                                  onClick={() => setSelectedImage(getImageUrl(s.imageUrl))}
                                >
                                   <img 
                                     src={getImageUrl(s.imageUrl)} 
                                     alt="Capture" 
                                     className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700" 
                                   />
                                </div>
                                <div className="p-6">
                                   <div className="flex justify-between items-start mb-4">
                                      <div>
                                         <p className="text-[14px] font-black text-[#201515] uppercase italic">{s.employeeName}</p>
                                         <p className="text-[10px] font-bold text-[#00a76b] uppercase tracking-widest mt-1">{s.role}</p>
                                      </div>
                                      <div className="flex gap-2">
                                        <button 
                                          onClick={() => setSelectedImage(getImageUrl(s.imageUrl))}
                                          className="w-8 h-8 rounded-lg bg-[#eceae3] flex items-center justify-center text-[#201515] hover:bg-[#00a76b] hover:text-white transition-all"
                                        >
                                          <Eye size={14} />
                                        </button>
                                        <a 
                                          href={getImageUrl(s.imageUrl)} 
                                          download={`Screenshot-${s.employeeName}-${new Date(s.timestamp).toLocaleDateString()}.png`}
                                          className="w-8 h-8 rounded-lg bg-[#eceae3] flex items-center justify-center text-[#201515] hover:bg-[#00a76b] hover:text-white transition-all"
                                        >
                                          <Download size={14} />
                                        </a>
                                      </div>
                                   </div>
                                   <div className="pt-4 border-t border-[#eceae3] flex justify-between items-center text-[10px] font-black text-[#939084] uppercase tracking-widest italic">
                                      <span>{new Date(s.timestamp).toLocaleDateString()}</span>
                                      <span>{new Date(s.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                   </div>
                                </div>
                             </div>
                           ))}
                        </div>
                     </div>
                   ))}
                </div>
      ) : (
        <div className="zap-card p-0 overflow-hidden shadow-xl">
           <table className="w-full text-left border-collapse">
              <thead>
                 <tr className="bg-[#fffdf9] border-b border-[#c5c0b1]">
                    <th className="px-8 py-5 text-[10px] font-black text-[#939084] uppercase tracking-[0.2em]">Employee Name</th>
                    <th className="px-8 py-5 text-[10px] font-black text-[#939084] uppercase tracking-[0.2em]">Capture Date</th>
                    <th className="px-8 py-5 text-[10px] font-black text-[#939084] uppercase tracking-[0.2em]">Screenshot</th>
                    <th className="px-8 py-5 text-[10px] font-black text-[#939084] uppercase tracking-[0.2em] text-right">Actions</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-[#eceae3]">
                 {filtered.map((s) => (
                    <tr key={s._id} className="hover:bg-[#fffdf9] transition-colors group">
                       <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                             <div className="w-10 h-10 rounded-xl bg-[#201515] text-white flex items-center justify-center font-black italic">
                                {s.employeeName?.[0]}
                             </div>
                             <div>
                                <p className="text-[13px] font-black text-[#201515] uppercase italic">{s.employeeName}</p>
                                <p className="text-[9px] font-bold text-[#00a76b] uppercase tracking-widest">{s.role}</p>
                             </div>
                          </div>
                       </td>
                       <td className="px-8 py-6">
                          <p className="text-[12px] font-black text-[#201515] italic">{new Date(s.timestamp).toLocaleString()}</p>
                       </td>
                       <td className="px-8 py-6">
                          <div className="w-24 h-14 rounded-lg bg-[#201515] overflow-hidden border border-[#c5c0b1] cursor-pointer" onClick={() => setSelectedImage(getImageUrl(s.imageUrl))}>
                             <img src={getImageUrl(s.imageUrl)} alt="" className="w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity" />
                          </div>
                       </td>
                       <td className="px-8 py-6 text-right">
                          <div className="flex justify-end gap-2">
                             <button 
                               onClick={() => setSelectedImage(getImageUrl(s.imageUrl))}
                               className="p-2 text-[#939084] hover:text-[#00a76b] transition-colors"
                             >
                               <Eye size={18} />
                             </button>
                             <a 
                               href={getImageUrl(s.imageUrl)} 
                               download={`Screenshot-${s.employeeName}.png`}
                               className="p-2 text-[#939084] hover:text-[#00a76b] transition-colors"
                             >
                               <Download size={18} />
                             </a>
                          </div>
                       </td>
                    </tr>
                 ))}
              </tbody>
           </table>
        </div>
      )}
            </>
          )}
        </>
      )}

      {/* 🖼️ PREMIUM PREVIEW MODAL */}
      {selectedImage && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-12 animate-fade-in">
           {/* Glass Background */}
           <div 
             className="absolute inset-0 bg-[#201515]/95 backdrop-blur-xl cursor-zoom-out"
             onClick={() => setSelectedImage(null)}
           ></div>
           
           {/* Image Container */}
           <div className="relative max-w-full max-h-full flex flex-col items-center animate-scale-up">
              <div className="bg-white p-2 rounded-2xl shadow-[0_0_100px_rgba(0,0,0,0.5)] border border-white/10">
                 <img 
                   src={selectedImage} 
                   alt="Full Preview" 
                   className="max-w-full max-h-[70vh] rounded-xl object-contain"
                 />
              </div>

              {/* ACTION BAR AT BOTTOM */}
              <div className="mt-8 flex gap-6">
                 <a 
                   href={selectedImage} 
                   download="FluidHR-Capture.png"
                   className="flex items-center gap-3 px-8 py-3 rounded-full bg-white/10 hover:bg-[#00a76b] text-white transition-all border border-white/20 shadow-2xl group"
                   title="Download High Res"
                 >
                    <Download size={20} className="group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Download Node</span>
                 </a>
                 <button 
                   onClick={() => setSelectedImage(null)}
                   className="flex items-center gap-3 px-8 py-3 rounded-full bg-white/10 hover:bg-red-500 text-white transition-all border border-white/20 shadow-2xl group"
                   title="Close Preview"
                 >
                    <X size={20} className="group-hover:rotate-90 transition-transform" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Exit Trace</span>
                 </button>
              </div>
              
              <p className="mt-12 text-white/40 text-[10px] font-black uppercase tracking-[0.4em] italic">
                 Secure Connection Active • Encrypted Registry
              </p>
           </div>
        </div>
      )}
    </div>
  );
};

export default Screenshots;
