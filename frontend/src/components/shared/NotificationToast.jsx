'use client';

export default function NotificationToast({ notifications, onRemove }) {
  if (!notifications || notifications.length === 0) return null;

  const getTypeStyles = (type) => {
    switch (type) {
      case 'success':
        return 'border-[#47e266] bg-[#47e266]/10 text-[#6cff82]';
      case 'error':
        return 'border-[#ffb4ab] bg-[#ffb4ab]/10 text-[#ffb4ab]';
      case 'warning':
        return 'border-[#FF9F0A] bg-[#FF9F0A]/10 text-[#FF9F0A]';
      default:
        return 'border-[#adc6ff] bg-[#adc6ff]/10 text-[#adc6ff]';
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
            className="text-white/40 hover:text-white/80 transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>
      ))}
    </div>
  );
}
