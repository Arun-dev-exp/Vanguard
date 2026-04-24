'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { actionCenterData } from '@/lib/mockData';
import { useNotifications } from '@/hooks/useNotifications';
import NotificationToast from '@/components/shared/NotificationToast';

const sevStyles = {
  CRITICAL: { bg: 'bg-error/10', border: 'border-error', text: 'text-error', dot: 'bg-error', glow: 'shadow-[0_0_15px_rgba(255,180,171,0.15)]' },
  HIGH: { bg: 'bg-[#FF9F0A]/10', border: 'border-[#FF9F0A]', text: 'text-[#FF9F0A]', dot: 'bg-[#FF9F0A]', glow: '' },
  MEDIUM: { bg: 'bg-[#FFD60A]/10', border: 'border-[#FFD60A]', text: 'text-[#FFD60A]', dot: 'bg-[#FFD60A]', glow: '' },
};

const stStyles = {
  completed: { bg: 'bg-tertiary-fixed/10', text: 'text-tertiary-fixed', icon: 'check_circle' },
  'in-progress': { bg: 'bg-primary/10', text: 'text-primary', icon: 'hourglass_top' },
};

export default function ActionCenterPage() {
  const { notifications, addNotification, removeNotification } = useNotifications();
  const [actions, setActions] = useState({});
  const { activeThreats, responseTimeline } = actionCenterData;

  const doAction = async (tid, act) => {
    setActions(p => ({ ...p, [`${tid}-${act}`]: 'loading' }));
    await new Promise(r => setTimeout(r, 2000));
    setActions(p => ({ ...p, [`${tid}-${act}`]: 'done' }));
    addNotification(act === 'takedown' ? '✅ Takedown initiated successfully' : '✅ UPI blocked across network', 'success');
  };

  const gs = (tid, act) => actions[`${tid}-${act}`] || 'idle';

  return (
    <DashboardLayout>
      <NotificationToast notifications={notifications} onRemove={removeNotification} />
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-primary text-2xl">security</span>
          <h2 className="text-data-display-md text-on-surface tracking-wide">ACTION CENTER</h2>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-label-caps text-on-surface-variant">ACTIVE THREATS</span>
          <span className="text-data-display-md text-error">{activeThreats.filter(t => t.status === 'active').length}</span>
        </div>
      </div>

      <section className="grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1">
        <div className="lg:col-span-7 glass-panel glass-panel-hover rounded-lg flex flex-col overflow-hidden">
          <div className="p-4 border-b border-white/10 bg-surface-container-highest/30">
            <h3 className="text-label-caps text-on-surface">ACTIVE THREATS</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {activeThreats.map(t => {
              const s = sevStyles[t.severity] || sevStyles.MEDIUM;
              return (
                <div key={t.id} className={`p-4 rounded-lg border ${s.border} ${s.bg} ${s.glow}`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className={`w-2.5 h-2.5 rounded-full ${s.dot} ${t.severity === 'CRITICAL' ? 'animate-pulse' : ''}`}></span>
                      <span className="text-on-surface font-bold text-body-main">{t.name}</span>
                    </div>
                    <span className={`text-label-small ${s.text} ${s.bg} px-2 py-0.5 rounded-full border ${s.border}`}>{t.severity}</span>
                  </div>
                  <div className="flex gap-6 mb-4 text-label-small">
                    <div><span className="text-on-surface-variant block">ENTITIES</span><span className="text-on-surface font-semibold">{t.entities}</span></div>
                    <div><span className="text-on-surface-variant block">REPORTS</span><span className="text-on-surface font-semibold">{t.reports.toLocaleString()}</span></div>
                    <div><span className="text-on-surface-variant block">LAST SEEN</span><span className="text-on-surface font-semibold">{t.lastSeen}</span></div>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => doAction(t.id, 'takedown')} disabled={gs(t.id, 'takedown') !== 'idle'}
                      className={`flex items-center gap-2 px-4 py-2 rounded-[0.25rem] font-bold text-xs transition-all ${
                        gs(t.id, 'takedown') === 'done' ? 'bg-tertiary-container text-white' :
                        gs(t.id, 'takedown') === 'loading' ? 'bg-error/30 text-white/60 cursor-wait' :
                        'bg-gradient-to-r from-error to-secondary-container text-white hover:shadow-[0_0_15px_rgba(255,180,171,0.4)]'}`}>
                      <span className="material-symbols-outlined text-[16px]">{gs(t.id, 'takedown') === 'done' ? 'check_circle' : 'block'}</span>
                      {gs(t.id, 'takedown') === 'done' ? 'TAKEN DOWN' : gs(t.id, 'takedown') === 'loading' ? 'PROCESSING...' : 'TAKEDOWN'}
                    </button>
                    <button onClick={() => doAction(t.id, 'block-upi')} disabled={gs(t.id, 'block-upi') !== 'idle'}
                      className={`flex items-center gap-2 px-4 py-2 rounded-[0.25rem] font-bold text-xs transition-all ${
                        gs(t.id, 'block-upi') === 'done' ? 'bg-tertiary-container text-white' :
                        gs(t.id, 'block-upi') === 'loading' ? 'border border-primary/30 text-primary/60 cursor-wait' :
                        'border border-primary text-primary hover:bg-primary/10'}`}>
                      <span className="material-symbols-outlined text-[16px]">{gs(t.id, 'block-upi') === 'done' ? 'check_circle' : 'account_balance_wallet'}</span>
                      {gs(t.id, 'block-upi') === 'done' ? 'BLOCKED' : gs(t.id, 'block-upi') === 'loading' ? 'BLOCKING...' : 'BLOCK UPI'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-5 glass-panel glass-panel-hover rounded-lg flex flex-col overflow-hidden">
          <div className="p-4 border-b border-white/10 bg-surface-container-highest/30">
            <h3 className="text-label-caps text-on-surface">RESPONSE TIMELINE</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-6">
            <div className="relative border-l border-white/20 ml-3 space-y-6">
              {responseTimeline.map((item, i) => {
                const st = stStyles[item.status] || stStyles.completed;
                return (
                  <div key={i} className="relative pl-6">
                    <span className={`absolute left-[-6px] top-1 w-3 h-3 rounded-full ${item.status === 'completed' ? 'bg-tertiary-fixed' : 'bg-primary animate-pulse'}`}></span>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-label-small text-on-surface-variant">{item.time}</span>
                      <span className={`text-label-small px-2 py-0.5 rounded-full ${st.bg} ${st.text}`}>{item.status.toUpperCase()}</span>
                    </div>
                    <div className="text-body-main text-on-surface font-semibold">{item.action}</div>
                    <div className="text-label-small text-on-surface-variant mt-1">Target: {item.target}</div>
                    <div className="text-label-small text-on-surface-variant">By: {item.actor}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </DashboardLayout>
  );
}
