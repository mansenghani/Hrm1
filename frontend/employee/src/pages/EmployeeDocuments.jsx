import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL, getImageUrl } from '@shared/services/api';
import { FileText, UploadCloud, RefreshCw, CheckCircle, AlertTriangle } from 'lucide-react';
import { toast } from 'react-hot-toast';

const EmployeeDocuments = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploadingField, setUploadingField] = useState(null);

  const token = sessionStorage.getItem('token');

  const fetchProfile = async () => {
    try {
      const timestamp = new Date().getTime();
      const response = await axios.get(`/api/auth/me?t=${timestamp}`, {
        headers: { Authorization: `Bearer ${token}`, 'Cache-Control': 'no-cache' }
      });
      if (response.data) {
        setUserData(response.data);
      }
    } catch (err) {
      console.warn('Sync failed.', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchProfile();
  }, [token]);

  const handleDocumentChange = async (e, fieldName) => {
    const file = e.target.files[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      toast.error('Invalid format. Please upload JPG, PNG, or PDF.', {
        style: { background: '#ff4f00', color: '#fff', fontWeight: 'bold' }
      });
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        setUploadingField(fieldName);
        
        let endpoint = '';
        if (fieldName === 'adharCard') endpoint = `/api/employees/${userData.employeeRecordId}/adhar-card`;
        if (fieldName === 'bankDetails') endpoint = `/api/employees/${userData.employeeRecordId}/bank-details`;
        if (fieldName === 'panCard') endpoint = `/api/employees/${userData.employeeRecordId}/pan-card`;

        await axios.post(endpoint, { document: reader.result }, {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
        });
        
        toast.success(`${fieldName} updated successfully`, {
          style: { background: '#24a148', color: '#fff', fontWeight: 'bold' }
        });
        
        // Refresh data to show new image
        await fetchProfile();
      } catch (err) {
        toast.error('Verification Failed', {
           style: { background: '#ff4f00', color: '#fff', fontWeight: 'bold' }
        });
        console.error('Upload Error:', err);
      } finally {
        setUploadingField(null);
      }
    };
    reader.readAsDataURL(file);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <RefreshCw size={32} className="animate-spin text-[#00a76b]" />
        <p className="text-[11px] font-bold uppercase tracking-widest text-[#9ca3af]">Syncing Identity Vault...</p>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <AlertTriangle size={32} className="text-[#ff4f00]" />
        <p className="text-[13px] font-bold text-[#3b3e3c]">Failed to load identity records.</p>
      </div>
    );
  }

  const { adharCard, bankDetails, panCard } = userData;

  const renderDocumentBox = (title, field, currentValue, icon) => {
    const isPdf = currentValue && (currentValue.toLowerCase().endsWith('.pdf') || currentValue.startsWith('data:application/pdf'));

    return (
      <div className="bg-white rounded-xl border border-[#eceae3] p-6 shadow-sm flex flex-col justify-between h-full hover:border-[#00a76b] transition-all">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div 
              className={`w-14 h-14 rounded-lg flex items-center justify-center overflow-hidden border border-[#eceae3] transition-all shrink-0 ${currentValue ? 'bg-white cursor-pointer hover:scale-105 active:scale-95 shadow-sm' : 'bg-[#f9fdfc] text-[#8c918f]'}`}
              onClick={() => currentValue && window.open(getImageUrl(currentValue), '_blank')}
            >
              {currentValue ? (
                isPdf ? (
                  <div className="flex flex-col items-center justify-center text-red-500">
                    <span className="font-black text-[10px] uppercase">PDF</span>
                  </div>
                ) : (
                  <img src={getImageUrl(currentValue)} alt={title} className="w-full h-full object-cover" />
                )
              ) : (
                icon
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[15px] font-bold text-[#2c302e] mb-0.5">{title}</p>
              {!currentValue && <p className="text-[11px] text-[#8c918f] leading-tight">Missing document</p>}
            </div>
          </div>
          {currentValue && <span className="text-[10px] font-black text-[#00a76b] uppercase tracking-widest bg-[#00a76b]/10 px-2 py-1 rounded-[4px]">Ready</span>}
        </div>
        
        <label className="w-full h-10 bg-[#f9fdfc] hover:bg-[#00a76b] hover:text-white border border-[#eceae3] hover:border-[#00a76b] text-[#2c302e] rounded-lg text-[12px] font-bold uppercase tracking-widest cursor-pointer flex items-center justify-center gap-2 transition-all active:scale-[0.98]">
          {uploadingField === field ? (
             <RefreshCw size={14} className="animate-spin" />
          ) : (
             <UploadCloud size={14} />
          )}
          {uploadingField === field ? 'Uploading...' : (currentValue ? 'Replace Document' : 'Upload Document')}
          <input 
            type="file" 
            className="hidden" 
            accept=".jpg,.jpeg,.png,image/jpeg,image/png,application/pdf" 
            onChange={(e) => handleDocumentChange(e, field)}
            disabled={uploadingField === field}
          />
        </label>
      </div>
    );
  };

  return (
    <div className="p-8 pb-32 animate-fade-in max-w-6xl mx-auto">
      <div className="mb-10">
        <h1 className="text-3xl font-extrabold text-[#2c302e] tracking-tight">Identity Vault</h1>
        <p className="text-sm font-medium text-[#8c918f] mt-2">Manage your verified credentials and institutional records.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {renderDocumentBox('Adharcard Registry', 'adharCard', adharCard, <FileText size={24} />)}
        {renderDocumentBox('Bank Details', 'bankDetails', bankDetails, <span className="material-symbols-outlined text-[24px]">credit_card</span>)}
        {renderDocumentBox('PAN Card', 'panCard', panCard, <span className="material-symbols-outlined text-[24px]">badge</span>)}
      </div>

      <div className="mt-8 p-4 bg-[#f9fdfc] rounded-xl border border-[#eceae3] flex items-center gap-4">
         <AlertTriangle size={20} className="text-[#00a76b]" />
         <p className="text-[13px] font-medium text-[#8c918f]">
           Replacing a document will overwrite your existing record immediately. Ensure documents are clear and readable.
         </p>
      </div>
    </div>
  );
};

export default EmployeeDocuments;
