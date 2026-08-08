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
    <div className="relative">
      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-dim" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-surface-2 border border-border rounded-lg pl-8 pr-3 py-2 text-sm text-text outline-none focus:border-accent focus:ring-1 focus:ring-accent/40 transition-colors"
      />
    </div>
  )
}
