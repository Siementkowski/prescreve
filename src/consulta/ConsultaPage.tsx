import { useSyncStore } from '../core/sync'
import { ModoToggle } from './components/ModoToggle'
import { GestanteToggle } from './components/GestanteToggle'
import { BuscaGlobal } from './BuscaGlobal'
import { SeletorBreadcrumb } from './SeletorBreadcrumb'
import { PainelTratamentos } from './PainelTratamentos'

export function ConsultaPage() {
  const carregandoInicial = useSyncStore((s) => s.carregandoInicial)
  const erro = useSyncStore((s) => s.erro)
  const areas = useSyncStore((s) => s.areas)

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
      <div className="flex flex-col items-center gap-4 px-6 sm:px-9 pt-8 pb-5 shrink-0">
        <h1 className="font-display text-[36px] font-bold tracking-[-1.2px] text-text">Consulta</h1>
        <div className="flex items-center gap-3 flex-wrap w-full max-w-4xl">
          <ModoToggle />
          <GestanteToggle />
          <BuscaGlobal />
        </div>
        <SeletorBreadcrumb />
      </div>

      <PainelTratamentos />
    </div>
  )
}
