import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '@shared/services/api';
import { Eye, Shield, Lock, FileText, Upload, Trash2, Check, RefreshCw, Plus } from 'lucide-react';

const Profile = () => {
  const [userData, setUserData] = useState(null);
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(true);

  const token = sessionStorage.getItem('token');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const timestamp = new Date().getTime();
        const response = await axios.get(`/api/auth/me?t=${timestamp}`, {
          headers: { Authorization: `Bearer ${token}`, 'Cache-Control': 'no-cache' }
        });
        if (response.data) {
          setUserData(response.data);
          sessionStorage.setItem('user', JSON.stringify(response.data));
        }
      } catch (err) {
        console.warn('Initial sync failed.');
      } finally {
        setSyncing(false);
      }
    };
    if (token) fetchProfile();
  }, [token]);

  if (syncing) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 16 }}>
        <RefreshCw size={32} className="animate-spin text-[#00a76b]" />
        <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.2em', color: '#9ca3af' }}>Syncing Identity Node...</p>
      </div>
    );
  }

  const safeUserData = userData || {};
  const fullName = safeUserData.name || (safeUserData.profile ? `${safeUserData.profile.firstName || ''} ${safeUserData.profile.lastName || ''}`.trim() : 'System Admin');
  const userEmail = safeUserData.email || 'admin@fluidhr.com';
  const userRole = safeUserData.role || 'Personnel';
  const userDept = (safeUserData.department && typeof safeUserData.department === 'object') ? safeUserData.department.name : (safeUserData.department || 'General Operations');
  
  const empId = safeUserData.employeeId || 'PENDING-SYNC';
  const personalEmail = safeUserData.personalEmail || 'Not Configured';
  const joinDate = safeUserData.joinDate ? new Date(safeUserData.joinDate).toLocaleDateString() : 'Not Set';
  const phone = safeUserData.phone || 'Data Missing';
  const empType = safeUserData.employmentType || 'Standard';
  const gender = safeUserData.gender || 'Not Specified';
  const address = safeUserData.address || 'Locator Data Missing';
  const birthdate = safeUserData.dob ? new Date(safeUserData.dob).toLocaleDateString() : 'Not Configured';
  const adharCard = safeUserData.adharCard || null;
  const bankDetails = safeUserData.bankDetails || null;
  const panCard = safeUserData.panCard || null;

  const initials = fullName ? fullName.split(' ').filter(Boolean).map(n => n[0]).join('').toUpperCase().substring(0, 2) || 'NA' : 'NA';

  const resetForm = () => {
    setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setStatus({ type: '', message: '' });
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setStatus({ type: '', message: '' });
    if (!passwords.currentPassword || !passwords.newPassword || !passwords.confirmPassword) {
      return setStatus({ type: 'error', message: 'All fields required.' });
    }
    if (passwords.newPassword !== passwords.confirmPassword) {
      return setStatus({ type: 'error', message: 'Passwords mismatch.' });
    }
    setLoading(true);
    const urls = ['/api/auth/update-password'];
    let success = false;
    for (const url of urls) {
      if (success) break;
      try {
        const response = await axios.put(url, { currentPassword: passwords.currentPassword, newPassword: passwords.newPassword }, { headers: { Authorization: `Bearer ${token}` }, timeout: 2000 });
        if (response.data) {
          setStatus({ type: 'success', message: 'Password updated successfully' });
          setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
          success = true;
        }
      } catch (err) {
        if (err.response) {
          setStatus({ type: 'error', message: err.response.data.message || 'Verification Failed' });
          success = true;
        }
      }
    }
    if (!success) setStatus({ type: 'error', message: 'Connection Error.' });
    setLoading(false);
  };

  const getImageUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http') || path.startsWith('data:')) return path;
    const normalized = path.replace(/\\/g, '/');
    return normalized.startsWith('/') ? normalized : `/${normalized}`;
  };

  return (
    <div style={{ fontFamily: "'Inter', -apple-system, sans-serif", background: '#f9fdfc', minHeight: 'calc(100vh - 56px)', color: '#3b3e3c', width: '100%', boxSizing: 'border-box' }}>
      <div style={{ width: '100%', maxWidth: '100%', padding: '32px 32px 60px', boxSizing: 'border-box' }}>
        
        {/* ALERTS */}
        {status.message && (
          <div style={{ marginBottom: 20, padding: 16, borderRadius: 12, border: status.type === 'success' ? '1px solid #10b981' : '1px solid #f87171', background: status.type === 'success' ? '#f0fdf4' : '#fef2f2', display: 'flex', flexDirection: 'column', gap: 4 }}>
            <h4 style={{ fontSize: 11, fontWeight: 900, textTransform: 'uppercase', tracking: 1, margin: 0, color: status.type === 'success' ? '#065f46' : '#991b1b' }}>
              {status.type === 'success' ? 'Protocol Verified' : 'Security Alert'}
            </h4>
            <p style={{ fontSize: 13, color: '#3b3e3c', margin: 0 }}>{status.message}</p>
          </div>
        )}

        {/* HEADER SECTION */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: '#2c302e', margin: 0, letterSpacing: '-0.5px' }}>My profile</h1>
            <p style={{ fontSize: 14, color: '#8c918f', margin: '4px 0 0' }}>Personal information.</p>
          </div>
        </div>

        {/* PROFILE METADATA GRID */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24, alignItems: 'start', marginBottom: 24 }}>
          
          {/* IDENTITY CARD */}
          <div className="verdant-card" style={{ textAlign: 'center', position: 'relative' }}>
            <p style={{ fontSize: 15, fontWeight: 700, color: '#3b3e3c', margin: '0 0 24px', textAlign: 'left' }}>Identity</p>
            
            <div style={{ display: 'inline-flex', position: 'relative', margin: '0 auto 16px' }}>
              <div style={{ width: 100, height: 100, borderRadius: '50%', background: '#00a76b', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, fontWeight: 800, overflow: 'hidden', boxShadow: '0 4px 10px rgba(0,167,107,0.1)' }}>
                {userData?.profileImage ? (
                  <img src={getImageUrl(userData.profileImage)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  initials
                )}
              </div>
            </div>

            <h3 style={{ fontSize: 18, fontWeight: 800, color: '#3b3e3c', margin: '0 0 4px' }}>{fullName}</h3>
            <p style={{ fontSize: 13, color: '#8c918f', margin: '0 0 2px', fontWeight: 600 }}>{userRole.toUpperCase()}</p>
            <p style={{ fontSize: 12, color: '#9ca3af', margin: 0, fontWeight: 600 }}>{userDept}</p>
          </div>

          {/* PERSONAL DETAILS CARD */}
          <div className="verdant-card">
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#3b3e3c', marginBottom: 24, marginTop: 0 }}>Personal details</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px 24px' }}>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#939084', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Full name</label>
                <input type="text" readOnly defaultValue={fullName} className="verdant-input" />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#939084', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email</label>
                <input type="email" readOnly defaultValue={userEmail} className="verdant-input" />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#939084', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Department</label>
                <input type="text" readOnly defaultValue={userDept} className="verdant-input" />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#939084', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Designation</label>
                <input type="text" readOnly defaultValue={userRole} className="verdant-input" />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#939084', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Phone</label>
                <input type="text" readOnly defaultValue={phone} className="verdant-input" />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#939084', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Location</label>
                <input type="text" readOnly defaultValue={address} className="verdant-input" />
              </div>

            </div>
          </div>

        </div>

        {/* VERIFIED DOCUMENTS VAULT */}
        <div className="verdant-card" style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: '#3b3e3c', marginBottom: 24, marginTop: 0 }}>Verified Documents Vault</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
            
            {/* Adharcard Display */}
            <div className="verdant-highlight-box" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, padding: 20 }}>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: 9, fontWeight: 900, textTransform: 'uppercase', tracking: 1, color: '#8c918f', margin: '0 0 4px' }}>National ID</p>
                <p style={{ fontSize: 14, fontWeight: 800, color: '#3b3e3c', margin: 0 }}>Adharcard</p>
              </div>
              {adharCard ? (
                <a href={getImageUrl(adharCard)} target="_blank" rel="noopener noreferrer" className="verdant-btn-primary"
                  style={{ fontSize: 12, padding: '8px 16px', height: 'auto' }}>
                  View Document
                </a>
              ) : (
                <span style={{ fontSize: 12, fontWeight: 700, color: '#8c918f', fontStyle: 'italic' }}>Not Registered</span>
              )}
            </div>

            {/* Bank Details Display */}
            <div className="verdant-highlight-box" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, padding: 20 }}>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: 9, fontWeight: 900, textTransform: 'uppercase', tracking: 1, color: '#8c918f', margin: '0 0 4px' }}>Financial ID</p>
                <p style={{ fontSize: 14, fontWeight: 800, color: '#3b3e3c', margin: 0 }}>Bank Details</p>
              </div>
              {bankDetails ? (
                <a href={getImageUrl(bankDetails)} target="_blank" rel="noopener noreferrer" className="verdant-btn-primary"
                  style={{ fontSize: 12, padding: '8px 16px', height: 'auto' }}>
                  View Document
                </a>
              ) : (
                <span style={{ fontSize: 12, fontWeight: 700, color: '#8c918f', fontStyle: 'italic' }}>Not Registered</span>
              )}
            </div>

            {/* PAN Card Display */}
            <div className="verdant-highlight-box" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, padding: 20 }}>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: 9, fontWeight: 900, textTransform: 'uppercase', tracking: 1, color: '#8c918f', margin: '0 0 4px' }}>Identity Node</p>
                <p style={{ fontSize: 14, fontWeight: 800, color: '#3b3e3c', margin: 0 }}>Pancard</p>
              </div>
              {panCard ? (
                <a href={getImageUrl(panCard)} target="_blank" rel="noopener noreferrer" className="verdant-btn-primary"
                  style={{ fontSize: 12, padding: '8px 16px', height: 'auto' }}>
                  View Document
                </a>
              ) : (
                <span style={{ fontSize: 12, fontWeight: 700, color: '#8c918f', fontStyle: 'italic' }}>Not Registered</span>
              )}
            </div>

          </div>
        </div>

        {/* SECURITY CHANGE PASSWORD */}
        <div className="verdant-card">
          <h3 style={{ fontSize: 15, fontWeight: 700, color: '#3b3e3c', marginBottom: 24, marginTop: 0 }}>Change Password</h3>
          
          <form onSubmit={handleUpdatePassword} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#939084', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Old Password</label>
                <input type="password" required value={passwords.currentPassword} onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })} className="verdant-input" />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#939084', textTransform: 'uppercase', letterSpacing: '0.05em' }}>New Password</label>
                <input type="password" required value={passwords.newPassword} onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })} className="verdant-input" />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#939084', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Confirm Password</label>
                <input type="password" required value={passwords.confirmPassword} onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })} className="verdant-input" />
              </div>

            </div>

            <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
              <button type="submit" disabled={loading} className="verdant-btn-primary">
                {loading ? 'Updating...' : 'Update Password'}
              </button>
              <button type="button" onClick={resetForm} className="verdant-btn-outline">
                Discard
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
};

export default Profile;
