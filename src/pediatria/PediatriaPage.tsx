import { Calculator, Syringe, ListChecks, Workflow, ClipboardList, Pill, Heart, AlertTriangle } from 'lucide-react'
import { usePediatriaStore, type AbaPediatria } from './store'
import { CalculadoraDose } from './CalculadoraDose'
import { CalendarioVacinal } from './CalendarioVacinal'
import { MarcosDesenvolvimento } from './MarcosDesenvolvimento'
import { CondutasPediatricas } from './CondutasPediatricas'
import { ExamesPorIdade } from './ExamesPorIdade'
import { Suplementacao } from './Suplementacao'
import { Aleitamento } from './Aleitamento'
import { SinaisAlertaTEA } from './SinaisAlertaTEA'

const ABAS: { id: AbaPediatria; label: string; icone: typeof Calculator }[] = [
  { id: 'calculadora', label: 'Calculadora', icone: Calculator },
  { id: 'calendario_vacinal', label: 'Calendário vacinal', icone: Syringe },
  { id: 'marcos_desenvolvimento', label: 'Marcos do desenvolvimento', icone: ListChecks },
  { id: 'exames', label: 'Exames', icone: ClipboardList },
  { id: 'suplementacao', label: 'Suplementação', icone: Pill },
  { id: 'aleitamento', label: 'Aleitamento', icone: Heart },
  { id: 'sinais_alerta_tea', label: 'Sinais de alerta (TEA)', icone: AlertTriangle },
  { id: 'condutas', label: 'Condutas', icone: Workflow },
]

/** Casca do módulo de Pediatria — sub-nav entre os módulos. Cada aba nova é independente
 *  (dado próprio em dados/*.ts) — "organizar depois" é sobre agrupar visualmente, não
 *  sobre arquitetura: adicionar mais uma aba aqui não exige tocar nas outras. */
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
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-sm font-medium rounded-lg border transition-colors whitespace-nowrap ${
              abaAberta === id
                ? 'bg-accent-dim border-accent text-accent'
                : 'bg-surface border-border text-text-dim hover:text-text hover:border-text-dim'
            }`}
          >
            <Icone className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      <div className="flex-1 min-h-0">
        {abaAberta === 'calculadora' && <CalculadoraDose />}
        {abaAberta === 'calendario_vacinal' && <CalendarioVacinal />}
        {abaAberta === 'marcos_desenvolvimento' && <MarcosDesenvolvimento />}
        {abaAberta === 'exames' && <ExamesPorIdade />}
        {abaAberta === 'suplementacao' && <Suplementacao />}
        {abaAberta === 'aleitamento' && <Aleitamento />}
        {abaAberta === 'sinais_alerta_tea' && <SinaisAlertaTEA />}
        {abaAberta === 'condutas' && <CondutasPediatricas />}
      </div>
    </div>
  )
}
