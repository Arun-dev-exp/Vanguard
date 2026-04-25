'use client';

import { useState, useEffect } from 'react';
import SidebarNavigation from './SidebarNavigation';
import NotificationToast from '@/components/shared/NotificationToast';
import { useNotifications } from '@/hooks/useNotifications';
import { useDemoMode } from '@/hooks/useDemoMode';
import { useTheme } from '@/context/ThemeContext';

export default function DashboardLayout({ children }) {
  const { notifications, addNotification, removeNotification } = useNotifications();
  const { demoMode, toggleDemoMode } = useDemoMode();
  const { theme, toggleTheme } = useTheme();
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
          timeZone: 'Asia/Kolkata',
        }) + ' IST'
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!demoMode) return;
    const demoMessages = [
      { msg: '🚨 New scam campaign detected — Loan App Fraud Ring', type: 'warning' },
      { msg: '⚡ ML Engine flagged 3 new suspicious UPI IDs', type: 'info' },
      { msg: '🔴 High-risk transaction detected — Rs.2.5L via fraudster@upi', type: 'error' },
      { msg: '✅ Takedown completed for phishing URL bit.ly/fake-kyc', type: 'success' },
    ];
    let idx = 0;
    const interval = setInterval(() => {
      const { msg, type } = demoMessages[idx % demoMessages.length];
      addNotification(msg, type);
      idx++;
    }, 15000);
    return () => clearInterval(interval);
  }, [demoMode, addNotification]);

  const isDark = theme === 'dark';

  return (
    <div className={`flex h-screen font-[var(--font-inter)] text-[13.5px] antialiased overflow-hidden transition-colors duration-400 ${isDark ? 'bg-[#080c16] text-slate-200' : 'bg-[#f4f6fb] text-gray-900'}`}>
      <SidebarNavigation demoMode={demoMode} onToggleDemo={toggleDemoMode} />

      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Ambient aurora blobs */}
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
          <div className={`absolute w-[700px] h-[700px] rounded-full blur-[150px] -top-[250px] -left-[150px] transition-all duration-700 ${isDark ? 'bg-blue-600/[0.07]' : 'bg-blue-400/[0.04]'}`} />
          <div className={`absolute w-[500px] h-[500px] rounded-full blur-[130px] -bottom-[200px] -right-[100px] transition-all duration-700 ${isDark ? 'bg-emerald-500/[0.05]' : 'bg-emerald-400/[0.03]'}`} />
          <div className={`absolute w-[400px] h-[400px] rounded-full blur-[100px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-700 ${isDark ? 'bg-violet-600/[0.03]' : 'bg-violet-400/[0.02]'}`} />
        </div>

        <main className="flex-1 overflow-y-auto relative z-[1]">
          <div className="p-5 max-w-[1500px] mx-auto w-full flex flex-col gap-5">
            {/* Premium Header Bar */}
            <header className="glass-panel rounded-2xl px-6 py-3.5 flex justify-between items-center">
              <div className="flex items-center gap-3.5">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 ${isDark ? 'bg-blue-500/10 ring-1 ring-blue-500/20' : 'bg-blue-50 ring-1 ring-blue-200/60'}`}>
                  <span className="material-symbols-outlined text-primary text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>shield</span>
                </div>
                <div>
                  <h1 className="text-lg font-bold text-primary tracking-tight leading-none">VANGUARD</h1>
                  <p className={`text-[9px] font-semibold tracking-[0.15em] uppercase leading-none mt-0.5 ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>Security Operations Center</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* Clock */}
                <div className={`tabular-nums text-sm font-semibold tracking-tight ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>{currentTime}</div>

                {/* Divider */}
                <div className={`w-px h-6 ${isDark ? 'bg-white/8' : 'bg-gray-200'}`} />

                {/* Role badge */}
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-colors duration-300 ${isDark ? 'bg-white/[0.04] ring-1 ring-white/[0.06]' : 'bg-gray-50 ring-1 ring-gray-200/80'}`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" style={{ boxShadow: '0 0 8px rgba(16,185,129,0.7)' }} />
                  <span className="text-label-caps text-on-surface-variant">Tier 1 Analyst</span>
                </div>

                {/* Demo badge */}
                {demoMode && (
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${isDark ? 'bg-emerald-500/8 ring-1 ring-emerald-500/20' : 'bg-emerald-50 ring-1 ring-emerald-200/60'}`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-glow-pulse" />
                    <span className="text-label-caps text-emerald-500">Demo</span>
                  </div>
                )}

                {/* Theme toggle */}
                <button onClick={toggleTheme} className="theme-toggle-btn" title={isDark ? 'Switch to light mode' : 'Switch to dark mode'} aria-label="Toggle theme">
                  <span className="material-symbols-outlined animate-theme-spin" key={theme} style={{ fontSize: 18, fontVariationSettings: "'FILL' 1" }}>
                    {isDark ? 'light_mode' : 'dark_mode'}
                  </span>
                </button>
              </div>
            </header>

            {children}
          </div>
        </main>
      </div>

      <NotificationToast notifications={notifications} onRemove={removeNotification} />
    </div>
  );
}
