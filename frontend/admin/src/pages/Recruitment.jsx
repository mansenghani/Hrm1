import React, { useState } from 'react';
import {
  Briefcase,
  Users,
  Clock,
  CheckCircle2,
  Search,
  Filter,
  Plus,
  Download
} from 'lucide-react';

const METRICS = [
  { label: 'Open jobs', value: 14, icon: Briefcase, color: '#00a76b', bg: 'rgba(0,167,107,0.08)' },
  { label: 'Active candidates', value: 143, icon: Users, color: '#2563eb', bg: 'rgba(37,99,235,0.08)', trend: '↑ 9%', isPositive: true },
  { label: 'Avg. time to hire', value: '22d', icon: Clock, color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', trend: '↘ 3%', isPositive: false },
  { label: 'Hires this month', value: 6, icon: CheckCircle2, color: '#10b981', bg: 'rgba(16,185,129,0.08)', trend: '↑ 20%', isPositive: true }
];

const PIPELINE_STAGES = [
  { label: 'Sourced', count: 84, progress: 84 },
  { label: 'Screening', count: 32, progress: 32 },
  { label: 'Interview', count: 18, progress: 18 },
  { label: 'Offer', count: 6, progress: 6 },
  { label: 'Hired', count: 3, progress: 3 }
];

const Recruitment = () => {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="animate-fade-in max-w-[1440px] mx-auto space-y-8 pb-32">
      {/* 1. Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end border-b border-[#e2eae7] dark:border-[#1a2d29] pb-8 gap-4">
        <div>
          <h1 className="text-[28px] font-bold tracking-tight text-slate-900 dark:text-white leading-none">Recruitment</h1>
          <p className="text-sm text-slate-500 dark:text-[#a3b3af] mt-2 font-medium">Pipeline, openings and candidates.</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 border border-[#dcdbd3] dark:border-[#1a2d29] bg-white dark:bg-[#111c18] hover:bg-[#eceae3]/50 dark:hover:bg-slate-800/50 text-[#5c5f5d] dark:text-[#cbd5e1] font-bold text-xs rounded-full cursor-pointer transition-all flex items-center gap-1.5">
            <Download size={14} />
            <span>Export</span>
          </button>
          <button className="px-4 py-2 bg-[#00a76b] hover:bg-[#00915c] text-white font-bold text-xs rounded-full cursor-pointer transition-all flex items-center gap-1.5 shadow-sm border-none">
            <Plus size={14} />
            <span>New job</span>
          </button>
        </div>
      </div>

      {/* 2. Search & Filter Bar */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-white dark:bg-[#111c18] border border-[#e2eae7] dark:border-[#1a2d29] rounded-full text-sm font-semibold text-slate-700 dark:text-[#a3b3af] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00a76b]/20 focus:bg-white dark:focus:bg-[#162722] transition-all"
          />
        </div>
        <button className="px-5 py-2.5 border border-[#dcdbd3] dark:border-[#1a2d29] bg-white dark:bg-[#111c18] hover:bg-[#eceae3]/50 dark:hover:bg-slate-800/50 text-[#5c5f5d] dark:text-[#cbd5e1] font-bold text-xs rounded-full cursor-pointer transition-all flex items-center gap-1.5">
          <Filter size={14} />
          <span>Filters</span>
        </button>
      </div>

      {/* 3. KPI Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {METRICS.map((metric, i) => {
          const Icon = metric.icon;
          return (
            <div
              key={i}
              className="bg-white dark:bg-[#111c18] border border-[#e2eae7] dark:border-[#1a2d29] rounded-[24px] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex flex-col justify-between h-[140px] transition-all"
            >
              <div className="flex justify-between items-start">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: metric.bg, color: metric.color }}
                >
                  <Icon size={18} />
                </div>
                {metric.trend && (
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                      metric.isPositive
                        ? 'bg-[#e6f6f0] text-[#00a76b] dark:bg-[#0e271f] dark:text-[#00c285]'
                        : 'bg-[#feebeb] text-[#dc2626] dark:bg-[#2d1212] dark:text-[#ff6b6b]'
                    }`}
                  >
                    {metric.trend}
                  </span>
                )}
              </div>
              <div className="mt-4">
                <h3 className="text-[28px] font-bold text-slate-900 dark:text-white leading-none mb-1.5">{metric.value}</h3>
                <p className="text-[13px] font-semibold text-slate-400 dark:text-[#a3b3af] uppercase tracking-wider">{metric.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* 4. Candidate Pipeline Card */}
      <div className="bg-white dark:bg-[#111c18] border border-[#e2eae7] dark:border-[#1a2d29] rounded-[24px] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
        <h2 className="text-[16px] font-bold text-slate-900 dark:text-white mb-6">Candidate pipeline</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {PIPELINE_STAGES.map((stage, i) => (
            <div
              key={i}
              className="bg-[#fcfcfa] dark:bg-[#111c18]/40 border border-[#e2eae7] dark:border-[#1a2d29] p-5 rounded-[20px] transition-all flex flex-col justify-between h-[110px]"
            >
              <div>
                <p className="text-[12px] font-semibold text-slate-400 dark:text-[#a3b3af] uppercase tracking-wider mb-2">{stage.label}</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white leading-none">{stage.count}</p>
              </div>
              <div className="w-full bg-[#eceae3] dark:bg-[#1a2d29] h-1.5 rounded-full overflow-hidden mt-3">
                <div
                  className="bg-[#00a76b] h-full rounded-full transition-all"
                  style={{ width: `${stage.progress}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Recruitment;
