import { useState } from 'react'
import { Info, AlertTriangle, ChevronDown, ArrowRight } from 'lucide-react'
import { trimestreDaIG, formatarIG } from './idade'
import { PRE_NATAL, AVALIAR_SEMPRE, PERIODICIDADE_CONSULTAS, PERGUNTAS_ESSENCIAIS, ATIVIDADE_FISICA, type BlocoTrimestre } from './dados/preNatal'
import { useGestantesStore, useIGAtual } from './store'

const FAIXA_TRIMESTRE: Record<BlocoTrimestre['trimestre'], string> = {
  1: 'até 13s 6d',
  2: '14s a 27s 6d',
  3: '28s em diante',
}

/** Conteúdo de rotina do pré-natal por trimestre (exames/condutas) + referência rápida —
 *  a calculadora de idade gestacional em si mora no Guia de Consulta (Em construção),
 *  que é o ponto de entrada da consulta; aqui só se lê a IG já calculada, via a mesma
 *  store compartilhada (gestantes/store.ts). Sem cálculo feito ainda em lugar nenhum, os
 *  3 trimestres ficam visíveis mas neutros — não trava quem só quer consultar.
 *
 *  Trimestres em acordeão (só um aberto por vez) — cada bloco tem exame a exame de um
 *  trimestre inteiro, os três abertos ao mesmo tempo é informação demais pra uma consulta
 *  que só precisa da fase atual. `trimestreAberto` null = segue o cálculo (ou o 1º, sem
 *  cálculo); um número explícito (inclusive 0 = "nenhum") é o que a pessoa escolheu na mão,
 *  e continua valendo até ela clicar de novo — não é sobrescrito a cada recálculo de IG. */
export function CalculadoraGestacional() {
  const setAbaAberta = useGestantesStore((s) => s.setAbaAberta)
  const [referenciaAberta, setReferenciaAberta] = useState(false)
  const [trimestreAberto, setTrimestreAberto] = useState<number | null>(null)

  const ig = useIGAtual()
  const trimestreAtual = ig ? trimestreDaIG(ig.semanas) : null
  const periodicidadeAtual = ig ? PERIODICIDADE_CONSULTAS.find((f) => ig.semanas >= f.semanaInicio && (f.semanaFim == null || ig.semanas < f.semanaFim)) : null
  const trimestreEfetivo = trimestreAberto ?? trimestreAtual ?? 1

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="max-w-3xl mx-auto flex flex-col gap-4 pb-16">
        {/* ---- banner contextual ---- */}
        {ig && trimestreAtual ? (
          <div className="flex items-start gap-3 bg-accent-dim border border-accent/30 rounded-[var(--radius-card,14px)] px-4 py-3.5">
            <Info className="w-[17px] h-[17px] text-accent shrink-0 mt-0.5" />
            <div className="text-sm">
              <strong className="text-accent font-semibold">
                Com {formatarIG(ig)}, ela está no {trimestreAtual}º trimestre.
              </strong>
              <p className="text-text mt-0.5 leading-relaxed">
                O bloco desse trimestre já abre sozinho lá embaixo — os outros dois ficam recolhidos.
                {periodicidadeAtual && ` Periodicidade recomendada agora: consultas ${periodicidadeAtual.intervalo.toLowerCase()}.`}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-3 flex-wrap bg-surface-2 border border-border rounded-[var(--radius-item,11px)] px-4 py-3">
            <span className="text-sm text-text-dim">
              Sem idade gestacional calculada ainda — os 3 trimestres abaixo ficam neutros até lá.
            </span>
            <button
              onClick={() => setAbaAberta('guia_consulta')}
              className="flex items-center gap-1.5 text-sm font-semibold text-accent hover:underline shrink-0"
            >
              Calcular em Em construção <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* ---- referência rápida — recolhida por padrão, junta o que antes eram 4
            caixinhas soltas num card só, com divisórias internas em vez de repetir
            borda+ícone+título quatro vezes seguidas. ---- */}
        <div className="border border-border rounded-[var(--radius-card,14px)] bg-surface overflow-hidden">
          <button
            type="button"
            onClick={() => setReferenciaAberta((v) => !v)}
            className="w-full flex items-center justify-between gap-2 px-4 py-3 text-left"
          >
            <span className="text-xs font-bold text-text-dim uppercase tracking-wide">Referência rápida</span>
            <ChevronDown
              className={`w-4 h-4 text-text-dim shrink-0 transition-transform ${referenciaAberta ? 'rotate-180' : ''}`}
            />
          </button>

          {referenciaAberta && (
            <div className="border-t border-border divide-y divide-border">
              <BlocoReferencia titulo="Avaliar sempre">
                <ul className="flex flex-col gap-1.5">
                  {AVALIAR_SEMPRE.map((item) => (
                    <li key={item} className="text-sm text-text-dim leading-snug">
                      {item}
                    </li>
                  ))}
                </ul>
              </BlocoReferencia>

              <BlocoReferencia titulo="Periodicidade das consultas">
                <div className="flex flex-col gap-1.5">
                  {PERIODICIDADE_CONSULTAS.map((f) => (
                    <div key={f.intervalo} className="text-sm text-text-dim leading-snug flex justify-between gap-2">
                      <span>{f.semanaFim == null ? `${f.semanaInicio}–41 sem` : `Até ${f.semanaFim} sem`}</span>
                      <strong className="text-text font-semibold shrink-0">{f.intervalo}</strong>
                    </div>
                  ))}
                </div>
              </BlocoReferencia>

              <BlocoReferencia titulo="Perguntas essenciais">
                <div className="flex flex-col gap-2">
                  {PERGUNTAS_ESSENCIAIS.map((p) => (
                    <p key={p.titulo} className="text-sm leading-snug">
                      <strong className="text-text font-semibold">{p.titulo}:</strong>{' '}
                      <span className="text-text-dim">{p.descricao}</span>
                    </p>
                  ))}
                </div>
              </BlocoReferencia>

              <BlocoReferencia titulo="Atividade física">
                <ul className="flex flex-col gap-1.5">
                  {ATIVIDADE_FISICA.map((item) => (
                    <li key={item} className="text-sm text-text-dim leading-snug">
                      {item}
                    </li>
                  ))}
                </ul>
              </BlocoReferencia>
            </div>
          )}
        </div>

        {/* ---- trimestres — acordeão, só o efetivo (atual ou escolhido) aberto ---- */}
        <div className="flex flex-col gap-3">
          {PRE_NATAL.map((bloco) => {
            const ativo = bloco.trimestre === trimestreAtual
            const aberto = bloco.trimestre === trimestreEfetivo
            return (
              <div
                key={bloco.trimestre}
                className={`border rounded-[var(--radius-card,14px)] bg-surface overflow-hidden transition-colors ${
                  ativo ? 'border-accent' : 'border-border'
                } ${aberto && ativo ? 'shadow-[3px_3px_0_var(--color-accent)]' : ''}`}
              >
                <button
                  type="button"
                  onClick={() => setTrimestreAberto(aberto ? 0 : bloco.trimestre)}
                  className={`w-full flex items-center justify-between gap-3 px-4.5 py-3.5 text-left transition-colors ${
                    ativo ? 'bg-accent-dim' : aberto ? 'bg-surface-2' : 'hover:bg-surface-2'
                  } ${aberto ? 'border-b border-border' : ''}`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className={`w-[26px] h-[26px] rounded-full flex items-center justify-center font-display text-xs font-bold shrink-0 ${
                        ativo ? 'bg-accent text-white' : 'bg-text text-bg'
                      }`}
                    >
                      {bloco.trimestre}
                    </span>
                    <h3 className="font-display text-[15.5px] font-semibold truncate">
                      {bloco.trimestre}º trimestre
                      <span className="text-xs text-text-dim font-medium ml-1.5">{FAIXA_TRIMESTRE[bloco.trimestre]}</span>
                    </h3>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {ativo && (
                      <span className="text-[11px] font-bold text-accent bg-surface border border-accent rounded-full px-2.5 py-1">
                        Fase atual
                      </span>
                    )}
                    <ChevronDown className={`w-4 h-4 text-text-dim transition-transform ${aberto ? 'rotate-180' : ''}`} />
                  </div>
                </button>

                {aberto && (
                  <div className="p-4.5 flex flex-col gap-3.5">
                    <div>
                      <span className="text-[11px] font-bold text-text-dim uppercase tracking-wide">Exames de rotina</span>
                      <div className="flex flex-col gap-1.5 mt-1.5">
                        {bloco.exames.map((e) => (
                          <div key={e.nome} className="border border-border rounded-[var(--radius-item,11px)] px-3 py-2.5">
                            <strong className="block text-[13.5px] font-semibold">{e.nome}</strong>
                            <span className="block text-xs text-text-dim mt-0.5">{e.periodicidade}</span>
                            {e.notas && e.notas.length > 0 && (
                              <ul className="flex flex-col gap-1 mt-2">
                                {e.notas.map((n) => (
                                  <li
                                    key={n.texto}
                                    className={`text-xs leading-snug ${n.alerta ? 'text-warn font-medium' : 'text-text-dim'}`}
                                  >
                                    {n.alerta && <AlertTriangle className="w-3 h-3 inline-block mr-1 -mt-0.5" />}
                                    {n.texto}
                                  </li>
                                ))}
                              </ul>
                            )}
                            {e.subitens && e.subitens.length > 0 && (
                              <div className="flex flex-col gap-1.5 mt-2.5 pt-2.5 border-t border-border">
                                {e.subitens.map((sub, i) => (
                                  <div key={sub.titulo} className="text-xs">
                                    <span className="font-semibold text-text">
                                      {i + 1}. {sub.titulo}
                                      {sub.absoluta && (
                                        <span className="ml-1.5 text-[10px] font-bold text-danger bg-danger-dim border border-danger/30 rounded-full px-1.5 py-0.5">
                                          Indicação absoluta
                                        </span>
                                      )}
                                    </span>
                                    {sub.descricao && <p className="text-text-dim mt-0.5 leading-snug">{sub.descricao}</p>}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {bloco.condutas.length > 0 && (
                      <div>
                        <span className="text-[11px] font-bold text-text-dim uppercase tracking-wide">Conduta</span>
                        <div className="flex flex-col gap-1.5 mt-1.5">
                          {bloco.condutas.map((c) =>
                            c.alerta ? (
                              <span
                                key={c.texto}
                                className="flex items-start gap-1.5 text-[11.5px] font-semibold text-warn bg-warn-dim border border-warn/30 rounded-full px-3 py-1.5 w-fit"
                              >
                                <AlertTriangle className="w-3 h-3 shrink-0 mt-0.5" />
                                {c.texto}
                              </span>
                            ) : (
                              <div
                                key={c.texto}
                                className="border border-border rounded-[var(--radius-item,11px)] px-3 py-2.5 text-[13.5px] font-semibold"
                              >
                                {c.texto}
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <p className="text-xs text-text-dim px-0.5">
          Conteúdo de referência — protocolo Ministério da Saúde / Febrasgo, pré-natal de baixo risco. Não substitui avaliação clínica individual.
        </p>
      </div>
    </div>
  )
}

function BlocoReferencia({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div className="px-4 py-3.5">
      <span className="text-[11px] font-bold text-text-dim uppercase tracking-wide">{titulo}</span>
      <div className="mt-2">{children}</div>
    </div>
  )
}
