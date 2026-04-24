'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { fraudShieldData } from '@/lib/mockData';

const riskColorMap = {
  critical: { bg: 'bg-error/20', border: 'border-error', text: 'text-error', glow: 'shadow-[0_0_15px_rgba(255,180,171,0.3)]', dot: 'bg-error' },
  high: { bg: 'bg-[#FF9F0A]/20', border: 'border-[#FF9F0A]', text: 'text-[#FF9F0A]', glow: 'shadow-[0_0_15px_rgba(255,159,10,0.3)]', dot: 'bg-[#FF9F0A]' },
  medium: { bg: 'bg-[#FFD60A]/20', border: 'border-[#FFD60A]', text: 'text-[#FFD60A]', glow: 'shadow-[0_0_15px_rgba(255,214,10,0.3)]', dot: 'bg-[#FFD60A]' },
  low: { bg: 'bg-tertiary-fixed/20', border: 'border-tertiary-fixed', text: 'text-tertiary-fixed', glow: '', dot: 'bg-tertiary-fixed' },
};

const typeIconMap = {
  upi: 'account_balance_wallet',
  url: 'link',
  phone: 'call',
};

const severityConfig = {
  critical: { bg: 'bg-error/10', text: 'text-error', icon: 'error' },
  high: { bg: 'bg-[#FF9F0A]/10', text: 'text-[#FF9F0A]', icon: 'warning' },
  info: { bg: 'bg-primary/10', text: 'text-primary', icon: 'info' },
  success: { bg: 'bg-tertiary-fixed/10', text: 'text-tertiary-fixed', icon: 'check_circle' },
};

export default function FraudShieldPage() {
  const [selectedNode, setSelectedNode] = useState(null);
  const { networkNodes, activityFeed } = fraudShieldData;

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-primary text-2xl">query_stats</span>
          <h2 className="text-data-display-md text-on-surface tracking-wide">FRAUD SHIELD</h2>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-label-caps text-on-surface-variant">ENTITIES TRACKED</span>
          <span className="text-data-display-md text-primary">{networkNodes.length}</span>
        </div>
      </div>

      <section className="grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1">
        {/* Network Visualization */}
        <div className="lg:col-span-8 glass-panel glass-panel-hover rounded-lg flex flex-col overflow-hidden">
          <div className="p-4 border-b border-white/10 bg-surface-container-highest/30 flex justify-between items-center">
            <h3 className="text-label-caps text-on-surface">ENTITY NETWORK GRAPH</h3>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-error"></span>
                <span className="text-label-small text-on-surface-variant">Critical</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#FF9F0A]"></span>
                <span className="text-label-small text-on-surface-variant">High</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#FFD60A]"></span>
                <span className="text-label-small text-on-surface-variant">Medium</span>
              </div>
            </div>
          </div>

          {/* SVG Network Graph */}
          <div className="flex-1 p-6 min-h-[450px] relative">
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
              {/* Connection Lines */}
              {networkNodes.map((node) =>
                node.connections.map((connId) => {
                  const target = networkNodes.find((n) => n.id === connId);
                  if (!target) return null;
                  return (
                    <line
                      key={`${node.id}-${connId}`}
                      x1={node.x}
                      y1={node.y}
                      x2={target.x}
                      y2={target.y}
                      stroke="rgba(173, 198, 255, 0.15)"
                      strokeWidth="0.3"
                      strokeDasharray="1,1"
                    />
                  );
                })
              )}
              {/* Nodes */}
              {networkNodes.map((node) => {
                const colors = riskColorMap[node.risk];
                const isSelected = selectedNode?.id === node.id;
                return (
                  <g key={node.id} onClick={() => setSelectedNode(node)} className="cursor-pointer">
                    {/* Glow ring */}
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={isSelected ? 4 : 3}
                      fill="none"
                      stroke={node.risk === 'critical' ? '#ffb4ab' : node.risk === 'high' ? '#FF9F0A' : '#FFD60A'}
                      strokeWidth="0.3"
                      opacity={isSelected ? 0.8 : 0.3}
                    />
                    {/* Core */}
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={isSelected ? 2.5 : 1.8}
                      fill={node.risk === 'critical' ? '#ffb4ab' : node.risk === 'high' ? '#FF9F0A' : '#FFD60A'}
                      opacity={0.9}
                    />
                    {/* Label */}
                    <text
                      x={node.x}
                      y={node.y + 5}
                      textAnchor="middle"
                      fill="#c2c6d6"
                      fontSize="2.2"
                      fontFamily="Inter"
                    >
                      {node.label.length > 18 ? node.label.slice(0, 18) + '...' : node.label}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Right Panel: Entity List + Activity */}
        <div className="lg:col-span-4 flex flex-col gap-5">
          {/* Entity Risk List */}
          <div className="glass-panel glass-panel-hover rounded-lg flex flex-col overflow-hidden flex-1">
            <div className="p-4 border-b border-white/10 bg-surface-container-highest/30">
              <h3 className="text-label-caps text-on-surface">FLAGGED ENTITIES</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {networkNodes.map((node) => {
                const colors = riskColorMap[node.risk];
                return (
                  <div
                    key={node.id}
                    onClick={() => setSelectedNode(node)}
                    className={`p-3 rounded-[0.25rem] border cursor-pointer transition-all duration-200 ${
                      selectedNode?.id === node.id
                        ? `${colors.bg} ${colors.border} ${colors.glow}`
                        : 'border-white/10 bg-surface-container-low hover:bg-surface-container'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`material-symbols-outlined text-[14px] ${colors.text}`}>
                          {typeIconMap[node.type]}
                        </span>
                        <span className="text-body-main text-on-surface text-xs truncate max-w-[160px]">{node.label}</span>
                      </div>
                      <span className={`text-label-small ${colors.text} ${colors.bg} px-2 py-0.5 rounded-full border ${colors.border}`}>
                        {node.risk.toUpperCase()}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Activity Feed */}
          <div className="glass-panel glass-panel-hover rounded-lg flex flex-col overflow-hidden max-h-[350px]">
            <div className="p-4 border-b border-white/10 bg-surface-container-highest/30 flex justify-between items-center">
              <h3 className="text-label-caps text-on-surface">ACTIVITY FEED</h3>
              <span className="w-2 h-2 rounded-full bg-tertiary-fixed animate-pulse shadow-[0_0_6px_rgba(108,255,130,0.8)]"></span>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {activityFeed.map((item) => {
                const sev = severityConfig[item.severity] || severityConfig.info;
                return (
                  <div key={item.id} className={`p-3 rounded-[0.25rem] ${sev.bg} border border-white/5`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`material-symbols-outlined text-[14px] ${sev.text}`}>{sev.icon}</span>
                      <span className="text-label-small text-on-surface-variant">{item.time}</span>
                    </div>
                    <p className="text-body-main text-on-surface text-xs">{item.message}</p>
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
