import { useMemo } from 'react'
import {
  AlertTriangle,
  ArrowRight,
  Info,
  ClipboardList,
  Pill,
  MessageCircleQuestion,
  Stethoscope,
  ClipboardCheck,
  ListChecks,
  FileCheck,
} from 'lucide-react'
import { CopyButton } from '../consulta/components/CopyButton'
import { useGestantesStore, useIGAtual, dataDeInputISO } from './store'
import { useGuiaConsultaStore, type StatusSorologia, type MetodoBCF, type MovimentacaoFetal } from './guiaConsultaStore'
import { calcularDPP, dppCorrigidaPorUSG, formatarIG, formatarData, trimestreDaIG } from './idade'
import { PRE_NATAL, PERGUNTAS_ESSENCIAIS, examesDaConsulta, proximoExameImagem, PERIODICIDADE_CONSULTAS } from './dados/preNatal'
import { calcularAcidoFolico, calcularFerro, calcularCalcio, calcularAAS, calcularB12D } from './dados/suplementacao'
import { vacinasAplicaveis } from './dados/vacinas'
import { Secao } from './components/Secao'

const ROTULO_SOROLOGIA: Record<StatusSorologia, string> = { desconhecido: '?', imune: 'imune', suscetivel: 'suscetível' }
const ROTULO_METODO_BCF: Record<MetodoBCF, string> = { nao_informado: '', sonar_doppler: 'sonar Doppler', pinard: 'Pinard' }
const ROTULO_MOVIMENTACAO: Record<Exclude<MovimentacaoFetal, 'nao_avaliado'>, string> = {
  presente: 'presente, referida pela paciente',
  reduzida: 'reduzida',
  ausente: 'ausente',
}

const ACHADOS_ADICIONAIS = [
  'Presença de varizes em MMII',
  'Empastamento/sinais de TVP em MMII',
  'Hiperpigmentação de linha alba',
  'Diástase de músculos retos abdominais',
]

const SEMANAS_POR_INTERVALO: Record<string, number> = { Mensal: 4, Quinzenal: 2, Semanal: 1 }

/** Guia de consulta — checklist + construtor de anamnese que se adapta ao contexto (IG,
 *  1ª consulta ou retorno), diferente do Gerador (fixo): aqui os campos e o próprio texto
 *  final mudam conforme a semana e o que é marcado. Reaproveita os dados já alimentados
 *  em Pré-natal/Suplementação/Vacinação — não duplica conteúdo clínico, só reorganiza.
 *  Formulário vive em guiaConsultaStore.ts (não useState) pra sobreviver a trocar de
 *  sub-aba sem perder o preenchimento — mesmo sem persist em localStorage: some com F5,
 *  fica se só trocar de aba. */
export function GuiaConsulta() {
  const metodo = useGestantesStore((s) => s.metodo)
  const dum = useGestantesStore((s) => s.dum)
  const dataReferencia = useGestantesStore((s) => s.dataReferencia)
  const igReferenciaSemanas = useGestantesStore((s) => s.igReferenciaSemanas)
  const igReferenciaDias = useGestantesStore((s) => s.igReferenciaDias)
  const setAbaAberta = useGestantesStore((s) => s.setAbaAberta)
  const ig = useIGAtual()
  const dpp = useMemo(() => {
    if (!ig) return null
    return metodo === 'dum'
      ? calcularDPP(dataDeInputISO(dum))
      : dppCorrigidaPorUSG(dataDeInputISO(dataReferencia), { semanas: Number(igReferenciaSemanas) || 0, dias: Number(igReferenciaDias) || 0 })
  }, [ig, metodo, dum, dataReferencia, igReferenciaSemanas, igReferenciaDias])

  const primeiraConsulta = useGuiaConsultaStore((s) => s.primeiraConsulta)
  const setPrimeiraConsulta = useGuiaConsultaStore((s) => s.setPrimeiraConsulta)

  const dumAnamnese = useGuiaConsultaStore((s) => s.dumAnamnese)
  const setDumAnamnese = useGuiaConsultaStore((s) => s.setDumAnamnese)
  const g = useGuiaConsultaStore((s) => s.g)
  const setG = useGuiaConsultaStore((s) => s.setG)
  const p = useGuiaConsultaStore((s) => s.p)
  const setP = useGuiaConsultaStore((s) => s.setP)
  const c = useGuiaConsultaStore((s) => s.c)
  const setC = useGuiaConsultaStore((s) => s.setC)
  const a = useGuiaConsultaStore((s) => s.a)
  const setA = useGuiaConsultaStore((s) => s.setA)
  const historiaObstetrica = useGuiaConsultaStore((s) => s.historiaObstetrica)
  const setHistoriaObstetrica = useGuiaConsultaStore((s) => s.setHistoriaObstetrica)
  const tipoSanguineo = useGuiaConsultaStore((s) => s.tipoSanguineo)
  const setTipoSanguineo = useGuiaConsultaStore((s) => s.setTipoSanguineo)
  const comorbidades = useGuiaConsultaStore((s) => s.comorbidades)
  const setComorbidades = useGuiaConsultaStore((s) => s.setComorbidades)
  const medsSelecionados = useGuiaConsultaStore((s) => s.medsSelecionados)
  const setMedsSelecionados = useGuiaConsultaStore((s) => s.setMedsSelecionados)
  const outrosMedicamentos = useGuiaConsultaStore((s) => s.outrosMedicamentos)
  const setOutrosMedicamentos = useGuiaConsultaStore((s) => s.setOutrosMedicamentos)
  const alergias = useGuiaConsultaStore((s) => s.alergias)
  const setAlergias = useGuiaConsultaStore((s) => s.setAlergias)
  const negaVicios = useGuiaConsultaStore((s) => s.negaVicios)
  const setNegaVicios = useGuiaConsultaStore((s) => s.setNegaVicios)
  const viciosDetalhe = useGuiaConsultaStore((s) => s.viciosDetalhe)
  const setViciosDetalhe = useGuiaConsultaStore((s) => s.setViciosDetalhe)
  const toxoplasmose = useGuiaConsultaStore((s) => s.toxoplasmose)
  const setToxoplasmose = useGuiaConsultaStore((s) => s.setToxoplasmose)
  const atividadeLaboral = useGuiaConsultaStore((s) => s.atividadeLaboral)
  const setAtividadeLaboral = useGuiaConsultaStore((s) => s.setAtividadeLaboral)

  const acompanhada = useGuiaConsultaStore((s) => s.acompanhada)
  const setAcompanhada = useGuiaConsultaStore((s) => s.setAcompanhada)
  const acompanhantePor = useGuiaConsultaStore((s) => s.acompanhantePor)
  const setAcompanhantePor = useGuiaConsultaStore((s) => s.setAcompanhantePor)
  const encaminhadaPor = useGuiaConsultaStore((s) => s.encaminhadaPor)
  const setEncaminhadaPor = useGuiaConsultaStore((s) => s.setEncaminhadaPor)
  const jaRealizouExames = useGuiaConsultaStore((s) => s.jaRealizouExames)
  const setJaRealizouExames = useGuiaConsultaStore((s) => s.setJaRealizouExames)
  const queixas = useGuiaConsultaStore((s) => s.queixas)
  const setQueixas = useGuiaConsultaStore((s) => s.setQueixas)
  const queixasDetalhe = useGuiaConsultaStore((s) => s.queixasDetalhe)
  const setQueixasDetalhe = useGuiaConsultaStore((s) => s.setQueixasDetalhe)
  const vacinasTomadas = useGuiaConsultaStore((s) => s.vacinasTomadas)
  const setVacinasTomadas = useGuiaConsultaStore((s) => s.setVacinasTomadas)

  const peso = useGuiaConsultaStore((s) => s.peso)
  const setPeso = useGuiaConsultaStore((s) => s.setPeso)
  const estatura = useGuiaConsultaStore((s) => s.estatura)
  const setEstatura = useGuiaConsultaStore((s) => s.setEstatura)
  const abdomeGravidico = useGuiaConsultaStore((s) => s.abdomeGravidico)
  const setAbdomeGravidico = useGuiaConsultaStore((s) => s.setAbdomeGravidico)
  const au = useGuiaConsultaStore((s) => s.au)
  const setAu = useGuiaConsultaStore((s) => s.setAu)
  const bcfBpm = useGuiaConsultaStore((s) => s.bcfBpm)
  const setBcfBpm = useGuiaConsultaStore((s) => s.setBcfBpm)
  const bcfMetodo = useGuiaConsultaStore((s) => s.bcfMetodo)
  const setBcfMetodo = useGuiaConsultaStore((s) => s.setBcfMetodo)
  const bcfAusente = useGuiaConsultaStore((s) => s.bcfAusente)
  const setBcfAusente = useGuiaConsultaStore((s) => s.setBcfAusente)
  const movimentacaoFetal = useGuiaConsultaStore((s) => s.movimentacaoFetal)
  const setMovimentacaoFetal = useGuiaConsultaStore((s) => s.setMovimentacaoFetal)
  const achados = useGuiaConsultaStore((s) => s.achados)
  const setAchados = useGuiaConsultaStore((s) => s.setAchados)

  const riscoAlto = useGuiaConsultaStore((s) => s.riscoAlto)
  const setRiscoAlto = useGuiaConsultaStore((s) => s.setRiscoAlto)
  const planoExtra = useGuiaConsultaStore((s) => s.planoExtra)
  const setPlanoExtra = useGuiaConsultaStore((s) => s.setPlanoExtra)

  const marcados = useGuiaConsultaStore((s) => s.marcados)
  const setMarcados = useGuiaConsultaStore((s) => s.setMarcados)

  const trimestreAtual = ig ? trimestreDaIG(ig.semanas) : null
  const blocoAtual = trimestreAtual ? PRE_NATAL.find((b) => b.trimestre === trimestreAtual) : undefined
  const exames = trimestreAtual != null && primeiraConsulta != null ? examesDaConsulta(trimestreAtual, primeiraConsulta) : []
  const periodicidade = ig ? PERIODICIDADE_CONSULTAS.find((f) => ig.semanas >= f.semanaInicio && (f.semanaFim == null || ig.semanas < f.semanaFim)) : null
  const proximaImagem = ig ? proximoExameImagem(ig.semanas) : null
  const vacinasContexto = ig ? vacinasAplicaveis(ig.semanas) : []

  const suplementos = useMemo(() => {
    if (!ig) return []
    const ctx = { semanasIG: ig.semanas, riscoFolatoAlto: false, anemiaConfirmada: false, riscoPreEclampsia: false, dietaRestritivaOuHipovitaminose: false }
    return [calcularAcidoFolico(ctx), calcularFerro(ctx), calcularCalcio(ctx), calcularAAS(ctx), calcularB12D(ctx)]
  }, [ig])

  function alternar<T>(set: Set<T>, valor: T, setter: (s: Set<T>) => void) {
    const novo = new Set(set)
    if (novo.has(valor)) novo.delete(valor)
    else novo.add(valor)
    setter(novo)
  }

  const textoFinal = useMemo(() => {
    if (!ig || !dpp || primeiraConsulta == null) return ''

    const dataRefTexto = dataReferencia ? formatarData(dataDeInputISO(dataReferencia)) : '___'
    const igNaRefTexto = `${igReferenciaSemanas || '0'}s${igReferenciaDias ? igReferenciaDias + 'd' : ''}`
    const igHeader =
      metodo === 'usg'
        ? `IG (USG ${dataRefTexto} com ${igNaRefTexto})`
        : metodo === 'previa'
          ? `IG (prévia de ${dataRefTexto} com ${igNaRefTexto})`
          : `IG (DUM ${dum ? formatarData(dataDeInputISO(dum)) : '___'})`
    const dumTexto = dumAnamnese ? formatarData(dataDeInputISO(dumAnamnese)) : '___'

    const referidas = PERGUNTAS_ESSENCIAIS.filter((q) => queixas[q.titulo])
    const textoQueixas =
      referidas.length === 0
        ? 'Nega queixas, como náuseas, vômitos, sangramento vaginal, perda de líquido, dor ou contrações, alteração da movimentação fetal.'
        : `Refere ${referidas.map((q) => q.titulo.toLowerCase()).join(', ')}${queixasDetalhe ? ' — ' + queixasDetalhe : ''}. Nega demais queixas.`

    const vacinasFaltando = vacinasContexto.filter((v) => !vacinasTomadas.has(v))
    const textoVacinas = vacinasFaltando.length === 0 ? 'em dia' : `faltando ${vacinasFaltando.join(', ')}`

    const itensMedicamentos = [
      ...suplementos.filter((s) => medsSelecionados.has(s.nome)).map((s) => `${s.nome} ${s.dose}`),
      ...(outrosMedicamentos ? [outrosMedicamentos] : []),
    ]

    const linhasObjetivo: string[] = ['BEG, LOTE, corada, hidratada, anictérica, acianótica.']
    if (peso || estatura) linhasObjetivo.push(`Peso: ${peso || '___'} kg. Estatura: ${estatura || '___'} m.`)
    if (abdomeGravidico) linhasObjetivo.push('Abdome gravídico, indolor à palpação superficial e profunda.')
    if (au) linhasObjetivo.push(`AU: ${au} cm.`)
    if (ig.semanas >= 12) {
      const metodoTxt = bcfMetodo !== 'nao_informado' ? ` (${ROTULO_METODO_BCF[bcfMetodo]})` : ''
      linhasObjetivo.push(
        bcfAusente
          ? 'BCF ausente à ausculta — reavaliar com USG.'
          : bcfBpm
            ? `BCF presente${metodoTxt}, FCF de ${bcfBpm} bpm.`
            : 'BCF não auscultado nessa consulta.'
      )
    }
    if (movimentacaoFetal !== 'nao_avaliado') linhasObjetivo.push(`Movimentação fetal ${ROTULO_MOVIMENTACAO[movimentacaoFetal]}.`)
    if (achados.size > 0) linhasObjetivo.push(`${Array.from(achados).join(', ')}.`)

    const examesTexto = exames.filter((e) => marcados.has(e.nome)).map((e) => e.nome)
    const linhaSolicitacao =
      examesTexto.length > 0
        ? `Solicito ${examesTexto.join(', ')} e demais exames laboratoriais de rotina do trimestre.`
        : 'Solicito EQU + urocultura com TSA e demais exames laboratoriais de rotina do trimestre.'

    const semanasRetorno = periodicidade ? SEMANAS_POR_INTERVALO[periodicidade.intervalo] ?? 4 : 4

    return `# G${g || '_'}P${p || '_'}C${c || '_'}A${a || '_'}
${historiaObstetrica ? `    ${historiaObstetrica}` : ''}
# TS: ${tipoSanguineo || '___'}
# DUM: ${dumTexto}
# ${igHeader}: ${formatarIG(ig)}
# DPP: ${formatarData(dpp)}
# Comorbidades: ${comorbidades || 'nega'}
# Medicamentos em uso: ${itensMedicamentos.length > 0 ? itensMedicamentos.join(', ') : 'nega'}
# Alergias: ${alergias || 'nega'}
# Vícios: ${negaVicios ? 'nega tabagismo e etilismo' : viciosDetalhe || '___'}
# Toxoplasmose ${ROTULO_SOROLOGIA[toxoplasmose]}
# Atividade laboral: ${atividadeLaboral || '___'}

S
Paciente em ${primeiraConsulta ? 'primeira consulta' : 'consulta de retorno'} ${riscoAlto ? 'no AGAR' : 'de pré-natal'}, ${acompanhada ? `acompanhada de ${acompanhantePor || '___'}` : 'desacompanhada'}. ${encaminhadaPor ? `Encaminhada por ${encaminhadaPor}.` : 'Gestação de risco habitual.'}
${jaRealizouExames ? 'Já' : 'Ainda não'} realizou USG obstétrico e exames laboratoriais. Nega histórico de aborto, comorbidades e alergias, salvo o descrito acima.
${textoQueixas}
Calendário vacinal ${textoVacinas}.

O
${linhasObjetivo.join('\n')}

A
Gestação de ${formatarIG(ig)}, ${riscoAlto ? 'alto risco' : 'risco habitual'}.

P
${linhaSolicitacao}
Oriento sinais de alarme (sangramento vaginal, perda de líquido, ausência de movimentação fetal, cefaleia intensa, edema súbito de mãos/rosto) e busca de pronto atendimento se necessário.
Encaminho para realização de ${proximaImagem?.nome ?? 'USG'} conforme idade gestacional (${proximaImagem?.semanaInicio}-${proximaImagem?.semanaFim} semanas).
Retorno em ${semanasRetorno} semana${semanasRetorno === 1 ? '' : 's'}.
${planoExtra ? planoExtra + '\n' : ''}Paciente ciente e concordante com a conduta.`
  }, [
    ig,
    dpp,
    primeiraConsulta,
    metodo,
    dum,
    dataReferencia,
    igReferenciaSemanas,
    igReferenciaDias,
    dumAnamnese,
    g,
    p,
    c,
    a,
    historiaObstetrica,
    tipoSanguineo,
    comorbidades,
    medsSelecionados,
    outrosMedicamentos,
    suplementos,
    alergias,
    negaVicios,
    viciosDetalhe,
    toxoplasmose,
    atividadeLaboral,
    acompanhada,
    acompanhantePor,
    encaminhadaPor,
    jaRealizouExames,
    queixas,
    queixasDetalhe,
    vacinasContexto,
    vacinasTomadas,
    peso,
    estatura,
    abdomeGravidico,
    au,
    bcfBpm,
    bcfMetodo,
    bcfAusente,
    movimentacaoFetal,
    achados,
    riscoAlto,
    planoExtra,
    exames,
    marcados,
    periodicidade,
    proximaImagem,
  ])

  if (!ig) {
    return (
      <div className="h-full flex items-center justify-center px-6">
        <div className="text-center max-w-sm flex flex-col items-center gap-3">
          <p className="text-sm text-text-dim">
            Calcule a idade gestacional em Pré-natal primeiro — o guia usa ela pra montar a anamnese certa.
          </p>
          <button
            onClick={() => setAbaAberta('pre_natal')}
            className="flex items-center gap-1.5 text-sm font-semibold text-accent hover:underline"
          >
            Ir para Pré-natal <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="max-w-3xl mx-auto flex flex-col gap-4 pb-16">
        <div className="flex items-start gap-2 text-xs text-text-dim bg-surface-2 border border-border rounded-lg px-3 py-2.5">
          <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          <span>
            Em construção — idade gestacional atual: {formatarIG(ig)}, {trimestreAtual}º trimestre (calculada em
            Pré-natal).
          </span>
        </div>

        {/* ---- gate: 1ª consulta ou retorno ---- */}
        <div className="bg-surface border border-border rounded-2xl p-5 flex flex-col gap-3">
          <p className="font-display text-[16px] font-semibold">Essa é a primeira consulta de pré-natal dela?</p>
          <div className="flex gap-2">
            <button
              onClick={() => setPrimeiraConsulta(true)}
              className={`flex-1 text-sm font-semibold rounded-xl border px-4 py-3 transition-colors ${
                primeiraConsulta === true ? 'bg-accent-dim border-accent text-accent' : 'bg-surface-2 border-border text-text-dim hover:text-text'
              }`}
            >
              Sim, primeira consulta
            </button>
            <button
              onClick={() => setPrimeiraConsulta(false)}
              className={`flex-1 text-sm font-semibold rounded-xl border px-4 py-3 transition-colors ${
                primeiraConsulta === false ? 'bg-accent-dim border-accent text-accent' : 'bg-surface-2 border-border text-text-dim hover:text-text'
              }`}
            >
              Não, é retorno
            </button>
          </div>
        </div>

        {primeiraConsulta != null && (
          <>
            {/* ============ ANAMNESE ============ */}

            <Secao titulo="Antecedentes" icone={ClipboardList}>
              <div className="flex flex-col gap-3">
                <Campo label="DUM (relatada, pro cabeçalho da anamnese)">
                  <input
                    type="date"
                    value={dumAnamnese}
                    onChange={(e) => setDumAnamnese(e.target.value)}
                    max={new Date().toISOString().slice(0, 10)}
                    className={inputCls + ' w-full'}
                  />
                </Campo>
                <div className="grid grid-cols-4 gap-2.5">
                  <Campo label="G"><input value={g} onChange={(e) => setG(e.target.value)} className={inputCls} /></Campo>
                  <Campo label="P"><input value={p} onChange={(e) => setP(e.target.value)} className={inputCls} /></Campo>
                  <Campo label="C"><input value={c} onChange={(e) => setC(e.target.value)} className={inputCls} /></Campo>
                  <Campo label="A"><input value={a} onChange={(e) => setA(e.target.value)} className={inputCls} /></Campo>
                </div>
                {Number(g) > 1 && (
                  <Campo label="Detalhar gestações anteriores relevantes">
                    <input
                      value={historiaObstetrica}
                      onChange={(e) => setHistoriaObstetrica(e.target.value)}
                      placeholder="Ex: G1 - 2020 - trabalho de parto prematuro, pré-eclâmpsia"
                      className={inputCls + ' w-full'}
                    />
                  </Campo>
                )}
                <div className="grid grid-cols-2 gap-2.5">
                  <Campo label="Tipo sanguíneo (TS)"><input value={tipoSanguineo} onChange={(e) => setTipoSanguineo(e.target.value)} className={inputCls} /></Campo>
                  <Campo label="Atividade laboral"><input value={atividadeLaboral} onChange={(e) => setAtividadeLaboral(e.target.value)} className={inputCls} /></Campo>
                </div>
                <Campo label="Comorbidades (vazio = nega)"><input value={comorbidades} onChange={(e) => setComorbidades(e.target.value)} className={inputCls + ' w-full'} /></Campo>
                <Campo label="Alergias (vazio = nega)"><input value={alergias} onChange={(e) => setAlergias(e.target.value)} className={inputCls + ' w-full'} /></Campo>

                <div>
                  <span className="text-xs font-semibold text-text-dim">Vícios</span>
                  <div className="flex items-center gap-2 mt-1.5">
                    <ToggleChip ativo={negaVicios} onClick={() => setNegaVicios(true)} label="Nega tabagismo/etilismo" />
                    <ToggleChip ativo={!negaVicios} onClick={() => setNegaVicios(false)} label="Detalhar" />
                  </div>
                  {!negaVicios && (
                    <input value={viciosDetalhe} onChange={(e) => setViciosDetalhe(e.target.value)} className={inputCls + ' w-full mt-2'} />
                  )}
                </div>

                <SorologiaCampo label="Toxoplasmose" valor={toxoplasmose} onChange={setToxoplasmose} />
              </div>
            </Secao>

            <Secao titulo="Medicamentos em uso" icone={Pill}>
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1.5">
                  {suplementos.map((s) => (
                    <label
                      key={s.nome}
                      className="flex items-start gap-2.5 border border-border rounded-lg px-3 py-2 cursor-pointer hover:border-text-dim transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={medsSelecionados.has(s.nome)}
                        onChange={() => alternar(medsSelecionados, s.nome, setMedsSelecionados)}
                        className="mt-0.5 w-4 h-4 accent-[var(--color-accent)] shrink-0"
                      />
                      <span className="min-w-0">
                        <span className="block text-sm font-semibold text-text">{s.nome}</span>
                        <span className="block text-xs text-text-dim mt-0.5">{s.dose}</span>
                      </span>
                    </label>
                  ))}
                </div>
                <Campo label="Outros (vazio = nenhum)">
                  <input value={outrosMedicamentos} onChange={(e) => setOutrosMedicamentos(e.target.value)} className={inputCls + ' w-full'} />
                </Campo>
              </div>
            </Secao>

            <Secao titulo="Subjetivo" icone={MessageCircleQuestion}>
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <ToggleChip ativo={!acompanhada} onClick={() => setAcompanhada(false)} label="Desacompanhada" />
                  <ToggleChip ativo={acompanhada} onClick={() => setAcompanhada(true)} label="Acompanhada" />
                  {acompanhada && (
                    <input
                      value={acompanhantePor}
                      onChange={(e) => setAcompanhantePor(e.target.value)}
                      placeholder="por quem"
                      className={inputCls}
                    />
                  )}
                </div>
                <Campo label="Encaminhada por (vazio = gestação de risco habitual)">
                  <input value={encaminhadaPor} onChange={(e) => setEncaminhadaPor(e.target.value)} className={inputCls + ' w-full'} />
                </Campo>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-text-dim shrink-0">USG/exames prévios:</span>
                  <ToggleChip ativo={!jaRealizouExames} onClick={() => setJaRealizouExames(false)} label="Ainda não realizou" />
                  <ToggleChip ativo={jaRealizouExames} onClick={() => setJaRealizouExames(true)} label="Já realizou" />
                </div>

                <div>
                  <span className="text-xs font-semibold text-text-dim">Sinais de alarme — queixas nessa consulta</span>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {PERGUNTAS_ESSENCIAIS.map((q) => (
                      <ToggleChip
                        key={q.titulo}
                        ativo={!!queixas[q.titulo]}
                        onClick={() => setQueixas({ ...queixas, [q.titulo]: !queixas[q.titulo] })}
                        label={q.titulo}
                        alerta={!!queixas[q.titulo]}
                      />
                    ))}
                  </div>
                  {Object.values(queixas).some(Boolean) && (
                    <input
                      value={queixasDetalhe}
                      onChange={(e) => setQueixasDetalhe(e.target.value)}
                      placeholder="Detalhar a queixa referida"
                      className={inputCls + ' w-full mt-2'}
                    />
                  )}
                </div>

                <div>
                  <span className="text-xs font-semibold text-text-dim">
                    Calendário vacinal — o que já se aplica com {formatarIG(ig)}
                  </span>
                  <div className="flex flex-col gap-1.5 mt-1.5">
                    {vacinasContexto.map((nome) => (
                      <label key={nome} className="flex items-center gap-2.5 text-sm cursor-pointer">
                        <input
                          type="checkbox"
                          checked={vacinasTomadas.has(nome)}
                          onChange={() => alternar(vacinasTomadas, nome, setVacinasTomadas)}
                          className="w-4 h-4 accent-[var(--color-accent)]"
                        />
                        {nome}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </Secao>

            <Secao titulo="Objetivo — exame físico" icone={Stethoscope}>
              <div className="flex flex-col gap-3">
                <div className="grid grid-cols-2 gap-2.5">
                  <Campo label="Peso (kg)"><input value={peso} onChange={(e) => setPeso(e.target.value)} className={inputCls} /></Campo>
                  <Campo label="Estatura (m)"><input value={estatura} onChange={(e) => setEstatura(e.target.value)} className={inputCls} /></Campo>
                </div>

                <label className="flex items-center gap-2.5 text-sm cursor-pointer">
                  <input type="checkbox" checked={abdomeGravidico} onChange={(e) => setAbdomeGravidico(e.target.checked)} className="w-4 h-4 accent-[var(--color-accent)]" />
                  Abdome gravídico, indolor à palpação superficial e profunda
                </label>

                <Campo label="AU — altura uterina (cm)"><input value={au} onChange={(e) => setAu(e.target.value)} className={inputCls} /></Campo>

                {ig.semanas >= 12 && (
                  <div>
                    <span className="text-xs font-semibold text-text-dim">BCF — batimentos cardíacos fetais</span>
                    <div className="grid grid-cols-2 gap-2.5 mt-1.5">
                      <input value={bcfBpm} onChange={(e) => setBcfBpm(e.target.value)} placeholder="bpm" className={inputCls} disabled={bcfAusente} />
                      <select value={bcfMetodo} onChange={(e) => setBcfMetodo(e.target.value as MetodoBCF)} className={inputCls} disabled={bcfAusente}>
                        <option value="nao_informado">Método — não informar</option>
                        <option value="sonar_doppler">Sonar Doppler</option>
                        <option value="pinard">Pinard</option>
                      </select>
                    </div>
                    <label className="flex items-center gap-2.5 text-sm cursor-pointer mt-2">
                      <input
                        type="checkbox"
                        checked={bcfAusente}
                        onChange={(e) => setBcfAusente(e.target.checked)}
                        className="w-4 h-4 accent-[var(--color-danger)]"
                      />
                      <span className={bcfAusente ? 'text-danger font-semibold' : ''}>BCF ausente à ausculta</span>
                    </label>
                  </div>
                )}

                <Campo label="Movimentação fetal (MF)">
                  <select value={movimentacaoFetal} onChange={(e) => setMovimentacaoFetal(e.target.value as MovimentacaoFetal)} className={inputCls + ' w-full'}>
                    <option value="nao_avaliado">— não informar —</option>
                    <option value="presente">Presente</option>
                    <option value="reduzida">Reduzida</option>
                    <option value="ausente">Ausente</option>
                  </select>
                </Campo>

                <div>
                  <span className="text-xs font-semibold text-text-dim">Achados adicionais (marque se presentes)</span>
                  <div className="flex flex-col gap-1.5 mt-1.5">
                    {ACHADOS_ADICIONAIS.map((item) => (
                      <label key={item} className="flex items-center gap-2.5 text-sm cursor-pointer">
                        <input
                          type="checkbox"
                          checked={achados.has(item)}
                          onChange={() => alternar(achados, item, setAchados)}
                          className="w-4 h-4 accent-[var(--color-accent)]"
                        />
                        {item}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </Secao>

            {/* ---- exames a solicitar ---- */}
            <Secao titulo={`Exames ${primeiraConsulta ? '— painel inicial' : `— rotina do ${trimestreAtual}º trimestre`}`} icone={ClipboardCheck}>
              <div className="flex flex-col gap-2">
                {exames.map((e) => (
                  <label
                    key={e.nome}
                    className="flex items-start gap-2.5 border border-border rounded-xl bg-surface p-3 cursor-pointer hover:border-text-dim transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={marcados.has(e.nome)}
                      onChange={() => alternar(marcados, e.nome, setMarcados)}
                      className="mt-0.5 w-4 h-4 accent-[var(--color-accent)] shrink-0"
                    />
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold text-text">{e.nome}</span>
                      <span className="block text-xs text-text-dim mt-0.5">{e.periodicidade}</span>
                    </span>
                  </label>
                ))}
              </div>
            </Secao>

            {blocoAtual && blocoAtual.condutas.length > 0 && (
              <Secao titulo="Conduta desse trimestre" icone={ListChecks}>
                <div className="flex flex-col gap-1.5">
                  {blocoAtual.condutas.map((cd) =>
                    cd.alerta ? (
                      <span
                        key={cd.texto}
                        className="flex items-start gap-1.5 text-[12.5px] font-semibold text-warn bg-warn-dim border border-warn/30 rounded-full px-3 py-1.5 w-fit"
                      >
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                        {cd.texto}
                      </span>
                    ) : (
                      <div key={cd.texto} className="border border-border rounded-lg px-3 py-2 text-sm font-semibold">
                        {cd.texto}
                      </div>
                    )
                  )}
                </div>
              </Secao>
            )}

            <Secao titulo="Avaliação e plano" icone={FileCheck}>
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-text-dim shrink-0">Risco gestacional:</span>
                  <ToggleChip ativo={!riscoAlto} onClick={() => setRiscoAlto(false)} label="Habitual" />
                  <ToggleChip ativo={riscoAlto} onClick={() => setRiscoAlto(true)} label="Alto risco" alerta={riscoAlto} />
                </div>
                <Campo label="Plano extra (opcional — entra antes do fechamento)">
                  <textarea
                    value={planoExtra}
                    onChange={(e) => setPlanoExtra(e.target.value)}
                    rows={2}
                    className={inputCls + ' w-full resize-none'}
                  />
                </Campo>
              </div>
            </Secao>

            {/* ============ TEXTO FINAL ============ */}
            <div className="bg-surface border-2 border-accent/40 rounded-2xl p-4 flex flex-col gap-2.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-bold text-accent uppercase tracking-wide">Anamnese — pronta pra copiar</span>
                <CopyButton texto={textoFinal} label="Copiar anamnese" variant="solid" />
              </div>
              <pre className="text-xs text-text whitespace-pre-wrap font-sans leading-relaxed bg-surface-2 rounded-lg p-3 max-h-96 overflow-y-auto">
                {textoFinal}
              </pre>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

const inputCls =
  'bg-surface-2 border border-border focus:border-accent rounded-lg px-2.5 py-1.5 text-sm text-text outline-none transition-colors'

function Campo({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold text-text-dim">{label}</span>
      {children}
    </label>
  )
}

function ToggleChip({ ativo, onClick, label, alerta }: { ativo: boolean; onClick: () => void; label: string; alerta?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${
        ativo
          ? alerta
            ? 'bg-warn-dim border-warn text-warn'
            : 'bg-accent-dim border-accent text-accent'
          : 'bg-surface-2 border-border text-text-dim hover:text-text'
      }`}
    >
      {label}
    </button>
  )
}

function SorologiaCampo({ label, valor, onChange }: { label: string; valor: StatusSorologia; onChange: (v: StatusSorologia) => void }) {
  return (
    <Campo label={label}>
      <select value={valor} onChange={(e) => onChange(e.target.value as StatusSorologia)} className={inputCls}>
        <option value="desconhecido">?</option>
        <option value="imune">Imune</option>
        <option value="suscetivel">Suscetível</option>
      </select>
    </Campo>
  )
}
