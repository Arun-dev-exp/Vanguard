'use client';

import { useState, useCallback } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { campaigns, stats } from '@/lib/mockData';
import { checkUPI, initiateTakedown } from '@/lib/mockApi';
import { usePolling } from '@/hooks/usePolling';
import { useNotifications } from '@/hooks/useNotifications';
import NotificationToast from '@/components/shared/NotificationToast';

export default function ThreatIntelPage() {
  const [selectedCampaign, setSelectedCampaign] = useState(campaigns[0]);
  const [upiInput, setUpiInput] = useState('fraudster@upi');
  const [amountInput, setAmountInput] = useState('50,000');
  const [riskResult, setRiskResult] = useState({ risk: 'HIGH', campaign: 'KYC Scam', reports: 1247, confidence: 0.98 });
  const [isCheckingRisk, setIsCheckingRisk] = useState(false);
  const [takedownState, setTakedownState] = useState('idle'); // idle | loading | done
  const { notifications, addNotification, removeNotification } = useNotifications();

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

      {/* KPI Strip */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="glass-panel glass-panel-hover rounded-lg p-6 border-t-2 border-t-primary shadow-lg hover:shadow-[0_0_15px_rgba(173,198,255,0.2)]">
          <h3 className="text-label-caps text-on-surface-variant mb-2">TOTAL SCAMS DETECTED</h3>
          <div className="text-data-display-lg text-primary">{currentStats.totalScams.toLocaleString()}</div>
        </div>
        <div className="glass-panel glass-panel-hover rounded-lg p-6 border-t-2 border-t-[#FF9F0A] shadow-lg">
          <h3 className="text-label-caps text-on-surface-variant mb-2">ACTIVE CAMPAIGNS</h3>
          <div className="text-data-display-lg text-on-surface">{currentStats.activeCampaigns}</div>
        </div>
        <div className="glass-panel glass-panel-hover rounded-lg p-6 border-t-2 border-t-error bg-error/5 shadow-lg shadow-error/10">
          <h3 className="text-label-caps text-error mb-2">HIGH-RISK ALERTS</h3>
          <div className="text-data-display-lg text-error drop-shadow-[0_0_5px_rgba(255,180,171,0.5)]">{currentStats.highRiskAlerts}</div>
        </div>
        <div className="glass-panel glass-panel-hover rounded-lg p-6 border-t-2 border-t-tertiary-fixed shadow-lg flex flex-col justify-between">
          <h3 className="text-label-caps text-on-surface-variant mb-2">SYSTEM STATUS</h3>
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-tertiary-fixed animate-pulse shadow-[0_0_10px_rgba(108,255,130,1)]"></span>
            <span className="text-data-display-md text-tertiary-fixed">LIVE</span>
          </div>
        </div>
      </section>

      {/* Last Updated */}
      <div className="flex justify-end">
        <span className="text-label-small text-on-surface-variant">
          Last updated: {secondsAgo}s ago
        </span>
      </div>

      {/* Main 3-Column Workspace */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1">
        {/* Left: Campaign Sidebar */}
        <div className="lg:col-span-3 glass-panel glass-panel-hover rounded-lg flex flex-col overflow-hidden">
          <div className="p-4 border-b border-white/10 bg-surface-container-highest/50">
            <h2 className="text-label-caps text-on-surface">ACTIVE CAMPAIGNS</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {campaigns.map((campaign) => (
              <div
                key={campaign.id}
                onClick={() => { setSelectedCampaign(campaign); setTakedownState('idle'); }}
                className={`p-3 rounded-[0.25rem] cursor-pointer transition-all duration-200 ${
                  selectedCampaign?.id === campaign.id
                    ? `border ${campaign.borderColor} shadow-[0_0_15px_rgba(255,180,171,0.15)]`
                    : 'border border-white/10 bg-surface-container-low hover:bg-surface-container'
                }`}
                style={selectedCampaign?.id === campaign.id ? { backgroundColor: campaign.bgColor } : undefined}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: campaign.dotColor }}></span>
                    <span className={`text-body-main font-bold ${selectedCampaign?.id === campaign.id ? 'text-on-surface' : 'text-on-surface-variant'}`}>
                      {campaign.name}
                    </span>
                  </div>
                  <span
                    className="text-label-small px-2 py-0.5 rounded-full"
                    style={{
                      color: campaign.threatColor,
                      backgroundColor: `${campaign.threatColor}33`,
                    }}
                  >
                    {campaign.threatLevel}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Center: Campaign Detail */}
        <div className="lg:col-span-6 glass-panel glass-panel-hover rounded-lg flex flex-col overflow-hidden">
          <div className="p-6 border-b border-white/10 bg-surface-container-highest/30 flex justify-between items-center">
            <h2 className="text-data-display-md text-on-surface tracking-wide">{selectedCampaign.name.toUpperCase()}</h2>
            <span
              className="text-label-caps px-3 py-1 rounded-full shadow-[0_0_10px_rgba(255,180,171,0.2)]"
              style={{
                color: selectedCampaign.threatColor,
                backgroundColor: `${selectedCampaign.threatColor}33`,
                border: `1px solid ${selectedCampaign.threatColor}80`,
              }}
            >
              {selectedCampaign.threatLevel}
            </span>
          </div>
          <div className="p-6 flex-1 overflow-y-auto space-y-8">
            {/* Intercepted Messages */}
            <div>
              <h3 className="text-label-caps text-on-surface-variant mb-4">INTERCEPTED MESSAGES</h3>
              <div className="space-y-4">
                {selectedCampaign.messages.map((msg, i) => (
                  <div key={i} className="bg-[#05070A] border border-white/10 rounded-lg p-4 text-on-surface text-body-main">
                    {msg}
                  </div>
                ))}
              </div>
            </div>

            {/* Campaign Timeline */}
            <div>
              <h3 className="text-label-caps text-on-surface-variant mb-4">CAMPAIGN TIMELINE</h3>
              <div className="relative border-l border-white/20 ml-3 space-y-6">
                {selectedCampaign.timeline.map((item, i) => (
                  <div key={i} className="relative pl-6">
                    <span
                      className={`absolute left-[-5px] top-1 w-2 h-2 rounded-full ${
                        item.active ? 'bg-primary shadow-[0_0_5px_rgba(173,198,255,0.8)]' : 'bg-outline'
                      }`}
                    ></span>
                    <div className="text-label-small text-on-surface-variant">{item.time}</div>
                    <div className="text-body-main text-on-surface mt-1">{item.event}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Tools */}
        <div className="lg:col-span-3 flex flex-col gap-5">
          {/* Entities & Takedown */}
          <div className="glass-panel glass-panel-hover rounded-lg p-6 flex-1 flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-label-caps text-on-surface">EXTRACTED ENTITIES</h3>
              <button onClick={handleCopyAll} className="text-primary hover:text-primary-fixed transition-colors" title="Copy All">
                <span className="material-symbols-outlined text-[18px]">content_copy</span>
              </button>
            </div>
            <div className="space-y-4 mb-6 flex-1">
              <div>
                <span className="text-label-small text-on-surface-variant block mb-2">URLs</span>
                {selectedCampaign.entities.urls.map((url, i) => (
                  <div key={i} className="inline-flex items-center gap-2 bg-surface-container/50 border border-white/10 rounded-full px-3 py-1 text-body-main text-on-surface hover:bg-surface-container transition-colors mr-2 mb-2">
                    <span className="material-symbols-outlined text-[14px] text-primary">link</span>
                    {url}
                  </div>
                ))}
              </div>
              <div>
                <span className="text-label-small text-on-surface-variant block mb-2">UPI IDs</span>
                {selectedCampaign.entities.upiIds.map((upi, i) => (
                  <div key={i} className="inline-flex items-center gap-2 bg-surface-container/50 border border-white/10 rounded-full px-3 py-1 text-body-main text-on-surface hover:bg-surface-container transition-colors mr-2 mb-2">
                    <span className="material-symbols-outlined text-[14px] text-primary">account_balance_wallet</span>
                    {upi}
                  </div>
                ))}
              </div>
              <div>
                <span className="text-label-small text-on-surface-variant block mb-2">PHONES</span>
                <div className="flex flex-wrap gap-2">
                  {selectedCampaign.entities.phones.map((phone, i) => (
                    <div key={i} className="inline-flex items-center gap-2 bg-surface-container/50 border border-white/10 rounded-full px-3 py-1 text-body-main text-on-surface hover:bg-surface-container transition-colors">
                      <span className="material-symbols-outlined text-[14px] text-primary">call</span>
                      {phone}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <button
              onClick={handleTakedown}
              disabled={takedownState === 'loading'}
              className={`w-full mt-auto py-3 rounded-lg font-bold tracking-wide flex justify-center items-center gap-2 transition-all duration-300 ${
                takedownState === 'done'
                  ? 'bg-tertiary-container text-white shadow-[0_0_20px_rgba(71,226,102,0.4)]'
                  : takedownState === 'loading'
                  ? 'bg-gradient-to-r from-error/50 to-secondary-container/50 text-white/70 cursor-wait'
                  : 'bg-gradient-to-r from-error to-secondary-container text-white shadow-[0_0_20px_rgba(255,180,171,0.4)] hover:shadow-[0_0_30px_rgba(255,180,171,0.6)] hover:scale-[1.02]'
              }`}
            >
              <span className="material-symbols-outlined">
                {takedownState === 'done' ? 'check_circle' : takedownState === 'loading' ? 'hourglass_top' : 'block'}
              </span>
              {takedownState === 'done' ? 'TAKEDOWN INITIATED' : takedownState === 'loading' ? 'PROCESSING...' : 'INITIATE TAKEDOWN'}
            </button>
          </div>

          {/* Risk Check */}
          <div className="glass-panel glass-panel-hover rounded-lg p-6">
            <h3 className="text-label-caps text-on-surface mb-4">TRANSACTION RISK CHECK</h3>
            <div className="space-y-4">
              <input
                className="w-full bg-[#05070A] border border-white/10 rounded-[0.25rem] px-4 py-2 text-body-main text-on-surface focus:outline-none focus:border-primary focus:shadow-[0_0_10px_rgba(173,198,255,0.2)] transition-all placeholder:text-on-surface-variant/50"
                placeholder="Enter UPI ID / Acct"
                type="text"
                value={upiInput}
                onChange={(e) => setUpiInput(e.target.value)}
              />
              <input
                className="w-full bg-[#05070A] border border-white/10 rounded-[0.25rem] px-4 py-2 text-body-main text-on-surface focus:outline-none focus:border-primary focus:shadow-[0_0_10px_rgba(173,198,255,0.2)] transition-all placeholder:text-on-surface-variant/50"
                placeholder="Amount (INR)"
                type="text"
                value={amountInput}
                onChange={(e) => setAmountInput(e.target.value)}
              />
              <button
                onClick={handleCheckRisk}
                disabled={isCheckingRisk}
                className="w-full border border-primary text-primary hover:bg-primary/10 py-2 rounded-[0.25rem] font-bold transition-all duration-300 flex justify-center items-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">
                  {isCheckingRisk ? 'hourglass_top' : 'search'}
                </span>
                {isCheckingRisk ? 'CHECKING...' : 'CHECK RISK'}
              </button>

              {/* Risk Result */}
              {riskResult && (
                <div
                  className={`mt-4 border rounded-[0.25rem] p-4 flex items-start gap-3 ${
                    riskResult.risk === 'HIGH'
                      ? 'bg-error/10 border-error shadow-[0_0_15px_rgba(255,180,171,0.15)]'
                      : riskResult.risk === 'MEDIUM'
                      ? 'bg-[#FF9F0A]/10 border-[#FF9F0A]'
                      : 'bg-tertiary-fixed/10 border-tertiary-fixed shadow-[0_0_15px_rgba(71,226,102,0.15)]'
                  }`}
                >
                  <span className={`material-symbols-outlined mt-0.5 ${
                    riskResult.risk === 'HIGH' ? 'text-error' : riskResult.risk === 'MEDIUM' ? 'text-[#FF9F0A]' : 'text-tertiary-fixed'
                  }`}>
                    {riskResult.risk === 'HIGH' || riskResult.risk === 'MEDIUM' ? 'warning' : 'check_circle'}
                  </span>
                  <div>
                    <div className={`font-bold text-body-main ${
                      riskResult.risk === 'HIGH' ? 'text-error' : riskResult.risk === 'MEDIUM' ? 'text-[#FF9F0A]' : 'text-tertiary-fixed'
                    }`}>
                      {riskResult.risk === 'HIGH' ? 'HIGH RISK DETECTED' : riskResult.risk === 'MEDIUM' ? 'MEDIUM RISK' : 'LOW RISK — SAFE'}
                    </div>
                    <div className={`text-label-small mt-1 ${
                      riskResult.risk === 'HIGH' ? 'text-error-container' : riskResult.risk === 'MEDIUM' ? 'text-[#FF9F0A]/70' : 'text-tertiary-fixed-dim'
                    }`}>
                      {riskResult.risk === 'LOW'
                        ? 'Entity not found in any known scam campaigns. Transaction appears safe.'
                        : `Entity flagged in ${riskResult.reports} recent scam campaigns. Recommended action: Block immediately.`}
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
