import { FileText, Pill, Syringe, AlertTriangle } from 'lucide-react'
import { useGestantesStore, type AbaGestantes } from './store'
import { GuiaConsulta } from './GuiaConsulta'
import { Suplementacao } from './Suplementacao'
import { Vacinacao } from './Vacinacao'
import { Intercorrencias } from './Intercorrencias'

const ABAS: { id: AbaGestantes; label: string; icone: typeof FileText }[] = [
  { id: 'guia_consulta', label: 'Pré-natal', icone: FileText },
  { id: 'suplementacao', label: 'Suplementação', icone: Pill },
  { id: 'vacinacao', label: 'Vacinação', icone: Syringe },
  { id: 'intercorrencias', label: 'Intercorrências comuns', icone: AlertTriangle },
]

/** Casca do módulo de Gestantes — mesmo padrão do PediatriaPage.tsx: sub-nav entre os
 *  módulos, cada aba independente (dado próprio em dados/*.ts), estado da calculadora de
 *  IG compartilhado via store pra não pedir a DUM de novo em cada aba. */
export function GestantesPage() {
  const abaAberta = useGestantesStore((s) => s.abaAberta)
  const setAbaAberta = useGestantesStore((s) => s.setAbaAberta)

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
        {abaAberta === 'guia_consulta' && <GuiaConsulta />}
        {abaAberta === 'suplementacao' && <Suplementacao />}
        {abaAberta === 'vacinacao' && <Vacinacao />}
        {abaAberta === 'intercorrencias' && <Intercorrencias />}
      </div>
    </div>
  )
}
