import React, { useState } from 'react';
import axios from 'axios';
import { 
  X, Send, Paperclip, CheckCircle2, AlertCircle, 
  MessageSquare, Clock, Shield, User, FileText, Download,
  RefreshCw
} from 'lucide-react';
import { io } from 'socket.io-client';

const TaskDetail = ({ task, isOpen, onClose, onUpdate, userRole }) => {
  const [comment, setComment] = useState('');
  const [progress, setProgress] = useState(task?.progress || 0);
  const [feedback, setFeedback] = useState('');
  const [uploading, setUploading] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [employees, setEmployees] = useState([]);
  const [zoomImage, setZoomImage] = useState(null);
  const token = sessionStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  const currentUser = JSON.parse(sessionStorage.getItem('user') || '{}');
  const currentUserId = currentUser._id || currentUser.id;

  // 📡 Real-time Socket Connection
  React.useEffect(() => {
    if (!isOpen || !task?._id) return;

    // Connect to backend (adjust URL if needed, usually same as origin in dev)
    const socket = io(window.location.protocol + '//' + window.location.hostname + ':5000', {
      withCredentials: true
    });

    socket.on('connect', () => {
      console.log('📡 Socket Connected for Task:', task._id);
      socket.emit('join_task', task._id);
    });

    socket.on('new_comment', (data) => {
      console.log('💬 New Comment Received via Socket:', data);
      if (data.taskId === task._id) {
        onUpdate(); // Trigger refresh when new message arrives
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [isOpen, task?._id]);

  React.useEffect(() => {
    if (isOpen && (userRole === 'manager' || userRole === 'hr')) {
      const fetchEmployees = async () => {
        try {
          const res = await axios.get('/api/personnel/employees', { headers });
          setEmployees(res.data || []);
        } catch (err) { console.error('Employee Registry fetch failed'); }
      };
      fetchEmployees();
    }
  }, [isOpen, userRole]);

  if (!isOpen || !task) return null;

  const handleComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    try {
      await axios.post(`/api/tasks/comment/${task._id}`, { message: comment }, { headers });
      setComment('');
      onUpdate();
    } catch (err) { console.error('Comms failure:', err); }
  };

  const handleProgress = async (val) => {
    setProgress(val);
    try {
      await axios.put(`/api/tasks/progress/${task._id}`, { progress: val }, { headers });
      onUpdate();
    } catch (err) { console.error('Sync failure:', err); }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    setUploading(true);
    try {
      await axios.post(`/api/tasks/upload-proof/${task._id}`, formData, {
        headers: { ...headers, 'Content-Type': 'multipart/form-data' }
      });
      alert('Upload Successful');
      onUpdate();
    } catch (err) { 
      alert(err.response?.data?.message || 'Upload failed. Please check file size (<5MB).');
      console.error('Upload failed:', err); 
    }
    finally { setUploading(false); e.target.value = ''; }
  };

  const handleStatusAction = async (action, data = {}) => {
    try {
      await axios.put(`/api/tasks/${action}/${task._id}`, data, { headers });
      onUpdate();
      onClose();
    } catch (err) { console.error('Action failed:', err); }
  };

  const handleAssignEmployee = async () => {
    if (!selectedEmployee) return;
    try {
      await axios.put(`/api/tasks/assign/${task._id}`, { employeeId: selectedEmployee }, { headers });
      onUpdate();
      alert('Employee Assigned Successfully');
    } catch (err) { console.error('Assignment failed:', err); }
  };

  const statusColors = {
    assigned: 'bg-gray-500 text-white',
    in_progress: 'bg-blue-500 text-white',
    submitted: 'bg-orange-500 text-white',
    under_review: 'bg-purple-500 text-white',
    completed: 'bg-green-500 text-white',
    rework: 'bg-red-500 text-white'
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-[#201515]/80 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose}>
      <div className="bg-[#fffefb] w-full max-w-4xl h-[85vh] rounded-[24px] overflow-hidden shadow-2xl flex flex-col border border-[#c5c0b1] animate-in zoom-in-95 duration-300" onClick={(e) => e.stopPropagation()}>
        
        {/* HEADER */}
        <div className="p-6 border-b border-[#eceae3] bg-[#fffdf9] flex justify-between items-center shrink-0">
          <div>
            <div className="flex items-center gap-3 mb-1.5">
              <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-[0.2em] ${statusColors[task.status]}`}>
                {task.status.replace('_', ' ')}
              </span>
              <span className="text-[9px] font-black text-[#939084] uppercase tracking-widest flex items-center gap-1.5">
                <Clock size={12} /> Due: {new Date(task.dueDate).toLocaleDateString()}
              </span>
            </div>
            <h3 className="text-2xl font-black text-[#201515] uppercase italic tracking-tighter">{task.title}</h3>
          </div>
          <button onClick={onClose} className="w-10 h-10 bg-white border border-[#eceae3] rounded-xl flex items-center justify-center text-[#939084] hover:bg-[#ff4f00] hover:text-white transition-all shadow-sm cursor-pointer border-none">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* LEFT: INFO & FILES */}
          <div className="w-[55%] p-8 overflow-y-auto border-r border-[#eceae3] space-y-6 custom-scrollbar">
            
            <section>
              <h4 className="text-[9px] font-black text-[#939084] uppercase tracking-[0.4em] mb-3 italic">Task Description</h4>
              <p className="text-md font-bold text-[#36342e] leading-relaxed italic">"{task.description}"</p>
            </section>

            {task.status === 'rework' && task.feedback && (
              <section className="p-6 bg-red-50 border border-red-100 rounded-[24px]">
                <h4 className="text-[9px] font-black text-red-500 uppercase tracking-[0.4em] mb-3 flex items-center gap-2 italic">
                  <AlertCircle size={12} /> Rework Directive
                </h4>
                <p className="text-md font-bold text-red-900 italic">"{task.feedback}"</p>
              </section>
            )}

            {/* ASSIGN EMPLOYEE (For HR/Manager Lead if not assigned) */}
            {(userRole === 'manager' || userRole === 'hr') && !task.assignedEmployee && (
              <section className="p-6 bg-[#eceae3]/20 border border-[#c5c0b1] rounded-[24px] space-y-3">
                <h4 className="text-[9px] font-black text-[#939084] uppercase tracking-[0.4em] italic">Delegate Mission</h4>
                <div className="flex gap-3 pt-1">
                  <select 
                    className="flex-1 h-11 px-8 bg-white border border-[#c5c0b1] rounded-xl text-[11px] font-black uppercase tracking-widest focus:outline-none focus:border-[#ff4f00] cursor-pointer shadow-sm appearance-none"
                    value={selectedEmployee}
                    onChange={(e) => setSelectedEmployee(e.target.value)}
                  >
                    <option value="">Select Employee</option>
                    {employees.map(emp => (
                      <option key={emp._id} value={emp._id}>{emp.name}</option>
                    ))}
                  </select>
                  <button 
                    onClick={handleAssignEmployee}
                    disabled={!selectedEmployee}
                    className={`px-6 h-11 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all italic border-none cursor-pointer ${
                      selectedEmployee ? 'bg-[#ff4f00] text-white shadow-lg' : 'bg-[#eceae3] text-[#939084]'
                    }`}
                  >
                    Assign
                  </button>
                </div>
              </section>
            )}

            {/* PROGRESS (Only for Employee, Manager & HR) */}
            {(userRole === 'employee' || userRole === 'manager' || userRole === 'hr') && (
              <section className="space-y-5">
                <div className="flex justify-between items-center">
                  <h4 className="text-[9px] font-black text-[#939084] uppercase tracking-[0.4em] italic">Completion Pulse</h4>
                  <div className="flex items-center gap-3">
                    {userRole === 'employee' && task.status !== 'completed' && progress !== task.progress && (
                      <button 
                        onClick={() => handleProgress(progress)}
                        className="flex items-center gap-2 text-[8px] font-black text-[#24a148] uppercase tracking-widest bg-[#24a148]/5 px-3 py-1.5 rounded-lg hover:bg-[#24a148]/10 transition-all"
                      >
                        <RefreshCw size={10} className={uploading ? 'animate-spin' : ''} /> Update
                      </button>
                    )}
                    {userRole === 'employee' && progress < 100 && progress === task.progress && (
                      <button 
                        onClick={() => { setProgress(100); handleProgress(100); }}
                        className="text-[9px] font-black text-[#ff4f00] uppercase tracking-widest border-b border-[#ff4f00]/30 hover:border-[#ff4f00] transition-all pb-0.5"
                      >
                        Set 100%
                      </button>
                    )}
                    <span className="text-xl font-black text-[#201515] italic">{progress}%</span>
                  </div>
                </div>
                <div className="relative w-full h-5 bg-[#eceae3] rounded-full overflow-hidden border border-[#c5c0b1]/30 p-1">
                  <div 
                    className="h-full bg-[#ff4f00] rounded-full transition-all duration-300 shadow-[0_0_15px_rgba(255,79,0,0.4)]" 
                    style={{ width: `${progress}%` }}
                  />
                  {userRole === 'employee' && task.status !== 'completed' && (
                    <input 
                      type="range" min="0" max="100" value={progress}
                      onChange={(e) => setProgress(parseInt(e.target.value))}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                    />
                  )}
                  {/* VISIBLE THUMB INDICATOR */}
                  {userRole === 'employee' && task.status !== 'completed' && (
                    <div 
                      className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg border-2 border-[#ff4f00] pointer-events-none z-10 transition-all duration-300"
                      style={{ left: `calc(${progress}% - 6px)` }}
                    />
                  )}
                </div>
              </section>
            )}

            {/* ATTACHMENTS */}
            <section className="space-y-6">
              <div className="flex justify-between items-center">
                <h4 className="text-[10px] font-black text-[#939084] uppercase tracking-[0.4em] italic">Attachments</h4>
                {(userRole === 'employee' || userRole === 'manager' || userRole === 'hr') && task.status !== 'completed' && (
                  <label className="cursor-pointer bg-[#201515] text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#ff4f00] transition-all">
                    {uploading ? 'Uploading...' : 'Upload File'}
                    <input type="file" className="hidden" onChange={handleFileUpload} disabled={uploading} />
                  </label>
                )}
              </div>
              <div className="grid grid-cols-1 gap-4">
                {task.attachments?.length === 0 ? (
                  <p className="text-[11px] font-bold text-[#939084] uppercase italic">No attachments uploaded.</p>
                ) : (
                  [...task.attachments].reverse().map((file, i) => {
                    const isImage = file.fileName.match(/\.(jpg|jpeg|png|gif|webp)$/i);
                    const fileUrl = `${window.location.protocol}//${window.location.hostname}:5000${file.fileUrl}`;
                    
                    return (
                      <div key={i} className="p-4 bg-white border border-[#c5c0b1] rounded-2xl space-y-4 group hover:border-[#ff4f00] transition-all shadow-sm">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <FileText size={18} className="text-[#939084]" />
                            <div>
                              <p className="text-[12px] font-black text-[#201515] uppercase italic truncate max-w-[200px]">{file.fileName}</p>
                              <p className="text-[9px] font-bold text-[#939084] uppercase">{new Date(file.uploadedAt).toLocaleString()}</p>
                            </div>
                          </div>
                          <a href={fileUrl} target="_blank" rel="noreferrer" className="w-9 h-9 bg-[#eceae3] rounded-xl flex items-center justify-center text-[#201515] hover:bg-[#ff4f00] hover:text-white transition-all">
                            <Download size={16} />
                          </a>
                        </div>
                        {isImage && (
                          <div 
                            className="w-full rounded-xl overflow-hidden border border-[#c5c0b1] bg-[#eceae3] cursor-zoom-in group/img"
                            onClick={() => setZoomImage(fileUrl)}
                          >
                            <img src={fileUrl} alt="Preview" className="w-full h-auto object-contain max-h-[180px] mx-auto group-hover/img:scale-105 transition-transform duration-500" />
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </section>
          </div>

          {/* RIGHT: COMMENTS & ACTIONS */}
          <div className="w-[45%] flex flex-col bg-[#fffdf9]">
            {/* COMMENTS AREA */}
            <div className="flex-1 p-8 overflow-y-auto space-y-5 custom-scrollbar">
              <h4 className="text-[9px] font-black text-[#939084] uppercase tracking-[0.4em] mb-6 italic flex items-center gap-2">
                <MessageSquare size={12} /> Tactical Comms
              </h4>
              {[...(task.comments || [])].reverse().map((c, i) => {
                const isManager = c.role === 'manager' || c.role === 'admin' || c.role === 'hr';
                return (
                  <div key={i} className={`flex flex-col ${isManager ? 'items-end' : 'items-start'}`}>
                    <div className={`max-w-[85%] p-5 rounded-2xl ${isManager ? 'bg-[#201515] text-white rounded-br-none shadow-lg' : 'bg-white border border-[#c5c0b1] rounded-bl-none'}`}>
                      <p className="text-[13px] font-bold leading-relaxed italic">{c.message}</p>
                    </div>
                    <span className="text-[8px] font-black uppercase text-[#939084] mt-1.5 px-2 italic">
                      {c.role} • {new Date(c.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* ACTION AREA */}
            <div className="p-8 border-t border-[#eceae3] bg-white space-y-4">
              <form onSubmit={handleComment} className="flex gap-3">
                <input 
                  type="text" placeholder="Type tactical update..."
                  className="flex-1 h-12 px-5 bg-[#eceae3] rounded-xl text-[13px] font-bold focus:outline-none focus:ring-2 focus:ring-[#ff4f00]/20 transition-all italic"
                  value={comment} onChange={(e) => setComment(e.target.value)}
                />
                <button type="submit" className="w-12 h-12 bg-[#ff4f00] text-white rounded-xl flex items-center justify-center shadow-md hover:scale-105 active:scale-95 transition-all border-none cursor-pointer">
                  <Send size={18} />
                </button>
              </form>

              {/* STATUS SPECIFIC BUTTONS */}
              <div className="flex gap-3 pt-1">
                {userRole === 'employee' && (task.status === 'in_progress' || task.status === 'rework') && (
                  <button 
                    onClick={() => {
                      if (progress < 100) {
                        alert('Completion Pulse must be at 100% to submit the mission.');
                        return;
                      }
                      handleStatusAction('submit');
                    }}
                    className={`flex-1 h-14 rounded-xl font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all italic ${
                      progress < 100 ? 'bg-[#eceae3] text-[#939084] cursor-not-allowed' : 'bg-[#201515] text-white hover:bg-[#ff4f00] shadow-lg'
                    }`}
                  >
                    Submit Task <CheckCircle2 size={16} />
                  </button>
                )}

                {(userRole === 'manager' || userRole === 'hr') && task.status === 'submitted' && (
                  <>
                    <button 
                      onClick={() => handleStatusAction('approve')}
                      className="flex-1 h-14 bg-[#24a148] text-white rounded-xl font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-2 hover:scale-[1.02] transition-all italic shadow-lg"
                    >
                      Approve <CheckCircle2 size={16} />
                    </button>
                    <button 
                      onClick={() => {
                        const fb = prompt('Provide rework instructions:');
                        if (fb) handleStatusAction('reject', { feedback: fb });
                      }}
                      className="flex-1 h-14 bg-[#ff4f00] text-white rounded-xl font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-2 hover:scale-[1.02] transition-all italic shadow-lg"
                    >
                      Rework <AlertCircle size={16} />
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* IMAGE ZOOM LIGHTBOX */}
      {zoomImage && (
        <div 
          className="fixed inset-0 z-[2000] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-10 animate-in fade-in duration-300 cursor-zoom-out"
          onClick={() => setZoomImage(null)}
        >
          <button className="absolute top-10 right-10 text-white/50 hover:text-white"><X size={40} /></button>
          <img src={zoomImage} alt="Zoom" className="max-w-full max-h-full object-contain shadow-2xl rounded-lg animate-in zoom-in-95 duration-300" />
        </div>
      )}
    </div>
  );
};

export default TaskDetail;
