import React from 'react';

export const EntryButton = ({ children, variant = 'primary', className = '', ...props }) => {
  const baseStyles = "w-full py-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-3 active:scale-[0.98] font-black uppercase text-[12px] tracking-widest";
  const variants = {
    primary: "bg-[#F0B90B] text-[#1E2026] hover:bg-[#FFD000] shadow-lg shadow-[#F0B90B]/10",
    secondary: "bg-[#222126] text-white hover:bg-black shadow-lg shadow-black/10",
    outline: "bg-white border-2 border-[#E6E8EA] text-[#1E2026] hover:border-[#F0B90B] hover:text-[#F0B90B] shadow-sm",
    ghost: "bg-transparent text-[#848E9C] hover:text-[#1E2026]"
  };

  return (
    <button className={`${baseStyles} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

export const EntryInput = ({ label, icon, ...props }) => (
  <div className="space-y-3 text-left w-full">
    {label && <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#848E9C] ml-1">{label}</label>}
    <div className="relative group">
      {icon && <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#848E9C] group-focus-within:text-[#F0B90B] transition-colors">{icon}</span>}
      <input 
        className={`w-full ${icon ? 'pl-14' : 'px-6'} pr-6 py-4 bg-[#F5F5F5] rounded-xl border-2 border-transparent focus:border-[#F0B90B] focus:bg-white transition-all duration-300 text-[14px] font-bold text-[#1E2026] placeholder:text-[#848E9C]/50 outline-none`}
        {...props}
      />
    </div>
  </div>
);

export const RoleCard = ({ title, desc, icon, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`group relative flex flex-col items-center justify-center p-10 bg-white rounded-[40px] transition-all duration-500 border-2 ${active ? 'border-[#F0B90B] shadow-2xl scale-[1.05]' : 'border-transparent hover:border-[#F0B90B]/20 hover:-translate-y-2 hover:shadow-xl'}`}
  >
    <div className={`w-20 h-20 mb-8 flex items-center justify-center rounded-2xl transition-all duration-300 ${active ? 'bg-[#F0B90B]/10 text-[#F0B90B]' : 'bg-[#F5F5F5] text-[#848E9C] group-hover:bg-[#F0B90B]/10 group-hover:text-[#F0B90B]'}`}>
      {icon}
    </div>
    <h3 className={`text-xl font-black uppercase tracking-tighter transition-colors ${active ? 'text-[#F0B90B]' : 'text-[#1E2026] group-hover:text-[#F0B90B]'}`}>{title}</h3>
    <p className="mt-4 text-[10px] text-[#848E9C] font-black uppercase tracking-[0.2em] opacity-60 leading-none">
      {desc}
    </p>
    <div className={`mt-8 transition-all duration-500 ${active ? 'opacity-100 scale-110' : 'opacity-0 scale-90 group-hover:opacity-60'}`}>
       <div className="w-8 h-1 bg-[#F0B90B] rounded-full"></div>
    </div>
  </button>
);
