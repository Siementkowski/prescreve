import type { ReactNode } from 'react'
import { Plus } from 'lucide-react'
import { SearchInput } from './SearchInput'

/** Layout padrão das telas de admin: lista à esquerda (busca + itens + botão adicionar),
 *  formulário de edição à direita — o "workspace" de duas colunas do Painel Editorial, um
 *  único painel com borda de 18px de raio, o lado da lista em surface-2. */
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
    <div className="grid grid-cols-1 lg:grid-cols-[315px_1fr] h-full min-h-0 border border-border rounded-[var(--radius-panel,18px)] overflow-hidden bg-surface">
      <div className="flex flex-col gap-3 min-h-0 border-b lg:border-b-0 lg:border-r border-border bg-surface-2 p-5">
        {extraHeader}
        <div className="flex gap-2">
          <div className="flex-1">
            <SearchInput value={busca} onChange={onBuscaChange} placeholder={buscaPlaceholder} />
          </div>
          <button
            onClick={onNovo}
            className="shrink-0 flex items-center gap-1.5 bg-text hover:opacity-90 text-bg text-sm font-semibold rounded-[var(--radius-pill,999px)] px-4 py-2.5 transition-opacity"
          >
            <Plus className="w-4 h-4" />
            {labelNovo}
          </button>
        </div>
        <div className="flex-1 overflow-y-auto flex flex-col gap-1.5 pr-1">{lista}</div>
      </div>

      <div className="min-h-0 overflow-y-auto p-7">{formulario}</div>
    </div>
  )
}
