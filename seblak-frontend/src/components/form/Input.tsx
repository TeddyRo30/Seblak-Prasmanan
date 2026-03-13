import { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export function Input({
  label,
  error,
  helperText,
  className,
  ...props
}: InputProps) {
  return (
    <div className="mb-4">
      {label && (
        <label className="block text-gray-700 font-semibold mb-2">
          {label}
        </label>
      )}
      
      <input
        className={`
          w-full px-4 py-2 border rounded-lg
          focus:outline-none focus:ring-2 focus:ring-red-500
          ${error ? 'border-red-500 bg-red-50' : 'border-gray-300'}
          ${className || ''}
        `}
        {...props}
      />
      
      {error && (
        <p className="text-red-500 text-sm mt-1">
          ❌ {error}
        </p>
      )}
      
      {helperText && !error && (
        <p className="text-gray-500 text-sm mt-1">
          {helperText}
        </p>
      )}
    </div>
  );
}