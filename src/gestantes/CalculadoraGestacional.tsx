import { useMemo, useState } from 'react'
import { Calendar, Info, AlertTriangle } from 'lucide-react'
import {
  calcularIGPorDUM,
  calcularDPP,
  calcularIGPorUSG,
  dppCorrigidaPorUSG,
  trimestreDaIG,
  formatarIG,
  formatarData,
  type IdadeGestacional,
} from './idade'
import { PRE_NATAL, type BlocoTrimestre } from './dados/preNatal'

type Metodo = 'dum' | 'usg'

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
 *  aqui só orquestra estado de formulário e decide qual trimestre destacar. Sem cálculo
 *  feito, os 3 trimestres ficam visíveis mas neutros — não trava quem só quer consultar. */
export function CalculadoraGestacional() {
  const [metodo, setMetodo] = useState<Metodo>('dum')
  const [dum, setDum] = useState('')
  const [dataExameUSG, setDataExameUSG] = useState('')
  const [igUsgSemanas, setIgUsgSemanas] = useState('')
  const [igUsgDias, setIgUsgDias] = useState('')

  const resultado = useMemo(() => {
    if (metodo === 'dum') {
      if (!dum) return null
      const dataDum = dataDeInput(dum)
      const ig = calcularIGPorDUM(dataDum)
      return { ig, dpp: calcularDPP(dataDum) }
    }
    if (!dataExameUSG || igUsgSemanas === '') return null
    const dataExame = dataDeInput(dataExameUSG)
    const igNoExame: IdadeGestacional = { semanas: Number(igUsgSemanas) || 0, dias: Number(igUsgDias) || 0 }
    return { ig: calcularIGPorUSG(dataExame, igNoExame), dpp: dppCorrigidaPorUSG(dataExame, igNoExame) }
  }, [metodo, dum, dataExameUSG, igUsgSemanas, igUsgDias])

  const trimestreAtual = resultado ? trimestreDaIG(resultado.ig.semanas) : null

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

          {resultado && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-dashed border-border">
              <Stat label="Idade gestacional" valor={formatarIG(resultado.ig)} destaque />
              <Stat label={metodo === 'dum' ? 'DPP (Naegele)' : 'DPP corrigida'} valor={formatarData(resultado.dpp)} />
              <Stat label="Trimestre" valor={`${trimestreAtual}º`} />
            </div>
          )}
        </div>

        {/* ---- banner contextual ---- */}
        {resultado && trimestreAtual && (
          <div className="flex items-start gap-3 bg-accent-dim border border-accent/30 rounded-xl px-4 py-3.5">
            <Info className="w-[17px] h-[17px] text-accent shrink-0 mt-0.5" />
            <div className="text-sm">
              <strong className="text-accent font-semibold">
                Com {formatarIG(resultado.ig)}, ela está no {trimestreAtual}º trimestre.
              </strong>
              <p className="text-text mt-0.5 leading-relaxed">
                Os exames e condutas dessa fase já estão destacados abaixo — sem precisar procurar.
              </p>
            </div>
          </div>
        )}

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
