'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { navItems } from '@/lib/mockData';

export default function SidebarNavigation({ demoMode, onToggleDemo }) {
  const pathname = usePathname();

  return (
    <aside className="w-[220px] shrink-0 h-screen sticky top-0 flex flex-col py-5 bg-[#0a0e18]/90 backdrop-blur-[30px] font-[var(--font-inter)] text-xs font-semibold uppercase tracking-widest border-r border-white/[0.06] z-40">
      {/* Header */}
      <div className="px-5 mb-6">
        <div className="flex items-center gap-2.5 mb-1">
          <div className="w-8 h-8 rounded-full border border-white/20 bg-gradient-to-br from-primary-container/30 to-primary/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-primary text-base" style={{ fontVariationSettings: "'FILL' 1" }}>shield</span>
          </div>
          <div>
            <h1 className="text-[#5B9CFF] font-bold text-xs tracking-normal leading-tight">Vanguard-01</h1>
            <p className="text-[9px] text-tertiary-fixed-dim tracking-wider leading-tight">Active Vigilance</p>
          </div>
        </div>
        <button className="w-full mt-4 bg-error/80 hover:bg-error text-white py-2 px-3 rounded font-bold flex justify-center items-center gap-1.5 transition-colors text-[10px]">
          <span className="material-symbols-outlined text-[14px]">emergency</span>
          Emergency Lockdown
        </button>
      </div>

      {/* Nav Items */}
      <div className="flex-1 overflow-y-auto space-y-0.5 px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded transition-all duration-200 text-[10px] ${
                isActive
                  ? 'bg-primary/10 text-primary border-l-2 border-primary'
                  : 'text-slate-500 hover:text-slate-300 hover:bg-white/[0.03]'
              }`}
            >
              <span
                className="material-symbols-outlined text-[18px]"
                style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
              >
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}
      </div>

      {/* Bottom Actions */}
      <div className="mt-auto pt-4 px-2 space-y-0.5">
        <button
          onClick={onToggleDemo}
          className={`flex items-center gap-2.5 px-3 py-2 w-full rounded transition-all duration-200 text-[10px] ${
            demoMode
              ? 'text-tertiary-fixed-dim bg-tertiary-fixed/10'
              : 'text-slate-500 hover:text-slate-300 hover:bg-white/[0.03]'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">
            {demoMode ? 'toggle_on' : 'toggle_off'}
          </span>
          {demoMode ? 'Demo On' : 'Demo Off'}
        </button>
        <a href="#" className="flex items-center gap-2.5 text-slate-600 px-3 py-2 hover:text-slate-400 transition-all duration-200 rounded text-[10px]">
          <span className="material-symbols-outlined text-[16px]">info</span>
          Info
        </a>
        <a href="#" className="flex items-center gap-2.5 text-slate-600 px-3 py-2 hover:text-slate-400 transition-all duration-200 rounded text-[10px]">
          <span className="material-symbols-outlined text-[16px]">help</span>
          Support
        </a>
      </div>
    </aside>
  );
}
