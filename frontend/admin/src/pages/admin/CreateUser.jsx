import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  UserPlus, 
  User,
  Mail, 
  Lock, 
  Shield, 
  Calendar, 
  Users, 
  CheckCircle, 
  AlertTriangle, 
  X, 
  Eye, 
  EyeOff, 
  Info,
  Fingerprint,
  RefreshCw,
  Plus,
  ChevronDown,
  Camera
} from 'lucide-react';

const CreateUser = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'employee',
    joinDate: new Date().toISOString().split('T')[0],
    reportingManager: ''
  });
  const [managers, setManagers] = useState([]);
  const [nextId, setNextId] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '', employeeId: '', status: '' });
  
  // Image State
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const token = sessionStorage.getItem('token');

  // Auto-generate email based on name
  useEffect(() => {
    if (formData.firstName || formData.lastName) {
      const fName = formData.firstName.toLowerCase() || 'user';
      const lName = formData.lastName.toLowerCase() || '';
      const emailPulse = lName ? `${fName}.${lName}@fluidhr.com` : `${fName}@fluidhr.com`;
      setFormData(prev => ({ ...prev, email: emailPulse }));
    }
  }, [formData.firstName, formData.lastName]);

  useEffect(() => {
    const fetchNextId = async () => {
      try {
        const res = await axios.get(`/api/personnel/next-id/${formData.role}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setNextId(res.data.nextId);
        if (!formData.firstName && !formData.lastName) {
          setFormData(prev => ({ ...prev, email: `${res.data.nextId}@fluidhr.com` }));
        }
      } catch (err) { console.warn('ID Sync Delayed'); }
    };

    const fetchManagers = async () => {
      try {
        const res = await axios.get('/api/personnel/all', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setManagers(Array.isArray(res.data) ? res.data : []);
      } catch (err) { console.warn('Personnel Sync Delayed'); }
    };

    if (token) {
      fetchNextId();
      fetchManagers();
    }
  }, [formData.role, token]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '', employeeId: '', status: '' });

    try {
      const payload = {
        name: `${formData.firstName} ${formData.lastName}`.trim(),
        email: formData.email,
        password: formData.password,
        role: formData.role,
        joinDate: formData.joinDate,
        reportingManager: ['employee', 'manager'].includes(formData.role) ? formData.reportingManager : null
      };

      // 1. Create User Core
      const response = await axios.post('/api/users/create', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const { user } = response.data;
      const profileId = user.profileId; // 🎯 SYNC: Use the actual Profile ID, not User ID

      // 2. Upload Photo if selected (Sequential Linkage)
      if (selectedFile && profileId) {
        const uploadData = new FormData();
        uploadData.append('image', selectedFile);
        
        try {
          await axios.post(`/api/employees/${profileId}/profile-image`, uploadData, {
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
          });
        } catch (imgErr) {
          console.warn('Photo upload failed but user was created:', imgErr);
        }
      }

      setMessage({
        type: 'success',
        text: 'User Node successfully initialized with visual identity.',
        employeeId: user?.employeeId,
        status: user?.status
      });

      // Cleanup
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        role: formData.role,
        joinDate: new Date().toISOString().split('T')[0],
        reportingManager: ''
      });
      setSelectedFile(null);
      setPreviewUrl(null);

    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Synchronization Failure: Node initialization aborted.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in pb-32">
      {/* TOAST NOTIFICATION */}
      {message.text && (
        <div className={`fixed top-24 right-8 bg-[#fffefb] border border-[#c5c0b1] shadow-xl p-8 rounded-[8px] flex items-center gap-6 animate-fade-in z-[100] min-w-[400px]`}>
          <div className={`w-14 h-14 rounded-[4px] flex items-center justify-center ${message.type === 'success' ? 'bg-[#24a148] text-white' : 'bg-[#ff4f00] text-white'}`}>
            {message.type === 'success' ? <CheckCircle size={28} /> : <AlertTriangle size={28} />}
          </div>
          <div className="flex-1">
            <h4 className="zap-caption-upper !text-[#939084] mb-2">{message.type === 'success' ? 'Sync Success' : 'Pulse Failure'}</h4>
            <p className="text-[16px] font-bold text-[#201515] leading-tight mb-4">{message.text}</p>

            {message.employeeId && (
              <div className="flex items-center gap-3">
                <div className="px-3 py-1.5 bg-[#eceae3] text-[#201515] rounded-[4px] text-[11px] font-bold uppercase tracking-widest flex items-center gap-2">
                   <Fingerprint size={14} /> {message.employeeId}
                </div>
                <div className="px-3 py-1.5 bg-[#24a148] text-white rounded-[4px] text-[11px] font-bold uppercase tracking-widest">
                   {message.status || 'ACTIVE'}
                </div>
              </div>
            )}
          </div>
          <button onClick={() => setMessage({ type: '', text: '', employeeId: '', status: '' })} className="self-start text-[#939084] hover:text-[#201515]">
            <X size={20} />
          </button>
        </div>
      )}

      {/* HEADER */}
      <div className="mb-16 border-b border-[#c5c0b1] pb-10">
        <p className="zap-caption-upper text-[#ff4f00] mb-4">Identity Synthesis</p>
        <h1 className="zap-display-hero">Initialize <span className="text-[#ff4f00]">User Node.</span></h1>
        <p className="text-[18px] font-medium text-[#939084] mt-4">Register a new personnel entity into the organizational matrix.</p>
      </div>

      <div className="grid grid-cols-12 gap-12">
        {/* FORM SIDE */}
        <div className="col-span-12 lg:col-span-8 zap-card bg-[#fffdf9] p-12">
          {/* AVATAR UPLOAD SECTION */}
          <div className="flex flex-col items-center mb-12 border-b border-[#eceae3] pb-12">
             <div className="relative group">
                <div className="w-32 h-32 rounded-2xl bg-[#eceae3] border-2 border-dashed border-[#c5c0b1] flex items-center justify-center overflow-hidden transition-all group-hover:border-[#ff4f00]">
                   {previewUrl ? (
                     <img src={previewUrl} alt="Preview" className="w-full h-full object-cover shadow-2xl" />
                   ) : (
                     <User size={48} className="text-[#939084] opacity-30" />
                   )}
                </div>
                <label htmlFor="user-photo" className="absolute -bottom-3 -right-3 w-10 h-10 bg-[#ff4f00] text-white rounded-xl flex items-center justify-center shadow-xl cursor-pointer hover:scale-110 active:scale-95 transition-all">
                   <Camera size={18} />
                   <input 
                    id="user-photo" 
                    type="file" 
                    className="hidden" 
                    accept="image/*" 
                    onChange={handleFileChange}
                   />
                </label>
             </div>
             <p className="zap-caption-upper !text-[#939084] mt-6">Node Visual Identity</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {/* First Name */}
              <div className="space-y-4">
                <label className="zap-caption-upper text-[#201515]">First Name</label>
                <div className="relative">
                  <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#939084]" />
                  <input
                    required name="firstName" value={formData.firstName} onChange={handleChange}
                    className="w-full h-14 pl-12 pr-4 bg-white border border-[#c5c0b1] rounded-[4px] text-[15px] font-medium text-[#201515] focus:outline-none focus:border-[#ff4f00] transition-all"
                    placeholder="Enter first name..."
                  />
                </div>
              </div>

              {/* Last Name */}
              <div className="space-y-4">
                <label className="zap-caption-upper text-[#201515]">Last Name</label>
                <div className="relative">
                  <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#939084]" />
                  <input
                    required name="lastName" value={formData.lastName} onChange={handleChange}
                    className="w-full h-14 pl-12 pr-4 bg-white border border-[#c5c0b1] rounded-[4px] text-[15px] font-medium text-[#201515] focus:outline-none focus:border-[#ff4f00] transition-all"
                    placeholder="Enter last name..."
                  />
                </div>
              </div>

              {/* Email Address */}
              <div className="space-y-4">
                <label className="zap-caption-upper text-[#201515]">Email Address</label>
                <div className="relative">
                  <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#939084]" />
                  <input
                    required name="email" value={formData.email} onChange={handleChange}
                    className="w-full h-14 pl-12 pr-4 bg-white border border-[#c5c0b1] rounded-[4px] text-[15px] font-medium text-[#201515] focus:outline-none focus:border-[#ff4f00] transition-all"
                    placeholder="email@example.com"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-4">
                <label className="zap-caption-upper text-[#201515]">Temporary Password</label>
                <div className="relative">
                  <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#939084]" />
                  <input
                    required name="password" value={formData.password} onChange={handleChange}
                    type={showPassword ? 'text' : 'password'}
                    className="w-full h-14 pl-12 pr-12 bg-white border border-[#c5c0b1] rounded-[4px] text-[15px] font-medium text-[#201515] focus:outline-none focus:border-[#ff4f00] transition-all"
                    placeholder="••••••••"
                  />
                  <button
                    type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#939084] hover:text-[#ff4f00] transition-all bg-transparent border-none cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* System Role */}
              <div className="space-y-4">
                <label className="zap-caption-upper text-[#201515]">System Role</label>
                <div className="relative">
                  <Shield size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#939084]" />
                  <select
                    required name="role" value={formData.role} onChange={handleChange}
                    className="w-full h-14 pl-12 pr-12 bg-white border border-[#c5c0b1] rounded-[4px] text-[15px] font-bold text-[#201515] focus:outline-none focus:border-[#ff4f00] appearance-none cursor-pointer"
                  >
                    <option value="hr">HR</option>
                    <option value="manager">Manager</option>
                    <option value="employee">Employee</option>
                    <option value="admin">System Admin</option>
                  </select>
                  <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#939084] pointer-events-none" />
                </div>
              </div>

              {/* Join Date */}
              <div className="space-y-4">
                <label className="zap-caption-upper text-[#201515]">Entry Date</label>
                <div className="relative">
                  <Calendar size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#939084]" />
                  <input
                    required type="date" name="joinDate" value={formData.joinDate} onChange={handleChange}
                    className="w-full h-14 pl-12 pr-4 bg-white border border-[#c5c0b1] rounded-[4px] text-[15px] font-bold text-[#201515] focus:outline-none focus:border-[#ff4f00]"
                  />
                </div>
              </div>

              {/* Reporting Manager */}
              {['employee', 'manager'].includes(formData.role) && (
                <div className="space-y-4 col-span-full">
                  <label className="zap-caption-upper text-[#201515]">Reporting Manager</label>
                  <div className="relative">
                    <Users size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#939084]" />
                    <select
                      required name="reportingManager" value={formData.reportingManager} onChange={handleChange}
                      className="w-full h-14 pl-12 pr-12 bg-white border border-[#c5c0b1] rounded-[4px] text-[15px] font-bold text-[#201515] focus:outline-none focus:border-[#ff4f00] appearance-none cursor-pointer"
                    >
                      <option value="">Select Reporting Manager</option>
                      {managers.map(m => (
                        <option key={m._id} value={m._id}>{m.name || m.fullName}</option>
                      ))}
                    </select>
                    <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#939084] pointer-events-none" />
                  </div>
                </div>
              )}
            </div>

            <div className="pt-10 border-t border-[#c5c0b1] flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-3 text-[#939084] text-[13px] font-medium">
                <Info size={16} className="text-[#ff4f00]" />
                User records will be distributed across organizational clusters.
              </div>
              <div className="flex gap-4 w-full md:w-auto">
                <button
                  type="submit" disabled={loading}
                  className="zap-btn !bg-[#ff4f00] !text-white h-14 px-12 min-w-[200px] whitespace-nowrap shadow-lg hover:brightness-110 transition-all font-bold rounded-lg"
                >
                  {loading ? <RefreshCw className="animate-spin mr-3" size={18} /> : <Plus size={18} className="mr-3 text-white" />}
                  {loading ? 'Creating...' : 'Create User'}
                </button>
                <button type="button" className="zap-btn zap-btn-light h-14 px-10">Cancel</button>
              </div>
            </div>
          </form>
        </div>

        {/* PREVIEW SIDE */}
        <div className="col-span-12 lg:col-span-4 space-y-8">
           <div className="zap-card bg-[#201515] text-[#fffefb] p-10 relative overflow-hidden group">
              <div className="relative z-10">
                 <User size={48} className="text-[#ff4f00] mb-8" />
                 <h3 className="text-[24px] font-medium mb-4">Identity Preview</h3>
                 <p className="text-[14px] text-[#939084] leading-relaxed mb-10">Preview how the personnel entity will be represented across the global architecture.</p>
                 <div className="flex flex-wrap gap-3">
                    <span className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-[11px] font-bold uppercase tracking-widest text-[#939084]">Global Registry</span>
                    <span className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-[11px] font-bold uppercase tracking-widest text-[#939084]">Org Chart Node</span>
                 </div>
              </div>
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-[#ff4f00]/10 blur-3xl rounded-full transition-transform duration-700 group-hover:scale-150"></div>
           </div>

           <div className="zap-card p-10 bg-[#fffdf9]">
              <div className="flex items-center gap-3 text-[#201515] mb-8">
                 <Shield size={20} className="text-[#ff4f00]" />
                 <h3 className="zap-caption-upper !text-[#201515]">Security Protocol</h3>
              </div>
              <ul className="space-y-6">
                 <li className="flex items-start gap-4">
                    <CheckCircle size={16} className="text-[#24a148] mt-1" />
                    <p className="text-[13px] font-medium text-[#939084] leading-normal">Data isolation is enforced across role-specific organizational clusters.</p>
                 </li>
                 <li className="flex items-start gap-4">
                    <CheckCircle size={16} className="text-[#24a148] mt-1" />
                    <p className="text-[13px] font-medium text-[#939084] leading-normal">Asymmetric encryption (Bcrypt) is utilized for all credential storage.</p>
                 </li>
              </ul>
           </div>
        </div>
      </div>
    </div>
  );
};

export default CreateUser;
