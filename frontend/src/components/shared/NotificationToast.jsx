'use client';

import { useTheme } from '@/context/ThemeContext';

export default function NotificationToast({ notifications, onRemove }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  if (!notifications || notifications.length === 0) return null;

  const getTypeStyles = (type) => {
    switch (type) {
      case 'success':
        return isDark
          ? 'border-[#47e266] bg-[#47e266]/10 text-[#6cff82]'
          : 'border-emerald-400 bg-emerald-50 text-emerald-700';
      case 'error':
        return isDark
          ? 'border-[#ffb4ab] bg-[#ffb4ab]/10 text-[#ffb4ab]'
          : 'border-red-400 bg-red-50 text-red-700';
      case 'warning':
        return isDark
          ? 'border-[#FF9F0A] bg-[#FF9F0A]/10 text-[#FF9F0A]'
          : 'border-amber-400 bg-amber-50 text-amber-700';
      default:
        return isDark
          ? 'border-[#adc6ff] bg-[#adc6ff]/10 text-[#adc6ff]'
          : 'border-blue-400 bg-blue-50 text-blue-700';
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'success': return 'check_circle';
      case 'error': return 'error';
      case 'warning': return 'warning';
      default: return 'info';
    }
  };

  return (
    <div className="toast-container">
      {notifications.map((notif) => (
        <div
          key={notif.id}
          className={`animate-slide-in-right glass-panel rounded-lg p-4 min-w-[320px] max-w-[420px] border ${getTypeStyles(notif.type)} flex items-start gap-3 shadow-lg`}
        >
          <span className="material-symbols-outlined text-[20px] mt-0.5">
            {getIcon(notif.type)}
          </span>
          <div className="flex-1 text-sm font-medium">{notif.message}</div>
          <button
            onClick={() => onRemove(notif.id)}
            className={`transition-colors ${isDark ? 'text-white/40 hover:text-white/80' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>
      ))}
    </div>
  );
}
