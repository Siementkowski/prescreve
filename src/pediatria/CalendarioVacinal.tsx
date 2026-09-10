import { useMemo } from 'react'
import { CheckCircle2, Clock, Info } from 'lucide-react'
import { usePediatriaStore } from './store'
import { idadeEmMeses, formatarIdade } from './idade'
import { CALENDARIO_VACINAL } from './dados/calendarioVacinal'

/** Calendário Nacional de Vacinação (Ministério da Saúde) cruzado com a idade da
 *  criança — mostra, por vacina, quais doses já deveriam ter sido tomadas (pela idade)
 *  e quais ainda não chegaram. Não é registro de caderneta: não sabe o que a criança
 *  TOMOU de fato, só o que o calendário PREVÊ pra idade dela — a confirmação de dose
 *  aplicada é sempre pela caderneta física/SUS, não por aqui. */
export function CalendarioVacinal() {
  const dataNascimento = usePediatriaStore((s) => s.dataNascimento)
  const setDataNascimento = usePediatriaStore((s) => s.setDataNascimento)

  const idadeMeses = useMemo(() => (dataNascimento ? idadeEmMeses(dataNascimento) : null), [dataNascimento])

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
        {idadeMeses != null && (
          <span className="text-sm text-text-dim">
            {formatarIdade(idadeMeses)} de idade
          </span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {idadeMeses == null ? (
          <p className="text-sm text-text-dim px-1 py-4">Informe a data de nascimento pra ver o calendário.</p>
        ) : (
          <>
            <div className="flex items-start gap-2 text-xs text-text-dim bg-surface-2 border border-border rounded-lg px-3 py-2.5 mb-4">
              <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span>
                Calendário Nacional de Vacinação (Ministério da Saúde, 2026) cruzado só com a
                idade — não sabe o que já foi aplicado de fato. Confirme sempre pela caderneta.
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {CALENDARIO_VACINAL.map((vacina) => (
                <div key={vacina.nome} className="border border-border rounded-xl bg-surface p-4 flex flex-col gap-2.5">
                  <div>
                    <p className="font-display text-base font-semibold text-text">{vacina.nome}</p>
                    <p className="text-xs text-text-dim mt-0.5">{vacina.doencasEvitadas}</p>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    {vacina.doses.map((dose, i) => {
                      const prevista = idadeMeses >= dose.idadeMeses
                      return (
                        <div key={i} className="flex items-start gap-2 text-sm">
                          {prevista ? (
                            <CheckCircle2 className="w-4 h-4 text-ok shrink-0 mt-0.5" />
                          ) : (
                            <Clock className="w-4 h-4 text-text-dim shrink-0 mt-0.5" />
                          )}
                          <span className={prevista ? 'text-text' : 'text-text-dim'}>
                            {dose.rotulo} — {dose.idadeMeses === 0 ? 'ao nascer' : `${dose.idadeMeses} meses`}
                            {dose.observacao && (
                              <span className="block text-xs text-text-dim/80 mt-0.5">{dose.observacao}</span>
                            )}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
