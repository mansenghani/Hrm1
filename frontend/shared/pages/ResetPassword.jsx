import React, { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { ShieldCheck, ArrowRight, ArrowLeft, Lock, Zap, AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { EntryButton, EntryInput } from '../components/EntryPrimitives';

const ResetPassword = () => {
  const navigate = useNavigate();
  const { token } = useParams();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // If no token is provided, redirect to forgot password
  if (!token) {
    navigate('/forgot-password', { replace: true });
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }

    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z\d]).{8,}$/;
    if (!passwordRegex.test(password)) {
      setError('Password must be minimum 8 characters, 1 special symbol, minimum 1 capital letter, and minimum 1 number.');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(`/api/auth/reset-password/${token}`, { password });
      setSuccess(response.data.message || 'Password reset successfully.');
      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred while resetting the password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen overflow-hidden bg-[#eceae3] flex items-center justify-center p-4 selection:bg-[#00a76b] selection:text-white font-sans">
      <div className="w-full max-w-[760px] h-full max-h-[calc(100vh-2rem)] grid grid-cols-1 lg:grid-cols-12 bg-[#fffefb] rounded-[8px] border border-[#c5c0b1] shadow-sm overflow-hidden">
        {/* BRAND SIDEBAR */}
        <div className="hidden lg:flex lg:col-span-5 bg-[#201515] p-6 flex-col justify-between relative overflow-hidden">
           <div className="absolute -top-24 -left-24 w-80 h-80 bg-[#00a76b] opacity-10 blur-[100px] rounded-full"></div>
           
           <div className="relative z-10 flex items-center gap-3">
              <div className="w-9 h-9 bg-[#00a76b] rounded-[4px] flex items-center justify-center cursor-pointer" onClick={() => navigate('/login')}>
                <ShieldCheck size={20} className="text-[#fffefb]" />
              </div>
              <span className="text-[22px] font-bold text-[#fffefb] tracking-tight">FluidHR</span>
           </div>

           <div className="relative z-10">
              <h2 className="text-[30px] font-medium text-[#fffefb] mb-5 leading-[1.1] tracking-tight">
                 Set New <br/><span className="text-[#00a76b]">Secret Key</span>.
              </h2>
              <p className="text-[15px] text-[#c5c0b1] max-w-[260px] leading-relaxed font-medium">
                 Update your authentication credentials to regain access to the portal.
              </p>
           </div>

           <div className="relative z-10 pt-10 border-t border-[#36342e]">
              <div className="flex items-center gap-4 text-[#939084]">
                <Zap size={18} className="text-[#00a76b]" />
                <span className="text-[12px] font-bold uppercase tracking-[0.2em]">Auth Node v3.0.0</span>
              </div>
           </div>
        </div>

        {/* RESET FORM */}
        <div className="lg:col-span-7 p-6 md:p-10 flex flex-col bg-[#fffefb] relative overflow-y-auto">
           <Link to="/login" className="absolute top-8 left-8 text-[#939084] hover:text-[#201515] transition-colors flex items-center gap-2 text-sm font-bold">
             <ArrowLeft size={16} /> Back to Login
           </Link>
           <div className="max-w-[400px] w-full mx-auto mt-20">
              <div className="mb-6">
                 <p className="zap-caption-upper mb-3 text-[#00a76b]">Account Recovery</p>
                 <h1 className="text-[34px] font-medium text-[#201515] tracking-tight mb-3 leading-[1.0]">
                    Reset Password
                 </h1>
                 <p className="text-[13px] text-[#36342e] font-medium leading-relaxed">
                    Setting new credentials for your account.
                 </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                 <div className="relative">
                   <EntryInput 
                      label="New Password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter new password"
                      icon={<Lock size={20} />}
                    />
                    {password.length > 0 && (
                      <button
                        type="button" onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-[38px] text-[#939084] hover:text-[#00a76b] transition-all bg-transparent border-none cursor-pointer"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    )}
                 </div>

                 <EntryInput 
                    label="Confirm Password"
                    type="password" 
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    icon={<Lock size={20} />}
                  />

                 <div className="empty:hidden mt-2 mb-2">
                   {error && (
                     <div className="w-full bg-[#fff8f6] border border-[#00a76b] p-3 rounded-[4px] flex items-start gap-3 animate-fade-in">
                       <AlertCircle size={20} className="text-[#00a76b] shrink-0" />
                       <span className="text-[14px] text-[#00a76b] font-bold">{error}</span>
                     </div>
                   )}
                   {success && (
                     <div className="w-full bg-[#f6fff8] border border-[#24a148] p-3 rounded-[4px] flex items-start gap-3 animate-fade-in">
                       <CheckCircle size={20} className="text-[#24a148] shrink-0" />
                       <span className="text-[14px] text-[#24a148] font-bold">{success}</span>
                     </div>
                   )}
                 </div>

                 <div className="pt-1">
                    <EntryButton 
                      type="submit" 
                      disabled={loading}
                      variant="primary"
                      className="h-[48px] text-[15px] font-bold bg-[#00a76b] text-[#fffefb] hover:bg-[#201515] w-full"
                    >
                       {loading ? 'Updating...' : 'Update Password'}
                       {!loading && <ArrowRight size={20} className="ml-4" />}
                    </EntryButton>
                 </div>
              </form>
           </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
