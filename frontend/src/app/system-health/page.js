'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { systemHealthData } from '@/lib/mockData';
import { useTheme } from '@/context/ThemeContext';

const statusColorsDark = {
  operational: { text: 'text-tertiary-fixed', bg: 'bg-tertiary-fixed/10', border: 'border-tertiary-fixed/30', dot: 'bg-tertiary-fixed', label: 'OPERATIONAL' },
  degraded: { text: 'text-[#FF9F0A]', bg: 'bg-[#FF9F0A]/10', border: 'border-[#FF9F0A]/30', dot: 'bg-[#FF9F0A]', label: 'DEGRADED' },
  down: { text: 'text-error', bg: 'bg-error/10', border: 'border-error/30', dot: 'bg-error', label: 'DOWN' },
};

const statusColorsLight = {
  operational: { text: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-300', dot: 'bg-emerald-500', label: 'OPERATIONAL' },
  degraded: { text: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-300', dot: 'bg-amber-500', label: 'DEGRADED' },
  down: { text: 'text-red-600', bg: 'bg-red-50', border: 'border-red-300', dot: 'bg-red-500', label: 'DOWN' },
};

const logLevelColorsDark = {
  INFO: 'text-primary',
  WARN: 'text-[#FF9F0A]',
  ERROR: 'text-error',
};

const logLevelColorsLight = {
  INFO: 'text-blue-600',
  WARN: 'text-amber-600',
  ERROR: 'text-red-600',
};

export default function SystemHealthPage() {
  const { services, performanceMetrics, recentLogs } = systemHealthData;
  const [logFilter, setLogFilter] = useState('ALL');
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const statusColors = isDark ? statusColorsDark : statusColorsLight;
  const logLevelColors = isDark ? logLevelColorsDark : logLevelColorsLight;

  const filteredLogs = logFilter === 'ALL' ? recentLogs : recentLogs.filter(l => l.level === logFilter);

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-primary text-2xl">terminal</span>
          <h2 className="text-data-display-md text-on-surface tracking-wide">SYSTEM HEALTH</h2>
        </div>
        <div className="flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-tertiary-fixed animate-pulse" style={{ boxShadow: '0 0 8px rgba(108,255,130,0.8)' }}></span>
          <span className="text-label-caps text-tertiary-fixed">ALL SYSTEMS NOMINAL</span>
        </div>
      </div>

      {/* Service Status Cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {services.map(svc => {
          const sc = statusColors[svc.status];
          return (
            <div key={svc.id} className={`glass-panel glass-panel-hover rounded-2xl p-4 border-t-2 ${sc.border}`}>
              <div className="flex items-center gap-2 mb-2">
                <span className={`w-2 h-2 rounded-full ${sc.dot} ${svc.status === 'degraded' ? 'animate-pulse' : ''}`}></span>
                <span className="text-label-small text-on-surface-variant">{svc.name.toUpperCase()}</span>
              </div>
              <div className={`text-label-small ${sc.text} ${sc.bg} px-2 py-0.5 rounded-full inline-block mb-3 border ${sc.border}`}>{sc.label}</div>
              <div className="space-y-1 text-label-small">
                <div className="flex justify-between"><span className="text-on-surface-variant">Uptime</span><span className="text-on-surface font-semibold">{svc.uptime}%</span></div>
                <div className="flex justify-between"><span className="text-on-surface-variant">Latency</span><span className="text-on-surface font-semibold">{svc.latency}</span></div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Load</span>
                  <span className={`font-semibold ${
                    svc.load > 80 ? 'text-error' : svc.load > 60 ? (isDark ? 'text-[#FF9F0A]' : 'text-amber-600') : 'text-tertiary-fixed'
                  }`}>{svc.load}%</span>
                </div>
              </div>
            </div>
          );
        })}
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1">
        {/* Performance Metrics */}
        <div className="lg:col-span-7 glass-panel glass-panel-hover rounded-2xl flex flex-col overflow-hidden">
          <div className={`p-4 border-b ${isDark ? 'border-white/10 bg-surface-container-highest/30' : 'border-slate-100 bg-slate-50/40'}`}>
            <h3 className="text-label-caps text-on-surface">PERFORMANCE METRICS</h3>
          </div>
          <div className="p-6 grid grid-cols-2 gap-6">
            {/* CPU */}
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-label-caps text-on-surface-variant">CPU USAGE</span>
                <span className="text-body-main text-primary font-semibold">{performanceMetrics.cpu[performanceMetrics.cpu.length - 1]}%</span>
              </div>
              <div className="flex items-end gap-1 h-20">
                {performanceMetrics.cpu.map((v, i) => (
                  <div key={i} className="flex-1 rounded-t-sm transition-all" style={{
                    height: `${v}%`,
                    backgroundColor: v > 70 ? (isDark ? '#ffb4ab' : '#ef4444') : v > 50 ? (isDark ? '#FF9F0A' : '#f59e0b') : (isDark ? '#adc6ff' : '#3b82f6'),
                    opacity: isDark ? 0.6 : 0.7
                  }}></div>
                ))}
              </div>
            </div>
            {/* Memory */}
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-label-caps text-on-surface-variant">MEMORY</span>
                <span className="text-body-main text-primary font-semibold">{performanceMetrics.memory[performanceMetrics.memory.length - 1]}%</span>
              </div>
              <div className="flex items-end gap-1 h-20">
                {performanceMetrics.memory.map((v, i) => (
                  <div key={i} className="flex-1 rounded-t-sm transition-all" style={{
                    height: `${v}%`,
                    backgroundColor: v > 80 ? (isDark ? '#ffb4ab' : '#ef4444') : v > 65 ? (isDark ? '#FF9F0A' : '#f59e0b') : (isDark ? '#47e266' : '#22c55e'),
                    opacity: isDark ? 0.6 : 0.7
                  }}></div>
                ))}
              </div>
            </div>
            {/* Network I/O */}
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-label-caps text-on-surface-variant">NETWORK I/O</span>
                <span className="text-body-main text-primary font-semibold">{performanceMetrics.networkIO[performanceMetrics.networkIO.length - 1]} MB/s</span>
              </div>
              <div className="flex items-end gap-1 h-20">
                {performanceMetrics.networkIO.map((v, i) => (
                  <div key={i} className="flex-1 rounded-t-sm transition-all" style={{
                    height: `${(v / 200) * 100}%`,
                    backgroundColor: isDark ? 'rgba(173,198,255,0.5)' : 'rgba(59,130,246,0.5)'
                  }}></div>
                ))}
              </div>
            </div>
            {/* Requests */}
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-label-caps text-on-surface-variant">REQUESTS/SEC</span>
                <span className="text-body-main text-primary font-semibold">{performanceMetrics.requestsPerSec[performanceMetrics.requestsPerSec.length - 1].toLocaleString()}</span>
              </div>
              <div className="flex items-end gap-1 h-20">
                {performanceMetrics.requestsPerSec.map((v, i) => (
                  <div key={i} className="flex-1 rounded-t-sm transition-all" style={{
                    height: `${(v / 3500) * 100}%`,
                    backgroundColor: isDark ? 'rgba(71,226,102,0.5)' : 'rgba(34,197,94,0.5)'
                  }}></div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Logs Panel */}
        <div className="lg:col-span-5 glass-panel glass-panel-hover rounded-2xl flex flex-col overflow-hidden">
          <div className={`p-4 border-b flex justify-between items-center ${isDark ? 'border-white/10 bg-surface-container-highest/30' : 'border-slate-100 bg-slate-50/40'}`}>
            <h3 className="text-label-caps text-on-surface">SYSTEM LOGS</h3>
            <div className="flex gap-2">
              {['ALL', 'ERROR', 'WARN', 'INFO'].map(level => (
                <button key={level} onClick={() => setLogFilter(level)}
                  className={`text-label-small px-2 py-0.5 rounded-full transition-colors ${
                    logFilter === level
                      ? isDark ? 'bg-primary/20 text-primary border border-primary/30' : 'bg-blue-100 text-blue-700 border border-blue-200'
                      : isDark ? 'text-on-surface-variant hover:bg-white/5' : 'text-slate-500 hover:bg-slate-100'
                  }`}>
                  {level}
                </button>
              ))}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 font-mono text-xs space-y-1">
            {filteredLogs.map(log => (
              <div key={log.id} className={`flex gap-3 py-1.5 border-b transition-colors px-2 rounded-sm ${
                isDark ? 'border-white/5 hover:bg-white/5' : 'border-slate-100 hover:bg-slate-50'
              }`}>
                <span className="text-on-surface-variant shrink-0 w-24">{log.timestamp}</span>
                <span className={`shrink-0 w-12 font-bold ${logLevelColors[log.level]}`}>{log.level}</span>
                <span className={`shrink-0 w-28 truncate ${isDark ? 'text-primary/70' : 'text-blue-500/70'}`}>{log.service}</span>
                <span className="text-on-surface">{log.message}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Uptime Bar */}
      <div className="glass-panel rounded-2xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div>
            <span className="text-label-caps text-on-surface-variant block">OVERALL UPTIME</span>
            <span className="text-data-display-lg text-tertiary-fixed">99.87%</span>
          </div>
          <div>
            <span className="text-label-caps text-on-surface-variant block">INCIDENTS (24H)</span>
            <span className={`text-data-display-lg ${isDark ? 'text-[#FF9F0A]' : 'text-amber-600'}`}>2</span>
          </div>
          <div>
            <span className="text-label-caps text-on-surface-variant block">MTTR</span>
            <span className="text-data-display-lg text-primary">4.2 min</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-label-small text-on-surface-variant">30-DAY UPTIME</span>
          <div className="flex gap-0.5">
            {Array.from({ length: 30 }, (_, i) => (
              <div key={i} className={`w-2 h-6 rounded-sm ${
                i === 18 || i === 24
                  ? isDark ? 'bg-[#FF9F0A]/60' : 'bg-amber-400/60'
                  : isDark ? 'bg-tertiary-fixed/40' : 'bg-emerald-400/40'
              }`}></div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
