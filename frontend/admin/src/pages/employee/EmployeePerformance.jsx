import React, { useState } from 'react';
import { 
  Target, Award, Star, TrendingUp, CheckCircle, Clock, 
  Download, Plus, Search, SlidersHorizontal, X 
} from 'lucide-react';

const EmployeePerformance = () => {
  const [goals, setGoals] = useState([
    { label: 'Ship design system v2', pct: 72, status: 'On track' },
    { label: 'Improve onboarding NPS to 70', pct: 48, status: 'At risk' },
    { label: 'Launch mobile app beta', pct: 90, status: 'On track' }
  ]);

  const [appraisals, setAppraisals] = useState([
    { period: 'Q1 Check-in 2026', reviewer: 'Sarah Chen (Manager)', score: '4.5 / 5.0', status: 'Completed', date: 'April 15, 2026' },
    { period: 'Annual Review 2025', reviewer: 'Sarah Chen (Manager)', score: '4.2 / 5.0', status: 'Archived', date: 'Dec 18, 2025' }
  ]);

  const [isSetGoalModalOpen, setIsSetGoalModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    label: '',
    pct: 50,
    status: 'On track'
  });

  const handleSetGoal = (e) => {
    e.preventDefault();
    if (!formData.label) return;
    setGoals(prev => [
      ...prev,
      {
        label: formData.label,
        pct: Number(formData.pct),
        status: formData.status
      }
    ]);
    setFormData({ label: '', pct: 50, status: 'On track' });
    setIsSetGoalModalOpen(false);
    alert('Performance target successfully initialized.');
  };

  const handleExport = () => {
    alert('Exporting performance matrix telemetry...');
  };

  const filteredGoals = goals.filter(g => 
    g.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    g.status.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ fontFamily: "'Inter', -apple-system, sans-serif", background: '#f9fdfc', minHeight: 'calc(100vh - 56px)', color: '#3b3e3c', width: '100%', boxSizing: 'border-box' }}>
      <div style={{ width: '100%', maxWidth: '100%', padding: '32px 32px 60px', boxSizing: 'border-box' }}>
        
        {/* HEADER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: '#2c302e', margin: 0, letterSpacing: '-0.5px' }}>
              Performance
            </h1>
            <p style={{ fontSize: 14, color: '#8c918f', margin: '4px 0 0' }}>Goals, KPIs and reviews.</p>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button onClick={handleExport} className="verdant-btn-outline" style={{ gap: 8, height: 44 }}>
              <Download size={16} /> Export
            </button>
            <button onClick={() => setIsSetGoalModalOpen(true)} className="verdant-btn-primary" style={{ gap: 8, height: 44 }}>
              <Plus size={16} /> Set goal
            </button>
          </div>
        </div>

        {/* SEARCH & FILTER */}
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
          <button className="verdant-btn-outline" style={{ gap: 8, height: 44 }}>
            <SlidersHorizontal size={16} /> Filters
          </button>
        </div>

        {/* METRICS GRID */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20, marginBottom: 32 }}>
          {/* Card 1: Active Goals */}
          <div className="verdant-card" style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#e6f7f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Target size={20} color="#00a76b" />
              </div>
            </div>
            <div>
              <h3 style={{ fontSize: 32, fontWeight: 800, color: '#2c302e', margin: '0 0 4px', lineHeight: 1 }}>{goals.length}</h3>
              <p style={{ fontSize: 13, color: '#8c918f', margin: 0, fontWeight: 600 }}>Active goals</p>
            </div>
          </div>

          {/* Card 2: Avg. Rating */}
          <div className="verdant-card" style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#e6f7f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Star size={20} color="#00a76b" />
              </div>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#00a76b', display: 'flex', alignItems: 'center', gap: 2 }}>
                ↗ 0.2%
              </span>
            </div>
            <div>
              <h3 style={{ fontSize: 32, fontWeight: 800, color: '#2c302e', margin: '0 0 4px', lineHeight: 1 }}>4.3</h3>
              <p style={{ fontSize: 13, color: '#8c918f', margin: 0, fontWeight: 600 }}>Avg. rating</p>
            </div>
          </div>

          {/* Card 3: Reviews Due */}
          <div className="verdant-card" style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Award size={20} color="#f97316" />
              </div>
            </div>
            <div>
              <h3 style={{ fontSize: 32, fontWeight: 800, color: '#2c302e', margin: '0 0 4px', lineHeight: 1 }}>8</h3>
              <p style={{ fontSize: 13, color: '#8c918f', margin: 0, fontWeight: 600 }}>Reviews due</p>
            </div>
          </div>

          {/* Card 4: Top Performer */}
          <div className="verdant-card" style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <TrendingUp size={20} color="#4f46e5" />
              </div>
            </div>
            <div>
              <h3 style={{ fontSize: 26, fontWeight: 800, color: '#2c302e', margin: '4px 0 4px', lineHeight: 1 }}>Mei C.</h3>
              <p style={{ fontSize: 13, color: '#8c918f', margin: 0, fontWeight: 600 }}>Top performer</p>
            </div>
          </div>
        </div>

        {/* GOALS PROGRESS */}
        <div className="verdant-card" style={{ marginBottom: 28 }}>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: '#2c302e', marginBottom: 24, marginTop: 0 }}>Goals progress</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {filteredGoals.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#8c918f', fontSize: 14, padding: '20px 0', margin: 0 }}>
                No active goals found.
              </p>
            ) : (
              filteredGoals.map((g, idx) => (
                <div key={idx}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, alignItems: 'flex-end' }}>
                    <div>
                      <span style={{ fontSize: 15, color: '#374151', fontWeight: 600, display: 'block' }}>{g.label}</span>
                      <span style={{ fontSize: 12, color: g.status.toLowerCase() === 'at risk' ? '#dc2626' : '#8c918f', fontWeight: 700 }}>
                        {g.status}
                      </span>
                    </div>
                    <span style={{ fontSize: 15, fontWeight: 800, color: '#00a76b' }}>{g.pct}%</span>
                  </div>
                  <div style={{ height: 8, borderRadius: 99, background: '#e2eae7', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${g.pct}%`, background: '#00a76b', borderRadius: 99, transition: 'width 0.8s ease' }} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* DETAILS SECTION: PULSE & MATRIX TABLE */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
          
          {/* AI COMPETENCY PULSE */}
          <div className="verdant-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: '#3b3e3c', marginBottom: 16, marginTop: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Award size={18} color="#00a76b" /> AI Competency Pulse
              </h3>
              <div className="verdant-highlight-box" style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
                  {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="#00a76b" color="#00a76b" />)}
                </div>
                <p style={{ fontSize: 13, color: '#3b3e3c', margin: 0, fontStyle: 'italic', lineHeight: 1.5 }}>
                  "Bhavik has demonstrated stellar capacity in optimizing system modules and ensuring high uptime during frontend integrations. Great execution cadence."
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#201515', color: '#fff', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>SC</div>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: '#3b3e3c', margin: 0 }}>Sarah Chen</p>
                  <p style={{ fontSize: 11, color: '#8c918f', margin: 0 }}>Engineering Director</p>
                </div>
              </div>
            </div>
          </div>

          {/* APPRAISALS TABLE */}
          <div className="verdant-card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: 20, borderBottom: '1px solid #e2eae7' }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: '#2c302e', margin: 0 }}>Cycle Appraisal Registry</h3>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #e2eae7' }}>
                    <th style={{ padding: '12px 20px', fontSize: 11, fontWeight: 800, color: '#8c918f', textTransform: 'uppercase' }}>Cycle</th>
                    <th style={{ padding: '12px 20px', fontSize: 11, fontWeight: 800, color: '#8c918f', textTransform: 'uppercase' }}>Score</th>
                    <th style={{ padding: '12px 20px', fontSize: 11, fontWeight: 800, color: '#8c918f', textTransform: 'uppercase' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {appraisals.map((a, i) => (
                    <tr key={i} style={{ borderBottom: i < appraisals.length - 1 ? '1px solid #e2eae7' : 'none', fontSize: 13 }} className="hover:bg-[#f9fdfc]">
                      <td style={{ padding: '14px 20px', fontWeight: 700, color: '#3b3e3c' }}>
                        <div>{a.period}</div>
                        <div style={{ fontSize: 11, color: '#8c918f', fontWeight: 500, marginTop: 2 }}>{a.reviewer}</div>
                      </td>
                      <td style={{ padding: '14px 20px', fontWeight: 800, color: '#00a76b', fontFamily: 'monospace' }}>{a.score}</td>
                      <td style={{ padding: '14px 20px' }}>
                        <span style={{
                          fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 99,
                          background: a.status === 'Completed' ? '#e6f7f0' : '#f3f4f6',
                          color: a.status === 'Completed' ? '#00a76b' : '#6b7280'
                        }}>
                          {a.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>

      {/* SET GOAL MODAL */}
      {isSetGoalModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(30, 32, 38, 0.4)', backdropFilter: 'blur(4px)' }}>
          <div className="verdant-card" style={{ width: '100%', maxWidth: 500, padding: 32, position: 'relative', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)' }}>
            <button onClick={() => setIsSetGoalModalOpen(false)} style={{ position: 'absolute', top: 20, right: 20, border: 'none', background: 'transparent', cursor: 'pointer', color: '#9ca3af' }}>
              <X size={20} />
            </button>
            <h3 style={{ fontSize: 20, fontWeight: 800, color: '#2c302e', margin: '0 0 24px' }}>Set Goal</h3>
            
            <form onSubmit={handleSetGoal} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#8c918f' }}>Goal Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Ship design system v2"
                  value={formData.label}
                  onChange={e => setFormData({...formData, label: e.target.value})}
                  className="verdant-input"
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#8c918f' }}>Target Percentage</label>
                  <span style={{ fontSize: 13, fontWeight: 800, color: '#00a76b' }}>{formData.pct}%</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="100"
                  value={formData.pct}
                  onChange={e => setFormData({...formData, pct: e.target.value})}
                  style={{ accentColor: '#00a76b', cursor: 'pointer' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#8c918f' }}>Health Status</label>
                <select 
                  value={formData.status}
                  onChange={e => setFormData({...formData, status: e.target.value})}
                  className="verdant-input"
                  style={{ appearance: 'none', cursor: 'pointer' }}
                >
                   <option value="On track">On track</option>
                   <option value="At risk">At risk</option>
                   <option value="Needs focus">Needs focus</option>
                </select>
              </div>

              <button type="submit" className="verdant-btn-primary" style={{ width: '100%', marginTop: 8 }}>
                 Set Performance Target
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeePerformance;
