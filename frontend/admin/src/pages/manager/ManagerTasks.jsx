import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Zap, Clock, CheckCircle, BarChart3, Search, 
  RefreshCw, User, Shield, AlertCircle, ArrowUpRight
} from 'lucide-react';
import TaskDetail from '../../components/TaskDetail';

const ManagerTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const token = sessionStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  const fetchData = async (silentParam = false) => {
    const silent = silentParam === true;
    try {
      if (!silent) setLoading(true);
      const [tasksRes, employeesRes] = await Promise.all([
        axios.get('/api/tasks/manager', { headers }),
        axios.get('/api/personnel/my-team', { headers })
      ]);
      setTasks(tasksRes.data);
      setEmployees(employeesRes.data);
    } catch (err) { console.error('Sync failure:', err); }
    finally { if (!silent) setLoading(false); }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAssign = async (taskId, employeeId) => {
    if (!employeeId) return;
    try {
      await axios.put(`/api/tasks/assign/${taskId}`, { employeeId }, { headers });
      fetchData();
    } catch (err) { console.error('Assignment failed:', err); }
  };

  const statusColors = {
    assigned: 'bg-gray-500',
    in_progress: 'bg-blue-500',
    submitted: 'bg-orange-500',
    under_review: 'bg-purple-500',
    completed: 'bg-green-500',
    rework: 'bg-red-500'
  };

  return (
    <div className="animate-fade-in pb-32 max-w-[1600px] mx-auto">
      {/* HEADER */}
      <div className="mb-16 flex flex-col md:flex-row justify-between items-end border-b border-[#c5c0b1] pb-10">
        <div>
          <p className="zap-caption-upper text-[#ff4f00] mb-4">Task Management</p>
          <h1 className="zap-display-hero">Manage <span className="text-[#ff4f00]">Task.</span></h1>
        </div>
        <button onClick={fetchData} className="zap-btn zap-btn-orange h-14 px-8">
          <RefreshCw size={18} className={`mr-3 ${loading ? 'animate-spin' : ''}`} /> Sync Registry
        </button>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-16">
        {[
          { label: 'Total Tasks', val: tasks.length, icon: Zap, color: 'text-[#201515]' },
          { label: 'Awaiting Review', val: tasks.filter(t => t.status === 'submitted').length, icon: Clock, color: 'text-[#ff4f00]' },
          { label: 'In Progress', val: tasks.filter(t => t.status === 'in_progress').length, icon: RefreshCw, color: 'text-blue-500' },
          { label: 'Success Rate', val: `${tasks.length > 0 ? Math.round((tasks.filter(t => t.status === 'completed').length / tasks.length) * 100) : 0}%`, icon: BarChart3, color: 'text-[#24a148]' }
        ].map((s, i) => (
          <div key={i} className="zap-card group hover:border-[#201515] transition-all">
            <div className="w-12 h-12 bg-[#eceae3] rounded-[8px] flex items-center justify-center text-[#201515] group-hover:bg-[#ff4f00] group-hover:text-white transition-all mb-8">
              <s.icon size={20} />
            </div>
            <h3 className="text-[36px] font-medium text-[#201515] leading-none mb-2 tabular-nums">{s.val}</h3>
            <p className="text-[13px] font-bold text-[#939084] uppercase tracking-wider">{s.label}</p>
          </div>
        ))}
      </div>

      {/* TASK LIST */}
      <div className="zap-card p-0 overflow-hidden">
        <div className="p-8 bg-[#fffdf9] border-b border-[#c5c0b1] flex justify-between items-center">
          <h3 className="text-[14px] font-black uppercase tracking-widest text-[#201515]">Task Registry</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#fffdf9] border-b border-[#c5c0b1]">
                <th className="px-8 py-5 text-[11px] font-bold text-[#939084] uppercase tracking-widest">Task</th>
                <th className="px-8 py-5 text-[11px] font-bold text-[#939084] uppercase tracking-widest text-center">Status</th>
                <th className="px-8 py-5 text-[11px] font-bold text-[#939084] uppercase tracking-widest text-center">Assign Employee</th>
                <th className="px-8 py-5 text-[11px] font-bold text-[#939084] uppercase tracking-widest text-center">Done</th>
                <th className="px-8 py-5 text-[11px] font-bold text-[#939084] uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#c5c0b1]">
              {[...tasks].reverse().map((task) => (
                <tr key={task._id} className="hover:bg-[#fffdf9] transition-colors group cursor-pointer" onClick={() => { setSelectedTask(task); setIsModalOpen(true); }}>
                  <td className="px-8 py-8">
                    <span className="text-[15px] font-bold text-[#201515] uppercase italic">{task.title}</span>
                    <p className="text-[11px] font-bold text-[#939084] mt-1 uppercase">Due: {new Date(task.dueDate).toLocaleDateString()}</p>
                  </td>
                  <td className="px-8 py-8 text-center">
                    <span className={`px-3 py-1 rounded-[4px] text-[10px] font-bold uppercase tracking-widest text-white ${statusColors[task.status]}`}>
                      {task.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-8 py-8 text-center" onClick={(e) => e.stopPropagation()}>
                    {task.assignedEmployee ? (
                      <div className="flex items-center justify-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#eceae3] flex items-center justify-center text-[#939084]"><User size={14}/></div>
                        <span className="text-[13px] font-bold text-[#201515] uppercase italic">{task.assignedEmployee.name}</span>
                      </div>
                    ) : (
                      <select 
                        onChange={(e) => handleAssign(task._id, e.target.value)}
                        className="h-10 px-4 bg-white border border-[#c5c0b1] rounded-[4px] text-[11px] font-bold uppercase tracking-widest focus:outline-none focus:border-[#ff4f00] cursor-pointer"
                      >
                        <option value="">Assign Employee</option>
                        {employees.map(emp => (
                          <option key={emp._id} value={emp._id}>{emp.name}</option>
                        ))}
                      </select>
                    )}
                  </td>
                  <td className="px-8 py-8 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-[16px] font-black text-[#201515] italic">{task.progress}%</span>
                      <div className="w-16 h-1 bg-[#eceae3] rounded-full overflow-hidden">
                        <div className="h-full bg-[#ff4f00]" style={{ width: `${task.progress}%` }}></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-8 text-right">
                    <button className="w-10 h-10 flex items-center justify-center text-[#939084] hover:bg-[#ff4f00] hover:text-white rounded-[4px] transition-all bg-transparent border-none">
                      <ArrowUpRight size={18}/>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* TASK DETAIL MODAL */}
      {selectedTask && (
        <TaskDetail 
          task={tasks.find(t => t._id === selectedTask._id) || selectedTask}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onUpdate={() => fetchData(true)}
          userRole="manager"
        />
      )}
    </div>
  );
};

export default ManagerTasks;
