import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
  Plug, Mail, Calendar, Slack, Video, Activity, Key, Link2,
  Settings, RefreshCw, CheckCircle, XCircle, Plus, Eye, EyeOff, Trash2
} from 'lucide-react';

export default function Integrations() {
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'));
  const [activeTab, setActiveTab] = useState('connectors'); // connectors, webhooks, apikeys

  // Integrations List State
  const [connectors, setConnectors] = useState([
    { id: 'smtp', name: 'Email (SMTP)', desc: 'Configure company-wide outgoing SMTP mail services', icon: Mail, type: 'Communication', connected: true, active: true },
    { id: 'google_cal', name: 'Google Calendar', desc: 'Sync interviews, birthdays, and leaves to Google Calendar', icon: Calendar, type: 'Calendar', connected: false, active: false },
    { id: 'outlook', name: 'Microsoft Outlook', desc: 'Sync organizational schedule with Outlook calendars', icon: Calendar, type: 'Calendar', connected: false, active: false },
    { id: 'slack', name: 'Slack Notifications', desc: 'Push real-time time track alerts to Slack channels', icon: Slack, type: 'Communication', connected: true, active: true },
    { id: 'zoom', name: 'Zoom Meetings', desc: 'Auto-create Zoom invite links for scheduled recruitment interviews', icon: Video, type: 'Video Conferencing', connected: false, active: false },
    { id: 'ms_teams', name: 'Microsoft Teams', desc: 'Sync interviews and onboarding events directly to Teams', icon: Video, type: 'Video Conferencing', connected: true, active: true },
    { id: 'payroll_sync', name: 'Payroll Ledger Integration', desc: 'Export payslips directly to external financial ledgers', icon: Activity, type: 'Finance', connected: false, active: false },
    { id: 'attendance_dev', name: 'Attendance Devices (RFID/Biometric)', desc: 'Import punch records directly from biometric attendance devices', icon: Plug, type: 'Hardware', connected: true, active: true }
  ]);

  // Webhooks State
  const [webhooks, setWebhooks] = useState([
    { id: '1', url: 'https://api.workforce-dossier.com/v1/webhook', events: ['employee.created', 'leave.approved'], status: 'Active' },
    { id: '2', url: 'https://integrations.financials.io/punch-hook', events: ['attendance.punch'], status: 'Inactive' }
  ]);
  const [newWebhook, setNewWebhook] = useState({ url: '', events: [] });

  // API Keys State
  const [apiKeys, setApiKeys] = useState([
    { id: '1', name: 'Production Electron Client', key: 'vrd_live_xxxxxxxxxxxxxxxx9912', created: '2026-06-12', revealed: false },
    { id: '2', name: 'Staging Dashboard Sync', key: 'vrd_test_xxxxxxxxxxxxxxxx8472', created: '2026-07-01', revealed: false }
  ]);
  const [newKeyName, setNewKeyName] = useState('');

  // Config modal state
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [selectedConnector, setSelectedConnector] = useState(null);

  // Sync state per connector
  const [syncingId, setSyncingId] = useState(null);

  // Track theme reactively
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const handleToggleActive = (id) => {
    setConnectors(connectors.map(c => {
      if (c.id === id) {
        const nextActive = !c.active;
        toast.success(`${c.name} integration ${nextActive ? 'enabled' : 'disabled'}`);
        return { ...c, active: nextActive, connected: nextActive ? true : c.connected };
      }
      return c;
    }));
  };

  const handleSyncNow = (id, name) => {
    setSyncingId(id);
    setTimeout(() => {
      setSyncingId(null);
      toast.success(`Successfully synchronized data with ${name}!`);
    }, 1500);
  };

  const handleOpenConfig = (connector) => {
    setSelectedConnector(connector);
    setShowConfigModal(true);
  };

  // Add webhook
  const handleAddWebhook = (e) => {
    e.preventDefault();
    if (!newWebhook.url) {
      toast.error('Webhook URL is required');
      return;
    }
    const created = {
      id: String(webhooks.length + 1),
      url: newWebhook.url,
      events: newWebhook.events.length > 0 ? newWebhook.events : ['all'],
      status: 'Active'
    };
    setWebhooks([...webhooks, created]);
    setNewWebhook({ url: '', events: [] });
    toast.success('Webhook target registered successfully!');
  };

  // Generate API key
  const handleGenerateKey = (e) => {
    e.preventDefault();
    if (!newKeyName) {
      toast.error('Key Name is required');
      return;
    }
    const randomHex = Array.from({ length: 24 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    const created = {
      id: String(apiKeys.length + 1),
      name: newKeyName,
      key: `vrd_live_${randomHex.substring(0, 16)}${Math.floor(1000 + Math.random() * 9000)}`,
      created: new Date().toISOString().split('T')[0],
      revealed: true
    };
    setApiKeys([...apiKeys, created]);
    setNewKeyName('');
    toast.success('API Access Token generated!');
  };

  return (
    <div className="space-y-8 pb-24">
      {/* ─── FILTERS HEADER ───────────────────────────────── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-[#0c1512] border border-[#e2eae7] dark:border-[#13221e] rounded-[24px] p-6 shadow-sm">
        <div>
          <h2 className="text-[20px] font-extrabold text-slate-800 dark:text-white tracking-tight flex items-center gap-2">
            <Plug className="text-[#00a76b]" size={24} />
            System Integrations Manager
          </h2>
          <p className="text-xs text-slate-400 dark:text-[#829e92] font-semibold mt-1">Connect third-party productivity portals, manage live webhooks, and allocate API access tokens.</p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-2">
          {[
            { id: 'connectors', label: 'Connectors' },
            { id: 'webhooks', label: 'Webhooks' },
            { id: 'apikeys', label: 'API Credentials' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-[#00a76b] text-white'
                  : 'bg-white dark:bg-[#111c18] text-slate-400 border border-slate-200 dark:border-slate-800 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ─── TAB 1: INTEGRATION CONNECTORS ─────────────────── */}
      {activeTab === 'connectors' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {connectors.map((c, i) => {
            const Icon = c.icon;
            const isSyncing = syncingId === c.id;
            return (
              <div 
                key={i}
                className="bg-white dark:bg-[#0c1512] border border-[#e2eae7] dark:border-[#13221e] rounded-[24px] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.01)] hover:shadow-md transition-shadow flex flex-col justify-between h-[230px]"
              >
                <div>
                  <div className="flex justify-between items-start">
                    <div className="w-10 h-10 rounded-full bg-slate-50 dark:bg-[#111c18] flex items-center justify-center text-slate-600 dark:text-[#829e92] shrink-0">
                      <Icon size={20} />
                    </div>
                    
                    {/* Toggle Switch */}
                    <button
                      onClick={() => handleToggleActive(c.id)}
                      className={`w-10 h-5 rounded-full transition-colors relative border-none cursor-pointer p-0.5 flex ${
                        c.active ? 'bg-[#00a76b] justify-end' : 'bg-slate-200 dark:bg-slate-850 justify-start'
                      }`}
                    >
                      <span className="w-4 h-4 bg-white rounded-full shadow-sm"></span>
                    </button>
                  </div>

                  <h3 className="text-xs font-black text-slate-800 dark:text-white mt-4">{c.name}</h3>
                  <p className="text-[11px] text-slate-400 mt-2 font-semibold leading-normal line-clamp-2">{c.desc}</p>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-slate-50 dark:border-slate-900">
                  <div className="flex items-center gap-1.5">
                    {c.active ? (
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                    ) : (
                      <span className="w-1.5 h-1.5 bg-red-400 rounded-full"></span>
                    )}
                    <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">
                      {c.active ? 'Connected' : 'Disabled'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenConfig(c)}
                      className="p-1.5 hover:text-[#00a76b] rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent text-slate-400 cursor-pointer"
                      title="Configuration Settings"
                    >
                      <Settings size={13} />
                    </button>
                    {c.active && (
                      <button
                        onClick={() => handleSyncNow(c.id, c.name)}
                        disabled={isSyncing}
                        className="p-1.5 hover:text-[#00a76b] rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent text-slate-400 cursor-pointer disabled:opacity-40"
                        title="Sync Now"
                      >
                        <RefreshCw size={13} className={isSyncing ? 'animate-spin text-[#00a76b]' : ''} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ─── TAB 2: WEBHOOK CONNECTIONS ────────────────────── */}
      {activeTab === 'webhooks' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Webhook Register Panel */}
          <div className="lg:col-span-4 bg-white dark:bg-[#0c1512] border border-[#e2eae7] dark:border-[#13221e] rounded-[24px] p-6 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider mb-2">Register Webhook</h3>
              <p className="text-[10px] text-slate-400 font-semibold mb-6">Forward live check-ins and approvals to custom servers.</p>
              
              <form onSubmit={handleAddWebhook} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-400 font-bold uppercase mb-1.5">Destination URL</label>
                  <input
                    type="url"
                    required
                    placeholder="https://api.yourdomain.com/v1/punch"
                    value={newWebhook.url}
                    onChange={(e) => setNewWebhook({ ...newWebhook, url: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-[#111c18] border border-slate-200 dark:border-[#1a2d29] rounded-xl focus:outline-none focus:border-[#00a76b]"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-bold uppercase mb-1.5">Triggers (Comma separated)</label>
                  <input
                    type="text"
                    placeholder="employee.created, attendance.punch"
                    onChange={(e) => setNewWebhook({ ...newWebhook, events: e.target.value.split(',').map(ev => ev.trim()) })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-[#111c18] border border-slate-200 dark:border-[#1a2d29] rounded-xl focus:outline-none focus:border-[#00a76b]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-[#00a76b] hover:bg-[#00915c] text-white rounded-full font-bold cursor-pointer border-none shadow-sm flex items-center justify-center gap-1.5"
                >
                  <Plus size={14} />
                  <span>Register Hook</span>
                </button>
              </form>
            </div>
          </div>

          {/* Webhooks List */}
          <div className="lg:col-span-8 bg-white dark:bg-[#0c1512] border border-[#e2eae7] dark:border-[#13221e] rounded-[24px] p-6 shadow-sm">
            <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider mb-6">Registered Destinations</h3>
            
            <div className="space-y-4">
              {webhooks.map((w, i) => (
                <div 
                  key={i} 
                  className="p-4 border border-[#eceae3] dark:border-[#1a2d29] rounded-xl bg-slate-50/30 dark:bg-[#111c18]/20 flex justify-between items-center gap-4"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-800 dark:text-white truncate">{w.url}</p>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {w.events.map((ev, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-[#00a76b]/10 text-[#00a76b] text-[8px] font-black rounded uppercase">
                          {ev}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase ${
                      w.status === 'Active' ? 'bg-green-100 text-green-700 dark:bg-green-950/20' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {w.status}
                    </span>

                    <button
                      onClick={() => {
                        setWebhooks(webhooks.filter(x => x.id !== w.id));
                        toast.success('Webhook unsubscribed');
                      }}
                      className="p-2 text-slate-400 hover:text-red-500 bg-transparent border-none cursor-pointer"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 3: API KEYS CREDENTIALS ───────────────────── */}
      {activeTab === 'apikeys' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Key Generator */}
          <div className="lg:col-span-4 bg-white dark:bg-[#0c1512] border border-[#e2eae7] dark:border-[#13221e] rounded-[24px] p-6 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider mb-2">Create API Credential</h3>
              <p className="text-[10px] text-slate-400 font-semibold mb-6">Allocate authentication tokens for hardware clocks and scripts.</p>
              
              <form onSubmit={handleGenerateKey} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-400 font-bold uppercase mb-1.5">Credential Label</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Headquarters Biometric Puncher"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-[#111c18] border border-slate-200 dark:border-[#1a2d29] rounded-xl focus:outline-none focus:border-[#00a76b]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-[#00a76b] hover:bg-[#00915c] text-white rounded-full font-bold cursor-pointer border-none shadow-sm flex items-center justify-center gap-1.5"
                >
                  <Key size={14} />
                  <span>Generate Key</span>
                </button>
              </form>
            </div>
          </div>

          {/* Keys List */}
          <div className="lg:col-span-8 bg-white dark:bg-[#0c1512] border border-[#e2eae7] dark:border-[#13221e] rounded-[24px] p-6 shadow-sm">
            <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider mb-6">Active Security Keys</h3>
            
            <div className="space-y-4">
              {apiKeys.map((k, i) => (
                <div 
                  key={i} 
                  className="p-4 border border-[#eceae3] dark:border-[#1a2d29] rounded-xl bg-slate-50/30 dark:bg-[#111c18]/20 flex justify-between items-center gap-4 text-xs"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-black text-slate-700 dark:text-white">{k.name}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">Generated: {k.created}</p>
                    <div className="flex items-center gap-2 mt-2 bg-slate-100 dark:bg-[#162722] p-2 rounded-lg font-mono text-[11px] text-slate-500 select-all border border-slate-200 dark:border-transparent">
                      <span>{k.revealed ? k.key : 'vrd_live_xxxxxxxxxxxxxxxx' + k.key.substring(24)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => {
                        setApiKeys(apiKeys.map(key => key.id === k.id ? { ...key, revealed: !key.revealed } : key));
                      }}
                      className="p-2 hover:text-[#00a76b] text-slate-400 bg-transparent border-none cursor-pointer"
                    >
                      {k.revealed ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                    <button
                      onClick={() => {
                        setApiKeys(apiKeys.filter(x => x.id !== k.id));
                        toast.success('API Key revoked');
                      }}
                      className="p-2 hover:text-red-500 text-slate-400 bg-transparent border-none cursor-pointer"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL: CONFIGURATION EDIT ─────────────────────── */}
      {showConfigModal && selectedConnector && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#0c1512] border border-[#e2eae7] dark:border-[#13221e] rounded-[24px] w-full max-w-md p-6 shadow-[0_20px_50px_rgba(0,0,0,0.15)] animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center pb-4 mb-4 border-b border-[#eceae3] dark:border-[#1a2d29]">
              <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wider">Configure {selectedConnector.name}</h3>
              <button onClick={() => setShowConfigModal(false)} className="text-slate-400 hover:text-slate-600 bg-transparent border-none cursor-pointer">✕</button>
            </div>
            
            <form onSubmit={(e) => { e.preventDefault(); setShowConfigModal(false); toast.success('Settings synchronized locally'); }} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-bold uppercase mb-1.5">Integration Host / Endpoint</label>
                <input
                  type="text"
                  required
                  defaultValue={selectedConnector.id.includes('cal') ? 'https://google-sync.fluidhr.com' : 'smtp.gmail.com'}
                  className="w-full p-2.5 bg-slate-50 dark:bg-[#111c18] border border-slate-200 dark:border-[#1a2d29] rounded-xl focus:outline-none focus:border-[#00a76b]"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold uppercase mb-1.5">API Token / Secret Key</label>
                <input
                  type="password"
                  required
                  defaultValue="xxxxxxxxxxxxxxxxxxxxx"
                  className="w-full p-2.5 bg-slate-50 dark:bg-[#111c18] border border-slate-200 dark:border-[#1a2d29] rounded-xl focus:outline-none focus:border-[#00a76b]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowConfigModal(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-[#1a2d29] hover:bg-slate-50 rounded-full font-bold bg-transparent cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#00a76b] hover:bg-[#00915c] text-white rounded-full font-bold cursor-pointer border-none"
                >
                  Save Configuration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
