import React, { useState } from 'react';
import { Settings as SettingsIcon, Shield, Bell, Key, Database, RefreshCw, Save, X, Globe, Cpu } from 'lucide-react';

const Settings = () => {
  const [loading, setLoading] = useState(false);

  return (
    <div className="space-y-12 animate-in fade-in duration-500 pb-20">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
        <div>
          <h1 className="text-4xl font-black text-[#1E2026] tracking-tight leading-none mb-3">
            System <span className="text-[#F0B90B]">Architecture</span>
          </h1>
          <p className="text-[#848E9C] font-bold text-[11px] uppercase tracking-[0.2em] flex items-center gap-3">
            <span className="w-12 h-[2px] bg-[#F0B90B]"></span>
            Global Configuration Control
          </p>
        </div>
        <div className="flex gap-4">
           <button className="px-8 py-3 bg-[#F5F5F5] text-[#1E2026] rounded-full font-black text-[12px] uppercase tracking-wider hover:bg-[#E6E8EA] transition-all flex items-center gap-2">
              <X size={16} />
              Discard Trace
           </button>
           <button className="px-8 py-3 bg-[#F0B90B] text-[#1E2026] rounded-full font-black text-[12px] uppercase tracking-wider hover:bg-[#FFD000] transition-all shadow-lg flex items-center gap-2">
              <Save size={16} />
              Synchronize Nodes
           </button>
        </div>
      </div>

      {/* CORE CONFIGURATION GRID */}
      <div className="grid grid-cols-12 gap-10">
        
        {/* Identity & Branding Hub */}
        <div className="col-span-12 lg:col-span-7 space-y-10">
           <div className="bg-white border border-[#E6E8EA] rounded-3xl p-10 group">
              <div className="flex items-center gap-4 mb-12">
                 <div className="p-3 bg-[#F5F5F5] rounded-xl text-[#F0B90B] group-hover:bg-[#F0B90B] group-hover:text-white transition-all shadow-sm">
                    <Globe size={24} />
                 </div>
                 <div>
                    <h3 className="text-[12px] font-black text-[#1E2026] uppercase tracking-[0.2em]">Organizational Identity</h3>
                    <p className="text-[10px] font-bold text-[#848E9C] uppercase tracking-widest mt-1">Global branding & network visibility</p>
                 </div>
              </div>

              <div className="space-y-8">
                 <div className="flex items-center gap-8 pb-8 border-b border-[#F5F5F5]">
                    <div className="relative group/logo">
                       <div className="w-24 h-24 rounded-2xl bg-[#222126] flex items-center justify-center text-[#F0B90B] font-black text-2xl border border-white/5 shadow-xl transition-transform group-hover/logo:scale-105">
                          FHR
                       </div>
                       <div className="absolute inset-0 bg-black/60 rounded-2xl flex items-center justify-center opacity-0 group-hover/logo:opacity-100 transition-opacity cursor-pointer">
                          <RefreshCw size={20} className="text-white" />
                       </div>
                    </div>
                    <div>
                       <h4 className="text-[14px] font-black text-[#1E2026] uppercase">Node Identity Asset</h4>
                       <p className="text-[11px] font-bold text-[#848E9C] mt-1 mb-4">SVG or High-Res Logic Recommended</p>
                       <button className="text-[11px] font-black text-[#F0B90B] uppercase tracking-widest hover:underline">Update Asset</button>
                    </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                       <label className="text-[10px] font-black uppercase tracking-widest text-[#848E9C]">Entity Designation</label>
                       <input type="text" defaultValue="FluidHR Global Matrix" className="w-full bg-[#F5F5F5] border border-transparent rounded-xl px-5 py-4 text-[13px] font-bold text-[#1E2026] focus:border-[#F0B90B] focus:bg-white outline-none transition-all" />
                    </div>
                    <div className="space-y-3">
                       <label className="text-[10px] font-black uppercase tracking-widest text-[#848E9C]">Core Network URL</label>
                       <input type="text" defaultValue="internal.fluidhr.io" className="w-full bg-[#F5F5F5] border border-transparent rounded-xl px-5 py-4 text-[13px] font-bold text-[#1E2026] focus:border-[#F0B90B] focus:bg-white outline-none transition-all" />
                    </div>
                    <div className="col-span-full space-y-3">
                       <label className="text-[10px] font-black uppercase tracking-widest text-[#848E9C]">HQ Coordinate Address</label>
                       <input type="text" defaultValue="Global Infrastructure Center, Block A, SF" className="w-full bg-[#F5F5F5] border border-transparent rounded-xl px-5 py-4 text-[13px] font-bold text-[#1E2026] focus:border-[#F0B90B] focus:bg-white outline-none transition-all" />
                    </div>
                 </div>
              </div>
           </div>
        </div>

        {/* Sync Frequency Pillar */}
        <div className="col-span-12 lg:col-span-5 space-y-10">
           <div className="bg-white border border-[#E6E8EA] rounded-3xl p-10 group h-full">
              <div className="flex items-center gap-4 mb-12">
                 <div className="p-3 bg-[#F5F5F5] rounded-xl text-[#F0B90B] group-hover:bg-[#F0B90B] group-hover:text-white transition-all shadow-sm">
                    <RefreshCw size={24} />
                 </div>
                 <div>
                    <h3 className="text-[12px] font-black text-[#1E2026] uppercase tracking-[0.2em]">Operational Pulse</h3>
                    <p className="text-[10px] font-bold text-[#848E9C] uppercase tracking-widest mt-1">Sync frequency & buffer logic</p>
                 </div>
              </div>

              <div className="space-y-10">
                 <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#848E9C] mb-6">Active Sync Days</p>
                    <div className="flex justify-between gap-3">
                       {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
                          <button key={i} className={`flex-1 h-12 rounded-xl font-black text-[12px] transition-all border-2 ${i < 5 ? 'border-[#F0B90B] bg-[#F0B90B]/5 text-[#F0B90B]' : 'border-[#F5F5F5] text-[#848E9C] hover:border-[#E6E8EA]'}`}>{day}</button>
                       ))}
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-3">
                       <label className="text-[10px] font-black uppercase tracking-widest text-[#848E9C]">Pulse Start</label>
                       <input type="time" defaultValue="09:00" className="w-full bg-[#F5F5F5] rounded-xl px-5 py-4 text-[13px] font-black text-[#1E2026] border-none outline-none focus:bg-[#F0B90B]/5 transition-all" />
                    </div>
                    <div className="space-y-3">
                       <label className="text-[10px] font-black uppercase tracking-widest text-[#848E9C]">Pulse End</label>
                       <input type="time" defaultValue="18:00" className="w-full bg-[#F5F5F5] rounded-xl px-5 py-4 text-[13px] font-black text-[#1E2026] border-none outline-none focus:bg-[#F0B90B]/5 transition-all" />
                    </div>
                 </div>

                 <div className="p-8 bg-[#F5F5F5] rounded-2xl border border-[#E6E8EA] relative overflow-hidden group/opt">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#F0B90B]/5 blur-3xl group-hover/opt:scale-150 transition-transform"></div>
                    <div className="flex items-center justify-between mb-4 relative z-10">
                       <h4 className="text-[11px] font-black text-[#1E2026] uppercase">Latency Buffer</h4>
                       <div className="w-10 h-5 bg-[#F0B90B] rounded-full relative shadow-sm">
                          <div className="w-4 h-4 bg-white rounded-full absolute right-0.5 top-0.5"></div>
                       </div>
                    </div>
                    <p className="text-[10px] font-bold text-[#848E9C] leading-relaxed uppercase tracking-tight italic opacity-80 relative z-10">Allow personnel to clock-in within a defined operational window.</p>
                 </div>
              </div>
           </div>
        </div>

        {/* Global Access Protocol Shield */}
        <div className="col-span-12 bg-[#222126] rounded-3xl p-10 relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[#F6465D]/10 to-transparent rounded-full -mr-48 -mt-48 blur-[80px] group-hover:scale-125 transition-transform duration-[3s]"></div>
           <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12 text-white text-left">
              <div className="max-w-3xl">
                 <h3 className="text-[12px] font-black text-[#F0B90B] uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                    <Shield size={18} />
                    High-Level Authorization
                 </h3>
                 <p className="text-[#848E9C] text-[11px] font-bold leading-relaxed uppercase tracking-widest">
                    Critical maintenance operations and structural purge protocols. These actions are non-reversible and require verified lead master credentials. Proceed with caution within the secure architectural layer.
                 </p>
              </div>
              <div className="flex gap-4 shrink-0">
                 <button className="px-10 py-4 bg-white/5 border border-white/10 rounded-full font-black text-[11px] uppercase tracking-widest hover:bg-white/10 transition-all">Audit Trails</button>
                 <button className="px-10 py-4 bg-[#F6465D] text-white rounded-full font-black text-[11px] uppercase tracking-widest shadow-lg shadow-[#F6465D]/20 hover:scale-105 active:scale-95 transition-all border border-white/10">Purge Registry</button>
              </div>
           </div>
        </div>
      </div>

      {/* FOOTER */}
      <div className="pt-16 text-center opacity-30 pb-12">
        <p className="text-[#848E9C] text-[10px] font-black uppercase tracking-[0.6em] leading-loose">
           Configuration Layer Trace ID: 0x992B-X1 <br />
           <span className="text-[#F0B90B]">Verified Narrative Sync Active</span>
        </p>
      </div>
    </div>
  );
};

export default Settings;
