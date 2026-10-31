import { useMemo } from 'react'
import type { ReactNode } from 'react'
import { Link, useParams } from 'react-router-dom'
import { AlertTriangle, Baby, Calculator, ChevronDown, FlaskConical, Heart, Pill } from 'lucide-react'
import { useSyncStore } from '../core/sync'
import { usePediatriaStore } from '../pediatria/store'
import { calcularDosePediatrica, formatarNumero, textoFormula, textoPrescricaoPediatrica } from '../core/pediatria'
import { formatarApresentacao } from '../core/apresentacao'
import { FORMAS_CONFIG, type FormaFarmaceutica } from '../core/formas'
import { LABEL_STATUS_RISCO, type Medicamento } from '../admin/types'
import { HeroPagina } from '../core/components/HeroPagina'
import { CopyButton } from '../consulta/components/CopyButton'

const OPCOES_TOMADAS = [1, 2, 3, 4, 6]

/** Ficha do medicamento — hero com nome, peso e atalhos; à esquerda a dose calculada e as
 *  apresentações, à direita as advertências (contraindicações, gestação, observações).
 *  Só leitura. O peso é o mesmo da calculadora de Pediatria (usePediatriaStore), então
 *  digitar aqui ou lá não pede duas vezes. */
export function MedicamentoDetalhe() {
  const { id } = useParams()
  const carregandoInicial = useSyncStore((s) => s.carregandoInicial)
  const medicamentos = useSyncStore((s) => s.medicamentos)
  const apresentacoes = useSyncStore((s) => s.apresentacoes)

  const pesoKg = usePediatriaStore((s) => s.pesoKg)
  const setPesoKg = usePediatriaStore((s) => s.setPesoKg)
  const tomadasPorMedicamento = usePediatriaStore((s) => s.tomadasPorMedicamento)
  const setTomadasPorMedicamento = usePediatriaStore((s) => s.setTomadasPorMedicamento)

  const medicamento = medicamentos.find((m) => m.id === Number(id)) ?? null
  const apresentacoesDoMed = useMemo(
    () => apresentacoes.filter((a) => a.medicamento_id === medicamento?.id).sort((a, b) => a.ordem - b.ordem),
    [apresentacoes, medicamento]
  )

  if (carregandoInicial) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-sm text-text-dim">Carregando base…</p>
      </div>
    )
  }

  if (!medicamento) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-3">
        <p className="text-sm text-text-dim">Medicamento não encontrado.</p>
        <Link to="/medicamentos" className="text-sm font-medium text-accent hover:underline">
          Voltar para Medicamentos
        </Link>
      </div>
    )
  }

  const temDosePediatrica = medicamento.ped_mg_kg_dia != null && medicamento.ped_mg_kg_dia > 0
  const tomadas = tomadasPorMedicamento[medicamento.id] ?? 3
  const pesoValido = pesoKg != null && pesoKg > 0

  const formas = [
    ...new Set(
      apresentacoesDoMed.map((a) => FORMAS_CONFIG[a.forma as FormaFarmaceutica]?.rotulo ?? a.forma).filter(Boolean)
    ),
  ]
  const advertencias = montarAdvertencias(medicamento)
  const classe = medicamento.classe?.trim() || 'Outros'

  return (
    <div className="h-full overflow-y-auto">
      <HeroPagina
        migalhas={[
          { label: 'Página inicial', to: '/' },
          { label: 'Medicamentos', to: '/medicamentos' },
          { label: classe, to: `/medicamentos?classe=${encodeURIComponent(classe)}` },
          { label: medicamento.nome },
        ]}
        titulo={medicamento.nome}
        subtitulo={medicamento.nome_comercial}
      >
        {/* campo de peso — sem ele não há dose pra calcular */}
        <label className="flex items-center bg-surface text-text rounded-[var(--radius-control,12px)] p-1.5 max-w-lg focus-within:ring-2 focus-within:ring-white/60">
          <input
            type="number"
            min={0}
            step="0.1"
            value={pesoKg ?? ''}
            onChange={(e) => setPesoKg(e.target.value === '' ? null : Number(e.target.value))}
            placeholder="Digite o peso do paciente (em kg)"
            className="tabular flex-1 min-w-0 bg-transparent outline-none px-3 py-2 text-sm text-text placeholder:text-text-dim"
          />
          <span className="w-10 h-10 rounded-[var(--radius-input,9px)] bg-text text-bg flex items-center justify-center shrink-0">
            <Calculator className="w-4 h-4" />
          </span>
        </label>

        <div className="flex items-center gap-x-5 gap-y-2 flex-wrap text-[13px]">
          {formas.length > 0 && <Atalho icone={Pill}>{formas.join(' · ')}</Atalho>}
          {medicamento.gestacao_status && (
            <Atalho icone={Heart}>
              <b>Gestação:</b> {LABEL_STATUS_RISCO[medicamento.gestacao_status]}
            </Atalho>
          )}
          {medicamento.lactacao_status && (
            <Atalho icone={Baby}>
              <b>Lactação:</b> {LABEL_STATUS_RISCO[medicamento.lactacao_status]}
            </Atalho>
          )}
          {temDosePediatrica && (
            <Atalho icone={FlaskConical}>
              <b>Pediatria:</b> {formatarNumero(medicamento.ped_mg_kg_dia as number, 2)} mg/kg/dia
            </Atalho>
          )}
        </div>
      </HeroPagina>

      {/* corpo */}
      <div className="px-6 sm:px-9 py-8 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_360px] gap-6 items-start">
        <div className="flex flex-col gap-6">
          <section className="border border-border bg-surface rounded-[var(--radius-panel,18px)] p-6">
            {!temDosePediatrica ? (
              <Vazio>Este medicamento não tem dose pediátrica por peso cadastrada.</Vazio>
            ) : !pesoValido ? (
              <Vazio>Digite o peso da criança para iniciarmos os cálculos das doses e suas apresentações…</Vazio>
            ) : (
              <ResultadoDose
                medicamento={medicamento}
                pesoKg={pesoKg as number}
                tomadas={tomadas}
                onTomadas={(n) => setTomadasPorMedicamento(medicamento.id, n)}
              />
            )}
          </section>

          <section className="border border-border bg-surface rounded-[var(--radius-panel,18px)] p-6 flex flex-col gap-3">
            <h2 className="font-display text-[20px] font-semibold tracking-[-.6px] text-text">Apresentações</h2>
            {apresentacoesDoMed.length > 0 ? (
              <ul className="flex flex-col gap-2">
                {apresentacoesDoMed.map((a) => (
                  <li
                    key={a.id}
                    className="flex items-center gap-2.5 text-sm text-text bg-surface-2 rounded-[var(--radius-item,11px)] px-3.5 py-2.5"
                  >
                    <Pill className="w-4 h-4 text-accent shrink-0" />
                    {formatarApresentacao(a)}
                  </li>
                ))}
              </ul>
            ) : medicamento.apresentacoes ? (
              <p className="text-sm text-text-dim whitespace-pre-wrap">{medicamento.apresentacoes}</p>
            ) : (
              <p className="text-sm text-text-dim">Nenhuma apresentação cadastrada.</p>
            )}
          </section>
        </div>

        {/* advertências */}
        <aside className="border border-border bg-surface rounded-[var(--radius-panel,18px)] overflow-hidden">
          <h2 className="flex items-center gap-2 font-display text-[22px] font-semibold tracking-[-.6px] text-danger px-6 pt-6 pb-4">
            Advertências <AlertTriangle className="w-5 h-5" />
          </h2>
          {advertencias.length === 0 ? (
            <p className="text-sm text-text-dim px-6 pb-6">Nenhuma advertência cadastrada.</p>
          ) : (
            advertencias.map((adv) => (
              <div key={adv.titulo} className="px-6 py-4 border-t border-border">
                <h3 className="text-sm font-semibold text-text">{adv.titulo}</h3>
                <p className="text-[13px] text-text-dim leading-relaxed mt-1.5 whitespace-pre-wrap">{adv.texto}</p>
              </div>
            ))
          )}
        </aside>
      </div>
    </div>
  )
}

function montarAdvertencias(m: Medicamento): { titulo: string; texto: string }[] {
  const lista: { titulo: string; texto: string }[] = []
  if (m.contraindicacoes?.trim()) lista.push({ titulo: 'Contraindicações', texto: m.contraindicacoes.trim() })
  if (m.gestacao_status && m.gestacao_status !== 'seguro') {
    lista.push({
      titulo: `Gestação — ${LABEL_STATUS_RISCO[m.gestacao_status]}`,
      texto: m.gestacao_obs?.trim() || 'Sem observações cadastradas.',
    })
  } else if (m.gestacao_obs?.trim()) {
    lista.push({ titulo: 'Gestação', texto: m.gestacao_obs.trim() })
  }
  if (m.lactacao_status && m.lactacao_status !== 'seguro') {
    lista.push({ titulo: 'Lactação', texto: LABEL_STATUS_RISCO[m.lactacao_status] })
  }
  if (m.ped_obs?.trim()) lista.push({ titulo: 'Pediatria', texto: m.ped_obs.trim() })
  if (m.incompleto) {
    lista.push({
      titulo: 'Cadastro incompleto',
      texto: 'Este medicamento veio do cadastro rápido e ainda não foi revisado — confira bula e diretrizes.',
    })
  }
  return lista
}

function ResultadoDose({
  medicamento,
  pesoKg,
  tomadas,
  onTomadas,
}: {
  medicamento: Medicamento
  pesoKg: number
  tomadas: number
  onTomadas: (n: number) => void
}) {
  const calc = calcularDosePediatrica({
    pesoKg,
    mgPorKgDia: medicamento.ped_mg_kg_dia as number,
    doseMaxDiariaMg: medicamento.ped_dose_max_dia,
    tomadasPorDia: tomadas,
    concentracaoMgPorMl: medicamento.ped_concentracao,
  })

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h2 className="font-display text-[20px] font-semibold tracking-[-.6px] text-text">Dose calculada</h2>
          <p className="text-xs text-text-dim mt-0.5">
            {formatarNumero(pesoKg)} kg × {formatarNumero(calc.mgPorKgDia, 2)} mg/kg/dia
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <select
              value={tomadas}
              onChange={(e) => onTomadas(Number(e.target.value))}
              aria-label="Tomadas por dia"
              className="appearance-none bg-surface border border-border rounded-[var(--radius-input,9px)] pl-3 pr-8 py-2 text-sm text-text outline-none focus:border-text"
            >
              {OPCOES_TOMADAS.map((n) => (
                <option key={n} value={n}>
                  {n}x/dia
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-text-dim absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
          <CopyButton texto={textoPrescricaoPediatrica(calc, medicamento.nome)} label="Copiar" variant="solid" />
        </div>
      </div>

      {calc.atingiuTeto && (
        <div className="flex items-start gap-2 text-sm text-white bg-danger border border-danger rounded-[var(--radius-item,11px)] px-3 py-2.5 font-medium">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>
            Dose calculada ({formatarNumero(calc.doseDiariaCalculadaMg)} mg/dia) ultrapassa o teto de{' '}
            {formatarNumero(calc.doseMaximaDiariaMg as number)} mg/dia — resultado limitado ao teto.
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
        <p className="text-[11px] text-text-dim">Referência de bula: {formatarNumero(medicamento.ped_volume_ref)} ml</p>
      )}
    </div>
  )
}

function Resultado({ rotulo, valor, destaque }: { rotulo: string; valor: string; destaque?: boolean }) {
  return (
    <div
      className={`rounded-[var(--radius-item,11px)] px-4 py-3 ${
        destaque ? 'bg-accent-dim border border-accent/30' : 'bg-surface-2'
      }`}
    >
      <p className="text-[11px] text-text-dim uppercase tracking-wide">{rotulo}</p>
      <p className={`tabular text-[20px] font-semibold ${destaque ? 'text-accent' : 'text-text'}`}>{valor}</p>
    </div>
  )
}

function Vazio({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-2.5 text-center py-10 px-4">
      <Calculator className="w-5 h-5 text-text-dim" />
      <p className="text-[15px] font-semibold text-text-dim max-w-sm">{children}</p>
    </div>
  )
}

function Atalho({ icone: Icone, children }: { icone: typeof Pill; children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-white/90">
      <Icone className="w-3.5 h-3.5" />
      <span>{children}</span>
    </span>
  )
}
