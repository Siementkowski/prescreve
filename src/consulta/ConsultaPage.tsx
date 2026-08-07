import { useConsultaStore } from './store'
import { useSyncStore } from '../core/sync'
import { ModoToggle } from './components/ModoToggle'
import { GestanteToggle } from './components/GestanteToggle'
import { BuscaGlobal } from './BuscaGlobal'
import { PainelAreas } from './PainelAreas'
import { PainelPatologias } from './PainelPatologias'
import { PainelTratamentos } from './PainelTratamentos'

export function ConsultaPage() {
  const carregandoInicial = useSyncStore((s) => s.carregandoInicial)
  const erro = useSyncStore((s) => s.erro)
  const areas = useSyncStore((s) => s.areas)
  const areaSelecionadaId = useConsultaStore((s) => s.areaSelecionadaId)
  const patologiaSelecionadaId = useConsultaStore((s) => s.patologiaSelecionadaId)

  // No mobile só um painel fica visível por vez — deriva a "profundidade" da navegação.
  const painelMobile =
    patologiaSelecionadaId != null ? 'tratamentos' : areaSelecionadaId != null ? 'patologias' : 'areas'

  if (carregandoInicial) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-sm text-text-dim">Carregando base…</p>
      </div>
    )
  }

  // Só bloqueia a tela inteira se não sobrou nada nem no cache — com cache, mostra os
  // dados normalmente e deixa o indicador de sincronização avisar do problema.
  if (erro && areas.length === 0) {
    return (
      <div className="h-full flex items-center justify-center px-6">
        <p className="text-sm text-danger bg-danger/10 border border-danger/30 rounded-md px-4 py-3">{erro}</p>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col min-h-0">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border shrink-0 flex-wrap">
        <ModoToggle />
        <GestanteToggle />
        <BuscaGlobal />
      </div>

      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-[280px_320px_1fr]">
        <PainelAreas visivelMobile={painelMobile === 'areas'} />
        <PainelPatologias visivelMobile={painelMobile === 'patologias'} />
        <PainelTratamentos visivelMobile={painelMobile === 'tratamentos'} />
      </div>
    </div>
  )
}
