import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL, getImageUrl } from '@shared/services/api';
import { FileText, Download, Upload, Trash2, Check, RefreshCw, Search, X, Plus } from 'lucide-react';
import { toast } from 'react-hot-toast';

const EmployeeDocuments = () => {
  const [dossierFiles, setDossierFiles] = useState([
    { id: 1, name: 'Offer letter.pdf', size: '182 KB', date: 'Mar 14, 2022', type: 'offer_letter', dummy: true },
    { id: 2, name: 'Employment contract.pdf', size: '254 KB', date: 'Mar 14, 2022', type: 'contract', dummy: true },
    { id: 3, name: 'ID Verification.pdf', size: '98 KB', date: 'Mar 16, 2022', type: 'id_proof', dummy: true },
    { id: 4, name: 'Tax form W-4.pdf', size: '64 KB', date: 'Jan 5, 2026', type: 'tax_form', dummy: true }
  ]);
  const [userData, setUserData] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
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
        const u = response.data;
        
        const fetchedFiles = [
          { 
            id: 'adharCard', 
            name: u.adharCard ? 'Adhar Card Document' : 'Adhar Card (Missing)', 
            size: u.adharCard ? 'Uploaded' : '--', 
            date: u.adharCard ? 'Verified' : 'Pending', 
            type: 'adharCard', 
            url: u.adharCard 
          },
          { 
            id: 'bankDetails', 
            name: u.bankDetails ? 'Bank Details Document' : 'Bank Details (Missing)', 
            size: u.bankDetails ? 'Uploaded' : '--', 
            date: u.bankDetails ? 'Verified' : 'Pending', 
            type: 'bankDetails', 
            url: u.bankDetails 
          },
          { 
            id: 'panCard', 
            name: u.panCard ? 'PAN Card Document' : 'PAN Card (Missing)', 
            size: u.panCard ? 'Uploaded' : '--', 
            date: u.panCard ? 'Verified' : 'Pending', 
            type: 'panCard', 
            url: u.panCard 
          }
        ];

        setDossierFiles(prev => {
          const dummies = prev.filter(f => f.dummy || (!['adharCard', 'bankDetails', 'panCard'].includes(f.type)));
          return [...dummies, ...fetchedFiles];
        });
      }
    } catch (err) {
      console.warn('Sync failed.', err);
    }
  };

  useEffect(() => {
    if (token) fetchProfile();
  }, [token]);

  const handleRealUpload = async (e, fieldName) => {
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
        
        toast.success(`Document updated successfully`, {
          style: { background: '#24a148', color: '#fff', fontWeight: 'bold' }
        });
        
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


  const triggerDownload = (fileName, url) => {
    if (url) {
      window.open(getImageUrl(url), '_blank');
      return;
    }
    const cleanName = fileName.replace(/\.pdf$/i, '').replace(/_/g, ' ');
    const contentStream = `BT\n/F1 18 Tf\n50 720 Td\n(${cleanName}) Tj\n/F1 12 Tf\n0 -30 Td\n(FluidHR Document Verification Registry) Tj\n0 -20 Td\n(File Ref: ${fileName}) Tj\n0 -20 Td\n(Verification Date: ${new Date().toLocaleDateString()}) Tj\n0 -40 Td\n(This is a system-generated document showing verified employee records.) Tj\n0 -20 Td\n(All rights reserved by FluidHR Workforce OS.) Tj\nET`;
    const streamLength = contentStream.length;
    const pdfString = `%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>\nendobj\n4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n5 0 obj\n<< /Length ${streamLength} >>\nstream\n${contentStream}\nendstream\nendobj\nxref\n0 6\n0000000000 65535 f\n0000000009 00000 n\n0000000056 00000 n\n0000000111 00000 n\n0000000212 00000 n\n0000000289 00000 n\ntrailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${307 + streamLength}\n%%EOF`;

    const blob = new Blob([pdfString], { type: "application/pdf" });
    const dummyUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = dummyUrl;
    link.download = fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => {
      URL.revokeObjectURL(dummyUrl);
    }, 1000);
  };

  const handleDummyUpload = (e) => {
    e.preventDefault();
    if (!e.target.files?.[0]) return;
    setUploading(true);
    const fileName = e.target.files[0].name;
    const fileSize = `${Math.round(e.target.files[0].size / 1024)} KB`;
    setTimeout(() => {
      setUploading(false);
      setUploadSuccess(true);
      setDossierFiles(prev => [
        ...prev,
        {
          id: Date.now(),
          name: fileName,
          size: fileSize,
          date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          type: 'other',
          dummy: true
        }
      ]);
      setTimeout(() => {
        setUploadSuccess(false);
        setIsUploadModalOpen(false);
      }, 2000);
    }, 1500);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to remove this document from your dossier?')) {
      setDossierFiles(prev => prev.filter(f => f.id !== id));
    }
  };

  const policies = [
    { name: 'FluidHR Employee Handbook 2026', desc: 'Core guidelines, code of conduct, and organizational rules.', file: 'Handbook_2026.pdf', size: '2.4 MB' },
    { name: 'Leave & Attendance Policy v3.2', desc: 'Rules governing leaves, holidays, time-tracking, and approvals.', file: 'Leave_Policy.pdf', size: '1.1 MB' },
    { name: 'IT Security & Acceptable Use Policy', desc: 'Required compliance standards for access protocols and hardware usage.', file: 'IT_Policy.pdf', size: '950 KB' },
    { name: 'Prevention of Sexual Harassment (POSH)', desc: 'Security protocols, conduct standards, and reporting directives.', file: 'POSH_Policy.pdf', size: '1.5 MB' }
  ];

  const filteredDossier = dossierFiles.filter(f => 
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredPolicies = policies.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleExport = () => {
    alert('Exporting dossier metadata registry...');
  };

  return (
    <div style={{ fontFamily: "'Inter', -apple-system, sans-serif", background: '#f9fdfc', minHeight: 'calc(100vh - 56px)', color: '#3b3e3c', width: '100%', boxSizing: 'border-box' }}>
      <div style={{ width: '100%', maxWidth: '100%', padding: '32px 32px 60px', boxSizing: 'border-box' }}>
        
        {/* HEADER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: '#2c302e', margin: 0, letterSpacing: '-0.5px' }}>
              My documents
            </h1>
            <p style={{ fontSize: 14, color: '#8c918f', margin: '4px 0 0' }}>Personal files shared with HR.</p>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button onClick={handleExport} className="verdant-btn-outline" style={{ gap: 8, height: 44 }}>
              <Download size={16} /> Export
            </button>
            <button onClick={() => setIsUploadModalOpen(true)} className="verdant-btn-primary" style={{ gap: 8, height: 44 }}>
              <Plus size={16} /> Upload Generic
            </button>
          </div>
        </div>

        {/* SEARCH BAR */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={18} color="#9ca3af" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="text" 
              placeholder="Search..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="verdant-input"
              style={{ paddingLeft: 46 }}
            />
          </div>
        </div>

        {/* FILES CARD */}
        <div className="verdant-card" style={{ padding: 0, overflow: 'hidden', marginBottom: 28 }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2eae7' }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: '#2c302e', margin: 0 }}>Files</h3>
          </div>

          {filteredDossier.length === 0 ? (
            <p style={{ padding: '40px 24px', textAlign: 'center', color: '#8c918f', fontSize: 14, margin: 0 }}>
              No dossier files found.
            </p>
          ) : (
            filteredDossier.map((file, idx) => (
              <div 
                key={file.id || idx} 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between', 
                  padding: '16px 24px', 
                  borderBottom: idx === filteredDossier.length - 1 ? 'none' : '1px solid #e2eae7', 
                  transition: 'background 0.2s' 
                }} 
                className="hover:bg-[#f9fdfc]"
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#e6f7f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {uploadingField === file.type ? <RefreshCw size={20} className="animate-spin text-[#00a76b]" /> : <FileText size={20} color={file.url ? "#00a76b" : "#8c918f"} />}
                  </div>
                  <div>
                    <h4 style={{ fontSize: 15, fontWeight: 700, color: '#3b3e3c', margin: '0 0 4px' }}>
                      {file.name}
                      {file.url && <span style={{ marginLeft: 8, fontSize: 10, background: '#00a76b', color: 'white', padding: '2px 6px', borderRadius: 10 }}>Uploaded</span>}
                    </h4>
                    <p style={{ fontSize: 13, color: '#8c918f', margin: 0 }}>
                      {file.size} • {file.date}
                    </p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  {/* Download button for all files */}
                  {(file.dummy || file.url) && (
                    <button 
                      onClick={() => triggerDownload(file.name, file.url)}
                      className="verdant-btn-outline" 
                      style={{ gap: 6, height: 36, padding: '0 16px', fontSize: 12 }}
                    >
                      <Download size={14} /> Download
                    </button>
                  )}
                  
                  {/* Replace/Upload button for actual backend documents */}
                  {['adharCard', 'bankDetails', 'panCard'].includes(file.type) && (
                    <label className="verdant-btn-outline" style={{ display: 'flex', alignItems: 'center', gap: 6, height: 36, padding: '0 16px', fontSize: 12, cursor: 'pointer', margin: 0 }}>
                      <Upload size={14} /> {file.url ? 'Replace' : 'Upload'}
                      <input 
                        type="file" 
                        className="hidden" 
                        accept=".jpg,.jpeg,.png,image/jpeg,image/png,application/pdf" 
                        onChange={(e) => handleRealUpload(e, file.type)}
                        disabled={uploadingField === file.type}
                      />
                    </label>
                  )}

                  {/* Option to delete user-added dummy dossier files */}
                  {file.dummy && file.id > 4 && (
                    <button 
                      onClick={() => handleDelete(file.id)}
                      className="verdant-btn-outline" 
                      style={{ height: 36, width: 36, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', borderColor: '#f87171', color: '#ef4444' }}
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* POLICIES CARD */}
        <div className="verdant-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2eae7' }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: '#2c302e', margin: 0 }}>Company Policies</h3>
          </div>

          {filteredPolicies.length === 0 ? (
            <p style={{ padding: '40px 24px', textAlign: 'center', color: '#8c918f', fontSize: 14, margin: 0 }}>
              No policies found.
            </p>
          ) : (
            filteredPolicies.map((p, idx) => (
              <div 
                key={idx} 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between', 
                  padding: '16px 24px', 
                  borderBottom: idx === filteredPolicies.length - 1 ? 'none' : '1px solid #e2eae7', 
                  transition: 'background 0.2s' 
                }} 
                className="hover:bg-[#f9fdfc]"
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#e6f7f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FileText size={20} color="#00a76b" />
                  </div>
                  <div>
                    <h4 style={{ fontSize: 15, fontWeight: 700, color: '#3b3e3c', margin: '0 0 4px' }}>{p.name}</h4>
                    <p style={{ fontSize: 13, color: '#8c918f', margin: 0 }}>
                      {p.desc} • {p.size}
                    </p>
                  </div>
                </div>
                <div>
                  <button 
                    onClick={() => triggerDownload(p.file, null)}
                    className="verdant-btn-outline" 
                    style={{ gap: 6, height: 36, padding: '0 16px', fontSize: 12 }}
                  >
                    <Download size={14} /> Download
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

      </div>

      {/* DUMMY UPLOAD MODAL */}
      {isUploadModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(30, 32, 38, 0.4)', backdropFilter: 'blur(4px)' }}>
          <div className="verdant-card" style={{ width: '100%', maxWidth: 500, padding: 32, position: 'relative', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)' }}>
            <button onClick={() => setIsUploadModalOpen(false)} style={{ position: 'absolute', top: 20, right: 20, border: 'none', background: 'transparent', cursor: 'pointer', color: '#9ca3af' }}>
              <X size={20} />
            </button>
            <h3 style={{ fontSize: 20, fontWeight: 800, color: '#2c302e', margin: '0 0 24px' }}>Upload Dossier Document</h3>
            
            <div className="verdant-highlight-box" style={{ borderStyle: 'dashed', borderWidth: '2px', borderColor: '#00a76b', textAlign: 'center', position: 'relative', cursor: 'pointer', padding: '32px 16px' }}>
              <input type="file" onChange={handleDummyUpload} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }} disabled={uploading} />
              {uploading ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                  <RefreshCw size={24} className="animate-spin text-[#00a76b]" />
                  <p style={{ fontSize: 13, fontWeight: 700, color: '#3b3e3c', margin: 0 }}>Securing document connection...</p>
                </div>
              ) : uploadSuccess ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#e6f7f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Check size={16} color="#00a76b" />
                  </div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: '#00a76b', margin: 0 }}>Dossier updated successfully!</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                  <Upload size={24} color="#00a76b" />
                  <p style={{ fontSize: 13, fontWeight: 700, color: '#3b3e3c', margin: 0 }}>Drag file here or click to browse</p>
                  <p style={{ fontSize: 11, color: '#8c918f', margin: 0 }}>PDF, DOCX, or PNG formats up to 10MB</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeDocuments;
