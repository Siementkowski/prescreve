import { AlertTriangle, AlertCircle, HelpCircle } from 'lucide-react'
import type { StatusRisco } from '../../admin/types'

/** Alerta automático de gestação — aparece sempre que o medicamento tiver status cadastrado,
 *  independente de qualquer toggle. É o ponto mais importante do módulo: não pode depender
 *  de alguém lembrar de checar. */
export function AlertaGestacao({ status, obs }: { status: StatusRisco | null; obs: string | null }) {
  if (!status || status === 'seguro') return null

  if (status === 'contraindicado') {
    return (
      <div className="flex items-start gap-2 text-sm text-white bg-danger border border-danger rounded-md px-3 py-2.5 font-medium">
        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
        <span>
          Contraindicado na gestação
          {obs && <span className="block font-normal opacity-90 mt-0.5">{obs}</span>}
        </span>
      </div>
    )
  }

  if (status === 'cautela') {
    return (
      <div className="flex items-start gap-2 text-sm text-warn bg-warn/10 border border-warn/30 rounded-md px-3 py-2">
        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
        <span>
          Cautela na gestação
          {obs && <span className="block text-text-dim mt-0.5">{obs}</span>}
        </span>
      </div>
    )
  }

  // sem_dados
  return (
    <div className="flex items-center gap-2 text-xs text-text-dim">
      <HelpCircle className="w-3.5 h-3.5 shrink-0" />
      <span>Sem dados de segurança na gestação</span>
    </div>
  )
}
