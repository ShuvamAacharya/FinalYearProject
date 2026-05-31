import { useEffect, useState, type CSSProperties } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../api/axios';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';
import ProfileDropdown from '../../components/common/ProfileDropdown';

const BG     = '#0f1117';
const CARD   = '#1a1d27';
const BORDER = '#2d3748';

const DarkHeader = ({ user, onLogout }: { user: any; onLogout: () => void }) => (
  <header className="sticky top-0 z-40 px-6 py-4" style={{ backgroundColor: CARD, borderBottom: `1px solid ${BORDER}` }}>
    <div className="max-w-7xl mx-auto flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center shrink-0">
          <span className="text-white font-bold text-sm leading-none">E</span>
        </div>
        <span className="text-white font-semibold text-base">EduCity</span>
      </div>
      {user && (
        <ProfileDropdown
          user={{ name: user.name, role: user.role, email: user.email }}
          onLogout={onLogout}
        />
      )}
    </div>
  </header>
);

const STATUS_FILTERS = ['all', 'success', 'pending', 'failed'] as const;
type StatusFilter = typeof STATUS_FILTERS[number];

const statusStyle: Record<string, CSSProperties> = {
  success: { backgroundColor: 'rgba(34,197,94,0.12)',  color: '#4ade80', border: '1px solid rgba(34,197,94,0.3)'  },
  pending: { backgroundColor: 'rgba(234,179,8,0.12)',  color: '#facc15', border: '1px solid rgba(234,179,8,0.3)'  },
  failed:  { backgroundColor: 'rgba(239,68,68,0.12)',  color: '#f87171', border: '1px solid rgba(239,68,68,0.3)'  },
};

const PaymentLogs = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const [payments, setPayments]     = useState<any[]>([]);
  const [loading, setLoading]       = useState(true);
  const [filter, setFilter]         = useState<StatusFilter>('all');

  useEffect(() => { fetchPayments(filter); }, [filter]);

  const fetchPayments = async (status: StatusFilter) => {
    setLoading(true);
    try {
      const { data } = await axios.get('/esewa/logs', {
        params: { status },
      });
      setPayments(data.data || []);
    } catch {
      toast.error('Failed to load payment logs');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => { logout(); navigate('/'); };

  const filtered = filter === 'all'
    ? payments
    : payments.filter((p) => p.status === filter);

  const totalRevenue = payments
    .filter((p) => p.status === 'success')
    .reduce((sum, p) => sum + (p.amount ?? 0), 0);

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: BG, fontFamily: 'Inter, system-ui, sans-serif' }}>
      <DarkHeader user={user} onLogout={handleLogout} />

      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">

        {/* Page header + revenue */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Payment Logs</h1>
            <p className="text-gray-400 text-sm mt-1">All transactions across the platform</p>
          </div>
          <div className="rounded-xl px-5 py-3 text-right" style={{ backgroundColor: CARD, border: `1px solid ${BORDER}` }}>
            <p className="text-gray-400 text-xs">Total Revenue</p>
            <p className="text-green-400 font-bold text-xl">Rs. {totalRevenue.toLocaleString()}</p>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex items-center gap-2 mb-6 flex-wrap">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className="px-4 py-1.5 rounded-full text-sm font-medium capitalize transition-colors"
              style={
                filter === s
                  ? { backgroundColor: 'rgba(34,197,94,0.15)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.35)' }
                  : { backgroundColor: 'transparent', color: '#9ca3af', border: `1px solid ${BORDER}` }
              }
            >
              {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
              {s !== 'all' && (
                <span className="ml-1.5 opacity-60">
                  ({payments.filter((p) => p.status === s).length})
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="rounded-xl overflow-hidden" style={{ backgroundColor: CARD, border: `1px solid ${BORDER}` }}>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <div className="w-8 h-8 rounded-full border-2 border-green-500 border-t-transparent animate-spin" />
              <p className="text-gray-400 text-sm animate-pulse">Loading transactions…</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-500">
              <span className="text-4xl mb-3">💳</span>
              <p className="text-sm">No transactions found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: `1px solid ${BORDER}`, backgroundColor: '#1f2937' }}>
                    {['Student', 'Course', 'Amount', 'Method', 'Status', 'Transaction ID', 'Date'].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: BORDER }}>
                  {filtered.map((p) => (
                    <tr key={p._id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-4 py-3">
                        <p className="text-white font-medium truncate max-w-[140px]">{p.student?.name ?? '—'}</p>
                        <p className="text-gray-500 text-xs truncate max-w-[140px]">{p.student?.email}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-gray-300 truncate max-w-[160px]">{p.course?.title ?? '—'}</p>
                      </td>
                      <td className="px-4 py-3 text-white font-semibold whitespace-nowrap">
                        Rs. {p.amount?.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-gray-400 capitalize">{p.paymentMethod}</td>
                      <td className="px-4 py-3">
                        <span
                          className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize"
                          style={statusStyle[p.status] ?? statusStyle.pending}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-gray-500 text-xs font-mono" title={p.transactionUuid}>
                          {p.transactionUuid?.slice(0, 12)}…
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-400 whitespace-nowrap">
                        {new Date(p.createdAt).toLocaleDateString('en-US', {
                          month: 'short', day: 'numeric', year: 'numeric',
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentLogs;
