import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Profile = () => {
  const [userData, setUserData] = useState(null);
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(true);

  const token = sessionStorage.getItem('token');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const timestamp = new Date().getTime();
        const response = await axios.get(`/api/auth/me?t=${timestamp}`, {
          headers: { Authorization: `Bearer ${token}`, 'Cache-Control': 'no-cache' }
        });
        console.log('[CLIENT TRACE] Identity Received:', response.data.employeeId);
        if (response.data) {
          setUserData(response.data);
          sessionStorage.setItem('user', JSON.stringify(response.data));
        }
      } catch (err) {
        console.warn('Initial sync failed.');
      } finally {
        setSyncing(false);
      }
    };
    if (token) fetchProfile();
  }, [token]);

  if (syncing) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 animate-pulse">
            <div className="w-12 h-12 border-4 border-t-orange-500 border-slate-100 rounded-full animate-spin"></div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Verifying Professional Node...</p>
        </div>
    );
  }

  const safeUserData = userData || {};
  const fullName = safeUserData.name || (safeUserData.profile ? `${safeUserData.profile.firstName || ''} ${safeUserData.profile.lastName || ''}`.trim() : 'System Admin');
  const userEmail = safeUserData.email || 'admin@fluidhr.com';
  const userRole = safeUserData.role || 'Personnel';
  const userDept = (safeUserData.department && typeof safeUserData.department === 'object') ? safeUserData.department.name : (safeUserData.department || 'General Operations');
  
  // New Professional Metadata
  const empId = safeUserData.employeeId || 'PENDING-SYNC';
  const personalEmail = safeUserData.personalEmail || 'NOT CONFIGURED';
  const joinDate = safeUserData.joinDate ? new Date(safeUserData.joinDate).toLocaleDateString() : 'NOT SET';
  const phone = safeUserData.phone || 'DATA MISSING';
  const empType = safeUserData.employmentType || 'Standard';

  const initials = fullName ? fullName.split(' ').filter(Boolean).map(n => n[0]).join('').toUpperCase() || 'NA' : 'NA';

  const resetForm = () => {
    setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setStatus({ type: '', message: '' });
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setStatus({ type: '', message: '' });
    if (!passwords.currentPassword || !passwords.newPassword || !passwords.confirmPassword) {
      return setStatus({ type: 'error', message: 'All fields required.' });
    }
    if (passwords.newPassword !== passwords.confirmPassword) {
      return setStatus({ type: 'error', message: 'Passwords mismatch.' });
    }
    setLoading(true);
    const urls = ['/api/auth/update-password'];
    let success = false;
    for (const url of urls) {
      if (success) break;
      try {
        const response = await axios.put(url, { currentPassword: passwords.currentPassword, newPassword: passwords.newPassword }, { headers: { Authorization: `Bearer ${token}` }, timeout: 2000 });
        if (response.data) {
          setStatus({ type: 'success', message: 'Password updated successfully' });
          setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
          success = true;
        }
      } catch (err) {
        if (err.response) {
          setStatus({ type: 'error', message: err.response.data.message || 'Verification Failed' });
          success = true;
        }
      }
    }
    if (!success) setStatus({ type: 'error', message: 'Connection Error.' });
    setLoading(false);
  };

  return (
    <div className="animate-fade-in text-left overflow-hidden max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <style>{`
        .font-manrope { font-family: 'Manrope', sans-serif; }
        .material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 20; }
        .compact-input { 
          background-color: #f8fafc;
          border: 2px solid rgba(251, 146, 60, 0.6);
          border-radius: 12px;
          padding: 14px 18px;
          font-size: 13px;
          font-weight: 600;
          color: #1F2937;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          outline: none;
        }
        .compact-input:focus {
          border-color: rgba(249, 115, 22, 1);
          background-color: white;
          box-shadow: 0 0 0 2px rgba(249, 115, 22, 0.4);
        }
      `}</style>

      {/* ALERT SECTION */}
      {status.message && (
        <div className="mb-8 animate-scale-up">
          <div className={`${status.type === 'success' ? 'bg-emerald-50/50 border-emerald-200' : 'bg-rose-50/50 border-rose-200'} p-5 rounded-xl border shadow-sm`}>
            <div className="flex items-center gap-3 mb-1">
              <span className={`material-symbols-outlined text-lg ${status.type === 'success' ? 'text-emerald-500' : 'text-rose-500'}`}>
                {status.type === 'success' ? 'verified_user' : 'report'}
              </span>
              <h4 className={`text-[11px] font-black uppercase tracking-[0.2em] ${status.type === 'success' ? 'text-emerald-700' : 'text-rose-700'}`}>
                {status.type === 'success' ? 'System Protocol Verified' : 'Access Alert'}
              </h4>
            </div>
            <p className="text-[#1F2937] text-[12px] font-medium pl-8">{status.message}</p>
          </div>
        </div>
      )}

      {/* HEADER SECTION */}
      <section className="bg-white p-8 rounded-[24px] border border-slate-200/60 shadow-sm mb-8 flex flex-col md:flex-row items-center gap-8">
        <div className="relative group">
          <div className="w-24 h-24 rounded-2xl bg-[#F5F7FA] flex items-center justify-center border border-slate-100 shadow-inner group-hover:scale-105 transition-transform duration-500">
            <span className="text-3xl font-black text-[#2E3A59] opacity-20">{initials}</span>
          </div>
          <button className="absolute -bottom-2 -right-2 bg-[var(--accent-gold)] text-white p-2 rounded-lg shadow-lg hover:scale-110 active:scale-95 transition-all">
            <span className="material-symbols-outlined text-base">edit</span>
          </button>
        </div>
        <div className="text-center md:text-left flex-1">
          <h1 className="text-3xl font-black text-[#2E3A59] tracking-tighter font-manrope leading-none mb-2">{fullName}</h1>
          <div className="flex flex-wrap gap-4 mt-4 justify-center md:justify-start">
            <div className="flex items-center gap-2 bg-[#F5F7FA] px-3 py-1.5 rounded-lg text-slate-500 text-[10px] font-bold uppercase tracking-widest border border-slate-100">
              <span className="material-symbols-outlined text-sm text-[var(--accent-gold)]">mail</span> {userEmail}
            </div>
            <div className="flex items-center gap-2 bg-[#F5F7FA] px-3 py-1.5 rounded-lg text-slate-500 text-[10px] font-bold uppercase tracking-widest border border-slate-100">
              <span className="material-symbols-outlined text-sm text-[#2E3A59]">badge</span> {userRole}
            </div>
            <div className="flex items-center gap-2 bg-[#2E3A59] text-white px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-lg">
              <span className="material-symbols-outlined text-sm text-[var(--accent-gold)]">fingerprint</span> {empId}
            </div>
            <div className="flex items-center gap-2 bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest border border-emerald-100">
              <span className="material-symbols-outlined text-sm">verified</span> Active Node
            </div>
          </div>
        </div>
      </section>

      {/* GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* IDENTITY REGISTRY */}
        <section className="lg:col-span-2 bg-white p-10 rounded-[24px] shadow-sm border border-slate-200/60 space-y-10">
          <div className="flex justify-between items-center pb-6 border-b border-slate-50">
            <div>
              <h3 className="text-[12px] font-black text-[#2E3A59] font-manrope tracking-[0.2em] uppercase">Identity Registry</h3>
              <p className="text-slate-400 text-[9px] mt-1 font-medium">Core system profile identifiers</p>
            </div>
            <span className="material-symbols-outlined text-[#2E3A59]/5 text-5xl">fingerprint</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-[#2E3A59] opacity-40 ml-1">Full Legal Name</label>
              <div className="bg-[#fcfcfc] px-5 py-4 rounded-xl text-[#1F2937] font-bold text-[13px] border border-slate-200/60">{fullName}</div>
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-[#2E3A59] opacity-40 ml-1">Employee ID</label>
              <div className="bg-[#fcfcfc] px-5 py-4 rounded-xl text-[#2E3A59] font-black text-[13px] border-2 border-orange-400/20">{empId}</div>
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-[#2E3A59] opacity-40 ml-1">Professional Email</label>
              <div className="bg-[#fcfcfc] px-5 py-4 rounded-xl text-[#1F2937] font-bold text-[13px] border border-slate-200/60">{userEmail}</div>
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-[#2E3A59] opacity-40 ml-1">Personal Contact Vector</label>
              <div className="bg-[#fcfcfc] px-5 py-4 rounded-xl text-[#1F2937] font-bold text-[13px] border border-slate-200/60 italic opacity-60">{personalEmail}</div>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-50">
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                   <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Join Date Protocol</p>
                   <p className="text-sm font-black text-[#2E3A59]">{joinDate}</p>
                </div>
                <div className="space-y-2">
                   <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Assignment Branch</p>
                   <p className="text-sm font-black text-[#2E3A59] uppercase">{userDept}</p>
                </div>
                <div className="space-y-2">
                   <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Phone Telemetry</p>
                   <p className="text-sm font-black text-[#2E3A59]">{phone}</p>
                </div>
             </div>
          </div>
        </section>

        {/* INTELLIGENCE HUB */}
        <section className="bg-[#2E3A59] p-10 rounded-[28px] text-white flex flex-col justify-between relative shadow-2xl border border-white/5 overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>

          <div className="space-y-8 relative z-10">
            <h3 className="text-[12px] font-black font-manrope uppercase tracking-[0.2em] text-[var(--accent-gold)]">Operational Trace</h3>
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-5">
                <span className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Protocol Status</span>
                <span className="font-black text-[11px] uppercase text-emerald-400 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  Secured
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-white/10 pb-5">
                <span className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Node Health</span>
                <div className="flex items-center gap-4">
                  <span className="text-[var(--accent-gold)] font-black text-[12px]">98%</span>
                  <div className="w-20 h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-[var(--accent-gold)] w-[98%]"></div>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Cryptography</span>
                <span className="text-[9px] font-black px-3 py-1 bg-white/5 rounded-lg border border-white/10 uppercase tracking-widest text-emerald-300">Active</span>
              </div>
            </div>
          </div>
          <p className="mt-12 text-[10px] text-white/40 italic font-medium uppercase tracking-tight leading-relaxed">
            "Identity is the bedrock of secure architecture."
          </p>
        </section>

        {/* SECURITY REGISTRY */}
        <section className="lg:col-span-3 bg-white p-10 rounded-[32px] shadow-sm border border-slate-200/60 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-[var(--accent-gold)]"></div>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 pb-8 border-b border-slate-50 gap-4">
            <div>
              <h3 className="text-2xl font-black text-[#2E3A59] font-manrope uppercase tracking-tighter">Security Registry</h3>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] mt-2 italic">Official Access Management Hub</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-[#F5F7FA] text-[#2E3A59] px-4 py-2 rounded-xl border border-slate-200/60 text-[9px] font-black uppercase tracking-widest shadow-sm">
                <span className="material-symbols-outlined text-sm">shield</span> AES-256 Validated
              </div>
            </div>
          </div>

          <form onSubmit={handleUpdatePassword} className="space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-[#2E3A59] opacity-40 ml-4">Current Authorization Key</label>
                <input className="compact-input w-full" placeholder="********" type="password" required value={passwords.currentPassword} onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })} />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-[#2E3A59] opacity-40 ml-4">New Access Credentials</label>
                <input className="compact-input w-full" placeholder="********" type="password" required value={passwords.newPassword} onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })} />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-[#2E3A59] opacity-40 ml-4">Verification Matrix</label>
                <input className="compact-input w-full" placeholder="********" type="password" required value={passwords.confirmPassword} onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })} />
              </div>
            </div>

            {/* CONTROL HUB */}
            <div className="pt-10 flex flex-wrap gap-4 border-t border-slate-50">
              <button type="submit" disabled={loading} className="px-12 bg-[#2E3A59] text-white py-4 rounded-xl font-black text-[11px] uppercase tracking-[0.2em] shadow-xl shadow-slate-900/10 hover:bg-[#1f2a44] hover:scale-[1.03] active:scale-95 transition-all disabled:opacity-50 flex items-center gap-3">
                <span className="material-symbols-outlined text-base">lock_reset</span>
                {loading ? 'Processing...' : 'Sync Security Keys'}
              </button>

              <button type="button" onClick={resetForm} className="px-12 bg-slate-50 text-slate-400 py-4 rounded-xl font-black text-[11px] uppercase tracking-[0.2em] hover:bg-slate-100 hover:text-slate-600 border border-slate-100 transition-all flex items-center gap-3">
                <span className="material-symbols-outlined text-base">close</span>
                Discard Changes
              </button>
            </div>
          </form>
        </section>
      </div>

      {/* 🚀 DEEP DIAGNOSTIC (Admin/HR Only) */}
      {(userRole === 'admin' || userRole === 'hr') && (
        <div className="mt-20 p-8 bg-slate-900 rounded-3xl border border-white/5 shadow-2xl">
           <div className="flex items-center gap-3 mb-6">
              <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Identity Sync Diagnostic</h4>
           </div>
           <pre className="text-[10px] text-emerald-400 font-mono overflow-auto max-h-40 opacity-70">
              {JSON.stringify({
                receivedId: safeUserData.employeeId,
                mappedId: empId,
                serverSync: !!userData,
                tokenPresent: !!token
              }, null, 2)}
           </pre>
        </div>
      )}

      <div className="text-center pt-24 pb-12 opacity-30">
        <p className="text-[#2E3A59] text-[10px] font-black uppercase tracking-[0.5em] leading-loose">
          Narrative HR Central Operations Hub v2.5.5 <br />
          <span className="text-[var(--accent-gold)]">Premium Security Tier Authorized</span>
        </p>
      </div>
    </div>
  );
};

export default Profile;
