import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, ArrowRight, Zap, Users, BarChart3, Wallet, Activity, Globe, CheckCircle, ChevronRight } from 'lucide-react';

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#fffefb] selection:bg-[#ff4f00] selection:text-white">
      
      {/* NAVIGATION - Zapier Warm Header */}
      <header className="sticky top-0 w-full z-50 bg-[#fffefb] border-b border-[#c5c0b1]">
        <div className="flex w-full h-[72px] items-center px-8">
          <div className="flex items-center gap-3 mr-12">
            <div className="w-8 h-8 bg-[#ff4f00] rounded-[4px] flex items-center justify-center">
              <ShieldCheck size={20} className="text-[#fffefb]" />
            </div>
            <span className="text-[24px] font-bold tracking-tight text-[#201515]">FluidHR</span>
          </div>
          
          <nav className="hidden lg:flex gap-10">
            {['Product', 'Solutions', 'Global Sync', 'Security'].map(link => (
              <a key={link} className="text-[16px] font-medium text-[#201515] no-underline hover:text-[#ff4f00] transition-colors" href="#">{link}</a>
            ))}
          </nav>
          
          <div className="ml-auto flex items-center gap-8">
            <button 
              onClick={() => navigate('/login')} 
              className="text-[16px] font-medium text-[#201515] bg-transparent border-none cursor-pointer hover:text-[#ff4f00] transition-colors"
            >
              Log in
            </button>
            <button 
              onClick={() => navigate('/login')}
              className="zap-btn zap-btn-orange"
            >
              Sign up free
            </button>
          </div>
        </div>
      </header>

      <main>
        {/* HERO SECTION - Zapier High Impact Cream */}
        <section className="px-10 pt-32 pb-48 w-full text-center md:text-left">
          <div className="grid lg:grid-cols-12 gap-16 items-center">
            <div className="lg:col-span-7">
              <p className="zap-caption-upper mb-8 text-[#ff4f00]">The future of people automation</p>
              <h1 className="zap-display-xl mb-12 text-[#201515]">
                Automate your <br/>workforce like <span className="text-[#ff4f00]">effortless magic.</span>
              </h1>
              <p className="zap-body-large text-[#36342e] max-w-xl mb-16 font-medium">
                FluidHR is the easiest way to connect your personnel logistics, financial protocols, and institutional security into a single, automated ecosystem.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={() => navigate('/login')}
                  className="zap-btn zap-btn-orange h-[64px] px-12 text-[20px] font-bold"
                >
                  Start free with email
                  <ArrowRight size={22} className="ml-4" />
                </button>
                <button className="zap-btn zap-btn-dark h-[64px] px-12 text-[20px]">
                  Explore templates
                </button>
              </div>
              <p className="mt-8 text-[14px] text-[#939084] font-medium italic">Trusted by 10,000+ modern organizations globally.</p>
            </div>
            
            <div className="lg:col-span-5 relative hidden lg:block">
               <div className="zap-card border-none bg-gradient-to-br from-[#eceae3] to-transparent p-1">
                  <div className="bg-[#fffefb] border border-[#c5c0b1] rounded-[8px] p-10 shadow-sm overflow-hidden">
                     <div className="flex justify-between items-center mb-12 border-b border-[#eceae3] pb-6">
                        <div className="flex items-center gap-4">
                           <div className="w-10 h-10 bg-[#ff4f00] rounded-[4px] flex items-center justify-center">
                              <Zap size={20} className="text-[#fffefb]" />
                           </div>
                           <h3 className="text-[18px] font-bold text-[#201515]">Active Automation</h3>
                        </div>
                        <span className="w-3 h-3 bg-[#ff4f00] rounded-full animate-pulse"></span>
                     </div>
                     <div className="space-y-8">
                        {[
                          { name: 'Personnel Onboarding', appA: 'S', appB: 'Z' },
                          { name: 'Liquidity Sync', appA: 'B', appB: 'W' },
                          { name: 'Security Protocol', appA: 'G', appB: 'S' }
                        ].map((zap, i) => (
                          <div key={i} className="flex flex-col gap-4">
                             <div className="flex justify-between items-center">
                                <p className="text-[14px] font-bold text-[#36342e]">{zap.name}</p>
                                <span className="text-[12px] font-bold text-[#ff4f00]">Active</span>
                             </div>
                             <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-[4px] bg-[#201515] text-[#fffefb] flex items-center justify-center text-[10px] font-bold">{zap.appA}</div>
                                <div className="w-6 h-[1px] bg-[#c5c0b1]"></div>
                                <div className="w-8 h-8 rounded-[4px] bg-[#eceae3] text-[#201515] border border-[#c5c0b1] flex items-center justify-center text-[10px] font-bold">{zap.appB}</div>
                             </div>
                          </div>
                        ))}
                     </div>
                  </div>
               </div>
            </div>
          </div>
        </section>

        {/* TRUST STRIP - Zapier Sand Divider Style */}
        <section className="px-10 py-24 border-t border-b border-[#c5c0b1] bg-[#fffdf9]">
          <div className="w-full text-center">
            <h3 className="zap-caption-upper mb-12">Empowering global personnel magic</h3>
            <div className="flex flex-wrap justify-center gap-24 opacity-40 grayscale">
               {['SLACK', 'ASANA', 'TRELLO', 'STRIPE', 'NOTION'].map(logo => (
                 <span key={logo} className="text-[24px] font-black tracking-tighter text-[#201515]">{logo}</span>
               ))}
            </div>
          </div>
        </section>

        {/* FEATURES - Zapier Editorial Style */}
        <section className="py-32 md:py-48 px-10 w-full">
          <div className="text-center mb-32 w-full">
             <h2 className="zap-section-heading mb-10">Automation built for <span className="text-[#ff4f00]">human connection.</span></h2>
             <p className="zap-body-large text-[#36342e] font-medium leading-relaxed">
               FluidHR rejects the cold technical nature of legacy tools. We've built an infrastructure that feels as warm as a notebook and as powerful as the world's best automation engine.
             </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { title: 'Effortless Sync', desc: 'Connect your personnel registry to any platform with a single click. No code, no complexity, just sync.', icon: Activity },
              { title: 'Liquidity Flows', desc: 'Automate payroll and benefits with vivid clarity. Money moves at the speed of your organization.', icon: Wallet },
              { title: 'Synergy Logic', desc: 'Monitor organizational health with approachable metrics that help your team grow together.', icon: BarChart3 }
            ].map((feature, i) => (
              <div key={i} className="group cursor-pointer">
                 <div className="w-16 h-16 bg-[#eceae3] border border-[#c5c0b1] rounded-[8px] flex items-center justify-center mb-10 text-[#201515] group-hover:bg-[#ff4f00] group-hover:text-[#fffefb] group-hover:border-[#ff4f00] transition-all">
                    <feature.icon size={28} />
                 </div>
                 <h3 className="text-[24px] font-bold text-[#201515] mb-6">{feature.title}</h3>
                 <p className="text-[16px] text-[#36342e] leading-relaxed mb-10 font-medium">
                   {feature.desc}
                 </p>
                 <div className="flex items-center text-[#ff4f00] font-bold text-[14px] gap-2">
                   Learn more <ArrowRight size={18} />
                 </div>
              </div>
            ))}
          </div>
        </section>

        {/* FINAL CTA - Zapier Orange Impact */}
        <section className="px-6 py-32 md:py-56 bg-[#201515] text-[#fffefb] m-6 rounded-[8px] text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_30%,rgba(255,79,0,0.1),transparent)]"></div>
          <div className="max-w-3xl mx-auto relative z-10">
            <h2 className="zap-display-hero text-[#fffefb] mb-12">Build your first workflow today.</h2>
            <p className="text-[20px] text-[#c5c0b1] mb-16 font-medium">
              Join the modern organizations automating their people processes on the FluidHR protocol.
            </p>
            <div className="flex flex-col md:flex-row justify-center items-center gap-6">
               <input 
                 type="text" 
                 placeholder="Enter your email" 
                 className="w-full md:w-[420px] h-[64px] px-8 bg-[#fffefb] border-none rounded-[8px] text-[18px] font-medium text-[#201515] focus:outline-none focus:ring-2 focus:ring-[#ff4f00]"
               />
               <button 
                onClick={() => navigate('/login')}
                className="zap-btn zap-btn-orange h-[64px] px-12 text-[20px] w-full md:w-auto font-bold"
               >
                Sign up free
               </button>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER - Zapier Warm Dark Finish */}
      <footer className="px-10 py-32 bg-[#fffefb] border-t border-[#c5c0b1]">
        <div className="w-full">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-20 mb-32">
            <div className="col-span-1">
              <div className="flex items-center gap-3 mb-10">
                <div className="w-8 h-8 bg-[#ff4f00] rounded-[4px] flex items-center justify-center">
                  <ShieldCheck size={20} className="text-[#fffefb]" />
                </div>
                <span className="text-[24px] font-bold text-[#201515]">FluidHR</span>
              </div>
              <p className="text-[15px] text-[#36342e] font-medium leading-relaxed max-w-xs">
                Automation built for humans. Connect your organization with the world's most approachable HR protocol.
              </p>
            </div>
            
            {[
              { title: 'Product', links: ['Automation', 'Workflows', 'Global Sync', 'App Directory'] },
              { title: 'Developers', links: ['API Reference', 'System Status', 'Integration Guide', 'GitHub'] },
              { title: 'Company', links: ['About Us', 'Principles', 'Careers', 'Help Center'] }
            ].map((col, i) => (
              <div key={i}>
                <h4 className="zap-caption-upper mb-10 text-[#201515]">{col.title}</h4>
                <ul className="list-none space-y-5">
                  {col.links.map(link => (
                    <li key={link}><a className="text-[16px] text-[#36342e] hover:text-[#ff4f00] no-underline font-medium transition-colors" href="#">{link}</a></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-center gap-12 pt-20 border-t border-[#c5c0b1]">
            <div className="flex items-center gap-12 text-[13px] text-[#939084] font-bold uppercase tracking-widest">
              <p>© 2026 Zapier FluidHR Ecosystem Protocol.</p>
              <a href="#" className="hover:text-[#ff4f00] no-underline">Privacy</a>
              <a href="#" className="hover:text-[#ff4f00] no-underline">Terms</a>
            </div>
            <div className="flex items-center gap-4 text-[#939084]">
              <Globe size={18} />
              <span className="text-[13px] font-bold uppercase tracking-widest">Global English</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
