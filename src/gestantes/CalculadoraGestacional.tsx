import { useMemo } from 'react'
import { Calendar, Info, AlertTriangle, ClipboardCheck, CalendarClock, MessageCircleQuestion } from 'lucide-react'
import { calcularDPP, dppCorrigidaPorUSG, trimestreDaIG, formatarIG, formatarData } from './idade'
import { PRE_NATAL, AVALIAR_SEMPRE, PERIODICIDADE_CONSULTAS, PERGUNTAS_ESSENCIAIS, type BlocoTrimestre } from './dados/preNatal'
import { useGestantesStore, calcularIGDoContexto } from './store'

function dataDeInput(iso: string): Date {
  const [ano, mes, dia] = iso.split('-').map(Number)
  return new Date(ano, mes - 1, dia)
}

const FAIXA_TRIMESTRE: Record<BlocoTrimestre['trimestre'], string> = {
  1: 'até 13s 6d',
  2: '14s a 27s 6d',
  3: '28s em diante',
}

/** Calculadora de idade gestacional (DUM ou USG) + conteúdo de rotina do pré-natal por
 *  trimestre — mesmo espírito das calculadoras da Pediatria: lógica isolada em idade.ts,
 *  aqui só orquestra estado de formulário e decide qual trimestre destacar. Estado vive na
 *  store (gestantes/store.ts), compartilhado com Suplementação/Vacinação. Sem cálculo
 *  feito, os 3 trimestres ficam visíveis mas neutros — não trava quem só quer consultar. */
export function CalculadoraGestacional() {
  const metodo = useGestantesStore((s) => s.metodo)
  const setMetodo = useGestantesStore((s) => s.setMetodo)
  const dum = useGestantesStore((s) => s.dum)
  const setDum = useGestantesStore((s) => s.setDum)
  const dataExameUSG = useGestantesStore((s) => s.dataExameUSG)
  const setDataExameUSG = useGestantesStore((s) => s.setDataExameUSG)
  const igUsgSemanas = useGestantesStore((s) => s.igUsgSemanas)
  const setIgUsgSemanas = useGestantesStore((s) => s.setIgUsgSemanas)
  const igUsgDias = useGestantesStore((s) => s.igUsgDias)
  const setIgUsgDias = useGestantesStore((s) => s.setIgUsgDias)

  const ig = useMemo(
    () => calcularIGDoContexto({ metodo, dum, dataExameUSG, igUsgSemanas, igUsgDias }),
    [metodo, dum, dataExameUSG, igUsgSemanas, igUsgDias]
  )
  const dpp =
    ig == null
      ? null
      : metodo === 'dum'
        ? calcularDPP(dataDeInput(dum))
        : dppCorrigidaPorUSG(dataDeInput(dataExameUSG), { semanas: Number(igUsgSemanas) || 0, dias: Number(igUsgDias) || 0 })

  const trimestreAtual = ig ? trimestreDaIG(ig.semanas) : null
  const periodicidadeAtual = ig ? PERIODICIDADE_CONSULTAS.find((f) => ig.semanas >= f.semanaInicio && (f.semanaFim == null || ig.semanas < f.semanaFim)) : null

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="max-w-3xl mx-auto flex flex-col gap-5 pb-16">
        {/* ---- calculadora ---- */}
        <div className="bg-surface border border-border rounded-2xl shadow-[var(--shadow-float)] p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2.5">
              <Calendar className="w-[18px] h-[18px] text-accent" />
              <h2 className="font-display text-[17px] font-semibold">Idade gestacional</h2>
            </div>
            <div className="inline-flex p-[3px] rounded-full bg-surface-2 border border-border">
              <button
                onClick={() => setMetodo('dum')}
                className={`text-xs font-semibold px-3.5 py-1.5 rounded-full transition-colors ${
                  metodo === 'dum' ? 'bg-text text-bg' : 'text-text-dim'
                }`}
              >
                Por DUM
              </button>
              <button
                onClick={() => setMetodo('usg')}
                className={`text-xs font-semibold px-3.5 py-1.5 rounded-full transition-colors ${
                  metodo === 'usg' ? 'bg-text text-bg' : 'text-text-dim'
                }`}
              >
                Por USG
              </button>
            </div>
          </div>

          {metodo === 'dum' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Campo label="Data da última menstruação">
                <input
                  type="date"
                  value={dum}
                  onChange={(e) => setDum(e.target.value)}
                  max={new Date().toISOString().slice(0, 10)}
                  className="bg-surface-2 border-2 border-accent/40 focus:border-accent rounded-lg px-3 py-2 text-sm font-semibold text-text outline-none transition-colors w-full"
                />
              </Campo>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Campo label="Data do exame">
                <input
                  type="date"
                  value={dataExameUSG}
                  onChange={(e) => setDataExameUSG(e.target.value)}
                  max={new Date().toISOString().slice(0, 10)}
                  className="bg-surface-2 border-2 border-accent/40 focus:border-accent rounded-lg px-3 py-2 text-sm font-semibold text-text outline-none transition-colors w-full"
                />
              </Campo>
              <Campo label="IG no exame — semanas">
                <input
                  type="number"
                  min={0}
                  max={42}
                  value={igUsgSemanas}
                  onChange={(e) => setIgUsgSemanas(e.target.value)}
                  placeholder="0"
                  className="bg-surface-2 border-2 border-accent/40 focus:border-accent rounded-lg px-3 py-2 text-sm font-semibold text-text outline-none transition-colors w-full"
                />
              </Campo>
              <Campo label="IG no exame — dias">
                <input
                  type="number"
                  min={0}
                  max={6}
                  value={igUsgDias}
                  onChange={(e) => setIgUsgDias(e.target.value)}
                  placeholder="0"
                  className="bg-surface-2 border-2 border-accent/40 focus:border-accent rounded-lg px-3 py-2 text-sm font-semibold text-text outline-none transition-colors w-full"
                />
              </Campo>
            </div>
          )}

          {ig && dpp && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-dashed border-border">
              <Stat label="Idade gestacional" valor={formatarIG(ig)} destaque />
              <Stat label={metodo === 'dum' ? 'DPP (Naegele)' : 'DPP corrigida'} valor={formatarData(dpp)} />
              <Stat label="Trimestre" valor={`${trimestreAtual}º`} />
            </div>
          )}
        </div>

        {/* ---- banner contextual ---- */}
        {ig && trimestreAtual && (
          <div className="flex items-start gap-3 bg-accent-dim border border-accent/30 rounded-xl px-4 py-3.5">
            <Info className="w-[17px] h-[17px] text-accent shrink-0 mt-0.5" />
            <div className="text-sm">
              <strong className="text-accent font-semibold">
                Com {formatarIG(ig)}, ela está no {trimestreAtual}º trimestre.
              </strong>
              <p className="text-text mt-0.5 leading-relaxed">
                Os exames e condutas dessa fase já estão destacados abaixo — sem precisar procurar.
                {periodicidadeAtual && ` Periodicidade recomendada agora: consultas ${periodicidadeAtual.intervalo.toLowerCase()}.`}
              </p>
            </div>
          </div>
        )}

        {/* ---- avaliar sempre + periodicidade + perguntas essenciais ---- */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <SecaoCompacta icone={ClipboardCheck} titulo="Avaliar sempre">
            <ul className="flex flex-col gap-1.5">
              {AVALIAR_SEMPRE.map((item) => (
                <li key={item} className="text-[13px] text-text-dim leading-snug">
                  • {item}
                </li>
              ))}
            </ul>
          </SecaoCompacta>

          <SecaoCompacta icone={CalendarClock} titulo="Periodicidade">
            <ul className="flex flex-col gap-1.5">
              {PERIODICIDADE_CONSULTAS.map((f) => (
                <li key={f.intervalo} className="text-[13px] text-text-dim leading-snug flex justify-between gap-2">
                  <span>{f.semanaFim == null ? `${f.semanaInicio}–41 sem` : `Até ${f.semanaFim} sem`}</span>
                  <strong className="text-text font-semibold shrink-0">{f.intervalo}</strong>
                </li>
              ))}
            </ul>
          </SecaoCompacta>

          <SecaoCompacta icone={MessageCircleQuestion} titulo="Perguntas essenciais">
            <ul className="flex flex-col gap-1.5">
              {PERGUNTAS_ESSENCIAIS.map((p) => (
                <li key={p.titulo} className="text-[13px] leading-snug">
                  <strong className="text-text font-semibold">{p.titulo}:</strong>{' '}
                  <span className="text-text-dim">{p.descricao}</span>
                </li>
              ))}
            </ul>
          </SecaoCompacta>
        </div>

        {/* ---- trimestres ---- */}
        <div className="flex flex-col gap-3.5">
          {PRE_NATAL.map((bloco) => {
            const ativo = bloco.trimestre === trimestreAtual
            return (
              <div
                key={bloco.trimestre}
                className={`border rounded-2xl bg-surface overflow-hidden ${
                  ativo ? 'border-accent shadow-[3px_3px_0_var(--color-text)]' : 'border-border'
                }`}
              >
                <div
                  className={`flex items-center justify-between px-4.5 py-3.5 border-b ${
                    ativo ? 'bg-accent-dim border-accent/25' : 'bg-surface-2 border-border'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`w-[26px] h-[26px] rounded-full flex items-center justify-center font-display text-xs font-bold text-bg ${
                        ativo ? 'bg-accent' : 'bg-text'
                      }`}
                    >
                      {bloco.trimestre}
                    </span>
                    <h3 className="font-display text-[15.5px] font-semibold">
                      {bloco.trimestre}º trimestre
                      <span className="text-xs text-text-dim font-medium ml-1.5">{FAIXA_TRIMESTRE[bloco.trimestre]}</span>
                    </h3>
                  </div>
                  {ativo && (
                    <span className="text-[11px] font-bold text-accent bg-surface border border-accent rounded-full px-2.5 py-1">
                      Fase atual
                    </span>
                  )}
                </div>

                <div className="p-4.5 flex flex-col gap-3.5">
                  <div>
                    <span className="text-[11px] font-bold text-text-dim uppercase tracking-wide">Exames de rotina</span>
                    <div className="flex flex-col gap-1.5 mt-1.5">
                      {bloco.exames.map((e) => (
                        <div key={e.nome} className="border border-border rounded-[10px] px-3 py-2.5">
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
                                  <p className="text-text-dim mt-0.5 leading-snug">{sub.descricao}</p>
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
                            <div key={c.texto} className="border border-border rounded-[10px] px-3 py-2.5 text-[13.5px] font-semibold">
                              {c.texto}
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}
                </div>
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

function Campo({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold text-text-dim">{label}</span>
      {children}
    </label>
  )
}

function Stat({ label, valor, destaque }: { label: string; valor: string; destaque?: boolean }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[11px] font-semibold text-text-dim uppercase tracking-wide">{label}</span>
      <span className={`font-display text-xl font-semibold tabular-nums ${destaque ? 'text-accent' : ''}`}>{valor}</span>
    </div>
  )
}

function SecaoCompacta({
  icone: Icone,
  titulo,
  children,
}: {
  icone: typeof ClipboardCheck
  titulo: string
  children: React.ReactNode
}) {
  return (
    <div className="border border-border rounded-xl bg-surface p-3.5">
      <div className="flex items-center gap-1.5 mb-2">
        <Icone className="w-3.5 h-3.5 text-text-dim" />
        <span className="text-[11px] font-bold text-text-dim uppercase tracking-wide">{titulo}</span>
      </div>
      {children}
    </div>
  )
}
