import type { InputHTMLAttributes, TextareaHTMLAttributes } from 'react'
import { cn } from '../utils/cn'

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string
  error?: string
}

export function AppInput({ label, error, className, id, ...props }: InputProps) {
  const inputId = id ?? props.name
  return (
    <label className="grid gap-2 text-sm font-semibold text-slate-700" htmlFor={inputId}>
      <span>{label}</span>
      <input
        id={inputId}
        aria-invalid={Boolean(error)}
        aria-describedby={error && inputId ? `${inputId}-error` : undefined}
        className={cn(
          'h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-base text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-primary focus:ring-4 focus:ring-primary/10 read-only:bg-slate-50 read-only:text-slate-600',
          error && 'border-red-400 focus:border-red-500 focus:ring-red-100',
          className,
        )}
        {...props}
      />
      {error && <span id={inputId ? `${inputId}-error` : undefined} className="text-xs font-medium text-red-600">{error}</span>}
    </label>
  )
}

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string
  error?: string
}

export function AppTextarea({ label, error, className, id, ...props }: TextareaProps) {
  const inputId = id ?? props.name
  return (
    <label className="grid gap-2 text-sm font-semibold text-slate-700" htmlFor={inputId}>
      <span>{label}</span>
      <textarea
        id={inputId}
        aria-invalid={Boolean(error)}
        aria-describedby={error && inputId ? `${inputId}-error` : undefined}
        className={cn(
          'min-h-32 w-full resize-y rounded-xl border border-slate-200 bg-white p-4 text-base leading-6 text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-primary focus:ring-4 focus:ring-primary/10',
          error && 'border-red-400 focus:border-red-500 focus:ring-red-100',
          className,
        )}
        {...props}
      />
      {error && <span id={inputId ? `${inputId}-error` : undefined} className="text-xs font-medium text-red-600">{error}</span>}
    </label>
  )
}
