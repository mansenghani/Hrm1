import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Layers, Users, Share2, Activity, ArrowUpRight, RefreshCw } from 'lucide-react';

const Departments = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchEmployees = async () => {
    try {
      const token = sessionStorage.getItem('token');
      // Using relative path for proxy support
      const res = await axios.get('/api/employees', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEmployees(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Registry Sync Failed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const departmentsMap = employees.reduce((acc, emp) => {
    // Handling possible data structures (populated object or direct string)
    const dept = emp?.department?.name || emp?.department || 'Unassigned';
    if (!acc[dept]) acc[dept] = { name: dept, count: 0, members: [] };
    acc[dept].count += 1;
    acc[dept].members.push(emp);
    return acc;
  }, {});

  const departments = Object.values(departmentsMap);

  return (
    <div className="animate-fade-in pb-32">
      
      {/* HEADER */}
      <div className="mb-16 flex flex-col md:flex-row justify-between items-end border-b border-[#c5c0b1] pb-10">
        <div>
          <p className="zap-caption-upper text-[#ff4f00] mb-4">Structural Node Mapping</p>
          <h1 className="zap-display-hero">Unit <span className="text-[#ff4f00]">Architecture.</span></h1>
        </div>
        <button className="zap-btn zap-btn-orange h-14 px-8">
          <Layers size={18} className="mr-3" />
          Initialize Unit
        </button>
      </div>

      {/* GRID MATRIX - Zapier Style Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {loading ? (
          <div className="col-span-full py-32 text-center">
             <div className="flex flex-col items-center gap-4">
                <RefreshCw size={24} className="text-[#ff4f00] animate-spin" />
                <p className="zap-caption-upper text-[#939084]">Mapping Hub Matrix...</p>
             </div>
          </div>
        ) : departments.length === 0 ? (
          <div className="col-span-full py-32 text-center zap-card bg-[#fffdf9]">
             <p className="text-[15px] font-medium text-[#939084]">No structural units detected in the matrix</p>
          </div>
        ) : (
          departments.map((dept, i) => (
            <div key={i} className="zap-card group hover:border-[#201515] transition-all relative overflow-hidden bg-[#fffdf9]">
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#eceae3] rounded-full -mr-12 -mt-12 group-hover:bg-[#ff4f00]/5 transition-colors"></div>
              
              <div className="flex justify-between items-start mb-12 relative z-10">
                <div className="w-14 h-14 bg-[#eceae3] border border-[#c5c0b1] rounded-[8px] flex items-center justify-center text-[#201515] group-hover:bg-[#ff4f00] group-hover:text-white transition-all shadow-sm">
                  <Share2 size={24} />
                </div>
                <div className="flex flex-col items-end">
                   <p className="text-[11px] font-bold text-[#939084] uppercase tracking-widest mb-2">Node Integrity</p>
                   <div className="flex items-center gap-1.5 px-3 py-1 bg-white border border-[#24a148] rounded-full">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#24a148] animate-pulse"></div>
                      <span className="text-[10px] font-bold text-[#24a148] uppercase tracking-widest">Active</span>
                   </div>
                </div>
              </div>

              <h3 className="text-[24px] font-medium text-[#201515] mb-2 group-hover:text-[#ff4f00] transition-colors">{dept.name}</h3>
              <p className="text-[13px] font-bold text-[#939084] uppercase tracking-wider mb-10">SaaS Operational Segment</p>
              
              <div className="grid grid-cols-2 gap-6 border-t border-[#c5c0b1] pt-10 mt-6">
                 <div className="space-y-1">
                    <p className="text-[11px] font-bold text-[#939084] uppercase tracking-widest">Personnel Depth</p>
                    <p className="text-[24px] font-medium text-[#201515] tabular-nums">{dept.count} <span className="text-[12px] text-[#939084]">Nodes</span></p>
                 </div>
                 <div className="text-right space-y-1">
                    <p className="text-[11px] font-bold text-[#939084] uppercase tracking-widest">Trace Activity</p>
                    <div className="flex items-center justify-end gap-1.5 text-[#201515] font-bold">
                       <Activity size={12} className="text-[#24a148]" />
                       <span className="text-[13px] tabular-nums">High Ops</span>
                    </div>
                 </div>
              </div>
              
              <div className="mt-10 flex items-center justify-between text-[13px] font-bold uppercase tracking-widest text-[#939084] group-hover:text-[#201515] transition-colors cursor-pointer pt-6">
                 <span>View Cluster Map</span>
                 <ArrowUpRight size={18} className="text-[#c5c0b1] group-hover:text-[#ff4f00]" />
              </div>
            </div>
          ))
        )}
      </div>

      {/* FOOTER */}
      <div className="pt-24 text-center border-t border-[#c5c0b1] mt-24">
        <p className="text-[#939084] text-[11px] font-bold uppercase tracking-[0.4em] leading-loose">
           Architecture Stable • Distributed Hub Matrix: Verified
        </p>
      </div>
    </div>
  );
};

export default Departments;
