import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCheck, ChevronRight } from 'lucide-react';
import axios from '../../api/axios';
import { useAuthStore } from '../../store/authStore';

export interface AppNotification {
  id: string;
  type: string;
  message: string;
  link: string;
  count: number;
}

const READ_STORAGE_KEY = 'educity-notification-read';

type ReadState = Record<string, number>;

function loadReadState(): ReadState {
  try {
    const raw = localStorage.getItem(READ_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveReadState(state: ReadState) {
  localStorage.setItem(READ_STORAGE_KEY, JSON.stringify(state));
}

function getEffectiveUnread(notifications: AppNotification[], readState: ReadState) {
  let total = 0;
  for (const n of notifications) {
    const acknowledged = readState[n.id] ?? 0;
    if (n.count > acknowledged) {
      total += n.count - acknowledged;
    }
  }
  return total;
}

interface NotificationDropdownProps {
  /** Light navbar vs dark header */
  variant?: 'light' | 'dark';
}

const NotificationDropdown = ({ variant = 'dark' }: NotificationDropdownProps) => {
  const navigate = useNavigate();
  const token = useAuthStore((s) => s.token);
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [readState, setReadState] = useState<ReadState>(loadReadState);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const { data } = await axios.get('/notifications');
      setNotifications(data.notifications || []);
    } catch {
      /* silent — bell hidden on failure is ok */
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const unreadCount = getEffectiveUnread(notifications, readState);

  const markAllRead = () => {
    const next: ReadState = { ...readState };
    notifications.forEach((n) => {
      next[n.id] = n.count;
    });
    setReadState(next);
    saveReadState(next);
  };

  const handleNavigate = (link: string, id: string, count: number) => {
    const next = { ...readState, [id]: count };
    setReadState(next);
    saveReadState(next);
    setOpen(false);
    navigate(link);
  };

  if (!token) return null;

  const isLight = variant === 'light';
  const bellBtnClass = isLight
    ? 'relative p-2 rounded-full text-gray-600 hover:text-primary-600 hover:bg-gray-100 transition-colors'
    : 'relative p-2 rounded-full text-gray-400 hover:text-white hover:bg-white/5 transition-colors';

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={bellBtnClass}
        aria-label="Notifications"
        aria-expanded={open}
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold leading-none">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          className={`absolute right-0 top-full mt-2 w-80 max-w-[calc(100vw-2rem)] rounded-xl shadow-2xl z-[60] border overflow-hidden ${
            isLight ? 'bg-white border-gray-200' : 'border-[#2d3748]'
          }`}
          style={isLight ? undefined : { background: '#1a1d27' }}
        >
          <div
            className={`flex items-center justify-between px-4 py-3 border-b ${
              isLight ? 'border-gray-100' : 'border-[#2d3748]'
            }`}
          >
            <p className={`font-semibold text-sm ${isLight ? 'text-gray-900' : 'text-white'}`}>
              Notifications
            </p>
            {notifications.length > 0 && unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllRead}
                className={`flex items-center gap-1 text-xs font-medium ${
                  isLight ? 'text-primary-600 hover:text-primary-700' : 'text-green-400 hover:text-green-300'
                }`}
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-72 overflow-y-auto">
            {loading && notifications.length === 0 ? (
              <p className={`px-4 py-8 text-center text-sm ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>
                Loading…
              </p>
            ) : notifications.length === 0 ? (
              <p className={`px-4 py-8 text-center text-sm ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>
                No pending actions — you&apos;re all caught up!
              </p>
            ) : (
              notifications.map((n) => {
                const acknowledged = readState[n.id] ?? 0;
                const isUnread = n.count > acknowledged;
                return (
                  <button
                    key={n.id}
                    type="button"
                    onClick={() => handleNavigate(n.link, n.id, n.count)}
                    className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-colors border-b last:border-b-0 ${
                      isLight
                        ? 'border-gray-50 hover:bg-gray-50'
                        : 'border-[#2d3748]/50 hover:bg-[#0f1117]'
                    } ${isUnread ? (isLight ? 'bg-primary-50/50' : 'bg-purple-500/5') : ''}`}
                  >
                    <span
                      className={`shrink-0 mt-0.5 min-w-[22px] h-[22px] flex items-center justify-center rounded-full text-xs font-bold ${
                        isUnread ? 'bg-red-500 text-white' : isLight ? 'bg-gray-200 text-gray-600' : 'bg-gray-700 text-gray-400'
                      }`}
                    >
                      {n.count}
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className={`block text-sm ${isLight ? 'text-gray-800' : 'text-gray-200'}`}>
                        {n.message}
                      </span>
                    </span>
                    <ChevronRight className={`w-4 h-4 shrink-0 mt-0.5 ${isLight ? 'text-gray-400' : 'text-gray-600'}`} />
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
