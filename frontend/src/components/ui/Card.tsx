import { type ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
  accent?: 'blue' | 'green' | 'red' | 'purple' | 'yellow';
}

const accentColors = {
  blue:   'border-blue-500',
  green:  'border-green-500',
  red:    'border-red-500',
  purple: 'border-purple-500',
  yellow: 'border-yellow-500',
};

export default function Card({ children, className = '', hover = false, onClick, accent }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`
        bg-[#1a1d27] border rounded-lg p-6
        ${accent ? accentColors[accent] : 'border-gray-700'}
        ${hover ? 'hover:border-gray-500 transition cursor-pointer' : ''}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
}
