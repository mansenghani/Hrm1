import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Briefcase, Plus, Search, Shield, UserPlus, Trash2, 
  ArrowRight, Building2, CheckCircle, Calendar, Target
} from 'lucide-react';
import { createPortal } from 'react-dom';

const ProjectManagement = () => {
  const [projects, setProjects] = useState([]);
  const [managers, setManagers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [newProject, setNewProject] = useState({
    projectName: '',
    description: '',
    department: '',
    assignedManager: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: ''
  });

  const token = sessionStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [projRes, mgrRes] = await Promise.all([
        axios.get('/api/projects/hr', { headers }),
        axios.get('/api/personnel/managers', { headers })
      ]);
      setProjects(projRes.data);
      setManagers(mgrRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/projects/create', newProject, { headers });
      setMessage({ type: 'success', text: 'Project initialized successfully' });
      setNewProject({ projectName: '', description: '', department: '', assignedManager: '', startDate: new Date().toISOString().split('T')[0], endDate: '' });
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Initialization Failed' });
    }
  };

  if (loading) return (
    <div className="h-[60vh] flex flex-col items-center justify-center gap-6 opacity-30">
      <div className="w-12 h-12 border-4 border-t-[#F0B90B] border-[#F2F2F2] rounded-full animate-spin"></div>
      <p className="text-[10px] font-black uppercase tracking-[0.4em]">Synchronizing Project Registry...</p>
    </div>
  );

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20 max-w-7xl mx-auto">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-3xl font-black text-[#1E2026] tracking-tight leading-none mb-3 uppercase italic">
            Project <span className="text-[#F0B90B]">Registry</span>
          </h1>
          <p className="text-[#848E9C] font-bold text-[10px] uppercase tracking-[0.2em] flex items-center gap-3">
            <span className="w-12 h-[1px] bg-[#F0B90B]"></span>
            Mission Control Hub
          </p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-[#1E2026] text-white px-8 py-4 rounded-[20px] font-black text-[11px] uppercase tracking-widest shadow-xl hover:bg-black transition-all flex items-center gap-3 active:scale-95"
        >
          <Plus size={16} />
          Forge Project
        </button>
      </div>

      {/* FEEDBACK */}
      {message.text && (
        <div className={`p-5 rounded-[20px] flex items-center gap-4 animate-in slide-in-from-top-4 duration-300 ${message.type === 'success' ? 'bg-[#0ECB81]/10 border border-[#0ECB81]/20 text-[#0ECB81]' : 'bg-[#F6465D]/10 border border-[#F6465D]/20 text-[#F6465D]'}`}>
          <CheckCircle size={18} />
          <span className="text-[12px] font-black uppercase tracking-widest leading-none">{message.text}</span>
          <button onClick={() => setMessage({ type: '', text: '' })} className="ml-auto opacity-40 hover:opacity-100 transition-opacity"><Trash2 size={16} /></button>
        </div>
      )}

      {/* DATA GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <div key={project._id} className="bg-white border border-[#E6E8EA] rounded-[32px] overflow-hidden shadow-sm group hover:shadow-xl transition-all duration-500 flex flex-col min-h-[420px]">
            <div className="p-8 bg-[#F5F5F5] border-b border-[#E6E8EA] relative">
               <div className="absolute top-6 right-6 w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-inner group-hover:bg-[#F0B90B] transition-colors">
                  <Briefcase size={20} className="group-hover:text-[#1E2026] text-[#848E9C]" />
               </div>
               <h3 className="text-xl font-black text-[#1E2026] uppercase tracking-tighter leading-none mb-2">{project.projectName}</h3>
               <span className="px-3 py-1 bg-white border border-[#E6E8EA] rounded-full text-[8px] font-black text-[#848E9C] uppercase tracking-widest">{project.department}</span>
            </div>

            <div className="p-8 flex-1 space-y-6">
               <p className="text-[13px] font-bold text-[#848E9C] italic leading-relaxed line-clamp-3">"{project.description}"</p>
               
               <div className="space-y-4">
                  <div>
                    <p className="text-[9px] font-black text-[#848E9C] uppercase tracking-widest mb-3">CO</p>
                    <div className="flex items-center gap-3 p-3 bg-[#F9FAFC] rounded-2xl border border-[#E6E8EA]">
                      <div className="w-8 h-8 rounded-full bg-[#1E2026] flex items-center justify-center text-[#F0B90B] font-black text-xs">
                        {project.assignedManager?.name?.charAt(0)}
                      </div>
                      <div>
                        <p className="text-[12px] font-black text-[#1E2026] uppercase mb-0.5">{project.assignedManager?.name}</p>
                        <p className="text-[9px] font-bold text-[#848E9C]">{project.assignedManager?.email}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center bg-[#F9FAFC] p-3 rounded-2xl border border-[#E6E8EA]">
                     <div className="flex items-center gap-2 text-[#848E9C]">
                        <Calendar size={14} />
                        <span className="text-[9px] font-black uppercase tracking-widest">{new Date(project.startDate).toLocaleDateString()}</span>
                     </div>
                     <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${
                        project.status === 'active' ? 'bg-[#0ECB81]/10 text-[#0ECB81]' : 'bg-[#F0B90B]/10 text-[#F0B90B]'
                     }`}>
                        {project.status}
                     </span>
                  </div>
               </div>
            </div>

            <div className="p-6 bg-[#F5F5F5]/50 border-t border-[#E6E8EA] flex justify-between items-center">
                <p className="text-[9px] font-black text-[#848E9C] uppercase tracking-widest">{project.assignedEmployees?.length || 0} Assets Active</p>
                <button className="flex items-center gap-2 text-[9px] font-black uppercase text-[#1E2026] hover:text-[#F0B90B] transition-all">
                  Details <ArrowRight size={12} />
                </button>
            </div>
          </div>
        ))}
      </div>

      {/* CREATE MODAL */}
      {isModalOpen && createPortal(
        <div 
          onClick={() => setIsModalOpen(false)}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-6 bg-white/[0.01] backdrop-blur-xl animate-in fade-in duration-300 cursor-pointer"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-xl bg-white/95 backdrop-blur-3xl rounded-[48px] shadow-[0_40px_120px_rgba(0,0,0,0.15)] border border-white/20 p-14 relative cursor-default"
          >
             <button onClick={() => setIsModalOpen(false)} className="absolute top-10 right-10 text-slate-400 hover:text-black hover:rotate-90 transition-all">
                <Trash2 size={24} />
             </button>
             <h2 className="text-3xl font-black text-[#1E2026] uppercase tracking-tighter italic mb-10">Forge New <span className="text-[#F0B90B]">Mission</span></h2>
             
             <form onSubmit={handleCreateProject} className="space-y-8">
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Designation</label>
                    <input 
                        required
                        placeholder="ALPHA OPS"
                        className="w-full p-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-[#F0B90B] focus:bg-white transition-all outline-none font-bold"
                        value={newProject.projectName}
                        onChange={(e) => setNewProject({...newProject, projectName: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Branch</label>
                    <input 
                        required
                        placeholder="CYBER"
                        className="w-full p-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-[#F0B90B] focus:bg-white transition-all outline-none font-bold"
                        value={newProject.department}
                        onChange={(e) => setNewProject({...newProject, department: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Commanding Manager</label>
                  <select 
                      required
                      className="w-full p-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-[#F0B90B] focus:bg-white transition-all outline-none font-bold appearance-none"
                      value={newProject.assignedManager}
                      onChange={(e) => setNewProject({...newProject, assignedManager: e.target.value})}
                  >
                      <option value="">Select Commander</option>
                      {managers.map(m => <option key={m._id} value={m._id}>{m.name}</option>)}
                  </select>
                </div>

                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Mission Parameters (Description)</label>
                   <textarea 
                      required
                      rows="3"
                      placeholder="Define the tactical objectives..."
                      className="w-full p-5 bg-slate-50 rounded-3xl border-2 border-transparent focus:border-[#F0B90B] focus:bg-white transition-all outline-none font-bold resize-none"
                      value={newProject.description}
                      onChange={(e) => setNewProject({...newProject, description: e.target.value})}
                   />
                </div>

                <div className="grid grid-cols-2 gap-8">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Window Start</label>
                      <input 
                        required
                        type="date"
                        className="w-full p-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-[#F0B90B] focus:bg-white transition-all outline-none font-bold"
                        value={newProject.startDate}
                        onChange={(e) => setNewProject({...newProject, startDate: e.target.value})}
                      />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Window End</label>
                      <input 
                        type="date"
                        className="w-full p-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-[#F0B90B] focus:bg-white transition-all outline-none font-bold"
                        value={newProject.endDate}
                        onChange={(e) => setNewProject({...newProject, endDate: e.target.value})}
                      />
                   </div>
                </div>

                <button type="submit" className="w-full py-6 bg-[#1E2026] text-white rounded-[24px] font-black text-[13px] uppercase tracking-widest hover:bg-black shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-3">
                   Initialize Project Protocol <ArrowRight size={20} />
                </button>
             </form>
          </div>
        </div>,
        document.getElementById('modal-root')
      )}
    </div>
  );
};

export default ProjectManagement;
