import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft, Loader2, ChevronDown, FileText, UploadCloud, CheckCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

const EmployeeForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [formData, setFormData] = useState({
    employeeId: '',
    fullName: '',
    email: '',
    personalEmail: '',
    password: '',
    phone: '',
    gender: 'Male',
    dob: '',
    address: '',
    role: 'employee',
    managerId: '',
    joinDate: '',
    employmentType: 'Full-time'
  });

  const [departments, setDepartments] = useState([]);
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = sessionStorage.getItem('token');
        const mgrRes = await axios.get('/api/managers', { headers: { Authorization: `Bearer ${token}` } });
        setManagers(mgrRes.data);

        if (isEdit) {
          const empRes = await axios.get(`/api/employees/${id}`, {
             headers: { Authorization: `Bearer ${token}` }
          });
          const emp = empRes.data;
          setFormData({
            employeeId: emp.employeeId || '',
            fullName: emp.fullName || '',
            email: emp.email || '',
            personalEmail: emp.personalEmail || '',
            phone: emp.phone || '',
            gender: emp.gender || 'Male',
            dob: emp.dob ? emp.dob.split('T')[0] : '',
            address: emp.address || '',
            role: emp.userId?.role || emp.role || 'employee',
            managerId: emp.managerId?._id || '',
            joinDate: emp.joinDate ? emp.joinDate.split('T')[0] : '',
            employmentType: emp.employmentType || 'Full-time',
            profileImage: emp.profileImage || '',
            adharCard: emp.adharCard || '',
            bankDetails: emp.bankDetails || '',
            panCard: emp.panCard || ''
          });
        }
      } catch (err) {
        console.error('Fetch error:', err);
        setError('Failed to load form data');
      }
    };
    fetchData();
  }, [id, isEdit]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = sessionStorage.getItem('token');
      const submitData = { ...formData };
      
      // Data cleanup
      if (!submitData.managerId) delete submitData.managerId;
      if (isEdit) delete submitData.password; // Optional: separate change password flow

      if (isEdit) {
        await axios.put(`/api/employees/${id}`, submitData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post('/api/employees', submitData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      toast.success('Employee Data Update Successfully', {
        style: {
          background: '#1E2026',
          color: '#fff',
          fontWeight: 'bold',
          borderRadius: '12px',
          border: '1px solid #F0B90B'
        },
        iconTheme: {
          primary: '#F0B90B',
          secondary: '#1E2026',
        }
      });
      const pathRole = window.location.pathname.split('/')[1];
      navigate(`/${pathRole}/employees`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save employee');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => {
            const pathRole = window.location.pathname.split('/')[1];
            navigate(`/${pathRole}/employees`);
          }}
          className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-[#848E9C] hover:text-[#1E2026] hover:shadow-sm border border-[#E6E8EA] transition-all"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-3xl font-black text-[#1E2026] uppercase tracking-tighter">
            {isEdit ? 'Update' : 'Register'} <span className="text-[#F0B90B]">Node</span>
          </h1>
        </div>
      </div>

      <div className="bg-white border border-[#E6E8EA] rounded-2xl p-8 shadow-[0_3px_5px_rgba(32,32,37,0.05)]">
        {/* TAB SWITCHER */}
        <div className="flex gap-1 p-1 bg-[#F5F5F5] rounded-xl mb-10 w-fit">
           <button 
             onClick={() => setActiveTab('profile')}
             className={`px-8 py-2.5 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all ${activeTab === 'profile' ? 'bg-white text-[#1E2026] shadow-sm' : 'text-[#848E9C] hover:text-[#1E2026]'}`}
           >
              Profile Nodes
           </button>
           <button 
             onClick={() => setActiveTab('documents')}
             className={`px-8 py-2.5 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all ${activeTab === 'documents' ? 'bg-white text-[#1E2026] shadow-sm' : 'text-[#848E9C] hover:text-[#1E2026]'}`}
           >
              Identity Vault
           </button>
        </div>

        {/* AVATAR SECTION */}
        {isEdit && activeTab === 'profile' && (
          <div className="flex justify-center mb-10 border-b border-[#F5F5F5] pb-10">
            <div className="relative group">
              <div className="w-32 h-32 rounded-2xl bg-[#F5F5F5] flex items-center justify-center border-2 border-dashed border-[#E6E8EA] overflow-hidden group-hover:border-[#F0B90B] transition-all">
                {formData.profileImage ? (
                  <img src={formData.profileImage} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-4xl font-black text-[#1E2026] opacity-10 uppercase">
                    {formData.fullName?.substring(0, 2) || 'SA'}
                  </span>
                )}
              </div>
              <label htmlFor="emp-photo" className="absolute -bottom-3 -right-3 w-10 h-10 bg-[#F0B90B] text-white rounded-xl flex items-center justify-center shadow-xl cursor-pointer hover:scale-110 active:scale-95 transition-all">
                 <span className="material-symbols-outlined text-xl">photo_camera</span>
                 <input 
                  id="emp-photo" 
                  type="file" 
                  className="hidden" 
                  accept="image/*" 
                  onChange={async (e) => {
                    const file = e.target.files[0];
                    if (!file) return;
                    const token = sessionStorage.getItem('token');
                    const uploadData = new FormData();
                    uploadData.append('image', file);
                    try {
                      setLoading(true);
                      const res = await axios.post(`/api/employees/${id}/profile-image`, uploadData, {
                        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
                      });
                      setFormData({ ...formData, profileImage: res.data.profileImage });
                    } catch (err) {
                      setError('Failed to update node visual identity');
                    } finally {
                      setLoading(false);
                    }
                  }}
                 />
              </label>
            </div>
          </div>
        )}

        {/* VERIFIED DOCUMENTS VAULT */}
        {isEdit && activeTab === 'documents' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10 pb-10">
            {/* Adharcard Upload */}
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#848E9C]">Adharcard Registry</label>
              <div className="flex flex-col items-center gap-4 p-5 bg-[#F5F5F5] rounded-2xl border-2 border-dashed border-[#E6E8EA] hover:border-[#F0B90B] transition-all group">
                <div 
                  className={`w-full aspect-square max-w-[160px] rounded-xl bg-white flex items-center justify-center text-[#F0B90B] shadow-md overflow-hidden border border-[#E6E8EA] transition-all ${formData.adharCard ? 'cursor-pointer hover:scale-[1.02] active:scale-95' : ''}`}
                  onClick={() => formData.adharCard && window.open(formData.adharCard, '_blank')}
                >
                  {formData.adharCard ? (
                    <img src={formData.adharCard} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                       <FileText size={32} className="opacity-20" />
                       <p className="text-[9px] font-black uppercase tracking-widest opacity-40">Missing</p>
                    </div>
                  )}
                </div>
                
                <label className="w-full cursor-pointer bg-[#1E2026] text-white py-3 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95">
                  <UploadCloud size={14} />
                  Upload
                  <input 
                    type="file" className="hidden" 
                    onChange={async (e) => {
                      const file = e.target.files[0];
                      if (!file) return;
                      const token = sessionStorage.getItem('token');
                      const uploadData = new FormData();
                      uploadData.append('document', file);
                      try {
                        setLoading(true);
                        const res = await axios.post(`/api/employees/${id}/adhar-card`, uploadData, {
                          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
                        });
                        setFormData({ ...formData, adharCard: res.data.adharCard });
                        toast.success('Adharcard Protocol Verified');
                      } catch (err) {
                        toast.error('Identity Verification Failed');
                      } finally {
                        setLoading(false);
                      }
                    }}
                  />
                </label>
              </div>
            </div>

            {/* Bank Details Upload */}
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#848E9C]">Bank Details Registry</label>
              <div className="flex flex-col items-center gap-4 p-5 bg-[#F5F5F5] rounded-2xl border-2 border-dashed border-[#E6E8EA] hover:border-[#F0B90B] transition-all group">
                <div 
                  className={`w-full aspect-square max-w-[160px] rounded-xl bg-white flex items-center justify-center text-[#F0B90B] shadow-md overflow-hidden border border-[#E6E8EA] transition-all ${formData.bankDetails ? 'cursor-pointer hover:scale-[1.02] active:scale-95' : ''}`}
                  onClick={() => formData.bankDetails && window.open(formData.bankDetails, '_blank')}
                >
                  {formData.bankDetails ? (
                    <img src={formData.bankDetails} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                       <span className="material-symbols-outlined text-3xl opacity-20">credit_card</span>
                       <p className="text-[9px] font-black uppercase tracking-widest opacity-40">Missing</p>
                    </div>
                  )}
                </div>

                <label className="w-full cursor-pointer bg-[#1E2026] text-white py-3 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95">
                  <UploadCloud size={14} />
                  Upload
                  <input 
                    type="file" className="hidden" 
                    onChange={async (e) => {
                      const file = e.target.files[0];
                      if (!file) return;
                      const token = sessionStorage.getItem('token');
                      const uploadData = new FormData();
                      uploadData.append('document', file);
                      try {
                        setLoading(true);
                        const res = await axios.post(`/api/employees/${id}/bank-details`, uploadData, {
                          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
                        });
                        setFormData({ ...formData, bankDetails: res.data.bankDetails });
                        toast.success('Financial Asset Synchronized');
                      } catch (err) {
                        toast.error('Banking Verification Failed');
                      } finally {
                        setLoading(false);
                      }
                    }}
                  />
                </label>
              </div>
            </div>

            {/* PAN Card Upload */}
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#848E9C]">PAN Card Registry</label>
              <div className="flex flex-col items-center gap-4 p-5 bg-[#F5F5F5] rounded-2xl border-2 border-dashed border-[#E6E8EA] hover:border-[#F0B90B] transition-all group">
                <div 
                  className={`w-full aspect-square max-w-[160px] rounded-xl bg-white flex items-center justify-center text-[#F0B90B] shadow-md overflow-hidden border border-[#E6E8EA] transition-all ${formData.panCard ? 'cursor-pointer hover:scale-[1.02] active:scale-95' : ''}`}
                  onClick={() => formData.panCard && window.open(formData.panCard, '_blank')}
                >
                  {formData.panCard ? (
                    <img src={formData.panCard} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                       <span className="material-symbols-outlined text-3xl opacity-20">badge</span>
                       <p className="text-[9px] font-black uppercase tracking-widest opacity-40">Missing</p>
                    </div>
                  )}
                </div>

                <label className="w-full cursor-pointer bg-[#1E2026] text-white py-3 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95">
                  <UploadCloud size={14} />
                  Upload
                  <input 
                    type="file" className="hidden" 
                    onChange={async (e) => {
                      const file = e.target.files[0];
                      if (!file) return;
                      const token = sessionStorage.getItem('token');
                      const uploadData = new FormData();
                      uploadData.append('document', file);
                      try {
                        setLoading(true);
                        const res = await axios.post(`/api/employees/${id}/pan-card`, uploadData, {
                          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
                        });
                        setFormData({ ...formData, panCard: res.data.panCard });
                        toast.success('PAN Card Protocol Synchronized');
                      } catch (err) {
                        toast.error('PAN Verification Failed');
                      } finally {
                        setLoading(false);
                      }
                    }}
                  />
                </label>
              </div>
            </div>
          </div>
        )}

        {error && <div className="mb-6 p-4 bg-[#F6465D]/10 text-[#F6465D] font-bold text-sm rounded-xl uppercase tracking-wider">{error}</div>}
        
        {activeTab === 'profile' && (
          <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             {isEdit && (
               <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#848E9C]">Employee ID</label>
                 <input disabled value={formData.employeeId} className="w-full px-4 py-3 bg-[#F5F5F5] opacity-60 rounded-xl font-bold text-sm cursor-not-allowed" />
               </div>
             )}
             <div className="space-y-2">
               <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#848E9C]">Full Name *</label>
               <input required name="fullName" value={formData.fullName} onChange={handleChange} className="w-full px-4 py-3 bg-[#F5F5F5] focus:bg-white border-2 border-transparent focus:border-[#F0B90B] rounded-xl font-bold text-sm" placeholder="John Doe" />
             </div>
             <div className="space-y-2">
               <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#848E9C]">Office Email Address *</label>
               <input 
                 type="email" required name="email" value={formData.email} onChange={handleChange} 
                 disabled={isEdit}
                 className={`w-full px-4 py-3 bg-[#F5F5F5] border-2 border-transparent rounded-xl font-bold text-sm ${isEdit ? 'opacity-60 cursor-not-allowed' : 'focus:bg-white focus:border-[#F0B90B]'}`} 
                 placeholder="john@fluidhr.com" 
               />
             </div>
             
             <div className="space-y-2">
               <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#848E9C]">Personal Email Address</label>
               <input 
                 type="email" name="personalEmail" value={formData.personalEmail} onChange={handleChange} 
                 className="w-full px-4 py-3 bg-[#F5F5F5] focus:bg-white border-2 border-transparent focus:border-[#F0B90B] rounded-xl font-bold text-sm" 
                 placeholder="john.doe@gmail.com" 
               />
             </div>
             
             {!isEdit && (
               <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#848E9C]">Password *</label>
                 <input type="password" required={!isEdit} name="password" value={formData.password} onChange={handleChange} className="w-full px-4 py-3 bg-[#F5F5F5] focus:bg-white border-2 border-transparent focus:border-[#F0B90B] rounded-xl font-bold text-sm" placeholder="••••••••" />
               </div>
             )}

             <div className="space-y-2">
               <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#848E9C]">Phone Number</label>
               <input name="phone" value={formData.phone} onChange={handleChange} className="w-full px-4 py-3 bg-[#F5F5F5] focus:bg-white border-2 border-transparent focus:border-[#F0B90B] rounded-xl font-bold text-sm" placeholder="+1 234 567 8900" />
             </div>

             <div className="space-y-2">
               <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#848E9C]">Role *</label>
               <div className="relative">
                 <select required name="role" value={formData.role} onChange={handleChange} className="w-full px-4 pr-10 py-3 bg-[#F5F5F5] focus:bg-white border-2 border-transparent focus:border-[#F0B90B] rounded-xl font-bold text-sm appearance-none cursor-pointer transition-all">
                   <option value="employee">Employee</option>
                   <option value="manager">Manager</option>
                   <option value="hr">HR</option>
                   <option value="admin">Admin</option>
                 </select>
                 <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#848E9C] pointer-events-none" />
               </div>
             </div>



             {/* Direct Manager Selection - Hidden for Leadership Nodes */}
             {!['hr', 'manager', 'admin'].includes(formData.role?.toLowerCase()) && (
               <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#848E9C]">Direct Manager</label>
                 <div className="relative">
                   <select 
                    name="managerId" 
                    value={formData.managerId} 
                    onChange={handleChange} 
                    className="w-full px-4 pr-10 py-3 bg-[#F5F5F5] focus:bg-white border-2 border-transparent focus:border-[#F0B90B] rounded-xl font-bold text-sm appearance-none cursor-pointer transition-all"
                   >
                     <option value="">Select Manager</option>
                     {managers.map(m => <option key={m._id} value={m._id}>{m.name}</option>)}
                   </select>
                   <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#848E9C] pointer-events-none" />
                 </div>
               </div>
             )}

             <div className="space-y-2">
               <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#848E9C]">Join Date *</label>
               <input type="date" required name="joinDate" value={formData.joinDate} onChange={handleChange} className="w-full px-4 py-3 bg-[#F5F5F5] focus:bg-white border-2 border-transparent focus:border-[#F0B90B] rounded-xl font-bold text-sm" />
             </div>

             <div className="space-y-2">
               <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#848E9C]">Birthdate *</label>
               <input type="date" required name="dob" value={formData.dob} onChange={handleChange} className="w-full px-4 py-3 bg-[#F5F5F5] focus:bg-white border-2 border-transparent focus:border-[#F0B90B] rounded-xl font-bold text-sm" />
             </div>

             <div className="space-y-2">
               <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#848E9C]">Employment Type</label>
               <div className="relative">
                 <select name="employmentType" value={formData.employmentType} onChange={handleChange} className="w-full px-4 pr-10 py-3 bg-[#F5F5F5] focus:bg-white border-2 border-transparent focus:border-[#F0B90B] rounded-xl font-bold text-sm appearance-none cursor-pointer transition-all">
                   <option value="Full-time">Full-time</option>
                   <option value="Part-time">Part-time</option>
                   <option value="Contract">Contract</option>
                 </select>
                 <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#848E9C] pointer-events-none" />
               </div>
             </div>

             <div className="space-y-2">
               <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#848E9C]">Gender Identity *</label>
               <div className="relative">
                 <select required name="gender" value={formData.gender} onChange={handleChange} className="w-full px-4 pr-10 py-3 bg-[#F5F5F5] focus:bg-white border-2 border-transparent focus:border-[#F0B90B] rounded-xl font-bold text-sm appearance-none cursor-pointer transition-all">
                   <option value="Male">Male</option>
                   <option value="Female">Female</option>
                   <option value="Other">Other</option>
                 </select>
                 <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#848E9C] pointer-events-none" />
               </div>
             </div>

             <div className="space-y-2 col-span-full">
               <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#848E9C]">Location Node (Address)</label>
               <textarea 
                 name="address" value={formData.address} onChange={handleChange} 
                 className="w-full h-32 px-4 py-3 bg-[#F5F5F5] focus:bg-white border-2 border-transparent focus:border-[#F0B90B] rounded-xl font-bold text-sm resize-none" 
                 placeholder="Enter physical location address..." 
               />
             </div>
          </div>

          <div className="pt-6 border-t border-[#E6E8EA] flex justify-end">
             <button 
               type="submit" 
               disabled={loading}
               className="bg-[#1E2026] text-white px-8 py-4 rounded-xl font-black uppercase text-[12px] tracking-widest hover:bg-black transition-all flex items-center gap-3 shadow-2xl active:scale-[0.98] disabled:opacity-50"
             >
               {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
               {isEdit ? 'Save Mutations' : 'Execute Registration'}
             </button>
          </div>
        </form>
        )}
      </div>
    </div>
  );
};

export default EmployeeForm;
