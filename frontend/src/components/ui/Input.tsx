interface InputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (val: string) => void;
  type?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
}

export default function Input({
  label,
  placeholder,
  value,
  onChange,
  type = 'text',
  error,
  required,
  disabled,
}: InputProps) {
  return (
    <div className="mb-4">
      {label && (
        <label className="block text-sm font-semibold text-gray-300 mb-2">
          {label} {required && <span className="text-red-400">*</span>}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={`
          w-full px-4 py-3 bg-[#1a1d27] border rounded-lg text-white
          placeholder-gray-500 focus:outline-none transition
          ${error ? 'border-red-500 focus:border-red-500' : 'border-gray-700 focus:border-blue-500'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      />
      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
    </div>
  );
}
