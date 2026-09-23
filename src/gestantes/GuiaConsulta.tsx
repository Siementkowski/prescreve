import { useMemo } from 'react'
import { Calendar } from 'lucide-react'
import { useGestantesStore, useIGAtual, dataDeInputISO } from './store'
import { useGuiaConsultaStore } from './guiaConsultaStore'
import { calcularDPP, dppCorrigidaPorUSG, formatarIG, formatarData, trimestreDaIG } from './idade'

/** Pré-natal — ponto de entrada da consulta: só a calculadora de idade gestacional
 *  (compacta, canto superior esquerdo) + o gate "1ª consulta ou retorno". O antigo fluxo
 *  guiado (anamnese completa: Antecedentes, Medicamentos, Objetivo, texto final) foi
 *  removido daqui — o próximo passo é substituí-lo por roteiros de anamnese específicos
 *  por faixa de IG, entregues dinamicamente a partir do que já é calculado nesta tela.
 *  IG compartilhada via store (gestantes/store.ts) com Suplementação/Vacinação. */
export function GuiaConsulta() {
  const metodo = useGestantesStore((s) => s.metodo)
  const setMetodo = useGestantesStore((s) => s.setMetodo)
  const dum = useGestantesStore((s) => s.dum)
  const setDum = useGestantesStore((s) => s.setDum)
  const dataReferencia = useGestantesStore((s) => s.dataReferencia)
  const setDataReferencia = useGestantesStore((s) => s.setDataReferencia)
  const igReferenciaSemanas = useGestantesStore((s) => s.igReferenciaSemanas)
  const setIgReferenciaSemanas = useGestantesStore((s) => s.setIgReferenciaSemanas)
  const igReferenciaDias = useGestantesStore((s) => s.igReferenciaDias)
  const setIgReferenciaDias = useGestantesStore((s) => s.setIgReferenciaDias)
  const ig = useIGAtual()
  const dpp = useMemo(() => {
    if (!ig) return null
    return metodo === 'dum'
      ? calcularDPP(dataDeInputISO(dum))
      : dppCorrigidaPorUSG(dataDeInputISO(dataReferencia), { semanas: Number(igReferenciaSemanas) || 0, dias: Number(igReferenciaDias) || 0 })
  }, [ig, metodo, dum, dataReferencia, igReferenciaSemanas, igReferenciaDias])
  const trimestreAtual = ig ? trimestreDaIG(ig.semanas) : null

  const primeiraConsulta = useGuiaConsultaStore((s) => s.primeiraConsulta)
  const setPrimeiraConsulta = useGuiaConsultaStore((s) => s.setPrimeiraConsulta)

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="flex flex-col gap-3 w-full max-w-[300px]">
        {/* ---- calculadora de idade gestacional — compacta ---- */}
        <div className="bg-surface border border-border rounded-[var(--radius-card,14px)] p-3.5 flex flex-col gap-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-accent" />
              <h2 className="font-display text-[13px] font-semibold">Idade gestacional</h2>
            </div>
          </div>

          <div className="inline-flex p-[2px] rounded-[var(--radius-pill,999px)] bg-surface-2 border border-border w-fit">
            <button
              onClick={() => setMetodo('dum')}
              className={`text-[10.5px] font-semibold px-2.5 py-1 rounded-[var(--radius-pill,999px)] transition-colors ${
                metodo === 'dum' ? 'bg-text text-bg' : 'text-text-dim hover:text-text'
              }`}
            >
              DUM
            </button>
            <button
              onClick={() => setMetodo('usg')}
              className={`text-[10.5px] font-semibold px-2.5 py-1 rounded-[var(--radius-pill,999px)] transition-colors ${
                metodo === 'usg' ? 'bg-text text-bg' : 'text-text-dim hover:text-text'
              }`}
            >
              USG
            </button>
            <button
              onClick={() => setMetodo('previa')}
              className={`text-[10.5px] font-semibold px-2.5 py-1 rounded-[var(--radius-pill,999px)] transition-colors ${
                metodo === 'previa' ? 'bg-text text-bg' : 'text-text-dim hover:text-text'
              }`}
            >
              IG prévia
            </button>
          </div>

          {metodo === 'dum' ? (
            <Campo label="Data da última menstruação">
              <input
                type="date"
                value={dum}
                onChange={(e) => setDum(e.target.value)}
                max={new Date().toISOString().slice(0, 10)}
                className={inputCls + ' w-full'}
              />
            </Campo>
          ) : (
            <div className="flex flex-col gap-2">
              <Campo label={metodo === 'usg' ? 'Data do exame' : 'Data em que a IG foi registrada'}>
                <input
                  type="date"
                  value={dataReferencia}
                  onChange={(e) => setDataReferencia(e.target.value)}
                  max={new Date().toISOString().slice(0, 10)}
                  className={inputCls + ' w-full'}
                />
              </Campo>
              <div className="grid grid-cols-2 gap-2">
                <Campo label="Semanas">
                  <input
                    type="number"
                    min={0}
                    max={42}
                    value={igReferenciaSemanas}
                    onChange={(e) => setIgReferenciaSemanas(e.target.value)}
                    placeholder="0"
                    className={inputCls + ' w-full'}
                  />
                </Campo>
                <Campo label="Dias">
                  <input
                    type="number"
                    min={0}
                    max={6}
                    value={igReferenciaDias}
                    onChange={(e) => setIgReferenciaDias(e.target.value)}
                    placeholder="0"
                    className={inputCls + ' w-full'}
                  />
                </Campo>
              </div>
            </div>
          )}

          {ig && dpp && (
            <div className="grid grid-cols-3 gap-2 pt-2.5 border-t border-dashed border-border">
              <Stat label="IG" valor={formatarIG(ig)} destaque />
              <Stat label={metodo === 'dum' ? 'DPP' : 'DPP corr.'} valor={formatarData(dpp)} />
              <Stat label="Trim." valor={`${trimestreAtual}º`} />
            </div>
          )}
        </div>

        {/* ---- gate: 1ª consulta ou retorno ---- */}
        {ig && (
          <div className="bg-surface border border-border rounded-[var(--radius-card,14px)] p-3.5 flex flex-col gap-2">
            <p className="font-display text-[12.5px] font-semibold">Primeira consulta de pré-natal?</p>
            <div className="flex gap-1.5">
              <button
                onClick={() => setPrimeiraConsulta(true)}
                className={`flex-1 text-[11px] font-semibold rounded-[var(--radius-control,12px)] border px-2.5 py-2 transition-colors ${
                  primeiraConsulta === true ? 'bg-text border-text text-bg' : 'bg-surface-2 border-border text-text-dim hover:text-text'
                }`}
              >
                Sim
              </button>
              <button
                onClick={() => setPrimeiraConsulta(false)}
                className={`flex-1 text-[11px] font-semibold rounded-[var(--radius-control,12px)] border px-2.5 py-2 transition-colors ${
                  primeiraConsulta === false ? 'bg-text border-text text-bg' : 'bg-surface-2 border-border text-text-dim hover:text-text'
                }`}
              >
                Retorno
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

const inputCls =
  'bg-surface-2 border border-border focus:border-text rounded-[var(--radius-input,9px)] px-2 py-1 text-xs text-text outline-none transition-colors'

function Stat({ label, valor, destaque }: { label: string; valor: string; destaque?: boolean }) {
  return (
    <div className="flex flex-col gap-0.5 min-w-0">
      <span className="text-[9px] font-semibold text-text-dim uppercase tracking-wide">{label}</span>
      <span className={`font-display text-[13px] font-semibold tabular-nums truncate ${destaque ? 'text-accent' : ''}`}>{valor}</span>
    </div>
  )
}

function Campo({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[10px] font-semibold text-text-dim">{label}</span>
      {children}
    </label>
  )
}
