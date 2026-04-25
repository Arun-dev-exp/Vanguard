'use client';

import { useState, useCallback } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { campaigns, stats } from '@/lib/mockData';
import { checkUPI, initiateTakedown } from '@/lib/mockApi';
import { usePolling } from '@/hooks/usePolling';
import { useNotifications } from '@/hooks/useNotifications';
import NotificationToast from '@/components/shared/NotificationToast';
import { useTheme } from '@/context/ThemeContext';

export default function ThreatIntelPage() {
  const [selectedCampaign, setSelectedCampaign] = useState(campaigns[0]);
  const [upiInput, setUpiInput] = useState('fraudster@upi');
  const [amountInput, setAmountInput] = useState('50,000');
  const [riskResult, setRiskResult] = useState({ risk: 'HIGH', campaign: 'KYC Scam', reports: 1247, confidence: 0.98 });
  const [isCheckingRisk, setIsCheckingRisk] = useState(false);
  const [takedownState, setTakedownState] = useState('idle');
  const { notifications, addNotification, removeNotification } = useNotifications();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const fetchStats = useCallback(() => Promise.resolve(stats), []);
  const { data: liveStats, secondsAgo } = usePolling(fetchStats, 5000);
  const currentStats = liveStats || stats;

  const handleCheckRisk = async () => {
    if (!upiInput.trim()) return;
    setIsCheckingRisk(true);
    setRiskResult(null);
    try {
      const result = await checkUPI(upiInput.trim());
      setRiskResult(result);
    } catch {
      setRiskResult({ risk: 'ERROR', campaign: null, reports: 0 });
    }
    setIsCheckingRisk(false);
  };

  const handleTakedown = async () => {
    setTakedownState('loading');
    try {
      await initiateTakedown(selectedCampaign.id, 'all');
      setTakedownState('done');
      addNotification('✅ UPI blocked across network — Takedown initiated successfully', 'success');
    } catch {
      setTakedownState('idle');
      addNotification('❌ Takedown failed — Please retry', 'error');
    }
  };

  const handleCopyAll = () => {
    const entities = selectedCampaign.entities;
    const text = [
      ...entities.urls.map(u => `URL: ${u}`),
      ...entities.upiIds.map(u => `UPI: ${u}`),
      ...entities.phones.map(p => `Phone: ${p}`),
    ].join('\n');
    navigator.clipboard.writeText(text);
    addNotification('📋 All entities copied to clipboard', 'info');
  };

  return (
    <DashboardLayout>
      <NotificationToast notifications={notifications} onRemove={removeNotification} />

      {/* ── KPI Strip ── */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Scams Detected */}
        <div className="glass-panel glass-panel-hover rounded-2xl p-5 kpi-card kpi-card-primary">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-label-caps text-on-surface-variant">Total Scams Detected</h3>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isDark ? 'bg-blue-500/10' : 'bg-blue-50'}`}>
              <span className="material-symbols-outlined text-primary text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>bug_report</span>
            </div>
          </div>
          <div className="text-data-display-lg text-primary">{currentStats.totalScams.toLocaleString()}</div>
          <div className={`mt-2 text-[11px] font-medium ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
            <span className="material-symbols-outlined text-[13px] align-middle mr-0.5">trending_up</span>
            +12.5% from last week
          </div>
        </div>

        {/* Active Campaigns */}
        <div className="glass-panel glass-panel-hover rounded-2xl p-5 kpi-card kpi-card-warning">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-label-caps text-on-surface-variant">Active Campaigns</h3>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isDark ? 'bg-amber-500/10' : 'bg-amber-50'}`}>
              <span className={`material-symbols-outlined text-[18px] ${isDark ? 'text-amber-400' : 'text-amber-600'}`} style={{ fontVariationSettings: "'FILL' 1" }}>campaign</span>
            </div>
          </div>
          <div className="text-data-display-lg text-on-surface">{currentStats.activeCampaigns}</div>
          <div className={`mt-2 text-[11px] font-medium ${isDark ? 'text-amber-400/70' : 'text-amber-600/70'}`}>
            <span className="material-symbols-outlined text-[13px] align-middle mr-0.5">warning</span>
            2 critical, 1 high priority
          </div>
        </div>

        {/* High-Risk Alerts */}
        <div className="glass-panel glass-panel-hover rounded-2xl p-5 kpi-card kpi-card-danger">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-label-caps text-error">High-Risk Alerts</h3>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isDark ? 'bg-red-500/10' : 'bg-red-50'}`}>
              <span className="material-symbols-outlined text-error text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>error</span>
            </div>
          </div>
          <div className={`text-data-display-lg text-error ${isDark ? 'drop-shadow-[0_0_8px_rgba(252,165,165,0.4)]' : ''}`}>{currentStats.highRiskAlerts}</div>
          <div className={`mt-2 text-[11px] font-medium ${isDark ? 'text-red-400/70' : 'text-red-500/70'}`}>
            <span className="material-symbols-outlined text-[13px] align-middle mr-0.5">schedule</span>
            Last alert 3 min ago
          </div>
        </div>

        {/* System Status */}
        <div className="glass-panel glass-panel-hover rounded-2xl p-5 kpi-card kpi-card-success">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-label-caps text-on-surface-variant">System Status</h3>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isDark ? 'bg-emerald-500/10' : 'bg-emerald-50'}`}>
              <span className={`material-symbols-outlined text-[18px] ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} style={{ fontVariationSettings: "'FILL' 1" }}>monitoring</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" style={{ boxShadow: '0 0 12px rgba(16,185,129,0.8)' }} />
            <span className={`text-data-display-md ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>LIVE</span>
          </div>
          <div className={`mt-2 text-[11px] font-medium ${isDark ? 'text-emerald-400/70' : 'text-emerald-600/70'}`}>
            99.87% uptime · 12ms avg
          </div>
        </div>
      </section>

      {/* Updated indicator */}
      <div className="flex justify-end -mt-1">
        <span className={`text-[10px] font-medium tracking-wide ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>
          Updated {secondsAgo}s ago
        </span>
      </div>

      {/* ── Main 3-Column Workspace ── */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1">
        {/* LEFT: Campaign Sidebar */}
        <div className="lg:col-span-3 glass-panel glass-panel-hover rounded-2xl flex flex-col overflow-hidden">
          <div className="section-header">
            <h2 className="text-label-caps text-on-surface">Active Campaigns</h2>
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${isDark ? 'bg-blue-500/10 text-blue-300' : 'bg-blue-50 text-blue-600'}`}>{campaigns.length}</span>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {campaigns.map((campaign) => (
              <div
                key={campaign.id}
                onClick={() => { setSelectedCampaign(campaign); setTakedownState('idle'); }}
                className={`p-3.5 rounded-xl cursor-pointer transition-all duration-200 ${
                  selectedCampaign?.id === campaign.id
                    ? `border ${campaign.borderColor} ${isDark ? 'shadow-lg' : 'shadow-md ring-1 ring-black/[0.03]'}`
                    : isDark
                      ? 'border border-white/[0.04] bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/[0.08]'
                      : 'border border-gray-100 bg-white/60 hover:bg-white hover:border-gray-200 hover:shadow-sm'
                }`}
                style={selectedCampaign?.id === campaign.id ? { backgroundColor: isDark ? campaign.bgColor : `${campaign.bgColor}` } : undefined}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: campaign.dotColor }} />
                    <span className={`text-[12.5px] font-semibold ${selectedCampaign?.id === campaign.id ? 'text-on-surface' : 'text-on-surface-variant'}`}>
                      {campaign.name}
                    </span>
                  </div>
                  <span className="text-[9px] font-bold tracking-wider px-2 py-0.5 rounded-full uppercase" style={{ color: campaign.threatColor, backgroundColor: `${campaign.threatColor}18`, border: `1px solid ${campaign.threatColor}30` }}>
                    {campaign.threatLevel}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CENTER: Campaign Detail */}
        <div className="lg:col-span-6 glass-panel glass-panel-hover rounded-2xl flex flex-col overflow-hidden">
          <div className="section-header">
            <h2 className="text-[18px] font-bold text-on-surface tracking-tight">{selectedCampaign.name.toUpperCase()}</h2>
            <span className="text-[10px] font-bold tracking-wider px-3 py-1 rounded-full uppercase" style={{ color: selectedCampaign.threatColor, backgroundColor: `${selectedCampaign.threatColor}15`, border: `1px solid ${selectedCampaign.threatColor}40`, boxShadow: isDark ? `0 0 12px ${selectedCampaign.threatColor}20` : 'none' }}>
              {selectedCampaign.threatLevel}
            </span>
          </div>
          <div className="p-5 flex-1 overflow-y-auto space-y-7">
            {/* Messages */}
            <div>
              <h3 className="text-label-caps text-on-surface-variant mb-3">Intercepted Messages</h3>
              <div className="space-y-3">
                {selectedCampaign.messages.map((msg, i) => (
                  <div key={i} className={`rounded-xl p-4 text-[13px] leading-relaxed transition-colors ${isDark ? 'bg-white/[0.02] border border-white/[0.05] text-slate-300' : 'bg-gray-50/80 border border-gray-100 text-gray-600'}`}>
                    {msg}
                  </div>
                ))}
              </div>
            </div>

            {/* Timeline */}
            <div>
              <h3 className="text-label-caps text-on-surface-variant mb-4">Campaign Timeline</h3>
              <div className={`relative border-l-2 ml-3 space-y-5 ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
                {selectedCampaign.timeline.map((item, i) => (
                  <div key={i} className="relative pl-6">
                    <span className={`absolute left-[-6px] top-1.5 w-2.5 h-2.5 rounded-full ring-2 ${
                      item.active
                        ? isDark ? 'bg-blue-400 ring-blue-400/30 shadow-[0_0_8px_rgba(96,165,250,0.5)]' : 'bg-blue-500 ring-blue-200'
                        : isDark ? 'bg-slate-600 ring-slate-700' : 'bg-gray-300 ring-gray-200'
                    }`} />
                    <div className={`text-[10px] font-semibold tracking-wide uppercase ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>{item.time}</div>
                    <div className="text-[13px] font-medium text-on-surface mt-0.5">{item.event}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: Tools */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          {/* Entities + Takedown */}
          <div className="glass-panel glass-panel-hover rounded-2xl p-5 flex-1 flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-label-caps text-on-surface">Extracted Entities</h3>
              <button onClick={handleCopyAll} className="text-primary hover:text-primary-fixed transition-colors" title="Copy All">
                <span className="material-symbols-outlined text-[16px]">content_copy</span>
              </button>
            </div>
            <div className="space-y-4 mb-5 flex-1">
              <div>
                <span className="text-label-small text-on-surface-variant block mb-2">URLs</span>
                <div className="flex flex-wrap">
                  {selectedCampaign.entities.urls.map((url, i) => (
                    <span key={i} className="premium-chip mr-2 mb-2">
                      <span className="material-symbols-outlined text-[13px] text-primary">link</span>{url}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <span className="text-label-small text-on-surface-variant block mb-2">UPI IDs</span>
                <div className="flex flex-wrap">
                  {selectedCampaign.entities.upiIds.map((upi, i) => (
                    <span key={i} className="premium-chip mr-2 mb-2">
                      <span className="material-symbols-outlined text-[13px] text-primary">account_balance_wallet</span>{upi}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <span className="text-label-small text-on-surface-variant block mb-2">Phones</span>
                <div className="flex flex-wrap">
                  {selectedCampaign.entities.phones.map((phone, i) => (
                    <span key={i} className="premium-chip mr-2 mb-2">
                      <span className="material-symbols-outlined text-[13px] text-primary">call</span>{phone}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <button
              onClick={handleTakedown}
              disabled={takedownState === 'loading'}
              className={`w-full btn-premium transition-all ${
                takedownState === 'done'
                  ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-md shadow-emerald-500/20'
                  : takedownState === 'loading'
                  ? 'bg-gradient-to-r from-red-500/40 to-red-400/40 text-white/60 cursor-wait'
                  : 'btn-danger'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">
                {takedownState === 'done' ? 'check_circle' : takedownState === 'loading' ? 'hourglass_top' : 'block'}
              </span>
              {takedownState === 'done' ? 'Takedown Initiated' : takedownState === 'loading' ? 'Processing...' : 'Initiate Takedown'}
            </button>
          </div>

          {/* Risk Check */}
          <div className="glass-panel glass-panel-hover rounded-2xl p-5">
            <h3 className="text-label-caps text-on-surface mb-4">Transaction Risk Check</h3>
            <div className="space-y-3">
              <input className="premium-input" placeholder="Enter UPI ID / Account" value={upiInput} onChange={(e) => setUpiInput(e.target.value)} />
              <input className="premium-input" placeholder="Amount (INR)" value={amountInput} onChange={(e) => setAmountInput(e.target.value)} />
              <button
                onClick={handleCheckRisk}
                disabled={isCheckingRisk}
                className={`w-full py-2.5 rounded-xl font-bold text-[11px] tracking-wide uppercase flex justify-center items-center gap-2 transition-all duration-300 ${
                  isDark
                    ? 'border border-blue-400/30 text-blue-300 hover:bg-blue-500/10'
                    : 'border border-blue-300 text-blue-600 hover:bg-blue-50'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">{isCheckingRisk ? 'hourglass_top' : 'search'}</span>
                {isCheckingRisk ? 'Checking...' : 'Check Risk'}
              </button>

              {riskResult && (
                <div className={`mt-3 rounded-xl p-4 flex items-start gap-3 ${
                  riskResult.risk === 'HIGH'
                    ? isDark ? 'bg-red-500/8 border border-red-500/20 ring-1 ring-red-500/10' : 'bg-red-50 border border-red-200 ring-1 ring-red-100'
                    : riskResult.risk === 'MEDIUM'
                    ? isDark ? 'bg-amber-500/8 border border-amber-500/20' : 'bg-amber-50 border border-amber-200'
                    : isDark ? 'bg-emerald-500/8 border border-emerald-500/20' : 'bg-emerald-50 border border-emerald-200'
                }`}>
                  <span className={`material-symbols-outlined mt-0.5 text-[18px] ${
                    riskResult.risk === 'HIGH' ? 'text-error' : riskResult.risk === 'MEDIUM' ? (isDark ? 'text-amber-400' : 'text-amber-600') : (isDark ? 'text-emerald-400' : 'text-emerald-600')
                  }`} style={{ fontVariationSettings: "'FILL' 1" }}>
                    {riskResult.risk === 'HIGH' || riskResult.risk === 'MEDIUM' ? 'warning' : 'check_circle'}
                  </span>
                  <div>
                    <div className={`font-bold text-[12px] ${
                      riskResult.risk === 'HIGH' ? 'text-error' : riskResult.risk === 'MEDIUM' ? (isDark ? 'text-amber-400' : 'text-amber-600') : (isDark ? 'text-emerald-400' : 'text-emerald-600')
                    }`}>
                      {riskResult.risk === 'HIGH' ? 'HIGH RISK DETECTED' : riskResult.risk === 'MEDIUM' ? 'MEDIUM RISK' : 'LOW RISK — SAFE'}
                    </div>
                    <div className={`text-[11px] mt-1 leading-relaxed ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                      {riskResult.risk === 'LOW'
                        ? 'Entity not found in any known scam campaigns.'
                        : `Flagged in ${riskResult.reports} recent campaigns. Block immediately.`}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </DashboardLayout>
  );
}
