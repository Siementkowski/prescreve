import { useMemo } from 'react'
import { ArrowLeft } from 'lucide-react'
import { useConsultaStore } from './store'
import { useSyncStore } from '../core/sync'
import { patologiasVisiveis } from './filtros'

export function PainelPatologias({ visivelMobile }: { visivelMobile: boolean }) {
  const modo = useConsultaStore((s) => s.modo)
  const areas = useSyncStore((s) => s.areas)
  const patologias = useSyncStore((s) => s.patologias)
  const tratamentos = useSyncStore((s) => s.tratamentos)
  const areaSelecionadaId = useConsultaStore((s) => s.areaSelecionadaId)
  const patologiaSelecionadaId = useConsultaStore((s) => s.patologiaSelecionadaId)
  const selecionarPatologia = useConsultaStore((s) => s.selecionarPatologia)
  const voltar = useConsultaStore((s) => s.voltar)

  const area = areas.find((a) => a.id === areaSelecionadaId) ?? null

  const visiveis = useMemo(
    () => (areaSelecionadaId != null ? patologiasVisiveis(patologias, areaSelecionadaId, tratamentos, modo) : []),
    [patologias, areaSelecionadaId, tratamentos, modo]
  )

  return (
    <div className={`${visivelMobile ? 'flex' : 'hidden'} lg:flex flex-col min-h-0 border-border lg:border-r`}>
      <div className="px-4 py-3 border-b border-border shrink-0 flex items-center gap-2">
        <button
          onClick={voltar}
          className="lg:hidden text-text-dim hover:text-text transition-colors -ml-1 p-1"
          aria-label="Voltar"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h2 className="text-xs font-semibold text-text-dim uppercase tracking-wide">
          Patologias{area ? ` — ${area.nome}` : ''}
        </h2>
      </div>
      <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-1">
        {areaSelecionadaId == null ? (
          <p className="text-sm text-text-dim px-2 py-4">Selecione uma área.</p>
        ) : visiveis.length === 0 ? (
          <p className="text-sm text-text-dim px-2 py-4">Nenhuma patologia com tratamento neste modo.</p>
        ) : (
          visiveis.map((p) => (
            <button
              key={p.id}
              onClick={() => selecionarPatologia(p.id)}
              className={`w-full text-left px-3 py-2.5 rounded-lg border transition-colors ${
                patologiaSelecionadaId === p.id
                  ? 'bg-surface-2 border-accent'
                  : 'bg-transparent border-transparent hover:bg-surface-2'
              }`}
            >
              <span className="block text-sm text-text font-medium">{p.nome}</span>
              {p.sinonimos && <span className="block text-xs text-text-dim truncate mt-0.5">{p.sinonimos}</span>}
            </button>
          ))
        )}
      </div>
    </div>
  )
}
