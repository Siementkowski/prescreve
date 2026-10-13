import { useMemo, useState } from 'react'
import { CheckCircle2, Clock, MinusCircle, Info, ListChecks, Pill } from 'lucide-react'
import { useIGAtual } from './store'
import { formatarIG } from './idade'
import { Secao, Tabela } from './components/Secao'
import {
  calcularAcidoFolico,
  calcularFerro,
  calcularAAS,
  calcularVitaminaD,
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

/** Suplementação de rotina no pré-natal — Ácido Fólico, Ferro, AAS e Vitamina D.
 *  Usa a IG calculada na aba Pré-natal (store compartilhada — ver gestantes/store.ts),
 *  então quem já calculou lá não precisa informar a DUM de novo aqui. Regra puramente da
 *  semana + fatores de risco marcados abaixo — ver dados/suplementacao.ts pro racional de
 *  cada janela. Não substitui julgamento clínico individual. */
export function Suplementacao() {
  const ig = useIGAtual()
  const [riscoFolatoAlto, setRiscoFolatoAlto] = useState(false)
  const [anemiaConfirmada, setAnemiaConfirmada] = useState(false)
  const [riscoPreEclampsia, setRiscoPreEclampsia] = useState(false)
  const [deficienciaVitaminaD, setDeficienciaVitaminaD] = useState(false)

  const recomendacoes = useMemo(() => {
    const ctx = {
      semanasIG: ig?.semanas ?? null,
      riscoFolatoAlto,
      anemiaConfirmada,
      riscoPreEclampsia,
      deficienciaVitaminaD,
    }
    return [calcularAcidoFolico(ctx), calcularFerro(ctx), calcularAAS(ctx), calcularVitaminaD(ctx)]
  }, [ig, riscoFolatoAlto, anemiaConfirmada, riscoPreEclampsia, deficienciaVitaminaD])

  const fatores = [
    { rotulo: 'Risco alto de folato', dica: 'Filho com DTN, obesidade, anticonvulsivantes, má absorção/celíaca, DM insulinodependente, alcoolismo, bariátrica ou drogas que interferem no folato — eleva o ácido fólico.', valor: riscoFolatoAlto, set: setRiscoFolatoAlto },
    { rotulo: 'Anemia confirmada (Hb < 11)', dica: 'Eleva a dose de ferro elementar.', valor: anemiaConfirmada, set: setAnemiaConfirmada },
    { rotulo: 'Alto risco para pré-eclâmpsia', dica: 'HAS crônica, DM, gestação múltipla, história de PE… (ver tabela do AAS abaixo).', valor: riscoPreEclampsia, set: setRiscoPreEclampsia },
    { rotulo: 'Deficiência de vitamina D', dica: 'Comprovada por exame.', valor: deficienciaVitaminaD, set: setDeficienciaVitaminaD },
  ]

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="flex flex-col gap-4 pb-16">
        <div className="flex items-start gap-2 text-xs text-text-dim bg-surface-2 border border-border rounded-[var(--radius-item,11px)] px-3 py-2.5">
          <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          <span>
            {ig
              ? `Idade gestacional atual: ${formatarIG(ig)} (calculada na aba Pré-natal).`
              : 'Sem idade gestacional calculada ainda — abra Pré-natal e calcule por DUM, USG ou IG prévia pra ver o status de cada suplemento por semana.'}{' '}
            Regra geral — casos individuais sempre podem mudar a conduta.
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-4 items-start">
          <div className="lg:sticky lg:top-0">
            <Secao titulo="Fatores de risco" icone={ListChecks}>
              <div className="flex flex-col gap-2.5">
                {fatores.map((f) => (
                  <label key={f.rotulo} className="flex items-start gap-2.5 cursor-pointer" title={f.dica}>
                    <input
                      type="checkbox"
                      checked={f.valor}
                      onChange={(e) => f.set(e.target.checked)}
                      className="mt-0.5 w-4 h-4 accent-[var(--color-accent)] shrink-0"
                    />
                    <span className="min-w-0">
                      <span className="block text-sm font-medium text-text">{f.rotulo}</span>
                      <span className="block text-xs text-text-dim mt-0.5">{f.dica}</span>
                    </span>
                  </label>
                ))}
              </div>
            </Secao>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-4 gap-3">
            {recomendacoes.map((r) => {
              const Icone = ICONE_STATUS[r.status]
              return (
                <div key={r.nome} className="border border-border rounded-[var(--radius-card,14px)] bg-surface p-4 flex flex-col gap-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-display text-base font-semibold text-text">{r.nome}</p>
                    <span className={`flex items-center gap-1.5 text-xs font-semibold shrink-0 mt-0.5 ${COR_STATUS[r.status]}`}>
                      <Icone className="w-3.5 h-3.5" />
                      {r.rotuloStatus}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-text">{r.dose}</p>
                  <p className="text-xs text-text-dim">{r.janela}</p>
                  {r.observacao && <p className="text-xs text-text-dim/80">{r.observacao}</p>}
                  <details className="mt-auto pt-2 border-t border-dashed border-border group">
                    <summary className="text-xs font-semibold text-text-dim hover:text-text cursor-pointer select-none">
                      Indicação
                    </summary>
                    <p className="text-xs text-text-dim mt-1.5">{r.indicacao}</p>
                  </details>
                </div>
              )
            })}
          </div>
        </div>

        <Secao titulo="Profilaxia de pré-eclâmpsia com AAS" icone={Pill}>
          <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-5 items-start">
            <div className="flex flex-col gap-2">
              <Tabela
                cabecalho={['Fatores de Alto Risco', 'Fatores de Risco Moderado']}
                linhas={[
                  ['Pré-eclâmpsia em gestação anterior', 'Nuliparidade'],
                  ['Gestação múltipla', 'História familiar de PE (mãe ou irmãs)'],
                  ['Obesidade (IMC > 30)', 'Condições socioeconômicas desfavoráveis'],
                  ['Hipertensão arterial crônica', 'Raça/cor preta ou parda'],
                  ['Diabetes tipo 1 ou 2', 'Idade ≥ 35 anos'],
                  ['Doença renal ou autoimune (LES, SAAF)', 'Desfecho adverso em gestação prévia*'],
                  ['Reprodução assistida', 'Intervalo > 10 anos desde a última gestação'],
                ]}
              />
              <p className="text-xs text-text-dim">*DPP, baixo peso ao nascer &gt;37s, parto prematuro, bebê com baixo peso</p>
            </div>
            <div className="flex flex-col gap-3">
              <div className="rounded-[var(--radius-item,11px)] border border-border bg-surface-2 p-3.5">
                <p className="text-sm font-semibold text-text mb-1.5">Indicações de AAS</p>
                <ul className="list-disc pl-5 text-sm text-text-dim flex flex-col gap-1">
                  <li><strong className="text-text">1</strong> fator de Alto Risco, <strong className="text-text">ou</strong></li>
                  <li><strong className="text-text">2</strong> fatores de Risco Moderado</li>
                </ul>
              </div>
              <div className="rounded-[var(--radius-item,11px)] border border-border bg-surface-2 p-3.5">
                <p className="text-sm font-semibold text-text mb-1.5">Esquema</p>
                <p className="text-sm text-text-dim">AAS 100mg — 1 comprimido, 1x/dia, todos os dias, de 12 a 36 semanas.</p>
              </div>
            </div>
          </div>
        </Secao>
      </div>
    </div>
  )
}
