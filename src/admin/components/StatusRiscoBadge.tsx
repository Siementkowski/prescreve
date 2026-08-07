import type { StatusRisco } from '../types'
import { LABEL_STATUS_RISCO } from '../types'

const CORES: Record<StatusRisco, string> = {
  seguro: 'text-ok border-ok/40 bg-ok/10',
  cautela: 'text-warn border-warn/40 bg-warn/10',
  contraindicado: 'text-danger border-danger/40 bg-danger/10',
  sem_dados: 'text-text-dim border-border bg-surface-2',
}

export function StatusRiscoBadge({ status }: { status: StatusRisco | null }) {
  if (!status) return <span className="text-xs text-text-dim">—</span>
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full border ${CORES[status]}`}>
      {LABEL_STATUS_RISCO[status]}
    </span>
  )
}
