'use client';

import { useState, useEffect } from 'react';
import SidebarNavigation from './SidebarNavigation';
import NotificationToast from '@/components/shared/NotificationToast';
import { useNotifications } from '@/hooks/useNotifications';
import { useDemoMode } from '@/hooks/useDemoMode';

export default function DashboardLayout({ children }) {
  const { notifications, addNotification, removeNotification } = useNotifications();
  const { demoMode, toggleDemoMode } = useDemoMode();
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

  // Demo mode notifications
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

  return (
    <div className="flex h-screen bg-[#080c16] text-on-background font-[var(--font-inter)] text-sm antialiased overflow-hidden">
      {/* Sidebar — left */}
      <SidebarNavigation demoMode={demoMode} onToggleDemo={toggleDemoMode} />

      {/* Main content — right */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Aurora bg blobs */}
        <div className="absolute inset-0 pointer-events-none z-0">
          <div className="absolute w-[600px] h-[600px] rounded-full bg-[#005ac2] opacity-[0.08] blur-[120px] -top-[200px] -left-[100px]"></div>
          <div className="absolute w-[500px] h-[500px] rounded-full bg-[#00a73e] opacity-[0.06] blur-[120px] -bottom-[200px] -right-[100px]"></div>
        </div>

        {/* Scrollable content */}
        <main className="flex-1 overflow-y-auto relative z-[1]">
          <div className="p-5 max-w-[1500px] mx-auto w-full flex flex-col gap-4">
            {/* Top Header Bar */}
            <header className="glass-panel rounded-lg px-5 py-3 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <span
                  className="material-symbols-outlined text-primary text-3xl drop-shadow-[0_0_8px_rgba(173,198,255,0.6)]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  shield
                </span>
                <h1 className="text-2xl font-semibold text-primary drop-shadow-[0_0_8px_rgba(173,198,255,0.4)]" style={{ letterSpacing: '-0.02em' }}>
                  VANGUARD
                </h1>
              </div>
              <div className="flex items-center gap-5">
                <div className="text-on-surface-variant text-lg font-semibold tabular-nums">{currentTime}</div>
                <div className="flex items-center gap-2 bg-surface-container-high px-3 py-1.5 rounded-full border border-white/10">
                  <span className="w-2 h-2 rounded-full bg-tertiary-fixed animate-pulse shadow-[0_0_8px_rgba(108,255,130,0.8)]"></span>
                  <span className="text-label-caps text-on-surface">SOC Analyst — Tier 1</span>
                </div>
                {demoMode && (
                  <div className="flex items-center gap-2 bg-tertiary-fixed/10 px-3 py-1.5 rounded-full border border-tertiary-fixed/30">
                    <span className="w-2 h-2 rounded-full bg-tertiary-fixed animate-glow-pulse"></span>
                    <span className="text-label-caps text-tertiary-fixed-dim">Demo Mode</span>
                  </div>
                )}
              </div>
            </header>

            {children}
          </div>
        </main>
      </div>

      {/* Toast notifications — global overlay */}
      <NotificationToast notifications={notifications} onRemove={removeNotification} />
    </div>
  );
}
