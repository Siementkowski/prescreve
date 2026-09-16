import { Calculator, Workflow, Baby, AlertTriangle } from 'lucide-react'
import { usePediatriaStore, type AbaPediatria } from './store'
import { CalculadoraDose } from './CalculadoraDose'
import { PuericulturaPage } from './PuericulturaPage'
import { CondutasPediatricas } from './CondutasPediatricas'
import { SinaisAlertaTEA } from './SinaisAlertaTEA'

const ABAS: { id: AbaPediatria; label: string; icone: typeof Calculator }[] = [
  { id: 'calculadora', label: 'Calculadora', icone: Calculator },
  { id: 'puericultura', label: 'Puericultura', icone: Baby },
  { id: 'condutas', label: 'Condutas', icone: Workflow },
  { id: 'sinais_alerta_tea', label: 'Sinais de alerta (TEA)', icone: AlertTriangle },
]

/** Casca do módulo de Pediatria — sub-nav entre os módulos. Puericultura agrupa o
 *  acompanhamento de rotina da criança saudável (calendário vacinal, marcos do
 *  desenvolvimento, suplementação, aleitamento, exames) numa aba só, com seu próprio
 *  sub-nav — ver PuericulturaPage.tsx. */
export function PediatriaPage() {
  const abaAberta = usePediatriaStore((s) => s.abaAberta)
  const setAbaAberta = usePediatriaStore((s) => s.setAbaAberta)

  return (
    <div className="h-full flex flex-col min-h-0">
      <div className="flex items-center gap-1.5 px-4 py-3 border-b border-border shrink-0 overflow-x-auto">
        {ABAS.map(({ id, label, icone: Icone }) => (
          <button
            key={id}
            onClick={() => setAbaAberta(id)}
            className={`flex items-center gap-2 px-3.5 py-2.5 text-sm font-medium rounded-[var(--radius-nav,10px)] transition-colors whitespace-nowrap ${
              abaAberta === id ? 'bg-text text-bg' : 'text-text hover:bg-surface-3'
            }`}
          >
            <Icone className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      <div className="flex-1 min-h-0">
        {abaAberta === 'calculadora' && <CalculadoraDose />}
        {abaAberta === 'puericultura' && <PuericulturaPage />}
        {abaAberta === 'condutas' && <CondutasPediatricas />}
        {abaAberta === 'sinais_alerta_tea' && <SinaisAlertaTEA />}
      </div>
    </div>
  )
}
