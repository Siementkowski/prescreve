import { WifiOff } from 'lucide-react'
import { useSyncStore } from '../../core/sync'

/** Fica visível o tempo todo que o admin estiver sem rede — os dados que aparecem aqui
 *  ainda são os do cache, mas qualquer tentativa de salvar vai ser recusada (ver admin/api.ts). */
export function OfflineBanner() {
  const online = useSyncStore((s) => s.online)
  if (online) return null

  return (
    <div className="flex items-center gap-2 bg-danger/10 border-b border-danger/30 px-4 py-2 text-sm text-danger shrink-0">
      <WifiOff className="w-4 h-4 shrink-0" />
      Sem conexão — edição bloqueada até a rede voltar. Você está vendo os dados da última sincronização.
    </div>
  )
}
