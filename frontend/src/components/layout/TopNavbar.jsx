'use client';

import { useTheme } from '@/context/ThemeContext';

export default function TopNavbar() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <nav className={`md:hidden fixed top-0 left-0 w-full z-50 flex justify-between items-center px-6 h-16 backdrop-blur-[20px] font-[var(--font-inter)] antialiased tracking-tight transition-colors duration-300 ${
      isDark
        ? 'bg-white/5 border-b border-white/[0.08] shadow-[0_1px_0_0_rgba(59,130,246,0.3)] shadow-2xl shadow-blue-900/20'
        : 'bg-white/80 border-b border-slate-200 shadow-sm'
    }`}>
      <div className={`flex items-center gap-2 text-xl font-black tracking-tighter uppercase ${isDark ? 'text-white' : 'text-slate-800'}`}>
        <span className="material-symbols-outlined text-blue-500">shield</span>
        FRAUD SENTINEL
      </div>
      <div className="flex gap-4">
        <button className={`p-2 rounded-[0.25rem] flex items-center justify-center transition-colors duration-300 ${isDark ? 'text-slate-400 hover:text-white hover:bg-white/10' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'}`}>
          <span className="material-symbols-outlined">notifications</span>
        </button>
        <button className={`p-2 rounded-[0.25rem] flex items-center justify-center transition-colors duration-300 ${isDark ? 'text-slate-400 hover:text-white hover:bg-white/10' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'}`}>
          <span className="material-symbols-outlined">schedule</span>
        </button>
        <button
          onClick={toggleTheme}
          className="theme-toggle-btn !w-9 !h-9"
          title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 18, fontVariationSettings: "'FILL' 1" }}>
            {isDark ? 'light_mode' : 'dark_mode'}
          </span>
        </button>
        <button className={`p-2 rounded-[0.25rem] flex items-center justify-center transition-colors duration-300 ${isDark ? 'text-slate-400 hover:text-white hover:bg-white/10' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'}`}>
          <span className="material-symbols-outlined">settings</span>
        </button>
      </div>
    </nav>
  );
}
