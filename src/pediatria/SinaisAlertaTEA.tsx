import { useMemo, useState } from 'react'
import { AlertTriangle, Info } from 'lucide-react'
import { usePediatriaStore } from './store'
import { idadeEmMeses, formatarIdade } from './idade'
import { SINAIS_ALERTA_TEA } from './dados/sinaisAlertaTEA'

/** Checklist de sinais de alerta de TEA por faixa etária — triagem clínica, não
 *  instrumento formal (M-CHAT não entra aqui, ver dados/sinaisAlertaTEA.ts). Marcação de
 *  itens é só visual da sessão, não salva nada — a presença de sinais é gatilho pra
 *  avaliação mais aprofundada, não conclusão automática. */
export function SinaisAlertaTEA() {
  const dataNascimento = usePediatriaStore((s) => s.dataNascimento)
  const setDataNascimento = usePediatriaStore((s) => s.setDataNascimento)
  const [marcados, setMarcados] = useState<Set<string>>(new Set())

  const idadeMeses = useMemo(() => (dataNascimento ? idadeEmMeses(dataNascimento) : null), [dataNascimento])

  const faixaAtual = useMemo(() => {
    if (idadeMeses == null) return null
    return (
      SINAIS_ALERTA_TEA.find((f) => idadeMeses >= f.idadeMesesInicio && idadeMeses < f.idadeMesesFim) ??
      SINAIS_ALERTA_TEA[SINAIS_ALERTA_TEA.length - 1]
    )
  }, [idadeMeses])

  function alternar(chave: string) {
    setMarcados((prev) => {
      const novo = new Set(prev)
      if (novo.has(chave)) novo.delete(chave)
      else novo.add(chave)
      return novo
    })
  }

  const qtdMarcados = faixaAtual ? faixaAtual.sinais.filter((_, i) => marcados.has(`${faixaAtual.rotulo}-${i}`)).length : 0

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
        {idadeMeses == null || !faixaAtual ? (
          <p className="text-sm text-text-dim px-1 py-4">Informe a data de nascimento pra ver os sinais de alerta da faixa etária.</p>
        ) : (
          <div className="max-w-2xl mx-auto flex flex-col gap-4">
            <div className="flex items-start gap-2 text-xs text-text-dim bg-surface-2 border border-border rounded-lg px-3 py-2.5">
              <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span>
                Checklist de triagem, não é diagnóstico nem instrumento validado — presença
                de sinais é gatilho pra avaliação mais aprofundada com especialista.
              </span>
            </div>

            <div className="border border-border rounded-xl bg-surface p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between gap-2">
                <p className="font-display text-lg font-semibold text-text">{faixaAtual.rotulo}</p>
                {qtdMarcados > 0 && (
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-warn bg-warn-dim border border-warn/30 rounded-full px-2.5 py-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    {qtdMarcados} sinal{qtdMarcados === 1 ? '' : 'is'} marcado{qtdMarcados === 1 ? '' : 's'}
                  </span>
                )}
              </div>
              <div className="flex flex-col gap-1.5">
                {faixaAtual.sinais.map((sinal, i) => {
                  const chave = `${faixaAtual.rotulo}-${i}`
                  const marcado = marcados.has(chave)
                  return (
                    <label
                      key={chave}
                      className="flex items-start gap-2.5 text-sm cursor-pointer px-2 py-1.5 rounded-lg hover:bg-surface-2 transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={marcado}
                        onChange={() => alternar(chave)}
                        className="mt-0.5 w-4 h-4 accent-[var(--color-warn)] shrink-0"
                      />
                      <span className={marcado ? 'text-text' : 'text-text-dim'}>{sinal}</span>
                    </label>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
