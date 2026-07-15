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
    <div className="min-h-screen bg-[#f6f5f1] flex flex-col items-center justify-center p-4 selection:bg-[#00a76b] selection:text-white font-sans relative">
      <div className="w-full max-w-[400px] relative">
         
         <Link to="/login" className="absolute -top-16 left-0 text-[#7a7873] hover:text-[#201515] transition-colors flex items-center gap-2 text-[14px] font-bold">
           <ArrowLeft size={16} /> Back to Login
         </Link>

         <div className="mb-8">
            <p className="text-[13px] font-bold text-[#00a76b] tracking-[1px] uppercase mb-2">Account Recovery</p>
            <h1 className="text-[36px] font-medium text-[#201515] tracking-tight mb-3 leading-[1.0]">
               Reset Password
            </h1>
            <p className="text-[14px] text-[#5c5a55] font-medium">
               Setting new credentials for your account.
            </p>
         </div>

         <form onSubmit={handleSubmit} className="space-y-5">
            <div className="relative">
              <EntryInput 
                 label="NEW PASSWORD"
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
               label="CONFIRM PASSWORD"
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

            <div className="pt-2">
               <EntryButton 
                 type="submit" 
                 disabled={loading}
                 variant="primary"
                 className="h-[52px] text-[15px] font-bold bg-[#00a76b] text-[#fffefb] hover:bg-[#008f5a] w-full rounded-[6px]"
               >
                  {loading ? 'Updating...' : 'Update Password'}
                  {!loading && <ArrowRight size={20} className="ml-3" />}
               </EntryButton>
            </div>
         </form>
      </div>
    </div>
  );
};

export default ResetPassword;
