import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react'

const inputClass =
  'bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm text-text outline-none focus:border-accent focus:ring-1 focus:ring-accent/40 transition-colors w-full disabled:opacity-50'

function FieldShell({
  label,
  hint,
  children,
  className,
}: {
  label: string
  hint?: string
  children: ReactNode
  className?: string
}) {
  return (
    <label className={`flex flex-col gap-1.5 ${className ?? ''}`}>
      <span className="text-[11px] font-medium text-text-dim uppercase tracking-wide">{label}</span>
      {children}
      {hint && <span className="text-xs text-text-dim/80">{hint}</span>}
    </label>
  )
}

export function TextField({
  label,
  hint,
  className,
  ...props
}: { label: string; hint?: string; className?: string } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <FieldShell label={label} hint={hint} className={className}>
      <input {...props} className={inputClass} />
    </FieldShell>
  )
}

export function TextAreaField({
  label,
  hint,
  className,
  textareaClassName,
  ...props
}: {
  label: string
  hint?: string
  className?: string
  /** Classes extras no <textarea> em si (ex: fonte mono) — `className` vai no wrapper. */
  textareaClassName?: string
} & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <FieldShell label={label} hint={hint} className={className}>
      <textarea {...props} className={`${inputClass} resize-y min-h-20 ${textareaClassName ?? ''}`} />
    </FieldShell>
  )
}

export function SelectField({
  label,
  hint,
  className,
  children,
  ...props
}: { label: string; hint?: string; className?: string } & SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <FieldShell label={label} hint={hint} className={className}>
      <select {...props} className={inputClass}>
        {children}
      </select>
    </FieldShell>
  )
}

export function CheckboxField({
  label,
  checked,
  onChange,
  className,
}: {
  label: string
  checked: boolean
  onChange: (v: boolean) => void
  className?: string
}) {
  return (
    <label className={`flex items-center gap-2 text-sm text-text ${className ?? ''}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="accent-accent w-4 h-4"
      />
      {label}
    </label>
  )
}
