import type { ComponentPropsWithRef } from 'react';

interface FormFieldProps extends ComponentPropsWithRef<'input'> {
  label: string;
  error?: string;
}

// ช่องกรอกพร้อมป้ายและข้อความ error (ใช้กับ react-hook-form: <FormField {...register('x')} />)
export default function FormField({ label, error, id, ...inputProps }: FormFieldProps) {
  const inputId = id ?? inputProps.name;
  return (
    <div>
      <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <input
        id={inputId}
        {...inputProps}
        aria-invalid={!!error}
        className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:outline-none ${
          error ? 'border-red-400 focus:ring-red-400' : 'border-gray-300 focus:ring-indigo-500'
        }`}
      />
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
}
