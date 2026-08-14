import { formasAgrupadas, FORMAS_CONFIG, type FormaFarmaceutica } from '../../core/formas'

/** Seletor de forma farmacêutica em toggles agrupados (Sólidos · Líquidos · Parenterais ·
 *  Outros) — grupos e formas vêm de core/formas.ts, nada fixo aqui. Se a forma atual não é
 *  selecionável (caso do legado 'frasco'), mostra um chip somente-leitura separado em vez
 *  de forçar a pessoa a trocar pra continuar editando os outros campos. */
export function FormaToggle({
  valor,
  onChange,
}: {
  valor: string
  onChange: (forma: FormaFarmaceutica) => void
}) {
  const grupos = formasAgrupadas()
  const configAtual = FORMAS_CONFIG[valor as FormaFarmaceutica]
  const naoSelecionavel = valor && configAtual && configAtual.selecionavel === false

  return (
    <div className="flex flex-col gap-2.5">
      {naoSelecionavel && (
        <p className="text-xs text-text-dim bg-surface-2 border border-dashed border-border rounded-md px-2.5 py-1.5">
          Forma cadastrada como <strong className="text-text">{configAtual.rotulo}</strong> — mantida por não ter
          uma forma equivalente segura no catálogo atual. Não é possível escolhê-la de novo, só preservá-la aqui.
        </p>
      )}
      {grupos.map((g) => (
        <div key={g.grupo} className="flex flex-col gap-1">
          <span className="text-[11px] font-medium text-text-dim uppercase tracking-wide">{g.label}</span>
          <div className="flex flex-wrap gap-1.5">
            {g.formas.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => onChange(f)}
                className={`px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                  valor === f
                    ? 'bg-accent-dim border-accent text-accent'
                    : 'bg-surface-2 border-border text-text-dim hover:text-text hover:border-text-dim'
                }`}
              >
                {FORMAS_CONFIG[f].rotulo}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
