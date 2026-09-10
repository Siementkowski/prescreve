import { useMemo } from 'react'
import { Info } from 'lucide-react'
import { useSyncStore } from '../core/sync'
import { FluxogramaViewer } from '../fluxogramas/FluxogramaViewer'

const CATEGORIA_PEDIATRIA = 'Pediatria'

/** Condutas pediátricas por faixa etária (quando pedir exame, suplementação etc.) —
 *  reaproveita o mesmo mecanismo de Fluxogramas (Fases 1/2): não é um cadastro à parte,
 *  é só um recorte da biblioteca geral filtrado por categoria = "Pediatria". Cadastro
 *  continua em Painel → Fluxogramas, mesma fonte de verdade que alimenta /fluxogramas. */
export function CondutasPediatricas() {
  const fluxogramasTodos = useSyncStore((s) => s.fluxogramas)
  const carregandoInicial = useSyncStore((s) => s.carregandoInicial)

  const condutas = useMemo(
    () =>
      fluxogramasTodos
        .filter((f) => f.categoria === CATEGORIA_PEDIATRIA)
        .sort((a, b) => a.titulo.localeCompare(b.titulo, 'pt-BR')),
    [fluxogramasTodos]
  )

  if (carregandoInicial) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-sm text-text-dim">Carregando base…</p>
      </div>
    )
  }

  if (condutas.length === 0) {
    return (
      <div className="h-full flex items-center justify-center px-6">
        <div className="text-center max-w-sm flex flex-col items-center gap-2">
          <Info className="w-5 h-5 text-text-faint" />
          <p className="text-sm text-text-dim">
            Nenhuma conduta cadastrada ainda. Cadastre em Painel → Fluxogramas, usando a
            categoria "{CATEGORIA_PEDIATRIA}" — ela aparece aqui e também em /fluxogramas.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full min-h-0 p-4 flex flex-col">
      <FluxogramaViewer fluxogramas={condutas} />
    </div>
  )
}
