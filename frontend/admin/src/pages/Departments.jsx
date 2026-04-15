import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Layers, Users, Share2, Activity, ArrowUpRight } from 'lucide-react';

const Departments = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const token = sessionStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/api/employees', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setEmployees(res.data || []);
      } catch (err) {
        console.error('Fetch failed:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchEmployees();
  }, []);

  const departmentsMap = employees.reduce((acc, emp) => {
    const dept = emp.department || 'Unassigned';
    if (!acc[dept]) acc[dept] = { name: dept, count: 0, members: [] };
    acc[dept].count += 1;
    acc[dept].members.push(emp);
    return acc;
  }, {});

  const departments = Object.values(departmentsMap);

  return (
    <div className="space-y-12 animate-in fade-in duration-500 pb-20">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
        <div>
          <h1 className="text-4xl font-black text-[#1E2026] tracking-tight leading-none mb-3">
            Unit <span className="text-[#F0B90B]">Architecture</span>
          </h1>
          <p className="text-[#848E9C] font-bold text-[11px] uppercase tracking-[0.2em] flex items-center gap-3">
            <span className="w-12 h-[2px] bg-[#F0B90B]"></span>
            Structural Node Mapping
          </p>
        </div>
        <button className="bg-[#F0B90B] text-[#1E2026] px-10 py-4 rounded-full font-black text-[13px] uppercase tracking-wider shadow-lg hover:bg-[#FFD000] transition-all flex items-center gap-3">
          <Layers size={18} />
          Initialize Unit
        </button>
      </div>

      {/* GRID MATRIX */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {loading ? (
          <div className="col-span-full py-32 text-center">
             <div className="flex flex-col items-center gap-4 opacity-30">
                <div className="w-10 h-10 border-4 border-[#F0B90B]/20 border-t-[#F0B90B] rounded-full animate-spin"></div>
                <p className="text-[11px] font-black uppercase tracking-[0.2em]">Mapping Hub Matrix...</p>
             </div>
          </div>
        ) : departments.length === 0 ? (
          <div className="col-span-full py-32 text-center opacity-30">
             <p className="text-[11px] font-black uppercase tracking-[0.2em]">No structural units detected in the matrix</p>
          </div>
        ) : (
          departments.map((dept, i) => (
            <div key={i} className="bg-white border border-[#E6E8EA] rounded-2xl p-8 hover:border-[#F0B90B] hover:shadow-[0_8px_24px_rgba(0,0,0,0.05)] transition-all group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#F5F5F5] rounded-full -mr-12 -mt-12 group-hover:bg-[#F0B90B]/5 transition-colors"></div>
              
              <div className="flex justify-between items-start mb-10 relative z-10">
                <div className="w-14 h-14 bg-[#F5F5F5] rounded-2xl flex items-center justify-center text-[#1E2026] group-hover:bg-[#F0B90B] transition-all shadow-sm">
                  <Share2 size={24} strokeWidth={2.5} />
                </div>
                <div className="flex flex-col items-end">
                   <p className="text-[9px] font-black text-[#848E9C] uppercase tracking-widest mb-1">Node Integrity</p>
                   <div className="flex items-center gap-1.5 px-3 py-1 bg-[#0ECB81]/10 rounded-full">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#0ECB81] animate-pulse"></div>
                      <span className="text-[10px] font-black text-[#0ECB81] uppercase tracking-widest">Active</span>
                   </div>
                </div>
              </div>

              <h3 className="text-xl font-black text-[#1E2026] tracking-tight mb-2 group-hover:text-[#F0B90B] transition-colors">{dept.name}</h3>
              <p className="text-[11px] font-bold text-[#848E9C] uppercase tracking-[0.1em] mb-8">SaaS Operational Segment</p>
              
              <div className="grid grid-cols-2 gap-6 border-t border-[#E6E8EA] pt-8 mt-4">
                 <div className="space-y-1">
                    <p className="text-[10px] font-black text-[#848E9C] uppercase tracking-widest">Personnel Depth</p>
                    <p className="text-xl font-black text-[#1E2026] tabular-nums">{dept.count} <span className="text-[10px] text-[#848E9C]">Nodes</span></p>
                 </div>
                 <div className="text-right space-y-1">
                    <p className="text-[10px] font-black text-[#848E9C] uppercase tracking-widest">Trace Activity</p>
                    <div className="flex items-center justify-end gap-1.5 text-[#1E2026]">
                       <Activity size={12} className="text-[#0ECB81]" />
                       <span className="text-[12px] font-black tabular-nums">High Ops</span>
                    </div>
                 </div>
              </div>
              
              <div className="mt-8 flex items-center justify-between text-[11px] font-black uppercase tracking-widest text-[#848E9C] group-hover:text-[#1E2026] transition-colors cursor-pointer">
                 <span>View Cluster Map</span>
                 <ArrowUpRight size={14} />
              </div>
            </div>
          ))
        )}
      </div>

      {/* FOOTER */}
      <div className="pt-16 text-center opacity-30 pb-12">
        <p className="text-[#848E9C] text-[10px] font-black uppercase tracking-[0.6em] leading-loose">
           Chapter Summary: Architecture Stable <br />
           <span className="text-[#F0B90B]">Distributed Hub Matrix: Verified</span>
        </p>
      </div>
    </div>
  );
};

export default Departments;
