import { AlertOctagon } from 'lucide-react'
import { tempoDesdeRevisao } from '../../core/revisao'

/** Selo evidente, sempre visível junto da prescrição — nunca escondido em tooltip.
 *  O maior risco do app não é bug, é dado desatualizado com cara de confiável. */
export function SeloRevisao({ revisadoEm }: { revisadoEm: string | null }) {
  return (
    <span className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full border text-danger border-danger/50 bg-danger/15">
      <AlertOctagon className="w-3.5 h-3.5" />
      Revisar — {tempoDesdeRevisao(revisadoEm)}
    </span>
  )
}
