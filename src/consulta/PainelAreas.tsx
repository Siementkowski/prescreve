import { useMemo } from 'react'
import { useConsultaStore } from './store'
import { useSyncStore } from '../core/sync'
import { areasVisiveis } from './filtros'
import { IconePorNome } from '../admin/components/IconPicker'

export function PainelAreas({ visivelMobile }: { visivelMobile: boolean }) {
  const modo = useConsultaStore((s) => s.modo)
  const areas = useSyncStore((s) => s.areas)
  const areaSelecionadaId = useConsultaStore((s) => s.areaSelecionadaId)
  const selecionarArea = useConsultaStore((s) => s.selecionarArea)

  const visiveis = useMemo(() => areasVisiveis(areas, modo), [areas, modo])

  return (
    <div className={`${visivelMobile ? 'flex' : 'hidden'} lg:flex flex-col min-h-0 border-border lg:border-r`}>
      <div className="px-4 py-3 border-b border-border shrink-0">
        <h2 className="text-xs font-semibold text-text-dim uppercase tracking-wide">Áreas</h2>
      </div>
      <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-1">
        {visiveis.length === 0 ? (
          <p className="text-sm text-text-dim px-2 py-4">Nenhuma área cadastrada para este modo.</p>
        ) : (
          visiveis.map((area) => (
            <button
              key={area.id}
              onClick={() => selecionarArea(area.id)}
              className={`w-full flex items-center gap-3 text-left px-3 py-2.5 rounded-lg border transition-colors ${
                areaSelecionadaId === area.id
                  ? 'bg-surface-2 border-accent'
                  : 'bg-transparent border-transparent hover:bg-surface-2'
              }`}
            >
              <span
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                style={{ backgroundColor: (area.cor ?? '#3ba7ff') + '22', color: area.cor ?? '#3ba7ff' }}
              >
                <IconePorNome nome={area.icone} className="w-4 h-4" />
              </span>
              <span className="text-sm text-text font-medium">{area.nome}</span>
            </button>
          ))
        )}
      </div>
    </div>
  )
}
