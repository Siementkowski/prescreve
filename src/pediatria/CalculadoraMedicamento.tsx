import { AlertTriangle, ChevronDown } from 'lucide-react'
import type { Medicamento } from '../admin/types'
import { calcularDosePediatrica, formatarNumero, textoFormula, textoPrescricaoPediatrica } from '../core/pediatria'
import { usePediatriaStore } from './store'
import { CopyButton } from '../consulta/components/CopyButton'

const OPCOES_TOMADAS = [1, 2, 3, 4, 6]

export function CalculadoraMedicamento({ medicamento, pesoKg }: { medicamento: Medicamento; pesoKg: number }) {
  const tomadasPorMedicamento = usePediatriaStore((s) => s.tomadasPorMedicamento)
  const setTomadasPorMedicamento = usePediatriaStore((s) => s.setTomadasPorMedicamento)
  const tomadas = tomadasPorMedicamento[medicamento.id] ?? 3

  const calc = calcularDosePediatrica({
    pesoKg,
    mgPorKgDia: medicamento.ped_mg_kg_dia as number,
    doseMaxDiariaMg: medicamento.ped_dose_max_dia,
    tomadasPorDia: tomadas,
    concentracaoMgPorMl: medicamento.ped_concentracao,
  })

  const textoCopiar = textoPrescricaoPediatrica(calc, medicamento.nome)

  return (
    <div
      className={`border rounded-xl p-4 flex flex-col gap-3 ${
        calc.atingiuTeto ? 'border-danger/50 bg-danger-dim' : 'border-border bg-surface'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-display text-base font-semibold text-text">{medicamento.nome}</p>
          {medicamento.apresentacoes && (
            <p className="text-xs text-text-dim mt-0.5">{medicamento.apresentacoes}</p>
          )}
        </div>
        <CopyButton texto={textoCopiar} label="Copiar" variant="solid" />
      </div>

      <div className="flex items-center gap-2">
        <label className="text-xs text-text-dim shrink-0">Tomadas/dia</label>
        <div className="relative">
          <select
            value={tomadas}
            onChange={(e) => setTomadasPorMedicamento(medicamento.id, Number(e.target.value))}
            className="appearance-none bg-surface-2 border border-border rounded-lg pl-2.5 pr-7 py-1.5 text-sm text-text outline-none focus:border-accent"
          >
            {OPCOES_TOMADAS.map((n) => (
              <option key={n} value={n}>
                {n}x/dia
              </option>
            ))}
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-text-dim absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {calc.atingiuTeto && (
        <div className="flex items-start gap-2 text-sm text-white bg-danger border border-danger rounded-lg px-3 py-2.5 font-medium">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>
            Dose calculada ({formatarNumero(calc.doseDiariaCalculadaMg)} mg/dia) ultrapassa o teto de{' '}
            {formatarNumero(calc.doseMaximaDiariaMg as number)} mg/dia — resultado limitado ao teto.
          </span>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <Resultado rotulo="Dose/dia" valor={`${formatarNumero(calc.doseDiariaEfetivaMg)} mg`} />
        <Resultado rotulo="Dose/tomada" valor={`${formatarNumero(calc.dosePorTomadaMg)} mg`} />
        {calc.volumePorTomadaMl != null && (
          <Resultado rotulo="Volume/tomada" valor={`${formatarNumero(calc.volumePorTomadaMl)} ml`} destaque />
        )}
      </div>

      <details className="text-xs text-text-dim">
        <summary className="cursor-pointer hover:text-text transition-colors">Ver fórmula</summary>
        <pre className="tabular whitespace-pre-wrap mt-1.5 leading-relaxed">{textoFormula(calc)}</pre>
      </details>

      {medicamento.ped_volume_ref != null && (
        <p className="text-[11px] text-text-dim">
          Referência de bula: {formatarNumero(medicamento.ped_volume_ref)} ml
        </p>
      )}

      {medicamento.ped_obs && <p className="text-xs text-text-dim">{medicamento.ped_obs}</p>}
    </div>
  )
}

function Resultado({ rotulo, valor, destaque }: { rotulo: string; valor: string; destaque?: boolean }) {
  return (
    <div className={`rounded-lg px-3 py-2 ${destaque ? 'bg-accent-dim border border-accent/30' : 'bg-surface-2'}`}>
      <p className="text-[11px] text-text-dim uppercase tracking-wide">{rotulo}</p>
      <p className={`tabular text-[15px] font-semibold ${destaque ? 'text-accent' : 'text-text'}`}>{valor}</p>
    </div>
  )
}
