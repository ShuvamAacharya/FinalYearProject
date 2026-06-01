import { type ReactNode } from 'react';

interface StatCardProps {
  icon: ReactNode;
  label: string;
  value: string | number;
  sub?: string;
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'teal';
  onClick?: () => void;
}

const colorMap = {
  blue:   { bg: 'bg-blue-600/20',   text: 'text-blue-400',   border: 'hover:border-blue-500' },
  green:  { bg: 'bg-green-600/20',  text: 'text-green-400',  border: 'hover:border-green-500' },
  purple: { bg: 'bg-purple-600/20', text: 'text-purple-400', border: 'hover:border-purple-500' },
  orange: { bg: 'bg-orange-600/20', text: 'text-orange-400', border: 'hover:border-orange-500' },
  teal:   { bg: 'bg-teal-600/20',   text: 'text-teal-400',   border: 'hover:border-teal-500' },
};

export default function StatCard({ icon, label, value, sub, color = 'blue', onClick }: StatCardProps) {
  const c = colorMap[color];
  return (
    <div
      onClick={onClick}
      className={`bg-[#1a1d27] border border-gray-700 rounded-lg p-6 ${c.border} transition ${onClick ? 'cursor-pointer' : ''}`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 ${c.bg} rounded-lg ${c.text}`}>{icon}</div>
        <span className={`text-3xl font-bold ${c.text}`}>{value}</span>
      </div>
      <p className="text-gray-400 text-sm font-semibold">{label}</p>
      {sub && <p className="text-gray-500 text-xs mt-1">{sub}</p>}
    </div>
  );
}
