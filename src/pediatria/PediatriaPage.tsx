import { Calculator, Syringe, ListChecks, Workflow } from 'lucide-react'
import { usePediatriaStore, type AbaPediatria } from './store'
import { CalculadoraDose } from './CalculadoraDose'
import { CalendarioVacinal } from './CalendarioVacinal'
import { MarcosDesenvolvimento } from './MarcosDesenvolvimento'

const ABAS: { id: AbaPediatria; label: string; icone: typeof Calculator }[] = [
  { id: 'calculadora', label: 'Calculadora', icone: Calculator },
  { id: 'calendario_vacinal', label: 'Calendário vacinal', icone: Syringe },
  { id: 'marcos_desenvolvimento', label: 'Marcos do desenvolvimento', icone: ListChecks },
  { id: 'condutas', label: 'Condutas', icone: Workflow },
]

/** Casca do módulo de Pediatria — sub-nav entre os 4 módulos (Fase 3 do plano). Só
 *  "Calculadora" está ligada nesta fase; as outras entram nas Fases 4 e 5, sem precisar
 *  mexer aqui de novo (só trocar o placeholder pelo componente real). */
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
        {abaAberta === 'condutas' && (
          <div className="h-full flex items-center justify-center px-6">
            <p className="text-sm text-text-dim text-center max-w-xs">Condutas — em breve.</p>
          </div>
        )}
      </div>
    </div>
  )
}
