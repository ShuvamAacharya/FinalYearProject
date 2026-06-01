import { type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  backTo?: string;
  backLabel?: string;
  action?: ReactNode;
}

export default function PageHeader({
  title,
  subtitle,
  showBack,
  backTo = '/student/dashboard',
  backLabel = 'Back to Dashboard',
  action,
}: PageHeaderProps) {
  const navigate = useNavigate();
  return (
    <div className="mb-8">
      {showBack && (
        <button
          onClick={() => navigate(backTo)}
          className="flex items-center gap-2 text-blue-400 hover:text-blue-300 mb-4 transition font-semibold group"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          {backLabel}
        </button>
      )}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">{title}</h1>
          {subtitle && <p className="text-gray-400 text-sm mt-1">{subtitle}</p>}
        </div>
        {action && <div>{action}</div>}
      </div>
      <div className="border-t border-gray-700 mt-4" />
    </div>
  );
}
