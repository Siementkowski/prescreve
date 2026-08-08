import { useConsultaStore } from '../store'
import { LABEL_MODO_TRATAMENTO } from '../../admin/types'
import type { ModoTratamento } from '../../admin/types'

const OPCOES: ModoTratamento[] = ['ambulatorial', 'hospitalar']

export function ModoToggle() {
  const modo = useConsultaStore((s) => s.modo)
  const setModo = useConsultaStore((s) => s.setModo)

  return (
    <div className="inline-flex rounded-lg border border-border bg-surface-2 p-1 shrink-0">
      {OPCOES.map((opcao) => (
        <button
          key={opcao}
          type="button"
          onClick={() => setModo(opcao)}
          className={`px-3.5 py-1.5 text-sm font-medium rounded-md transition-colors ${
            modo === opcao ? 'bg-accent text-accent-text' : 'text-text-dim hover:text-text'
          }`}
        >
          {LABEL_MODO_TRATAMENTO[opcao]}
        </button>
      ))}
    </div>
  )
}
