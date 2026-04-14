import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { ShieldCheck, ArrowRight, Lock, Mail, Users, Building2, UserCircle } from 'lucide-react';

const Login = () => {
  const { role: urlRole } = useParams();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post('/api/auth/login', {
        email,
        password,
        role: urlRole || 'admin'
      });

      const { token, role, _id, email: userEmail } = response.data;
      const user = { _id, email: userEmail, role };
      sessionStorage.setItem('token', token);
      sessionStorage.setItem('user', JSON.stringify(user));
      sessionStorage.setItem('role', role);

      navigate(`/${role}/dashboard`);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Authentication Protocol Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6 selection:bg-[#F0B90B] selection:text-[#1E2026]">
      <div className="max-w-[1200px] w-full grid grid-cols-1 lg:grid-cols-2 bg-white rounded-[3rem] overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.08)] border border-[#E6E8EA]">
        
        {/* BRAND SIDEBAR */}
        <div className="hidden lg:flex bg-[#222126] p-20 flex-col justify-between relative overflow-hidden">
           <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-[#F0B90B]/10 to-transparent rounded-full -mr-[250px] -mt-[250px] blur-[80px]"></div>
           
           <div className="relative z-10 flex items-center gap-4">
              <div className="w-12 h-12 bg-[#F0B90B] rounded-2xl flex items-center justify-center shadow-2xl">
                 <ShieldCheck size={28} className="text-[#1E2026]" fill="currentColor" />
              </div>
              <span className="text-3xl font-black text-white italic tracking-tighter uppercase">Fluid<span className="text-[#F0B90B]">HR</span></span>
           </div>

           <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/5 rounded-full mb-8 border border-white/10">
                 <div className="w-2 h-2 rounded-full bg-[#F0B90B] animate-pulse"></div>
                 <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#848E9C]">Protocol Encryption Active</span>
              </div>
              <h2 className="text-6xl font-black text-white leading-none uppercase mb-8 tracking-tighter">
                 Induced <br/>Security <br/><span className="text-[#F0B90B]">Standards</span>
              </h2>
              <p className="text-[#848E9C] text-lg font-bold leading-relaxed max-w-sm uppercase tracking-tight">
                 Access the world's highest fidelity personnel marketplace with 256-bit AES encryption.
              </p>
           </div>

           <div className="relative z-10 grid grid-cols-2 gap-8 border-t border-white/5 pt-12">
              <div>
                 <p className="text-[#F0B90B] text-2xl font-black tabular-nums">1.2ms</p>
                 <p className="text-[10px] font-black uppercase tracking-widest text-[#848E9C]">Auth Latency</p>
              </div>
              <div>
                 <p className="text-[#F0B90B] text-2xl font-black tabular-nums">99.9%</p>
                 <p className="text-[10px] font-black uppercase tracking-widest text-[#848E9C]">Uptime Trace</p>
              </div>
           </div>
        </div>

        {/* AUTH FORM */}
        <div className="p-12 md:p-24 flex flex-col justify-center bg-white">
           <div className="mb-12">
              <span className="text-[11px] font-black uppercase tracking-[0.3em] text-[#848E9C] mb-4 block">Induced Entry Node</span>
              <h1 className="text-4xl font-black text-[#1E2026] uppercase tracking-tighter mb-4">
                 Access <span className="text-[#F0B90B]">Portal</span>
              </h1>
              <p className="text-[#848E9C] font-bold text-sm uppercase tracking-tight">
                 Enter credentials for <span className="text-[#1E2026]">{urlRole || 'Institutional'}</span> synchronization.
              </p>
           </div>

           <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-6">
                 <div className="relative group">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#848E9C] ml-4 mb-2 block">Personnel Entity Email</label>
                    <div className="absolute left-6 bottom-4 text-[#848E9C] transition-colors group-focus-within:text-[#F0B90B]">
                       <Mail size={18} />
                    </div>
                    <input 
                       type="email" 
                       required
                       value={email}
                       onChange={(e) => setEmail(e.target.value)}
                       placeholder="node@fluidhr.io"
                       className="w-full pl-14 pr-8 py-4 bg-[#F5F5F5] border-2 border-orange-400/60 focus:ring-2 focus:ring-orange-500/40 rounded-2xl text-[14px] font-bold text-[#1E2026] focus:outline-none focus:bg-white transition-all"
                    />
                 </div>

                 <div className="relative group">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#848E9C] ml-4 mb-2 block">Security Token</label>
                    <div className="absolute left-6 bottom-4 text-[#848E9C] transition-colors group-focus-within:text-[#F0B90B]">
                       <Lock size={18} />
                    </div>
                    <input 
                       type="password" 
                       required
                       value={password}
                       onChange={(e) => setPassword(e.target.value)}
                       placeholder="Enter security token"
                       className="w-full pl-14 pr-8 py-4 bg-[#F5F5F5] border-2 border-orange-400/60 focus:ring-2 focus:ring-orange-500/40 rounded-2xl text-[14px] font-bold text-[#1E2026] focus:outline-none focus:bg-white transition-all"
                    />
                 </div>
              </div>

              {error && (
                <div className="bg-[#F6465D]/10 border border-[#F6465D]/20 p-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                   <div className="w-2 h-2 rounded-full bg-[#F6465D]"></div>
                   <span className="text-[11px] font-black text-[#F6465D] uppercase tracking-wider">{error}</span>
                </div>
              )}

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-[#1E2026] text-white py-5 rounded-2xl text-[14px] font-black uppercase tracking-[0.2em] hover:bg-black transition-all shadow-2xl active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-4"
              >
                 {loading ? 'Executing Trace...' : 'Initiate Sync'}
                 <ArrowRight size={20} className={loading ? 'animate-pulse' : ''} />
              </button>

              <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-[#848E9C]">
                 <span className="hover:text-[#F0B90B] cursor-pointer transition-colors underline decoration-[#F0B90B]/30 underline-offset-4">Reset Credentials</span>
                 <span onClick={() => navigate('/select-role')} className="hover:text-[#F0B90B] cursor-pointer transition-colors">Switch Auth Segment</span>
              </div>
           </form>

           <div className="mt-20 pt-12 border-t border-[#E6E8EA] flex items-center justify-between">
              <div className="flex items-center gap-3">
                 <div className="flex -space-x-2">
                    {[1, 2, 3].map(i => (
                       <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-[#F5F5F5] flex items-center justify-center overflow-hidden">
                          <img src={`https://ui-avatars.com/api/?name=User+${i}&background=848E9C&color=fff&bold=true`} alt="User" />
                       </div>
                    ))}
                 </div>
                 <span className="text-[9px] font-black text-[#848E9C] uppercase tracking-widest leading-none">Global <br/>Nodes Active</span>
              </div>
              <ShieldCheck size={24} className="text-[#848E9C] opacity-20" />
           </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
