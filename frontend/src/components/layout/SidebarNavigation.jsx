'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { navItems } from '@/lib/mockData';
import { useTheme } from '@/context/ThemeContext';

export default function SidebarNavigation({ demoMode, onToggleDemo }) {
  const pathname = usePathname();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <aside className={`w-[232px] shrink-0 h-screen sticky top-0 flex flex-col py-5 font-[var(--font-inter)] z-40 transition-all duration-400 ${
      isDark
        ? 'bg-[#0a0e18]/95 backdrop-blur-2xl border-r border-white/[0.04]'
        : 'bg-white/90 backdrop-blur-2xl border-r border-gray-200/70 shadow-[1px_0_8px_rgba(0,0,0,0.02)]'
    }`}>
      {/* Brand */}
      <div className="px-5 mb-5">
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
            isDark
              ? 'bg-gradient-to-br from-blue-500/15 to-blue-600/5 ring-1 ring-blue-500/15'
              : 'bg-gradient-to-br from-blue-50 to-blue-100 ring-1 ring-blue-200/50'
          }`}>
            <span className="material-symbols-outlined text-primary text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>shield</span>
          </div>
          <div>
            <h1 className={`font-bold text-[13px] tracking-tight leading-none ${isDark ? 'text-blue-300' : 'text-blue-600'}`}>Vanguard-01</h1>
            <p className={`text-[9px] font-semibold tracking-[0.12em] uppercase leading-none mt-1 ${isDark ? 'text-emerald-400/70' : 'text-emerald-600/70'}`}>Active Vigilance</p>
          </div>
        </div>

        {/* Emergency button */}
        <button className="w-full bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white py-2.5 px-3 rounded-xl font-bold flex justify-center items-center gap-2 transition-all text-[10px] tracking-wide uppercase shadow-md shadow-red-500/15 hover:shadow-red-500/25 hover:-translate-y-px">
          <span className="material-symbols-outlined text-[15px]">emergency</span>
          Emergency Lockdown
        </button>
      </div>

      {/* Nav Items */}
      <div className="flex-1 overflow-y-auto space-y-0.5 px-3">
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-[11px] font-semibold tracking-wide uppercase ${
                isActive
                  ? isDark
                    ? 'bg-blue-500/10 text-blue-300 ring-1 ring-blue-500/15'
                    : 'bg-blue-50 text-blue-600 ring-1 ring-blue-200/50'
                  : isDark
                    ? 'text-slate-500 hover:text-slate-300 hover:bg-white/[0.03]'
                    : 'text-gray-400 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]" style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </div>

      {/* Bottom Actions */}
      <div className="mt-auto pt-3 px-3 space-y-0.5">
        <button
          onClick={onToggleDemo}
          className={`flex items-center gap-3 px-3 py-2 w-full rounded-xl transition-all duration-200 text-[10px] font-semibold tracking-wide uppercase ${
            demoMode
              ? isDark ? 'text-emerald-400 bg-emerald-500/8 ring-1 ring-emerald-500/15' : 'text-emerald-600 bg-emerald-50 ring-1 ring-emerald-200/50'
              : isDark ? 'text-slate-500 hover:text-slate-300 hover:bg-white/[0.03]' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">{demoMode ? 'toggle_on' : 'toggle_off'}</span>
          {demoMode ? 'Demo On' : 'Demo Off'}
        </button>
        <a href="#" className={`flex items-center gap-3 px-3 py-2 rounded-xl text-[10px] font-medium tracking-wide uppercase transition-all ${isDark ? 'text-slate-600 hover:text-slate-400' : 'text-gray-300 hover:text-gray-500'}`}>
          <span className="material-symbols-outlined text-[16px]">info</span>Info
        </a>
        <a href="#" className={`flex items-center gap-3 px-3 py-2 rounded-xl text-[10px] font-medium tracking-wide uppercase transition-all ${isDark ? 'text-slate-600 hover:text-slate-400' : 'text-gray-300 hover:text-gray-500'}`}>
          <span className="material-symbols-outlined text-[16px]">help</span>Support
        </a>
      </div>
    </aside>
  );
}
