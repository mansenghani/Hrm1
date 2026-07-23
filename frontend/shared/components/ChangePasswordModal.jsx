import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Lock, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';

const ChangePasswordModal = ({ isOpen, onClose }) => {
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);

  // Handle escape key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleEsc);
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setStatus({ type: '', message: '' });

    if (!passwords.currentPassword || !passwords.newPassword || !passwords.confirmPassword) {
      return setStatus({ type: 'error', message: 'All fields are required.' });
    }
    if (passwords.newPassword !== passwords.confirmPassword) {
      return setStatus({ type: 'error', message: 'New passwords do not match.' });
    }
    if (passwords.newPassword.length < 6) {
      return setStatus({ type: 'error', message: 'Password must be at least 6 characters.' });
    }

    setLoading(true);
    const token = sessionStorage.getItem('token');
    
    try {
      const response = await axios.put('/api/auth/update-password', {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data) {
        setStatus({ type: 'success', message: 'Password updated successfully!' });
        setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setTimeout(() => {
          onClose();
          setStatus({ type: '', message: '' });
        }, 2000);
      }
    } catch (err) {
      setStatus({ 
        type: 'error', 
        message: err.response?.data?.message || 'Failed to update password.' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
      {/* Dimmed Overlay */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-md bg-white rounded-[8px] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex justify-between items-center px-8 pt-5 pb-4">
          <h2 className="text-[28px] font-bold text-slate-900 tracking-tight leading-none m-0">Change Password</h2>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 p-2 rounded-full transition-colors cursor-pointer border-none outline-none"
            type="button"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="px-8 pb-5">
          
          {/* Status Message */}
          {status.message && (
            <div className={`flex items-center gap-2 p-4 mb-6 rounded-xl ${
              status.type === 'success' 
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                : 'bg-red-50 text-red-700 border border-red-100'
            }`}>
              {status.type === 'success' ? <CheckCircle2 size={18} className="shrink-0" /> : <AlertCircle size={18} className="shrink-0" />}
              <span className="text-sm font-semibold">{status.message}</span>
            </div>
          )}

          <form onSubmit={handleUpdatePassword} className="flex flex-col gap-4">
            {/* Field 1 */}
            <div className="flex flex-col gap-2">
              <label className="text-[13px] font-bold text-slate-700">Current Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <Lock size={18} />
                </div>
                <input 
                  type="password" 
                  placeholder="Enter current password"
                  required
                  value={passwords.currentPassword}
                  onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-[8px] text-[14px] text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00a76b]/20 focus:border-[#00a76b] transition-all"
                />
              </div>
            </div>

            {/* Field 2 */}
            <div className="flex flex-col gap-2">
              <label className="text-[13px] font-bold text-slate-700">New Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <Lock size={18} />
                </div>
                <input 
                  type="password" 
                  placeholder="Enter new password"
                  required
                  value={passwords.newPassword}
                  onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-[8px] text-[14px] text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00a76b]/20 focus:border-[#00a76b] transition-all"
                />
              </div>
            </div>

            {/* Field 3 */}
            <div className="flex flex-col gap-2">
              <label className="text-[13px] font-bold text-slate-700">Confirm New Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <Lock size={18} />
                </div>
                <input 
                  type="password" 
                  placeholder="Confirm new password"
                  required
                  value={passwords.confirmPassword}
                  onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-[8px] text-[14px] text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00a76b]/20 focus:border-[#00a76b] transition-all"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="mt-4">
              <button 
                type="submit" 
                disabled={loading}
                className="w-full h-12 bg-[#00a76b] hover:bg-[#00925d] text-white font-bold text-[15px] rounded-[8px] flex items-center justify-center gap-2 transition-colors border-none cursor-pointer outline-none shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? <RefreshCw size={18} className="animate-spin" /> : 'Update Password'}
              </button>
              <p className="text-center text-slate-500 text-[12px] font-medium mt-4">
                Make sure your new password is at least 6 characters.
              </p>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
};

export default ChangePasswordModal;
