import { useMemo, useState } from 'react'
import { CheckCircle2, Clock, MinusCircle, Info } from 'lucide-react'
import { usePediatriaStore } from './store'
import { idadeEmMeses, formatarIdade } from './idade'
import { calcularFerro, calcularVitaminaD, type RecomendacaoSuplemento } from './dados/suplementacao'

const ICONE_STATUS: Record<RecomendacaoSuplemento['status'], typeof CheckCircle2> = {
  iniciar: CheckCircle2,
  aguardar: Clock,
  concluido: MinusCircle,
  nao_aplicavel: MinusCircle,
}

const COR_STATUS: Record<RecomendacaoSuplemento['status'], string> = {
  iniciar: 'text-ok',
  aguardar: 'text-warn',
  concluido: 'text-text-dim',
  nao_aplicavel: 'text-text-dim',
}

/** Assistente de suplementação — Ferro e Vitamina D, com regra puramente etária (+
 *  prematuridade/baixo peso pro ferro, fatores de risco pra vit. D). Ver
 *  dados/suplementacao.ts pras fontes e o porquê de não incluir Vitamina A/Zinco. */
export function Suplementacao() {
  const dataNascimento = usePediatriaStore((s) => s.dataNascimento)
  const setDataNascimento = usePediatriaStore((s) => s.setDataNascimento)
  const [prematuroOuBaixoPeso, setPrematuroOuBaixoPeso] = useState(false)
  const [fatorRiscoVitaminaD, setFatorRiscoVitaminaD] = useState(false)

  const idadeMeses = useMemo(() => (dataNascimento ? idadeEmMeses(dataNascimento) : null), [dataNascimento])

  const recomendacoes = useMemo(() => {
    if (idadeMeses == null) return null
    const ctx = { idadeMeses, prematuroOuBaixoPeso, fatorRiscoVitaminaD }
    return [calcularFerro(ctx), calcularVitaminaD(ctx)]
  }, [idadeMeses, prematuroOuBaixoPeso, fatorRiscoVitaminaD])

  return (
    <div className="h-full flex flex-col min-h-0">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border shrink-0 flex-wrap">
        <label className="text-sm text-text-dim font-medium shrink-0">Data de nascimento</label>
        <input
          type="date"
          value={dataNascimento ?? ''}
          onChange={(e) => setDataNascimento(e.target.value || null)}
          max={new Date().toISOString().slice(0, 10)}
          className="bg-surface-2 border-2 border-accent/40 focus:border-accent rounded-lg px-3 py-1.5 text-sm font-semibold text-text outline-none transition-colors"
        />
        {idadeMeses != null && <span className="text-sm text-text-dim">{formatarIdade(idadeMeses)} de idade</span>}
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {idadeMeses == null ? (
          <p className="text-sm text-text-dim px-1 py-4">Informe a data de nascimento pra ver as recomendações.</p>
        ) : (
          <div className="max-w-2xl mx-auto flex flex-col gap-4">
            <div className="flex items-start gap-2 text-xs text-text-dim bg-surface-2 border border-border rounded-lg px-3 py-2.5">
              <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span>
                Regra geral pra maioria das crianças — prematuridade extrema e patologias de
                base sempre podem mudar a conduta individual.
              </span>
            </div>

            <div className="border border-border rounded-xl bg-surface p-4 flex flex-col gap-3">
              <p className="text-sm font-semibold text-text">Fatores de contexto</p>
              <label className="flex items-center gap-2.5 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={prematuroOuBaixoPeso}
                  onChange={(e) => setPrematuroOuBaixoPeso(e.target.checked)}
                  className="w-4 h-4 accent-[var(--color-accent)]"
                />
                Prematuro ou baixo peso ao nascer (muda o esquema de ferro)
              </label>
              <label className="flex items-center gap-2.5 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={fatorRiscoVitaminaD}
                  onChange={(e) => setFatorRiscoVitaminaD(e.target.checked)}
                  className="w-4 h-4 accent-[var(--color-accent)]"
                />
                Fator de risco pra deficiência de vitamina D (dieta vegetariana estrita,
                obesidade, hepatopatia/nefropatia crônica, má absorção, medicamentos)
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {recomendacoes?.map((r) => {
                const Icone = ICONE_STATUS[r.status]
                return (
                  <div key={r.nome} className="border border-border rounded-xl bg-surface p-4 flex flex-col gap-2">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-display text-base font-semibold text-text">{r.nome}</p>
                      <span className={`flex items-center gap-1.5 text-xs font-semibold ${COR_STATUS[r.status]}`}>
                        <Icone className="w-3.5 h-3.5" />
                        {r.rotuloStatus}
                      </span>
                    </div>
                    <p className="text-sm text-text">{r.dose}</p>
                    <p className="text-xs text-text-dim">{r.duracao}</p>
                    {r.observacao && <p className="text-xs text-text-dim/80 mt-1">{r.observacao}</p>}
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
