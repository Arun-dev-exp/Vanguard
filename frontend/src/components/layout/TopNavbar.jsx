'use client';

export default function TopNavbar() {
  return (
    <nav className="md:hidden fixed top-0 left-0 w-full z-50 flex justify-between items-center px-6 h-16 bg-white/5 backdrop-blur-[20px] font-[var(--font-inter)] antialiased tracking-tight border-b border-white/[0.08] shadow-[0_1px_0_0_rgba(59,130,246,0.3)] shadow-2xl shadow-blue-900/20">
      <div className="flex items-center gap-2 text-xl font-black tracking-tighter text-white uppercase">
        <span className="material-symbols-outlined text-blue-500">shield</span>
        FRAUD SENTINEL
      </div>
      <div className="flex gap-4">
        <button className="text-slate-400 hover:text-white transition-colors duration-300 hover:bg-white/10 hover:border-white/20 p-2 rounded-[0.25rem] flex items-center justify-center">
          <span className="material-symbols-outlined">notifications</span>
        </button>
        <button className="text-slate-400 hover:text-white transition-colors duration-300 hover:bg-white/10 hover:border-white/20 p-2 rounded-[0.25rem] flex items-center justify-center">
          <span className="material-symbols-outlined">schedule</span>
        </button>
        <button className="text-slate-400 hover:text-white transition-colors duration-300 hover:bg-white/10 hover:border-white/20 p-2 rounded-[0.25rem] flex items-center justify-center">
          <span className="material-symbols-outlined">settings</span>
        </button>
      </div>
    </nav>
  );
}
