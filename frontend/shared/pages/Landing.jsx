import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, ArrowRight, Zap, Users, BarChart3, Wallet, Activity, Globe, CheckCircle } from 'lucide-react';

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white text-[#1E2026] overflow-x-hidden">
      
      {/* NAVIGATION */}
      <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-2xl border-b border-[#E6E8EA]">
        <div className="flex justify-between items-center px-10 py-5 max-w-[1440px] mx-auto">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-[#F0B90B] rounded-xl flex items-center justify-center shadow-lg shadow-[#F0B90B]/20">
                <ShieldCheck size={24} className="text-[#1E2026]" fill="currentColor" />
             </div>
             <span className="text-2xl font-black tracking-tighter text-[#1E2026] uppercase italic">Fluid<span className="text-[#F0B90B]">HR</span></span>
          </div>
          <nav className="hidden lg:flex items-center gap-12">
            {['Markets', 'Protocols', 'Institutional', 'Resources'].map(link => (
              <a key={link} className="text-[12px] font-black uppercase tracking-widest text-[#848E9C] hover:text-[#F0B90B] transition-colors" href="#">{link}</a>
            ))}
          </nav>
          <div className="flex items-center gap-6">
            <button 
              onClick={() => navigate('/select-role')} 
              className="text-[12px] font-black uppercase tracking-widest text-[#1E2026] hover:text-[#F0B90B] transition-colors"
            >
              Sign In
            </button>
            <button 
              onClick={() => navigate('/select-role')}
              className="bg-[#F0B90B] text-[#1E2026] px-8 py-3 rounded-full text-[12px] font-black uppercase tracking-widest hover:bg-[#FFD000] transition-all shadow-lg shadow-[#F0B90B]/10 active:scale-95"
            >
              Get Started
            </button>
          </div>
        </div>
      </header>

      <main className="pt-32">
        {/* HERO SECTION */}
        <section className="relative px-10 py-24 md:py-40 max-w-[1440px] mx-auto overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[1200px] bg-gradient-to-br from-[#F0B90B]/5 to-transparent rounded-full -z-10 blur-3xl"></div>
          
          <div className="grid lg:grid-cols-2 gap-24 items-center">
            <div className="text-left relative z-10">
              <div className="inline-flex items-center gap-3 px-6 py-2 bg-[#F5F5F5] rounded-full mb-10 border border-[#E6E8EA]">
                 <Zap size={14} className="text-[#F0B90B]" fill="currentColor" />
                 <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#848E9C]">v4.0 Protocol Active</span>
              </div>
              <h1 className="text-7xl md:text-8xl font-black leading-[0.85] tracking-tighter text-[#1E2026] mb-10 uppercase italic">
                 Buy, Sell, and <br/>Manage <span className="text-[#F0B90B]">Talent</span>
              </h1>
              <p className="text-xl md:text-2xl text-[#848E9C] max-w-xl mb-12 font-bold leading-relaxed border-l-8 border-[#F0B90B] pl-10 uppercase tracking-tight">
                THE WORLD'S HIGHEST FIDELITY HR ECOSYSTEM. ORCHESTRATE PERSONNEL UNITS WITH THE PRECISION OF A DIGITAL TRADING FLOOR.
              </p>
              <div className="flex flex-col sm:flex-row gap-6">
                <button 
                  onClick={() => navigate('/select-role')}
                  className="bg-[#222126] text-white px-12 py-5 rounded-full text-[14px] font-black uppercase tracking-widest hover:bg-black transition-all flex items-center justify-center gap-3 shadow-2xl active:scale-95"
                >
                  Enter Portal 
                  <ArrowRight size={20} />
                </button>
                <button className="bg-white border-2 border-[#E6E8EA] text-[#1E2026] px-12 py-5 rounded-full text-[14px] font-black uppercase tracking-widest hover:border-[#F0B90B] hover:text-[#F0B90B] transition-all active:scale-95">
                  Institutional Demo
                </button>
              </div>
            </div>
            
            <div className="relative group">
               <div className="absolute inset-0 bg-gradient-to-br from-[#F0B90B]/20 to-transparent rounded-[3rem] blur-2xl group-hover:scale-110 transition-transform duration-1000"></div>
               <div className="relative bg-[#222126] p-4 rounded-[3rem] border border-white/5 shadow-2xl overflow-hidden aspect-[4/3]">
                  <img className="w-full h-full object-cover rounded-[2rem] grayscale group-hover:grayscale-0 transition-all duration-1000 opacity-80" alt="fintech hr terminal dashboard" src="https://images.unsplash.com/photo-1611974717528-587002019484?auto=format&fit=crop&q=80&w=2000"/>
                  <div className="absolute bottom-10 left-10 right-10 p-8 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/10 flex justify-between items-center text-white">
                     <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-[#F0B90B]">System Status</p>
                        <p className="text-xl font-black uppercase">Nodes Synchronized</p>
                     </div>
                     <Activity size={32} className="text-[#F0B90B]" />
                  </div>
               </div>
            </div>
          </div>
        </section>

        {/* FEATURE MATRIX */}
        <section className="px-10 py-32 bg-[#F5F5F5]">
           <div className="max-w-[1440px] mx-auto">
              <div className="flex flex-col md:flex-row justify-between items-end gap-10 mb-24 border-b border-[#E6E8EA] pb-12">
                 <div className="text-left">
                    <h2 className="text-4xl md:text-6xl font-black text-[#1E2026] uppercase tracking-tighter leading-none mb-4">Core Ecosystem</h2>
                    <p className="text-xl font-bold text-[#848E9C] uppercase tracking-[0.1em]">Engineered for institutional-grade workforce orchestration.</p>
                 </div>
                 <div className="flex gap-4">
                    <div className="w-12 h-[2px] bg-[#F0B90B] self-center"></div>
                    <span className="text-[11px] font-black text-[#848E9C] uppercase tracking-[0.4em]">Protocol Matrix</span>
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                 {[
                   { title: 'Presence Trace', desc: 'Real-time monitoring with geo-protocol fencing and automated logic reconciliation.', icon: Activity, color: 'text-[#0ECB81]' },
                   { title: 'Ledger Liquidity', desc: 'Global one-click payment flows with automated tax compliance and dynamic benefits cycle.', icon: Wallet, color: 'text-[#F0B90B]' },
                   { title: 'Talent Scalability', desc: 'Data-driven appraisal nodes and feedback protocols to accelerate organizational growth.', icon: BarChart3, color: 'text-[#1EAEDB]' }
                 ].map((feature, i) => (
                   <div key={i} className="bg-white p-12 rounded-[2.5rem] border border-[#E6E8EA] hover:border-[#F0B90B] transition-all group relative overflow-hidden text-left">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-[#F5F5F5] rounded-full -mr-12 -mt-12 group-hover:bg-[#F0B90B]/10 transition-colors"></div>
                      <div className={`p-4 bg-[#F5F5F5] ${feature.color} rounded-2xl w-fit mb-10 group-hover:scale-110 transition-transform`}>
                         <feature.icon size={32} />
                      </div>
                      <h3 className="text-2xl font-black text-[#1E2026] uppercase mb-4 tracking-tight">{feature.title}</h3>
                      <p className="text-[#848E9C] font-bold leading-relaxed uppercase text-[12px] tracking-widest opacity-80 mb-10">
                        {feature.desc}
                      </p>
                      <button className="flex items-center gap-3 text-[11px] font-black uppercase tracking-widest text-[#1E2026] hover:text-[#F0B90B] transition-colors">
                         Explore Node <ArrowRight size={16} />
                      </button>
                   </div>
                 ))}
              </div>
           </div>
        </section>

        {/* CTA SECTION */}
        <section className="px-10 py-40">
           <div className="max-w-[1440px] mx-auto bg-[#222126] rounded-[4rem] p-24 text-center relative overflow-hidden shadow-2xl border border-white/5">
              <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-br from-[#F0B90B]/10 to-transparent rounded-full -mr-[400px] -mt-[400px] blur-[100px]"></div>
              <div className="relative z-10">
                 <h2 className="text-5xl md:text-8xl font-black text-white mb-10 uppercase italic tracking-tighter leading-none">
                    Start Your <span className="text-[#F0B90B]">Sync</span> Today
                 </h2>
                 <p className="text-[#848E9C] text-2xl font-bold mb-16 max-w-2xl mx-auto uppercase tracking-tight border-b-2 border-[#F0B90B]/20 pb-10">
                    Join 2,500+ global enterprises architecting their future on the FluidHR protocol.
                 </p>
                 <div className="flex flex-col md:flex-row justify-center gap-8">
                    <button 
                       onClick={() => navigate('/select-role')}
                       className="bg-[#F0B90B] text-[#1E2026] px-16 py-6 rounded-full text-lg font-black uppercase tracking-widest hover:bg-[#FFD000] shadow-2xl shadow-[#F0B90B]/20 transition-all active:scale-95"
                    >
                       Get Started Now
                    </button>
                    <button className="bg-white/5 backdrop-blur-xl border border-white/10 text-white px-16 py-6 rounded-full text-lg font-black uppercase tracking-widest hover:bg-white/10 transition-all active:scale-95">
                       Consult Sales Node
                    </button>
                 </div>
              </div>
           </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="bg-[#1E2026] w-full py-24 px-10 border-t border-white/10">
        <div className="max-w-[1440px] mx-auto text-left">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
             <div className="col-span-1">
                <div className="flex items-center gap-3 mb-8">
                   <div className="w-8 h-8 bg-[#F0B90B] rounded-lg flex items-center justify-center">
                      <ShieldCheck size={18} className="text-[#1E2026]" fill="currentColor" />
                   </div>
                   <span className="text-xl font-black text-white italic tracking-tighter uppercase">Fluid<span className="text-[#F0B90B]">HR</span></span>
                </div>
                <p className="text-[#848E9C] text-[10px] font-black uppercase tracking-[0.2em] leading-relaxed">System Architecture v4.0.9 <br/>Digital Personnel Marketplace Protocol</p>
             </div>
             {[
               { title: 'Ecosystem', links: ['Markets', 'Liquidity', 'Nodes', 'Architecture'] },
               { title: 'Governance', links: ['Privacy Protocol', 'Terms of Sync', 'Security Trace', 'Ethics Hub'] },
               { title: 'Resources', links: ['Node Status', 'Central API', 'Community Pulse', 'Whitepaper'] }
             ].map((col, i) => (
                <div key={i} className="space-y-6">
                   <h4 className="text-[12px] font-black uppercase tracking-[0.2em] text-[#F0B90B]">{col.title}</h4>
                   <ul className="space-y-4">
                      {col.links.map(link => (
                         <li key={link}><a className="text-[11px] font-bold uppercase tracking-widest text-[#848E9C] hover:text-white transition-colors" href="#">{link}</a></li>
                      ))}
                   </ul>
                </div>
             ))}
          </div>
          <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
             <div className="text-[#848E9C] text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-4">
                <Globe size={14} />
                Global Infrastructure Site (C) 2026 FluidHR.
             </div>
             <div className="flex gap-8">
                {['Twitter', 'Discord', 'Telegram', 'Node Sync'].map(link => (
                   <span key={link} className="text-[9px] font-black uppercase tracking-[0.4em] text-[#848E9C] hover:text-[#F0B90B] transition-colors cursor-pointer">{link}</span>
                ))}
             </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
