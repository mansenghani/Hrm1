import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Mail, Phone, Calendar, Briefcase, MapPin, Building, Activity, ShieldCheck } from 'lucide-react';

const EmployeeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const token = sessionStorage.getItem('token');
        const { data } = await axios.get(`/api/employees/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setEmployee(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchEmployee();
  }, [id]);

  if (loading) return <div className="p-10 animate-pulse font-black text-xs uppercase tracking-widest">Scanning Registry...</div>;
  if (!employee) return <div className="p-10 font-black text-xs uppercase tracking-widest text-[#F6465D]">Node Not Found</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/admin/employees')}
            className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-[#848E9C] hover:text-[#1E2026] shadow-sm border border-[#E6E8EA] transition-all"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-3xl font-black text-[#1E2026] uppercase tracking-tighter">
              Profile <span className="text-[#F0B90B]">Trace</span>
            </h1>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${
             employee.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
             Status: {employee.status}
          </span>
          <button 
             onClick={() => navigate(`/admin/employees/edit/${employee._id}`)}
             className="px-6 py-2 bg-[#F5F5F5] border border-[#E6E8EA] hover:bg-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all"
          >
            Edit Profile
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Column: ID Card */}
        <div className="bg-white rounded-3xl p-8 border border-[#E6E8EA] shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#F0B90B]/10 rounded-bl-full"></div>
          
          <div className="flex flex-col items-center text-center space-y-4 mb-8">
            <div className="w-24 h-24 bg-[#F5F5F5] rounded-3xl flex items-center justify-center border-2 border-white shadow-xl relative z-10">
               {employee.profileImage ? <img src={employee.profileImage} className="rounded-3xl" alt="Profile" /> : <User size={40} className="text-[#F0B90B]" />}
            </div>
            
            <div>
              <h2 className="text-2xl font-black text-[#1E2026] tracking-tight">{employee.fullName}</h2>
              <p className="text-[11px] font-bold text-[#848E9C] uppercase tracking-widest mt-1">{employee.role}</p>
            </div>
            
            <div className="inline-flex items-center gap-2 bg-[#F5F5F5] px-4 py-1.5 rounded-full border border-[#E6E8EA]">
              <ShieldCheck size={14} className="text-[#F0B90B]" />
              <span className="text-[10px] font-black text-[#1E2026] uppercase tracking-[0.2em]">{employee.employeeId}</span>
            </div>
          </div>
          
          <div className="space-y-5 pt-8 border-t border-[#E6E8EA]">
            <div className="flex items-center gap-4 group">
               <div className="w-8 h-8 rounded-full bg-[#F5F5F5] flex items-center justify-center group-hover:bg-[#F0B90B]/10 transition-colors">
                 <Mail size={14} className="text-[#848E9C] group-hover:text-[#F0B90B]" />
               </div>
               <div>
                  <p className="text-[9px] font-bold text-[#848E9C] uppercase tracking-widest">Office Email</p>
                  <p className="text-[12px] font-bold text-[#1E2026]">{employee.email}</p>
               </div>
            </div>
            
            {employee.personalEmail && (
              <div className="flex items-center gap-4 group">
                 <div className="w-8 h-8 rounded-full bg-[#F5F5F5] flex items-center justify-center group-hover:bg-[#F0B90B]/10 transition-colors">
                   <Mail size={14} className="text-[#848E9C] group-hover:text-[#F0B90B]" />
                 </div>
                 <div>
                    <p className="text-[9px] font-bold text-[#848E9C] uppercase tracking-widest">Personal Email</p>
                    <p className="text-[12px] font-bold text-[#1E2026]">{employee.personalEmail}</p>
                 </div>
              </div>
            )}
            <div className="flex items-center gap-4 group">
               <div className="w-8 h-8 rounded-full bg-[#F5F5F5] flex items-center justify-center group-hover:bg-[#F0B90B]/10 transition-colors">
                 <Phone size={14} className="text-[#848E9C] group-hover:text-[#F0B90B]" />
               </div>
               <div>
                  <p className="text-[9px] font-bold text-[#848E9C] uppercase tracking-widest">Comms Link</p>
                  <p className="text-[12px] font-bold text-[#1E2026]">{employee.phone || 'Unknown'}</p>
               </div>
            </div>
            <div className="flex items-center gap-4 group">
               <div className="w-8 h-8 rounded-full bg-[#F5F5F5] flex items-center justify-center group-hover:bg-[#F0B90B]/10 transition-colors">
                 <MapPin size={14} className="text-[#848E9C] group-hover:text-[#F0B90B]" />
               </div>
               <div>
                  <p className="text-[9px] font-bold text-[#848E9C] uppercase tracking-widest">Location Node</p>
                  <p className="text-[12px] font-bold text-[#1E2026]">{employee.address || 'Unknown'}</p>
               </div>
            </div>
          </div>
        </div>
        
        {/* Right Column: details */}
        <div className="md:col-span-2 space-y-8">
           
           <div className="bg-white rounded-3xl p-8 border border-[#E6E8EA] shadow-sm">
             <h3 className="text-[14px] font-black text-[#1E2026] uppercase tracking-widest mb-6 flex items-center gap-3">
               <Briefcase size={18} className="text-[#F0B90B]" /> Corporate Designation
             </h3>
             
             <div className="grid grid-cols-2 gap-8">
               <div>
                  <p className="text-[10px] font-bold text-[#848E9C] uppercase tracking-widest mb-1">Department Sector</p>
                  <p className="text-[14px] font-black text-[#1E2026]">{employee.department?.name || 'Unassigned'}</p>
               </div>
               <div>
                  <p className="text-[10px] font-bold text-[#848E9C] uppercase tracking-widest mb-1">Authorization Role</p>
                  <p className="text-[14px] font-black text-[#1E2026] uppercase">{employee.role}</p>
               </div>
               <div>
                  <p className="text-[10px] font-bold text-[#848E9C] uppercase tracking-widest mb-1">Hierarchy Manager</p>
                  <p className="text-[14px] font-black text-[#1E2026]">{employee.managerId?.name || 'Core Root'}</p>
               </div>
               <div>
                  <p className="text-[10px] font-bold text-[#848E9C] uppercase tracking-widest mb-1">Employment Type</p>
                  <p className="text-[14px] font-black text-[#1E2026]">{employee.employmentType}</p>
               </div>
               <div>
                  <p className="text-[10px] font-bold text-[#848E9C] uppercase tracking-widest mb-1">Induction Date</p>
                  <p className="text-[14px] font-black text-[#1E2026]">{employee.joinDate ? new Date(employee.joinDate).toLocaleDateString() : 'N/A'}</p>
               </div>
             </div>
           </div>

           <div className="bg-[#1E2026] rounded-3xl p-8 shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full blur-3xl"></div>
             
             <h3 className="text-[14px] font-black text-white uppercase tracking-widest mb-6 flex items-center gap-3 relative z-10">
               <Activity size={18} className="text-[#F0B90B]" /> Matrix Activity Placeholder
             </h3>
             
             <div className="grid grid-cols-3 gap-4 relative z-10">
                 <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                    <p className="text-[9px] font-black uppercase text-[#848E9C] tracking-widest mb-2">Network Uptime</p>
                    <p className="text-xl font-black text-white">99.8%</p>
                 </div>
                 <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                    <p className="text-[9px] font-black uppercase text-[#848E9C] tracking-widest mb-2">Tasks Executed</p>
                    <p className="text-xl font-black text-white">124 Focus</p>
                 </div>
                 <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                    <p className="text-[9px] font-black uppercase text-[#848E9C] tracking-widest mb-2">Leave Trace</p>
                    <p className="text-xl font-black text-[#F0B90B]">12 Hours</p>
                 </div>
             </div>
           </div>

        </div>

      </div>
    </div>
  );
};

export default EmployeeDetail;
