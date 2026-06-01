interface EmptyStateProps {
  icon?: string;
  title: string;
  message?: string;
  action?: { label: string; onClick: () => void };
}

export default function EmptyState({ icon, title, message, action }: EmptyStateProps) {
  return (
    <div className="text-center py-16">
      {icon && <div className="text-5xl mb-4">{icon}</div>}
      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      {message && <p className="text-gray-400 mb-6">{message}</p>}
      {action && (
        <button
          onClick={action.onClick}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
