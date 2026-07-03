import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Calendar, Clock, Plane, CheckCircle2, Plus, Search, 
  SlidersHorizontal, Download, X, AlertCircle, Info 
} from 'lucide-react';

const LeaveManagement = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    leaveType: '',
    startDate: '',
    endDate: '',
    reason: ''
  });

  const token = sessionStorage.getItem('token');
  const user = JSON.parse(sessionStorage.getItem('user') || '{}');
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'));
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const QUOTAS = {
    sick: 10,
    earned: 15,
    casual: 10,
    emergency: 5
  };

  useEffect(() => {
    fetchMyLeaves();
  }, []);

  const fetchMyLeaves = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/leaves/my', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLeaves(response.data);
    } catch (err) {
      console.error('Fetch failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateDays = (start, end) => {
    if (!start || !end) return 0;
    const diff = new Date(end).getTime() - new Date(start).getTime();
    return Math.max(1, Math.ceil(diff / (1000 * 3600 * 24)));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const days = calculateDays(formData.startDate, formData.endDate);
      await axios.post('/api/leaves/apply', { ...formData, totalDays: days }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Leave request submitted successfully.');
      setIsRequestModalOpen(false);
      setFormData({ leaveType: '', startDate: '', endDate: '', reason: '' });
      fetchMyLeaves();
    } catch (err) {
      console.error('Submit failed:', err);
      alert('Failed to submit leave request: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to withdraw this leave request?')) return;
    try {
      await axios.put(`/api/leaves/cancel/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Leave request withdrawn.');
      setIsModalOpen(false);
      fetchMyLeaves();
    } catch (err) {
      console.error('Cancel failed:', err);
      alert('Failed to withdraw request: ' + (err.response?.data?.message || err.message));
    }
  };

  const getInitials = (name) => {
    if (!name) return 'ME';
    return name
      .split(' ')
      .map(n => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  // Dynamic Metrics calculations
  const approvedLeaves = leaves.filter(l => l.status === 'approved');
  
  const usedEarned = approvedLeaves
    .filter(l => l.leaveType === 'earned')
    .reduce((acc, curr) => acc + (curr.totalDays || 0), 0);
    
  const usedSick = approvedLeaves
    .filter(l => l.leaveType === 'sick')
    .reduce((acc, curr) => acc + (curr.totalDays || 0), 0);

  const annualBalance = Math.max(0, QUOTAS.earned - usedEarned);
  const sickBalance = Math.max(0, QUOTAS.sick - usedSick);
  const pendingCount = leaves.filter(l => l.status === 'pending').length;

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const approvedThisMonth = approvedLeaves.filter(l => {
    const d = new Date(l.startDate);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  }).length;

  // Filter requests
  const filteredLeaves = leaves.filter(l => {
    const query = searchQuery.toLowerCase();
    return (
      l.leaveType.toLowerCase().includes(query) ||
      (l.reason && l.reason.toLowerCase().includes(query)) ||
      l.status.toLowerCase().includes(query)
    );
  });

  const handleExport = () => {
    alert('Exporting leave registry trace...');
  };

  return (
    <div style={{ fontFamily: "'Inter', -apple-system, sans-serif", background: isDark ? '#08100e' : '#f9fdfc', minHeight: 'calc(100vh - 56px)', color: isDark ? '#cbd5e1' : '#3b3e3c', width: '100%', boxSizing: 'border-box', transition: 'background-color 0.3s ease, color 0.3s ease' }}>
      <div style={{ width: '100%', maxWidth: '100%', padding: '32px 32px 60px', boxSizing: 'border-box' }}>
        
        {/* HEADER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: isDark ? '#fff' : '#2c302e', margin: 0, letterSpacing: '-0.5px' }}>
              My leave
            </h1>
            <p style={{ fontSize: 14, color: isDark ? '#a3b3af' : '#8c918f', margin: '4px 0 0' }}>Request and track your time-off.</p>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button onClick={handleExport} className="verdant-btn-outline" style={{ gap: 8, height: 44 }}>
              <Download size={16} /> Export
            </button>
            <button onClick={() => setIsRequestModalOpen(true)} className="verdant-btn-primary" style={{ gap: 8, height: 44 }}>
              <Plus size={16} /> Request leave
            </button>
          </div>
        </div>

        {/* SEARCH & FILTER */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={18} color={isDark ? '#a3b3af' : '#9ca3af'} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="text" 
              placeholder="Search..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="verdant-input"
              style={{ paddingLeft: 46 }}
            />
          </div>
          <button className="verdant-btn-outline" style={{ gap: 8, height: 44 }}>
            <SlidersHorizontal size={16} /> Filters
          </button>
        </div>

        {/* METRIC CARDS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20, marginBottom: 32 }}>
          {/* Card 1: Annual Balance */}
          <div className="verdant-card" style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: isDark ? 'rgba(0,167,107,0.08)' : '#e6f7f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Plane size={20} color="#00a76b" />
              </div>
            </div>
            <div>
              <h3 style={{ fontSize: 32, fontWeight: 800, color: isDark ? '#fff' : '#2c302e', margin: '0 0 4px', lineHeight: 1 }}>{annualBalance}d</h3>
              <p style={{ fontSize: 13, color: isDark ? '#a3b3af' : '#8c918f', margin: 0, fontWeight: 600 }}>Annual balance</p>
            </div>
          </div>

          {/* Card 2: Sick Balance */}
          <div className="verdant-card" style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: isDark ? 'rgba(79,70,229,0.08)' : '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Calendar size={20} color="#4f46e5" />
              </div>
            </div>
            <div>
              <h3 style={{ fontSize: 32, fontWeight: 800, color: isDark ? '#fff' : '#2c302e', margin: '0 0 4px', lineHeight: 1 }}>{sickBalance}d</h3>
              <p style={{ fontSize: 13, color: isDark ? '#a3b3af' : '#8c918f', margin: 0, fontWeight: 600 }}>Sick balance</p>
            </div>
          </div>

          {/* Card 3: Pending Requests */}
          <div className="verdant-card" style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: isDark ? 'rgba(249,115,22,0.08)' : '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Clock size={20} color="#f97316" />
              </div>
            </div>
            <div>
              <h3 style={{ fontSize: 32, fontWeight: 800, color: isDark ? '#fff' : '#2c302e', margin: '0 0 4px', lineHeight: 1 }}>{pendingCount}</h3>
              <p style={{ fontSize: 13, color: isDark ? '#a3b3af' : '#8c918f', margin: 0, fontWeight: 600 }}>Pending requests</p>
            </div>
          </div>

          {/* Card 4: Approved this month */}
          <div className="verdant-card" style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: isDark ? 'rgba(0,167,107,0.08)' : '#e6f7f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CheckCircle2 size={20} color="#00a76b" />
              </div>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#00a76b', display: 'flex', alignItems: 'center', gap: 2 }}>
                ↗ 5%
              </span>
            </div>
            <div>
              <h3 style={{ fontSize: 32, fontWeight: 800, color: isDark ? '#fff' : '#2c302e', margin: '0 0 4px', lineHeight: 1 }}>{approvedThisMonth}</h3>
              <p style={{ fontSize: 13, color: isDark ? '#a3b3af' : '#8c918f', margin: 0, fontWeight: 600 }}>Approved this month</p>
            </div>
          </div>
        </div>

        {/* MY REQUESTS */}
        <h2 style={{ fontSize: 18, fontWeight: 800, color: isDark ? '#fff' : '#2c302e', marginBottom: 16, marginTop: 0 }}>My requests</h2>
        
        <div className="verdant-card" style={{ padding: 0, overflow: 'hidden' }}>
          {loading ? (
            <p style={{ padding: '40px 24px', textAlign: 'center', color: isDark ? '#a3b3af' : '#8c918f', fontSize: 14, margin: 0 }} className="animate-pulse">
              Synchronizing leaves...
            </p>
          ) : filteredLeaves.length === 0 ? (
            <p style={{ padding: '40px 24px', textAlign: 'center', color: isDark ? '#a3b3af' : '#8c918f', fontSize: 14, margin: 0 }}>
              No leave requests found.
            </p>
          ) : (
            [...filteredLeaves].reverse().map((lv, idx) => (
              <div 
                key={lv._id || idx} 
                onClick={() => { setSelectedLeave(lv); setIsModalOpen(true); }} 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between', 
                  padding: '16px 24px', 
                  borderBottom: idx === filteredLeaves.length - 1 ? 'none' : (isDark ? '1px solid #1a2d29' : '1px solid #e2eae7'), 
                  cursor: 'pointer', 
                  transition: 'background 0.2s' 
                }} 
                className={isDark ? "hover:bg-[#162722]" : "hover:bg-[#f9fdfc]"}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: isDark ? 'rgba(0,167,107,0.08)' : '#e6f7f0', color: '#00a76b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800 }}>
                    {getInitials(user.name || 'My Request')}
                  </div>
                  <div>
                    <h4 style={{ fontSize: 15, fontWeight: 700, color: isDark ? '#fff' : '#3b3e3c', margin: '0 0 4px' }}>{user.name || 'My Request'}</h4>
                    <p style={{ fontSize: 13, color: isDark ? '#a3b3af' : '#8c918f', margin: 0 }}>
                      <span style={{ textTransform: 'capitalize' }}>{lv.leaveType} leave</span> • {new Date(lv.startDate).toLocaleDateString()} → {new Date(lv.endDate).toLocaleDateString()} • {lv.totalDays} day(s)
                    </p>
                  </div>
                </div>
                <div>
                  <span style={{
                    padding: '6px 12px',
                    borderRadius: 99,
                    fontSize: 12,
                    fontWeight: 700,
                    textTransform: 'capitalize',
                    background: lv.status === 'approved' ? (isDark ? 'rgba(0,167,107,0.08)' : '#e6f7f0') : lv.status === 'rejected' ? (isDark ? 'rgba(225,29,72,0.08)' : '#fde8e8') : (isDark ? 'rgba(107,114,128,0.08)' : '#f3f4f6'),
                    color: lv.status === 'approved' ? '#00a76b' : lv.status === 'rejected' ? '#e11d48' : (isDark ? '#cbd5e1' : '#6b7280'),
                    display: 'inline-block'
                  }}>
                    {lv.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* REQUEST LEAVE MODAL */}
      {isRequestModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(30, 32, 38, 0.4)', backdropFilter: 'blur(4px)' }}>
          <div className="verdant-card" style={{ width: '100%', maxWidth: 500, padding: 32, position: 'relative', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)' }}>
            <button onClick={() => setIsRequestModalOpen(false)} style={{ position: 'absolute', top: 20, right: 20, border: 'none', background: 'transparent', cursor: 'pointer', color: '#9ca3af' }}>
              <X size={20} />
            </button>
            <h3 style={{ fontSize: 20, fontWeight: 800, color: isDark ? '#fff' : '#2c302e', margin: '0 0 24px' }}>Request leave</h3>
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: isDark ? '#a3b3af' : '#8c918f' }}>Leave Type</label>
                <select 
                  required
                  value={formData.leaveType}
                  onChange={e => setFormData({...formData, leaveType: e.target.value})}
                  className="verdant-input"
                  style={{ appearance: 'none', cursor: 'pointer' }}
                >
                   <option value="" disabled>Choose Designation</option>
                   <option value="sick">Sick Leave</option>
                   <option value="casual">Casual Leave</option>
                   <option value="earned">Earned Leave</option>
                   <option value="emergency">Emergency Leave</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: isDark ? '#a3b3af' : '#8c918f' }}>Start Date</label>
                  <input 
                    type="date" 
                    required
                    value={formData.startDate}
                    onChange={e => setFormData({...formData, startDate: e.target.value})}
                    className="verdant-input"
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: isDark ? '#a3b3af' : '#8c918f' }}>End Date</label>
                  <input 
                    type="date" 
                    required
                    value={formData.endDate}
                    onChange={e => setFormData({...formData, endDate: e.target.value})}
                    className="verdant-input"
                  />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: isDark ? '#a3b3af' : '#8c918f' }}>Reason</label>
                <textarea 
                  required
                  value={formData.reason}
                  onChange={e => setFormData({...formData, reason: e.target.value})}
                  placeholder="State operational justification..."
                  className="verdant-input"
                  style={{ minHeight: 80, height: 'auto', padding: '12px 20px', borderRadius: 16 }}
                />
              </div>

              <button type="submit" className="verdant-btn-primary" style={{ width: '100%', marginTop: 8 }}>
                 Apply For Leave
              </button>
            </form>
          </div>
        </div>
      )}

      {/* DETAILS MODAL */}
      {isModalOpen && selectedLeave && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(30, 32, 38, 0.4)', backdropFilter: 'blur(4px)' }}>
          <div className="verdant-card" style={{ width: '100%', maxWidth: 550, padding: 32, position: 'relative', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)' }}>
            <button onClick={() => setIsModalOpen(false)} style={{ position: 'absolute', top: 20, right: 20, border: 'none', background: 'transparent', cursor: 'pointer', color: '#9ca3af' }}>
              <X size={20} />
            </button>
            <h3 style={{ fontSize: 20, fontWeight: 800, color: isDark ? '#fff' : '#2c302e', margin: '0 0 24px', textTransform: 'capitalize' }}>{selectedLeave.leaveType} Leave Details</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                   <label style={{ fontSize: 11, fontWeight: 700, color: isDark ? '#a3b3af' : '#8c918f', textTransform: 'uppercase' }}>Start Date</label>
                   <p style={{ fontSize: 15, fontWeight: 700, color: isDark ? '#fff' : '#3b3e3c', margin: '4px 0 0' }}>{new Date(selectedLeave.startDate).toLocaleDateString()}</p>
                </div>
                <div>
                   <label style={{ fontSize: 11, fontWeight: 700, color: isDark ? '#a3b3af' : '#8c918f', textTransform: 'uppercase' }}>End Date</label>
                   <p style={{ fontSize: 15, fontWeight: 700, color: isDark ? '#fff' : '#3b3e3c', margin: '4px 0 0' }}>{new Date(selectedLeave.endDate).toLocaleDateString()}</p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                   <label style={{ fontSize: 11, fontWeight: 700, color: isDark ? '#a3b3af' : '#8c918f', textTransform: 'uppercase' }}>Total Days</label>
                   <p style={{ fontSize: 15, fontWeight: 700, color: isDark ? '#fff' : '#3b3e3c', margin: '4px 0 0' }}>{selectedLeave.totalDays} day(s)</p>
                </div>
                <div>
                   <label style={{ fontSize: 11, fontWeight: 700, color: isDark ? '#a3b3af' : '#8c918f', textTransform: 'uppercase' }}>Status</label>
                   <p style={{ margin: '4px 0 0' }}>
                     <span style={{
                       padding: '4px 10px',
                       borderRadius: 99,
                       fontSize: 12,
                       fontWeight: 700,
                       textTransform: 'capitalize',
                       background: selectedLeave.status === 'approved' ? (isDark ? 'rgba(0,167,107,0.08)' : '#e6f7f0') : selectedLeave.status === 'rejected' ? (isDark ? 'rgba(225,29,72,0.08)' : '#fde8e8') : (isDark ? 'rgba(107,114,128,0.08)' : '#f3f4f6'),
                       color: selectedLeave.status === 'approved' ? '#00a76b' : selectedLeave.status === 'rejected' ? '#e11d48' : (isDark ? '#cbd5e1' : '#6b7280'),
                       display: 'inline-block'
                     }}>
                       {selectedLeave.status}
                     </span>
                   </p>
                </div>
              </div>

              <div>
                 <label style={{ fontSize: 11, fontWeight: 700, color: isDark ? '#a3b3af' : '#8c918f', textTransform: 'uppercase' }}>Reason</label>
                 <p style={{ fontSize: 14, color: isDark ? '#fff' : '#3b3e3c', margin: '4px 0 0', lineHeight: 1.5, background: isDark ? '#111c18' : '#f9fdfc', padding: 12, borderRadius: 12, border: isDark ? '1px solid #1a2d29' : '1px solid #e2eae7' }}>
                   {selectedLeave.reason || 'No justification provided.'}
                 </p>
              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
                {selectedLeave.status === 'pending' && (
                  <button onClick={() => handleCancel(selectedLeave._id)} className="verdant-btn-outline" style={{ flex: 1, borderColor: '#f87171', color: '#ef4444' }}>
                    Cancel Request
                  </button>
                )}
                <button onClick={() => setIsModalOpen(false)} className="verdant-btn-primary" style={{ flex: 1 }}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaveManagement;
