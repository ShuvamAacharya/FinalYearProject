import { type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Navbar from '../common/Navbar';

interface AppLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  backTo?: string;
  backLabel?: string;
  headerAction?: ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

const maxWidthMap = {
  sm:   'max-w-2xl',
  md:   'max-w-4xl',
  lg:   'max-w-6xl',
  xl:   'max-w-7xl',
  full: 'w-full',
};

export default function AppLayout({
  children,
  title,
  subtitle,
  showBack = false,
  backTo,
  backLabel = 'Back to Dashboard',
  headerAction,
  maxWidth = 'xl',
}: AppLayoutProps) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (backTo) navigate(backTo);
    else navigate(-1);
  };

  return (
    <div className="min-h-screen bg-[#0f1117] text-white">
      <Navbar />
      <div className={`${maxWidthMap[maxWidth]} mx-auto px-6 py-8`}>
        {showBack && (
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-blue-400 hover:text-blue-300 mb-6 transition font-semibold group"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            {backLabel}
          </button>
        )}
        {(title || headerAction) && (
          <div className="flex items-start justify-between mb-8">
            <div>
              {title && <h1 className="text-3xl font-bold text-white mb-1">{title}</h1>}
              {subtitle && <p className="text-gray-400 text-sm">{subtitle}</p>}
            </div>
            {headerAction && <div className="flex items-center gap-3">{headerAction}</div>}
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
