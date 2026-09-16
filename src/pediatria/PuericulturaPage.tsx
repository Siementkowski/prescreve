import { Syringe, ListChecks, Pill, Heart, ClipboardList } from 'lucide-react'
import { usePediatriaStore, type AbaPuericultura } from './store'
import { CalendarioVacinal } from './CalendarioVacinal'
import { MarcosDesenvolvimento } from './MarcosDesenvolvimento'
import { Suplementacao } from './Suplementacao'
import { Aleitamento } from './Aleitamento'
import { ExamesPorIdade } from './ExamesPorIdade'

const ABAS: { id: AbaPuericultura; label: string; icone: typeof Syringe }[] = [
  { id: 'calendario_vacinal', label: 'Calendário vacinal', icone: Syringe },
  { id: 'marcos_desenvolvimento', label: 'Marcos do desenvolvimento', icone: ListChecks },
  { id: 'suplementacao', label: 'Suplementação', icone: Pill },
  { id: 'aleitamento', label: 'Aleitamento', icone: Heart },
  { id: 'exames', label: 'Exames', icone: ClipboardList },
]

/** Puericultura — acompanhamento de rotina da criança saudável, agrupado numa aba própria
 *  dentro de Pediatria (mesmo espírito do módulo Gestantes, que também organiza suas
 *  sub-abas assim). Cada item já existia solto direto no nível de Pediatria; juntar aqui
 *  é só reorganização visual — nenhum dado/lógica mudou, cada tela continua independente. */
export function PuericulturaPage() {
  const abaAberta = usePediatriaStore((s) => s.abaPuericultura)
  const setAbaAberta = usePediatriaStore((s) => s.setAbaPuericultura)

  return (
    <div className="h-full flex flex-col min-h-0">
      <div className="flex items-center gap-1.5 px-4 py-3 border-b border-border shrink-0 overflow-x-auto">
        {ABAS.map(({ id, label, icone: Icone }) => (
          <button
            key={id}
            onClick={() => setAbaAberta(id)}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-sm font-medium rounded-[var(--radius-nav,10px)] border transition-colors whitespace-nowrap ${
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
        {abaAberta === 'calendario_vacinal' && <CalendarioVacinal />}
        {abaAberta === 'marcos_desenvolvimento' && <MarcosDesenvolvimento />}
        {abaAberta === 'suplementacao' && <Suplementacao />}
        {abaAberta === 'aleitamento' && <Aleitamento />}
        {abaAberta === 'exames' && <ExamesPorIdade />}
      </div>
    </div>
  )
}
