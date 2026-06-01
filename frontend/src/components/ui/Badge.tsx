interface BadgeProps {
  status: 'pending' | 'approved' | 'rejected' | 'passed' | 'failed';
  label?: string;
}

const badgeStyles = {
  pending:  'bg-yellow-600/20 text-yellow-400 border-yellow-600/30',
  approved: 'bg-green-600/20  text-green-400  border-green-600/30',
  rejected: 'bg-red-600/20    text-red-400    border-red-600/30',
  passed:   'bg-green-600/20  text-green-400  border-green-600/30',
  failed:   'bg-red-600/20    text-red-400    border-red-600/30',
};

const badgeLabels = {
  pending:  'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
  passed:   'Passed',
  failed:   'Failed',
};

export default function Badge({ status, label }: BadgeProps) {
  return (
    <span className={`px-3 py-1 border rounded-full text-xs font-semibold ${badgeStyles[status]}`}>
      {label || badgeLabels[status]}
    </span>
  );
}
