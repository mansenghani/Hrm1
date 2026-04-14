import React, { useState } from 'react';
import axios from 'axios';

const CreateUser = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'employee'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const token = localStorage.getItem('token');
      // Database Synchronization
      const response = await axios.post('/api/auth/create-user', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setMessage({ type: 'success', text: response.data.message });
      setFormData({ firstName: '', lastName: '', email: '', password: '', role: 'employee' });
      setTimeout(() => setMessage({ type: '', text: '' }), 5000);
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to create user.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      {/* CSS to hide browser-default password eye */}
      <style>{`
        input::-ms-reveal, input::-ms-clear { display: none !important; }
        input::-webkit-contacts-auto-fill-button, input::-webkit-credentials-auto-fill-button { display: none !important; }
      `}</style>

      {/* Success/Error Toast Notification */}
      {message.text && (
        <div className={`fixed top-24 right-8 bg-white shadow-[0px_24px_48px_rgba(0,2,41,0.08)] border-l-4 ${message.type === 'success' ? 'border-emerald-500' : 'border-rose-500'} px-6 py-5 rounded-2xl flex items-center gap-4 animate-in fade-in slide-in-from-top-6 duration-500 z-[100] ring-1 ring-black/5`}>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${message.type === 'success' ? 'bg-emerald-50 text-emerald-500' : 'bg-rose-50 text-rose-500'}`}>
            <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              {message.type === 'success' ? 'check_circle' : 'warning'}
            </span>
          </div>
          <div>
            <p className="text-sm font-black text-slate-800 uppercase tracking-tight">{message.type === 'success' ? 'Personnel Created' : 'Process Halted'}</p>
            <p className="text-xs font-bold text-slate-500 mt-1">{message.text}</p>
          </div>
          <button onClick={() => setMessage({ type: '', text: '' })} className="ml-4 w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-50 transition-all">
            <span className="material-symbols-outlined text-slate-400 text-lg">close</span>
          </button>
        </div>
      )}

      <div className="flex flex-col gap-6">
        <div>
          <h2 className="text-4xl font-extrabold text-on-surface tracking-tight font-manrope">Create the Account</h2>
          <p className="text-secondary mt-2 text-lg">Register a new team member to the Narrative HR ecosystem.</p>
        </div>

        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-span-8 bg-white rounded-xl p-8 shadow-[0px_24px_48px_rgba(0,2,41,0.06)] border border-slate-100">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* First Name */}
                <div className="space-y-2">
                  <label className="text-xs font-bold tracking-wider text-secondary uppercase ml-1">First Name</label>
                  <div className="relative group">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 group-focus-within:text-orange-500 transition-colors">person</span>
                    <input
                      required
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      autoComplete="off"
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-xl border-2 border-orange-400/60 focus:ring-2 focus:ring-orange-500/40 focus:bg-white transition-all outline-none text-on-surface font-medium"
                      placeholder=""
                      type="text"
                    />
                  </div>
                </div>

                {/* Last Name */}
                <div className="space-y-2">
                  <label className="text-xs font-bold tracking-wider text-secondary uppercase ml-1">Last Name</label>
                  <div className="relative group">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 group-focus-within:text-orange-500 transition-colors">person</span>
                    <input
                      required
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      autoComplete="off"
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-xl border-2 border-orange-400/60 focus:ring-2 focus:ring-orange-500/40 focus:bg-white transition-all outline-none text-on-surface font-medium"
                      placeholder=""
                      type="text"
                    />
                  </div>
                </div>

                {/* Email Address */}
                <div className="space-y-2">
                  <label className="text-xs font-bold tracking-wider text-secondary uppercase ml-1">Email Address</label>
                  <div className="relative group">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 group-focus-within:text-orange-500 transition-colors">mail</span>
                    <input
                      required
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      autoComplete="off"
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-xl border-2 border-orange-400/60 focus:ring-2 focus:ring-orange-500/40 focus:bg-white transition-all outline-none text-on-surface font-medium"
                      placeholder=""
                    />
                  </div>
                </div>

                {/* Password with Toggle */}
                <div className="space-y-2">
                  <label className="text-xs font-bold tracking-wider text-secondary uppercase ml-1">Temporary Password</label>
                  <div className="relative group">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 group-focus-within:text-orange-500 transition-colors">lock</span>
                    <input
                      required
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      autoComplete="new-password"
                      className="w-full pl-12 pr-12 py-4 bg-slate-50 rounded-xl border-2 border-orange-400/60 focus:ring-2 focus:ring-orange-500/40 focus:bg-white transition-all outline-none text-on-surface font-medium"
                      placeholder=""
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-orange-500 transition-colors"
                    >
                      <span className="material-symbols-outlined text-xs">
                        {showPassword ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Role Dropdown */}
                <div className="space-y-2">
                  <label className="text-xs font-bold tracking-wider text-secondary uppercase ml-1">System Role</label>
                  <div className="relative group">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 group-focus-within:text-orange-500 transition-colors">shield</span>
                    <select
                      required
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-xl border-2 border-orange-400/60 focus:ring-2 focus:ring-orange-500/40 focus:bg-white transition-all outline-none text-on-surface font-medium appearance-none"
                    >
                      <option value="" disabled>Select Access Level</option>
                      <option value="hr">HR Specialist</option>
                      <option value="manager">Department Manager</option>
                      <option value="employee">Employee</option>
                    </select>
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 pointer-events-none">expand_more</span>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-500 text-sm">
                  <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>info</span>
                  The user will be created across localized collections.
                </div>
                <div className="flex items-center gap-4">
                  <button type="button" className="px-8 py-4 text-slate-500 font-bold hover:bg-slate-50 rounded-xl transition-all">Cancel</button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-8 py-3 bg-[#ff9900] text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg shadow-orange-500/20 flex items-center gap-2 disabled:opacity-50"
                  >
                    {loading ? 'Creating Node...' : 'Create the Account'}
                    {!loading && <span className="material-symbols-outlined text-sm">add_circle</span>}
                  </button>
                </div>
              </div>
            </form>
          </div>

          <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
            <div className="bg-[#000229] rounded-xl p-8 text-white relative overflow-hidden group">
              <div className="relative z-10">
                <span className="material-symbols-outlined text-4xl mb-4 text-orange-500" style={{ fontVariationSettings: "'FILL' 1" }}>account_circle</span>
                <h3 className="text-xl font-bold font-manrope">Profile Preview</h3>
                <p className="text-slate-300 text-sm mt-2 leading-relaxed">Fill in the user details to see how they will appear across the HRMS portal.</p>
                <div className="mt-6 flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-white/10 rounded-full text-[10px] font-bold uppercase tracking-widest">Global Search</span>
                  <span className="px-3 py-1 bg-white/10 rounded-full text-[10px] font-bold uppercase tracking-widest">Org Chart</span>
                </div>
              </div>
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-orange-500/20 rounded-full blur-3xl transition-transform duration-700 group-hover:scale-150"></div>
            </div>

            <div className="bg-slate-100 rounded-xl p-8 border border-slate-200">
              <div className="flex items-center gap-3 text-on-surface mb-4">
                <span className="material-symbols-outlined text-orange-500">security</span>
                <h3 className="font-bold font-manrope">Security Audit</h3>
              </div>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-emerald-500 text-sm mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                  <p className="text-xs text-secondary leading-normal">Data isolation is enforced across role-specific collections.</p>
                </li>
                <li className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-emerald-500 text-sm mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                  <p className="text-xs text-secondary leading-normal">Encryption hash (Bcrypt) is used for all stored credentials.</p>
                </li>
              </ul>
            </div>

            <div className="flex-1 bg-orange-100 rounded-xl overflow-hidden min-h-[200px] relative">
              <img
                alt="Modern Office"
                className="absolute inset-0 w-full h-full object-cover opacity-60"
                src="https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&q=80&w=1000"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-orange-500/40 to-transparent"></div>
              <div className="absolute bottom-6 left-6 right-6">
                <p className="text-white font-bold font-manrope text-sm italic">"Building the future of team management, one node at a time."</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateUser;
