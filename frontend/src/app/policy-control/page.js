'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { policyControlData } from '@/lib/mockData';
import { useTheme } from '@/context/ThemeContext';

export default function PolicyControlPage() {
  const [rules, setRules] = useState(policyControlData.rules);
  const [editingRule, setEditingRule] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const { riskThresholds } = policyControlData;
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const toggleRule = (id) => {
    setRules(prev => prev.map(r => r.id === id ? { ...r, status: r.status === 'active' ? 'paused' : 'active' } : r));
  };

  const toggleAutoAction = (id) => {
    setRules(prev => prev.map(r => r.id === id ? { ...r, autoAction: !r.autoAction } : r));
  };

  const sevMap = isDark
    ? { critical: 'text-error', high: 'text-[#FF9F0A]', medium: 'text-[#FFD60A]' }
    : { critical: 'text-red-600', high: 'text-amber-600', medium: 'text-yellow-600' };

  const sevBg = isDark
    ? { critical: 'bg-error/10 border-error', high: 'bg-[#FF9F0A]/10 border-[#FF9F0A]', medium: 'bg-[#FFD60A]/10 border-[#FFD60A]' }
    : { critical: 'bg-red-50 border-red-300', high: 'bg-amber-50 border-amber-300', medium: 'bg-yellow-50 border-yellow-300' };

  const inputClass = `w-full border rounded-[0.25rem] px-3 py-2 text-body-main text-on-surface focus:outline-none focus:border-primary transition-all text-xs ${
    isDark ? 'bg-[#05070A] border-white/10' : 'bg-slate-50 border-slate-200'
  }`;

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-primary text-2xl">fingerprint</span>
          <h2 className="text-data-display-md text-on-surface tracking-wide">POLICY CONTROL</h2>
        </div>
        <button onClick={() => setShowAddForm(!showAddForm)} className="flex items-center gap-2 bg-primary text-on-primary px-4 py-2 rounded-lg font-bold text-xs hover:bg-primary-fixed transition-colors">
          <span className="material-symbols-outlined text-[16px]">add</span>
          ADD RULE
        </button>
      </div>

      <section className="grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1">
        {/* Rules List */}
        <div className="lg:col-span-8 glass-panel glass-panel-hover rounded-2xl flex flex-col overflow-hidden">
          <div className={`p-4 border-b flex justify-between items-center ${isDark ? 'border-white/10 bg-surface-container-highest/30' : 'border-slate-100 bg-slate-50/40'}`}>
            <h3 className="text-label-caps text-on-surface">DETECTION RULES</h3>
            <span className="text-label-small text-on-surface-variant">{rules.filter(r => r.status === 'active').length} ACTIVE</span>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {rules.map(rule => {
              return (
                <div key={rule.id} className={`p-4 rounded-2xl border transition-all ${
                  rule.status === 'active'
                    ? isDark ? 'border-white/10 bg-surface-container-low' : 'border-slate-200 bg-white'
                    : isDark ? 'border-white/5 bg-surface-container-lowest/50 opacity-60' : 'border-slate-100 bg-slate-50/50 opacity-60'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <button onClick={() => toggleRule(rule.id)} className={`w-10 h-5 rounded-full relative transition-colors ${rule.status === 'active' ? 'bg-tertiary-container' : 'bg-outline-variant'}`}>
                        <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform shadow-sm ${rule.status === 'active' ? 'left-5' : 'left-0.5'}`}></span>
                      </button>
                      <span className="text-on-surface font-bold text-body-main">{rule.name}</span>
                    </div>
                    <span className={`text-label-small px-2 py-0.5 rounded-full border ${sevBg[rule.severity]}`}>
                      <span className={sevMap[rule.severity]}>{rule.severity.toUpperCase()}</span>
                    </span>
                  </div>
                  <p className="text-body-main text-on-surface-variant mb-3 text-xs">{rule.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-label-small">
                      <span className="text-on-surface-variant">Threshold: <span className="text-on-surface font-semibold">{rule.threshold}</span></span>
                      <span className="text-on-surface-variant">Last: <span className="text-on-surface font-semibold">{rule.lastTriggered}</span></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-label-small text-on-surface-variant">AUTO</span>
                      <button onClick={() => toggleAutoAction(rule.id)} className={`w-8 h-4 rounded-full relative transition-colors ${rule.autoAction ? 'bg-primary' : 'bg-outline-variant'}`}>
                        <span className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform shadow-sm ${rule.autoAction ? 'left-4' : 'left-0.5'}`}></span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Panel */}
        <div className="lg:col-span-4 flex flex-col gap-5">
          {/* Risk Thresholds */}
          <div className="glass-panel glass-panel-hover rounded-2xl p-6">
            <h3 className="text-label-caps text-on-surface mb-4">RISK THRESHOLDS</h3>
            <div className="space-y-4">
              {Object.entries(riskThresholds).map(([level, config]) => (
                <div key={level} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: config.color }}></span>
                    <span className="text-body-main text-on-surface font-semibold uppercase text-xs">{level}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-32 h-2 rounded-full overflow-hidden ${isDark ? 'bg-surface-container-lowest' : 'bg-slate-200'}`}>
                      <div className="h-full rounded-full" style={{ width: `${config.max}%`, backgroundColor: config.color, opacity: 0.6 }}></div>
                    </div>
                    <span className="text-label-small text-on-surface-variant w-16 text-right">{config.min}–{config.max}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Automation Stats */}
          <div className="glass-panel glass-panel-hover rounded-2xl p-6">
            <h3 className="text-label-caps text-on-surface mb-4">AUTOMATION STATUS</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-body-main text-on-surface-variant">Auto-Actions Enabled</span>
                <span className="text-data-display-md text-tertiary-fixed">{rules.filter(r => r.autoAction).length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-body-main text-on-surface-variant">Rules Active</span>
                <span className="text-data-display-md text-primary">{rules.filter(r => r.status === 'active').length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-body-main text-on-surface-variant">Rules Paused</span>
                <span className={`text-data-display-md ${isDark ? 'text-[#FF9F0A]' : 'text-amber-600'}`}>{rules.filter(r => r.status === 'paused').length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-body-main text-on-surface-variant">Triggered Today</span>
                <span className="text-data-display-md text-on-surface">24</span>
              </div>
            </div>
          </div>

          {/* Add Rule Form */}
          {showAddForm && (
            <div className={`glass-panel rounded-2xl p-6 border animate-fade-in ${isDark ? 'border-primary/30' : 'border-blue-200'}`}>
              <h3 className="text-label-caps text-on-surface mb-4">NEW RULE</h3>
              <div className="space-y-3">
                <input className={inputClass} placeholder="Rule name" />
                <input className={inputClass} placeholder="Description" />
                <select className={inputClass}>
                  <option>Critical</option><option>High</option><option>Medium</option>
                </select>
                <input className={inputClass} placeholder="Threshold" type="number" />
                <button className="w-full bg-primary text-on-primary py-2 rounded-lg font-bold text-xs hover:bg-primary-fixed transition-colors">CREATE RULE</button>
              </div>
            </div>
          )}
        </div>
      </section>
    </DashboardLayout>
  );
}
