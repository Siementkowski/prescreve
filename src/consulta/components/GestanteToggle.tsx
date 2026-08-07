import { HeartPulse } from 'lucide-react'
import { useConsultaStore } from '../store'

/** Ligado, o botão fica vermelho de forma permanente (não só o instante do clique) —
 *  é a "indicação visual permanente" pedida: a barra de ferramentas nunca some de tela. */
export function GestanteToggle() {
  const gestante = useConsultaStore((s) => s.gestante)
  const setGestante = useConsultaStore((s) => s.setGestante)
  const ocultar = useConsultaStore((s) => s.ocultarContraindicados)
  const setOcultar = useConsultaStore((s) => s.setOcultarContraindicados)

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => setGestante(!gestante)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
          gestante
            ? 'bg-danger text-white border-danger'
            : 'bg-surface-2 text-text-dim border-border hover:text-text'
        }`}
      >
        <HeartPulse className="w-4 h-4" />
        Gestante
        {gestante && <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
      </button>

      {gestante && (
        <label className="flex items-center gap-1.5 text-xs text-text-dim select-none cursor-pointer">
          <input
            type="checkbox"
            checked={ocultar}
            onChange={(e) => setOcultar(e.target.checked)}
            className="accent-danger w-3.5 h-3.5"
          />
          Ocultar contraindicados
        </label>
      )}
    </div>
  )
}
