import { Info } from 'lucide-react'
import { CALENDARIO_VACINAL, type DoseVacina } from './dados/calendarioVacinal'
import { FAIXAS_PUERICULTURA, type FaixaPuericultura } from './dados/guiaPuericultura'

/** Vacinas com alguma dose prevista até a idade da consulta (sem as de muito depois). */
export function vacinasDevidas(f: FaixaPuericultura): string[] {
  return CALENDARIO_VACINAL.filter((v) => v.doses.some((d) => d.idadeMeses <= f.idadeReferenciaMeses)).map((v) => v.nome)
}

function faixaAnterior(f: FaixaPuericultura) {
  const i = FAIXAS_PUERICULTURA.findIndex((x) => x.id === f.id)
  return i > 0 ? FAIXAS_PUERICULTURA[i - 1] : null
}

const COLUNAS = [...new Set(CALENDARIO_VACINAL.flatMap((v) => v.doses.map((d) => d.idadeMeses)))].sort((a, b) => a - b)

function rotuloColuna(m: number) {
  if (m === 0) return 'Ao nascer'
  if (m < 24) return `${m} ${m === 1 ? 'mês' : 'meses'}`
  return `${m / 12} ${m / 12 === 1 ? 'ano' : 'anos'}`
}

function curto(d: DoseVacina) {
  const r = d.rotulo
  if (/única/i.test(r)) return 'Única'
  const dose = /^(\d)ª dose/.exec(r)
  if (dose) return `${dose[1]}ª`
  const ref = /^(\d)º reforço/.exec(r)
  if (ref) return `${ref[1]}º ref.`
  if (/reforço/i.test(r)) return 'Ref.'
  if (/extra/i.test(r)) return 'Extra'
  return r
}

/** Calendário de vacinação da criança no formato do PNI/Ministério da Saúde: vacinas nas
 *  linhas, idades nas colunas, a dose no cruzamento. A coluna da idade da consulta fica em
 *  destaque, e as doses previstas entre a consulta anterior e esta ficam marcadas. Só mostra
 *  o que o calendário PREVÊ — a confirmação do que foi aplicado é sempre pela caderneta. */
export function CalendarioPNI({ faixa }: { faixa: FaixaPuericultura }) {
  const m = faixa.idadeReferenciaMeses
  const anterior = faixaAnterior(faixa)?.idadeReferenciaMeses ?? -1
  const colunaAtual = [...COLUNAS].reverse().find((c) => c <= m) ?? 0

  const estado = (d: DoseVacina) => (d.idadeMeses > m ? 'futura' : d.idadeMeses > anterior ? 'agora' : 'passada')

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start gap-2 text-xs text-text-dim bg-surface-2 border border-border rounded-[var(--radius-item,11px)] px-3 py-2.5">
        <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
        <span>
          Calendário Nacional de Vacinação da Criança (Ministério da Saúde, 2026). Mostra o que está previsto para a idade — não sabe o que
          já foi aplicado. Confirme sempre pela caderneta.
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-text-dim">
        <span className="inline-flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded bg-accent" /> Dose desta consulta
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded bg-surface-3 border border-border-strong" /> Já prevista antes
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded border border-dashed border-border-strong" /> Ainda não chegou
        </span>
      </div>

      <div className="overflow-x-auto border border-border rounded-[var(--radius-card,14px)] bg-surface">
        <table className="w-full text-xs border-collapse min-w-[860px]">
          <thead>
            <tr>
              <th className="sticky left-0 z-10 bg-surface-2 text-left font-semibold text-text px-3 py-2.5 border-b border-border min-w-[170px]">
                Vacina
              </th>
              {COLUNAS.map((c) => (
                <th
                  key={c}
                  className={`px-2 py-2.5 border-b border-l border-border text-center font-semibold whitespace-nowrap ${
                    c === colunaAtual ? 'bg-accent text-accent-text' : 'bg-surface-2 text-text'
                  }`}
                >
                  {rotuloColuna(c)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {CALENDARIO_VACINAL.map((v) => (
              <tr key={v.nome} className="border-b border-border last:border-b-0">
                <td className="sticky left-0 z-10 bg-surface px-3 py-2 align-middle">
                  <p className="font-semibold text-text leading-tight">{v.nome}</p>
                </td>
                {COLUNAS.map((c) => {
                  const dose = v.doses.find((d) => d.idadeMeses === c)
                  return (
                    <td key={c} className={`px-1.5 py-1.5 border-l border-border text-center ${c === colunaAtual ? 'bg-accent-dim' : ''}`}>
                      {dose && (
                        <span
                          title={`${v.nome} — ${dose.rotulo}${dose.observacao ? ` (${dose.observacao})` : ''}`}
                          className={`inline-block min-w-[38px] rounded-md px-1.5 py-1 font-semibold ${
                            estado(dose) === 'agora'
                              ? 'bg-accent text-accent-text'
                              : estado(dose) === 'passada'
                                ? 'bg-surface-3 border border-border-strong text-text-dim'
                                : 'border border-dashed border-border-strong text-text-dim'
                          }`}
                        >
                          {curto(dose)}
                        </span>
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="border border-border rounded-[var(--radius-card,14px)] bg-surface p-4">
        <p className="font-display text-base font-semibold text-text mb-2">Nesta consulta</p>
        <ul className="flex flex-col gap-1.5">
          {faixa.vacinas.map((x) => (
            <li key={x} className="text-sm text-text leading-snug">
              • {x}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
