import React from 'react';

interface FormContainerProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  onSubmit: (e: React.FormEvent) => void;
  isLoading?: boolean;
  error?: string;
}

export function FormContainer({
  children,
  title,
  subtitle,
  onSubmit,
  isLoading,
  error,
}: FormContainerProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-red-600 mb-2">🍜</h1>
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          {subtitle && (
            <p className="text-gray-600 mt-2">{subtitle}</p>
          )}
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            ❌ {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={onSubmit} className="space-y-4">
          {children}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className={`
              w-full py-2 rounded-lg font-semibold text-white
              transition duration-200
              ${isLoading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-red-600 hover:bg-red-700'
              }
            `}
          >
            {isLoading ? '⏳ Loading...' : 'Submit'}
          </button>
        </form>
      </div>
    </div>
  );
}