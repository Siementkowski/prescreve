import { useMemo, useState } from 'react'
import { CheckCircle2, Clock, MinusCircle, Info, ListChecks, Pill } from 'lucide-react'
import { useIGAtual } from './store'
import { formatarIG } from './idade'
import { Secao } from './components/Secao'
import {
  calcularAcidoFolico,
  calcularFerro,
  calcularCalcio,
  calcularAAS,
  calcularB12D,
  type RecomendacaoSuplementoGestante,
} from './dados/suplementacao'

const ICONE_STATUS: Record<RecomendacaoSuplementoGestante['status'], typeof CheckCircle2> = {
  iniciar: CheckCircle2,
  aguardar: Clock,
  concluido: MinusCircle,
  nao_aplicavel: MinusCircle,
}

const COR_STATUS: Record<RecomendacaoSuplementoGestante['status'], string> = {
  iniciar: 'text-ok',
  aguardar: 'text-warn',
  concluido: 'text-text-dim',
  nao_aplicavel: 'text-text-dim',
}

/** Suplementação de rotina no pré-natal — Ácido Fólico, Ferro, Cálcio, AAS e Vitaminas
 *  B12/D. Usa a IG calculada em Pré-natal (store compartilhada — ver gestantes/store.ts),
 *  então quem já calculou lá não precisa informar a DUM de novo aqui. Regra puramente da
 *  semana + fatores de risco marcados abaixo — ver dados/suplementacao.ts pro racional de
 *  cada janela. Não substitui julgamento clínico individual. */
export function Suplementacao() {
  const ig = useIGAtual()
  const [riscoFolatoAlto, setRiscoFolatoAlto] = useState(false)
  const [anemiaConfirmada, setAnemiaConfirmada] = useState(false)
  const [riscoPreEclampsia, setRiscoPreEclampsia] = useState(false)
  const [dietaRestritivaOuHipovitaminose, setDietaRestritivaOuHipovitaminose] = useState(false)

  const recomendacoes = useMemo(() => {
    const ctx = {
      semanasIG: ig?.semanas ?? null,
      riscoFolatoAlto,
      anemiaConfirmada,
      riscoPreEclampsia,
      dietaRestritivaOuHipovitaminose,
    }
    return [calcularAcidoFolico(ctx), calcularFerro(ctx), calcularCalcio(ctx), calcularAAS(ctx), calcularB12D(ctx)]
  }, [ig, riscoFolatoAlto, anemiaConfirmada, riscoPreEclampsia, dietaRestritivaOuHipovitaminose])

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="max-w-3xl mx-auto flex flex-col gap-4 pb-16">
        <div className="flex items-start gap-2 text-xs text-text-dim bg-surface-2 border border-border rounded-lg px-3 py-2.5">
          <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          <span>
            {ig
              ? `Idade gestacional atual: ${formatarIG(ig)} (calculada em Pré-natal).`
              : 'Sem idade gestacional calculada ainda — abra Pré-natal e calcule por DUM ou USG pra ver o status de cada suplemento por semana.'}{' '}
            Regra geral — casos individuais sempre podem mudar a conduta.
          </span>
        </div>

        <Secao titulo="Fatores de risco" icone={ListChecks}>
          <div className="flex flex-col gap-3">
            <label className="flex items-center gap-2.5 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={riscoFolatoAlto}
                onChange={(e) => setRiscoFolatoAlto(e.target.checked)}
                className="w-4 h-4 accent-[var(--color-accent)]"
              />
              Antecedente pessoal/familiar de defeito do tubo neural, epilepsia, uso de anticonvulsivantes, diabetes,
              obesidade, polimorfismos genéticos, doença inflamatória intestinal ou cirurgia bariátrica (eleva dose de
              ácido fólico)
            </label>
            <label className="flex items-center gap-2.5 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={anemiaConfirmada}
                onChange={(e) => setAnemiaConfirmada(e.target.checked)}
                className="w-4 h-4 accent-[var(--color-accent)]"
              />
              Anemia confirmada (Hb &lt; 11) — eleva dose de ferro elementar
            </label>
            <label className="flex items-center gap-2.5 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={riscoPreEclampsia}
                onChange={(e) => setRiscoPreEclampsia(e.target.checked)}
                className="w-4 h-4 accent-[var(--color-accent)]"
              />
              Alto risco para pré-eclâmpsia (HAS crônica, DM, gestação múltipla, história de PE...)
            </label>
            <label className="flex items-center gap-2.5 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={dietaRestritivaOuHipovitaminose}
                onChange={(e) => setDietaRestritivaOuHipovitaminose(e.target.checked)}
                className="w-4 h-4 accent-[var(--color-accent)]"
              />
              Dieta vegana estrita ou hipovitaminose identificada (B12/D)
            </label>
          </div>
        </Secao>

        <Secao titulo="Recomendações" icone={Pill}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {recomendacoes.map((r) => {
              const Icone = ICONE_STATUS[r.status]
              return (
                <div key={r.nome} className="border border-border rounded-lg p-3.5 flex flex-col gap-2">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-text">{r.nome}</p>
                    <span className={`flex items-center gap-1.5 text-xs font-semibold shrink-0 ${COR_STATUS[r.status]}`}>
                      <Icone className="w-3.5 h-3.5" />
                      {r.rotuloStatus}
                    </span>
                  </div>
                  <p className="text-sm text-text">{r.dose}</p>
                  <p className="text-xs text-text-dim">{r.janela}</p>
                  <p className="text-xs text-text-dim/80 mt-1">{r.indicacao}</p>
                  {r.observacao && <p className="text-xs text-text-dim/80 mt-1">{r.observacao}</p>}
                </div>
              )
            })}
          </div>
        </Secao>
      </div>
    </div>
  )
}
