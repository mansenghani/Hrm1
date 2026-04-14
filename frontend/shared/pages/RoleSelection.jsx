import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Activity, Zap, Cpu, HelpCircle, Key } from 'lucide-react';
import { RoleCard } from '../components/EntryPrimitives';

const RoleSelection = () => {
  const navigate = useNavigate();

  const roles = [
    { id: 'admin', title: 'Admin', desc: 'System Architecture', icon: <ShieldCheck size={32} /> },
    { id: 'hr', title: 'HR', desc: 'Personnel Infrastructure', icon: <Activity size={32} /> },
    { id: 'manager', title: 'Manager', desc: 'Team Orchestration', icon: <Zap size={32} /> },
    { id: 'employee', title: 'Employee', desc: 'Personnel Node Ops', icon: <Cpu size={32} /> }
  ];

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8 bg-[#F5F5F5] relative overflow-hidden text-center">
      
      {/* ATMOSPHERIC ACCENTS */}
      <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-[#F0B90B]/5 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-[#222126]/5 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-6xl mx-auto relative z-10">
        <div className="mb-20 space-y-6">
          <div className="inline-flex items-center gap-3 px-6 py-2 bg-white shadow-[0_4px_12px_rgba(30,32,38,0.04)] border border-[#E6E8EA] rounded-full">
            <span className="w-2 h-2 bg-[#F0B90B] rounded-full animate-pulse"></span>
            <span className="text-[10px] font-black tracking-[0.3em] uppercase text-[#848E9C]">Step 02: Access Gateway</span>
          </div>
          <h1 className="text-6xl md:text-7xl font-black tracking-tighter text-[#1E2026] leading-none uppercase italic">
            Select Your <span className="text-[#F0B90B]">Perspective</span>
          </h1>
          <p className="text-[#848E9C] max-w-xl mx-auto text-xl font-bold italic border-l-4 border-[#F0B90B] pl-8 text-left md:text-center mx-auto uppercase tracking-tight">
             Define your personnel node identity to synchronize with organizational logic.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 px-4">
          {roles.map((role) => (
            <RoleCard 
              key={role.id}
              title={role.title}
              desc={role.desc}
              icon={role.icon}
              onClick={() => navigate(`/login/${role.id}`)}
            />
          ))}
        </div>

        <div className="mt-24 flex flex-col md:flex-row justify-center items-center gap-12 opacity-40">
           <div className="flex items-center gap-3 group cursor-pointer transition-colors hover:text-[#F0B90B]">
              <HelpCircle size={14} />
              <span className="text-[10px] tracking-[0.3em] uppercase font-black">Architecture Support</span>
           </div>
           <div className="flex items-center gap-3 group cursor-pointer transition-colors hover:text-[#F0B90B]">
              <Key size={14} />
              <span className="text-[10px] tracking-[0.3em] uppercase font-black">Request Global Access</span>
           </div>
        </div>
      </div>
      
      <div className="fixed bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#F0B90B]/30 to-transparent"></div>
    </main>
  );
};

export default RoleSelection;
