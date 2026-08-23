import { Search } from 'lucide-react'

export function SearchInput({
  value,
  onChange,
  placeholder = 'Buscar…',
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
}) {
  return (
    <div className="flex items-center gap-2 border border-border bg-surface rounded-[var(--radius-control,12px)] px-3 h-[var(--control-height,46px)] focus-within:border-text transition-colors">
      <Search className="w-4 h-4 text-text-dim shrink-0" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete="off"
        className="w-full bg-transparent outline-none text-sm text-text"
      />
    </div>
  )
}
