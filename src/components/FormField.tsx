import { FieldError, FieldValues, Path, UseFormRegister } from 'react-hook-form';

type Option = { value: string; label: string };

interface FormFieldProps<T extends FieldValues> {
  label: string;
  name: Path<T>;
  register: UseFormRegister<T>;
  error?: FieldError;
  type?: string;
  as?: 'input' | 'textarea' | 'select';
  options?: Option[];
  placeholder?: string;
  disabled?: boolean;
  readOnly?: boolean;
  rows?: number;
  required?: boolean;
  onInput?: (event: React.FormEvent<HTMLInputElement>) => void;
}

export const FormField = <T extends FieldValues>({
  label,
  name,
  register,
  error,
  type = 'text',
  as = 'input',
  options = [],
  placeholder,
  disabled,
  readOnly,
  rows = 3,
  required,
  onInput,
}: FormFieldProps<T>) => {
  const fieldClasses =
    'w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-hospital-teal focus:ring-2 focus:ring-hospital-teal/20 disabled:bg-slate-100 disabled:text-slate-500 read-only:bg-slate-50 read-only:text-hospital-navy read-only:font-semibold';

  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-slate-700">
        {label} {required ? <span className="text-red-600">*</span> : null}
      </span>
      {as === 'textarea' ? (
        <textarea
          {...register(name, required ? { required: 'Este campo es obligatorio' } : undefined)}
          rows={rows}
          disabled={disabled}
          readOnly={readOnly}
          placeholder={placeholder}
          className={`${fieldClasses} min-h-[96px] resize-y`}
        />
      ) : as === 'select' ? (
        <select {...register(name, required ? { required: 'Este campo es obligatorio' } : undefined)} disabled={disabled} className={fieldClasses}>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          {...register(name, required ? { required: 'Este campo es obligatorio' } : undefined)}
          type={type}
          disabled={disabled}
          readOnly={readOnly}
          placeholder={placeholder}
          onInput={onInput}
          className={fieldClasses}
        />
      )}
      {error ? <span className="mt-1 block text-xs font-medium text-red-600">{error.message}</span> : null}
    </label>
  );
};
