import type { ReactNode } from 'react'
import { Plus } from 'lucide-react'
import { SearchInput } from './SearchInput'

/** Layout padrão das telas de admin: lista à esquerda (busca + itens + botão adicionar),
 *  formulário de edição à direita. Desktop-first — duas colunas lado a lado. */
export function AdminPageShell({
  busca,
  onBuscaChange,
  buscaPlaceholder,
  onNovo,
  labelNovo,
  lista,
  formulario,
  extraHeader,
}: {
  busca: string
  onBuscaChange: (v: string) => void
  buscaPlaceholder?: string
  onNovo: () => void
  labelNovo: string
  lista: ReactNode
  formulario: ReactNode
  extraHeader?: ReactNode
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6 h-full min-h-0">
      <div className="flex flex-col gap-3 min-h-0">
        {extraHeader}
        <div className="flex gap-2">
          <div className="flex-1">
            <SearchInput value={busca} onChange={onBuscaChange} placeholder={buscaPlaceholder} />
          </div>
          <button
            onClick={onNovo}
            className="shrink-0 flex items-center gap-1.5 bg-accent hover:bg-accent/90 text-white text-sm font-medium rounded-md px-3 py-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            {labelNovo}
          </button>
        </div>
        <div className="flex-1 overflow-y-auto flex flex-col gap-1.5 pr-1">{lista}</div>
      </div>

      <div className="min-h-0 overflow-y-auto">{formulario}</div>
    </div>
  )
}
