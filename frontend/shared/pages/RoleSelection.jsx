import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Activity, Zap, Cpu, HelpCircle, Key } from 'lucide-react';
import { RoleCard } from '../components/EntryPrimitives';

const RoleSelection = () => {
  const navigate = useNavigate();

  const roles = [
    { id: 'admin', title: 'Admin', desc: 'System Architecture & Master Protocols', icon: <ShieldCheck /> },
    { id: 'hr', title: 'HR', desc: 'Personnel Infrastructure & Lifecycle', icon: <Activity /> },
    { id: 'manager', title: 'Manager', desc: 'Team Orchestration & Resource Allocation', icon: <Zap /> },
    { id: 'employee', title: 'Employee', desc: 'Personnel Node Operations & Tracking', icon: <Cpu /> }
  ];

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8 bg-white relative overflow-hidden">
      
      <div className="w-full max-w-[1584px] mx-auto relative z-10 px-8">
        <div className="mb-24">
          <p className="cds-heading-03 text-[#0f62fe] mb-4">Step 02: Access Gateway</p>
          <h1 className="cds-display-01 text-[#161616] mb-8">
            Select your <span className="font-medium">perspective</span>
          </h1>
          <div className="w-24 h-1 bg-[#161616] mb-8"></div>
          <p className="cds-body-long-01 text-[#525252] max-w-xl">
             Define your personnel node identity to synchronize with organizational logic. Enterprise-grade access control enabled.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-1">
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

        <div className="mt-24 flex flex-col md:flex-row items-center gap-12">
           <div className="flex items-center gap-3 cursor-pointer text-[#525252] hover:text-[#0f62fe] transition-colors">
              <HelpCircle size={16} />
              <span className="cds-caption-01 uppercase font-semibold">Architecture Support</span>
           </div>
           <div className="flex items-center gap-3 cursor-pointer text-[#525252] hover:text-[#0f62fe] transition-colors">
              <Key size={16} />
              <span className="cds-caption-01 uppercase font-semibold">Request Global Access</span>
           </div>
        </div>
      </div>
      
      {/* Carbon Border Accent */}
      <div className="fixed top-0 left-0 w-full h-1 bg-[#0f62fe]"></div>
    </main>
  );
};

export default RoleSelection;
