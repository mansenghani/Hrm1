import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ShieldCheck, ArrowRight, Lock, Mail, Globe, AlertCircle, Zap, UserCircle } from 'lucide-react';
import { EntryButton, EntryInput, EntrySelect } from '../components/EntryPrimitives';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // REDIRECT IF ALREADY LOGGED IN
  useEffect(() => {
    const token = sessionStorage.getItem('token');
    const role = sessionStorage.getItem('role');
    if (token && role) {
      navigate(`/${role}/dashboard`);
    }
  }, [navigate]);

  const roleOptions = [
    { value: 'admin', label: 'Admin' },
    { value: 'hr', label: 'HR' },
    { value: 'manager', label: 'Manager' },
    { value: 'employee', label: 'Employee' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!selectedRole) {
      setError('Please select a system role');
      setLoading(false);
      return;
    }

    try {
      // BACKEND API CALL (KEEPING ORIGINAL LOGIC)
      const response = await axios.post('/api/auth/login', {
        email,
        password
      });

      // BACKEND RETURNS FLAT STRUCTURE: { token, role, _id, email }
      const { token, role, _id, email: userEmail } = response.data;
      const user = { _id, role, email: userEmail };

      if (!role) {
        throw new Error('Identity verification failed: No role assigned');
      }

      // ROLE VALIDATION
      if (role !== selectedRole) {
        throw new Error('Invalid email, password, or role selection');
      }

      // STORAGE
      sessionStorage.setItem('token', token);
      sessionStorage.setItem('user', JSON.stringify(user));
      sessionStorage.setItem('role', role);

      // REDIRECTION LOGIC
      navigate(`/${role}/dashboard`);
    } catch (err) {
      setError('Invalid email, password, or role selection');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen overflow-hidden bg-[#eceae3] flex items-center justify-center p-4 selection:bg-[#ff4f00] selection:text-white font-sans">
      <div className="w-full max-w-[760px] h-full max-h-[calc(100vh-2rem)] grid grid-cols-1 lg:grid-cols-12 bg-[#fffefb] rounded-[8px] border border-[#c5c0b1] shadow-sm overflow-hidden">
        {/* BRAND SIDEBAR - Zapier Dark Warm Style */}
        <div className="hidden lg:flex lg:col-span-5 bg-[#201515] p-6 flex-col justify-between relative overflow-hidden">
           <div className="absolute -top-24 -left-24 w-80 h-80 bg-[#ff4f00] opacity-10 blur-[100px] rounded-full"></div>
           
           <div className="relative z-10 flex items-center gap-3">
              <div className="w-9 h-9 bg-[#ff4f00] rounded-[4px] flex items-center justify-center">
                <ShieldCheck size={20} className="text-[#fffefb]" />
              </div>
              <span className="text-[22px] font-bold text-[#fffefb] tracking-tight">FluidHR</span>
           </div>

           <div className="relative z-10">
              <h2 className="text-[30px] font-medium text-[#fffefb] mb-5 leading-[1.1] tracking-tight">
                 Single <br/><span className="text-[#ff4f00]">Identity</span> <br/>Protocol.
              </h2>
              <p className="text-[15px] text-[#c5c0b1] max-w-[260px] leading-relaxed font-medium">
                 One unified portal to manage your entire organizational lifecycle with military-grade precision.
              </p>
           </div>

           <div className="relative z-10 pt-10 border-t border-[#36342e]">
              <div className="flex items-center gap-4 text-[#939084]">
                <Zap size={18} className="text-[#ff4f00]" />
                <span className="text-[12px] font-bold uppercase tracking-[0.2em]">Auth Node v3.0.0</span>
              </div>
           </div>
        </div>

        {/* AUTH FORM - Unified Login */}
        <div className="lg:col-span-7 p-6 md:p-10 flex flex-col justify-center bg-[#fffefb]">
           <div className="max-w-[400px] w-full mx-auto">
              <div className="mb-6">
                 <p className="zap-caption-upper mb-3 text-[#ff4f00]">Enterprise Access</p>
                 <h1 className="text-[34px] font-medium text-[#201515] tracking-tight mb-3 leading-[1.0]">
                    HRMS Login
                 </h1>
                 <p className="text-[13px] text-[#36342e] font-medium leading-relaxed">
                    Select your system role and enter credentials to continue to your workspace.
                 </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                 <EntrySelect 
                    label="System Role"
                    required
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    options={roleOptions}
                    icon={<UserCircle size={20} />}
                  />

                 <EntryInput 
                    label="Corporate Email"
                    type="email" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.io"
                    icon={<Mail size={20} />}
                  />

                 <EntryInput 
                    label="Secret Key"
                    type="password" 
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    icon={<Lock size={20} />}
                  />

                 <div className="min-h-[60px] mb-3 flex items-center">
                   {error ? (
                     <div className="w-full bg-[#fff8f6] border border-[#ff4f00] p-3 rounded-[4px] flex items-start gap-3 animate-fade-in">
                       <AlertCircle size={20} className="text-[#ff4f00] shrink-0" />
                       <span className="text-[14px] text-[#ff4f00] font-bold">{error}</span>
                     </div>
                   ) : (
                     <div className="w-full h-full"></div>
                   )}
                 </div>

                 <div className="pt-4">
                    <EntryButton 
                      type="submit" 
                      disabled={loading}
                      variant="primary"
                      className="h-[48px] text-[15px] font-bold bg-[#ff4f00] text-[#fffefb] hover:bg-[#201515]"
                    >
                       {loading ? 'Validating credentials...' : 'Login'}
                       {!loading && <ArrowRight size={20} className="ml-4" />}
                    </EntryButton>
                 </div>

                 <div className="mt-8 pt-8 border-t border-[#eceae3] text-center">
                    <p className="text-[14px] text-[#939084] font-medium">
                       Authorized personnel only. All access is logged.
                    </p>
                 </div>
              </form>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
