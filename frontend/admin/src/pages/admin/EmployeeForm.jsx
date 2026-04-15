import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft, Loader2 } from 'lucide-react';

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
    department: '',
    role: 'employee',
    managerId: '',
    joinDate: '',
    employmentType: 'Full-time'
  });

  const [departments, setDepartments] = useState([]);
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = sessionStorage.getItem('token');
        const [deptRes, mgrRes] = await Promise.all([
          axios.get('/api/departments', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('/api/managers', { headers: { Authorization: `Bearer ${token}` } })
        ]);
        setDepartments(deptRes.data);
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
            department: emp.department?._id || '',
            role: emp.role || 'employee',
            managerId: emp.managerId?._id || '',
            joinDate: emp.joinDate ? emp.joinDate.split('T')[0] : '',
            employmentType: emp.employmentType || 'Full-time'
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
      if (!submitData.department) delete submitData.department;
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
      navigate('/admin/employees');
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
          onClick={() => navigate('/admin/employees')}
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
        {error && <div className="mb-6 p-4 bg-[#F6465D]/10 text-[#F6465D] font-bold text-sm rounded-xl uppercase tracking-wider">{error}</div>}
        
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
               <select required name="role" value={formData.role} onChange={handleChange} className="w-full px-4 py-3 bg-[#F5F5F5] focus:bg-white border-2 border-transparent focus:border-[#F0B90B] rounded-xl font-bold text-sm">
                 <option value="employee">Employee</option>
                 <option value="manager">Manager</option>
                 <option value="hr">HR</option>
                 <option value="admin">Admin</option>
               </select>
             </div>

             <div className="space-y-2">
               <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#848E9C]">Department</label>
               <select name="department" value={formData.department} onChange={handleChange} className="w-full px-4 py-3 bg-[#F5F5F5] focus:bg-white border-2 border-transparent focus:border-[#F0B90B] rounded-xl font-bold text-sm">
                 <option value="">Select Department</option>
                 {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
               </select>
             </div>

             <div className="space-y-2">
               <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#848E9C]">Direct Manager</label>
               <select name="managerId" value={formData.managerId} onChange={handleChange} className="w-full px-4 py-3 bg-[#F5F5F5] focus:bg-white border-2 border-transparent focus:border-[#F0B90B] rounded-xl font-bold text-sm">
                 <option value="">Select Manager</option>
                 {managers.map(m => <option key={m._id} value={m._id}>{m.name}</option>)}
               </select>
             </div>

             <div className="space-y-2">
               <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#848E9C]">Join Date *</label>
               <input type="date" required name="joinDate" value={formData.joinDate} onChange={handleChange} className="w-full px-4 py-3 bg-[#F5F5F5] focus:bg-white border-2 border-transparent focus:border-[#F0B90B] rounded-xl font-bold text-sm" />
             </div>

             <div className="space-y-2">
               <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#848E9C]">Employment Type</label>
               <select name="employmentType" value={formData.employmentType} onChange={handleChange} className="w-full px-4 py-3 bg-[#F5F5F5] focus:bg-white border-2 border-transparent focus:border-[#F0B90B] rounded-xl font-bold text-sm">
                 <option value="Full-time">Full-time</option>
                 <option value="Part-time">Part-time</option>
                 <option value="Contract">Contract</option>
               </select>
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
      </div>
    </div>
  );
};

export default EmployeeForm;
