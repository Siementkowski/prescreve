import { useMemo } from 'react'
import {
  AlertTriangle,
  Calendar,
  ClipboardList,
  Pill,
  Syringe,
  MessageCircleQuestion,
  Stethoscope,
  ClipboardCheck,
  FileCheck,
} from 'lucide-react'
import { CopyButton } from '../consulta/components/CopyButton'
import { useGestantesStore, useIGAtual, dataDeInputISO } from './store'
import { useGuiaConsultaStore, type StatusSorologia, type MetodoBCF, type StatusLabs } from './guiaConsultaStore'
import { calcularDPP, dppCorrigidaPorUSG, formatarIG, formatarData, trimestreDaIG } from './idade'
import { PERIODICIDADE_CONSULTAS, examesDaConsulta } from './dados/preNatal'
import { calcularAcidoFolico, calcularFerro, calcularCalcio, calcularAAS, calcularB12D } from './dados/suplementacao'
import { vacinasAplicaveis } from './dados/vacinas'
import { QUEIXAS_ROTINA, ORIENTACOES_PLANO, TEXTO_SINAIS_ALERTA } from './dados/anamnese'
import { Secao } from './components/Secao'
import { LinhaDoTempoIG } from './components/LinhaDoTempoIG'

const ROTULO_SOROLOGIA: Record<StatusSorologia, string> = { desconhecido: '?', imune: 'imune', suscetivel: 'suscetível' }
const ROTULO_METODO_BCF: Record<MetodoBCF, string> = { nao_informado: '', sonar_doppler: 'sonar Doppler', pinard: 'Pinard' }
const ROTULO_LABS: Record<StatusLabs, string> = { nao_avaliado: 'não avaliados', normais: 'normais', alterados: 'alterados' }

const SEMANAS_POR_INTERVALO: Record<string, number> = { Mensal: 4, Quinzenal: 2, Semanal: 1 }

/** Pré-natal — calculadora de IG + linha do tempo (compactas, topo) e o roteiro de
 *  anamnese que se adapta ao contexto (IG, 1ª consulta ou retorno). Reaproveita os dados
 *  já alimentados em Suplementação/Vacinação — não duplica conteúdo clínico, só reorganiza.
 *  Formulário vive em guiaConsultaStore.ts (não useState) pra sobreviver a trocar de
 *  sub-aba sem perder o preenchimento. */
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
  const vacinasTomadas = useGuiaConsultaStore((s) => s.vacinasTomadas)
  const setVacinasTomadas = useGuiaConsultaStore((s) => s.setVacinasTomadas)
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
  const labsStatus = useGuiaConsultaStore((s) => s.labsStatus)
  const setLabsStatus = useGuiaConsultaStore((s) => s.setLabsStatus)
  const labsAlteradosDetalhe = useGuiaConsultaStore((s) => s.labsAlteradosDetalhe)
  const setLabsAlteradosDetalhe = useGuiaConsultaStore((s) => s.setLabsAlteradosDetalhe)

  const queixasRotina = useGuiaConsultaStore((s) => s.queixasRotina)
  const setQueixasRotina = useGuiaConsultaStore((s) => s.setQueixasRotina)
  const queixasDetalhe = useGuiaConsultaStore((s) => s.queixasDetalhe)
  const setQueixasDetalhe = useGuiaConsultaStore((s) => s.setQueixasDetalhe)

  const peso = useGuiaConsultaStore((s) => s.peso)
  const setPeso = useGuiaConsultaStore((s) => s.setPeso)
  const estatura = useGuiaConsultaStore((s) => s.estatura)
  const setEstatura = useGuiaConsultaStore((s) => s.setEstatura)
  const pas = useGuiaConsultaStore((s) => s.pas)
  const setPas = useGuiaConsultaStore((s) => s.setPas)
  const pad = useGuiaConsultaStore((s) => s.pad)
  const setPad = useGuiaConsultaStore((s) => s.setPad)
  const fc = useGuiaConsultaStore((s) => s.fc)
  const setFc = useGuiaConsultaStore((s) => s.setFc)
  const au = useGuiaConsultaStore((s) => s.au)
  const setAu = useGuiaConsultaStore((s) => s.setAu)
  const bcfBpm = useGuiaConsultaStore((s) => s.bcfBpm)
  const setBcfBpm = useGuiaConsultaStore((s) => s.setBcfBpm)
  const bcfMetodo = useGuiaConsultaStore((s) => s.bcfMetodo)
  const setBcfMetodo = useGuiaConsultaStore((s) => s.setBcfMetodo)
  const bcfAusente = useGuiaConsultaStore((s) => s.bcfAusente)
  const setBcfAusente = useGuiaConsultaStore((s) => s.setBcfAusente)

  const riscoAlto = useGuiaConsultaStore((s) => s.riscoAlto)
  const setRiscoAlto = useGuiaConsultaStore((s) => s.setRiscoAlto)
  const orientacoesMarcadas = useGuiaConsultaStore((s) => s.orientacoesMarcadas)
  const setOrientacoesMarcadas = useGuiaConsultaStore((s) => s.setOrientacoesMarcadas)
  const planoExtra = useGuiaConsultaStore((s) => s.planoExtra)
  const setPlanoExtra = useGuiaConsultaStore((s) => s.setPlanoExtra)

  const examesMarcados = useGuiaConsultaStore((s) => s.examesMarcados)
  const setExamesMarcados = useGuiaConsultaStore((s) => s.setExamesMarcados)

  const exames = trimestreAtual != null && primeiraConsulta != null ? examesDaConsulta(trimestreAtual, primeiraConsulta) : []
  const periodicidade = ig ? PERIODICIDADE_CONSULTAS.find((f) => ig.semanas >= f.semanaInicio && (f.semanaFim == null || ig.semanas < f.semanaFim)) : null
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

    const referidas = QUEIXAS_ROTINA.filter((q) => queixasRotina.has(q.chave))
    const textoQueixas =
      referidas.length === 0
        ? `Nega ${QUEIXAS_ROTINA.map((q) => q.textoRefere).join(', ')}.`
        : `Refere ${referidas.map((q) => q.textoRefere).join(', ')}${queixasDetalhe ? ' — ' + queixasDetalhe : ''}. Nega demais queixas de rotina.`

    const vacinasFaltando = vacinasContexto.filter((v) => !vacinasTomadas.has(v))
    const textoVacinasHeader = vacinasFaltando.length === 0 ? 'em dia' : `faltando ${vacinasFaltando.join(', ')}`

    const itensMedicamentos = [
      ...suplementos.filter((s) => medsSelecionados.has(s.nome)).map((s) => `${s.nome} ${s.dose}`),
      ...(outrosMedicamentos ? [outrosMedicamentos] : []),
    ]

    const linhasObjetivo: string[] = ['BEG, LOTE, corada, hidratada, anictérica, acianótica.']
    if (peso || estatura) linhasObjetivo.push(`Peso: ${peso || '___'} kg. Estatura: ${estatura || '___'} m.`)
    if (pas || pad) linhasObjetivo.push(`PA: ${pas || '___'}/${pad || '___'} mmHg.`)
    if (fc) linhasObjetivo.push(`FC: ${fc} bpm.`)
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

    const examesTexto = exames.filter((e) => examesMarcados.has(e.nome)).map((e) => e.nome)
    const linhaSolicitacao =
      examesTexto.length > 0
        ? `Solicito ${examesTexto.join(', ')}.`
        : 'Solicito exames laboratoriais de rotina do trimestre.'

    const linhaVacinasPlano = vacinasFaltando.length > 0 ? `Vacinas pendentes: ${vacinasFaltando.join(', ')}.` : ''

    const orientacoesTexto = ORIENTACOES_PLANO.filter((o) => orientacoesMarcadas.has(o.chave))
      .map((o) => o.titulo)
      .join(', ')

    const semanasRetorno = periodicidade ? SEMANAS_POR_INTERVALO[periodicidade.intervalo] ?? 4 : 4

    const linhaLabs =
      labsStatus === 'alterados'
        ? `${ROTULO_LABS.alterados}${labsAlteradosDetalhe ? ' — ' + labsAlteradosDetalhe : ''}`
        : ROTULO_LABS[labsStatus]

    return `# G${g || '_'}P${p || '_'}C${c || '_'}A${a || '_'}
${historiaObstetrica ? `    ${historiaObstetrica}` : ''}
# TS: ${tipoSanguineo || '___'}
# ${igHeader}: ${formatarIG(ig)}
# DPP: ${formatarData(dpp)}
# Comorbidades: ${comorbidades || 'nega'}
# Medicamentos em uso: ${itensMedicamentos.length > 0 ? itensMedicamentos.join(', ') : 'nega'}
# Calendário vacinal: ${textoVacinasHeader}
# Alergias: ${alergias || 'nega'}
# Vícios: ${negaVicios ? 'nega tabagismo e etilismo' : viciosDetalhe || '___'}
# Toxoplasmose ${ROTULO_SOROLOGIA[toxoplasmose]}
# Atividade laboral: ${atividadeLaboral || '___'}
# DUM: ${dumTexto}
# LABS (${trimestreAtual}º tri): ${linhaLabs}

S
${textoQueixas}

O
${linhasObjetivo.join('\n')}

A
Gestação de ${formatarIG(ig)}, ${riscoAlto ? 'alto risco' : 'risco habitual'}.

P
${linhaSolicitacao}
${TEXTO_SINAIS_ALERTA}
${linhaVacinasPlano}
${orientacoesTexto ? `Orientações reforçadas: ${orientacoesTexto}.` : ''}
Retorno em ${semanasRetorno} semana${semanasRetorno === 1 ? '' : 's'}.
${planoExtra ? planoExtra + '\n' : ''}Paciente ciente e concordante com a conduta.`
      .split('\n')
      .filter((linha) => linha.trim() !== '')
      .join('\n')
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
    vacinasContexto,
    vacinasTomadas,
    alergias,
    negaVicios,
    viciosDetalhe,
    toxoplasmose,
    atividadeLaboral,
    labsStatus,
    labsAlteradosDetalhe,
    queixasRotina,
    queixasDetalhe,
    peso,
    estatura,
    pas,
    pad,
    fc,
    au,
    bcfBpm,
    bcfMetodo,
    bcfAusente,
    riscoAlto,
    orientacoesMarcadas,
    planoExtra,
    exames,
    examesMarcados,
    periodicidade,
    trimestreAtual,
  ])

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="max-w-4xl mx-auto flex flex-col gap-4 pb-16">
        {/* ---- calculadora de IG (compacta) + linha do tempo, lado a lado ---- */}
        <div className="flex flex-col sm:flex-row gap-3 items-start">
          <div className="w-full sm:w-[300px] shrink-0 flex flex-col gap-3">
            <div className="bg-surface border border-border rounded-[var(--radius-card,14px)] p-3.5 flex flex-col gap-3">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-accent" />
                <h2 className="font-display text-[13px] font-semibold">Idade gestacional</h2>
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

          <LinhaDoTempoIG semanaAtual={ig ? ig.semanas : null} />
        </div>

        {!ig && <p className="text-sm text-text-dim px-0.5">Calcule a idade gestacional acima pra continuar o guia.</p>}

        {ig && primeiraConsulta == null && (
          <p className="text-sm text-text-dim px-0.5">Responda se é 1ª consulta ou retorno acima pra abrir o roteiro.</p>
        )}

        {ig && primeiraConsulta != null && (
          <>
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

                <div>
                  <span className="text-xs font-semibold text-text-dim">LABS ({trimestreAtual}º tri)</span>
                  <div className="flex items-center gap-2 mt-1.5">
                    <ToggleChip ativo={labsStatus === 'nao_avaliado'} onClick={() => setLabsStatus('nao_avaliado')} label="Não avaliados" />
                    <ToggleChip ativo={labsStatus === 'normais'} onClick={() => setLabsStatus('normais')} label="Normais" />
                    <ToggleChip ativo={labsStatus === 'alterados'} onClick={() => setLabsStatus('alterados')} label="Alterados" alerta={labsStatus === 'alterados'} />
                  </div>
                  {labsStatus === 'alterados' && (
                    <input
                      value={labsAlteradosDetalhe}
                      onChange={(e) => setLabsAlteradosDetalhe(e.target.value)}
                      placeholder="O que veio alterado"
                      className={inputCls + ' w-full mt-2'}
                    />
                  )}
                </div>
              </div>
            </Secao>

            <Secao titulo="Medicamentos em uso" icone={Pill}>
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1.5">
                  {suplementos.map((s) => (
                    <label
                      key={s.nome}
                      className="flex items-start gap-2.5 border border-border rounded-[var(--radius-item,11px)] px-3 py-2 cursor-pointer hover:border-text-dim transition-colors"
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

            <Secao titulo="Calendário vacinal" icone={Syringe}>
              <div className="flex flex-col gap-1.5">
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
            </Secao>

            <Secao titulo="Subjetivo" icone={MessageCircleQuestion}>
              <div className="flex flex-col gap-3">
                <div>
                  <span className="text-xs font-semibold text-text-dim">Perguntas de rotina — marque o que a paciente refere</span>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {QUEIXAS_ROTINA.map((q) => (
                      <ToggleChip
                        key={q.chave}
                        ativo={queixasRotina.has(q.chave)}
                        onClick={() => alternar(queixasRotina, q.chave, setQueixasRotina)}
                        label={q.titulo}
                        alerta={queixasRotina.has(q.chave)}
                      />
                    ))}
                  </div>
                  {queixasRotina.size > 0 && (
                    <input
                      value={queixasDetalhe}
                      onChange={(e) => setQueixasDetalhe(e.target.value)}
                      placeholder="Detalhar a queixa referida"
                      className={inputCls + ' w-full mt-2'}
                    />
                  )}
                </div>
              </div>
            </Secao>

            <Secao titulo="Objetivo — exame físico" icone={Stethoscope}>
              <div className="flex flex-col gap-3">
                <div className="grid grid-cols-2 gap-2.5">
                  <Campo label="Peso (kg)"><input value={peso} onChange={(e) => setPeso(e.target.value)} className={inputCls} /></Campo>
                  <Campo label="Estatura (m)"><input value={estatura} onChange={(e) => setEstatura(e.target.value)} className={inputCls} /></Campo>
                </div>
                <div className="grid grid-cols-3 gap-2.5">
                  <Campo label="PAS (mmHg)"><input value={pas} onChange={(e) => setPas(e.target.value)} className={inputCls} /></Campo>
                  <Campo label="PAD (mmHg)"><input value={pad} onChange={(e) => setPad(e.target.value)} className={inputCls} /></Campo>
                  <Campo label="FC (bpm)"><input value={fc} onChange={(e) => setFc(e.target.value)} className={inputCls} /></Campo>
                </div>

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
              </div>
            </Secao>

            <Secao titulo={`Exames ${primeiraConsulta ? '— painel inicial' : `— rotina do ${trimestreAtual}º trimestre`}`} icone={ClipboardCheck}>
              <div className="flex flex-col gap-2">
                {exames.map((e) => (
                  <label
                    key={e.nome}
                    className="flex items-start gap-2.5 border border-border rounded-[var(--radius-card,14px)] bg-surface p-3 cursor-pointer hover:border-text-dim transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={examesMarcados.has(e.nome)}
                      onChange={() => alternar(examesMarcados, e.nome, setExamesMarcados)}
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

            <Secao titulo="Avaliação e plano" icone={FileCheck}>
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-text-dim shrink-0">Risco gestacional:</span>
                  <ToggleChip ativo={!riscoAlto} onClick={() => setRiscoAlto(false)} label="Habitual" />
                  <ToggleChip ativo={riscoAlto} onClick={() => setRiscoAlto(true)} label="Alto risco" alerta={riscoAlto} />
                </div>

                <div className="flex items-start gap-2 text-xs text-text-dim bg-surface-2 border border-border rounded-[var(--radius-item,11px)] px-3 py-2.5">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  {TEXTO_SINAIS_ALERTA}
                </div>

                <div>
                  <span className="text-xs font-semibold text-text-dim">Orientações dadas nessa consulta</span>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {ORIENTACOES_PLANO.map((o) => (
                      <ToggleChip
                        key={o.chave}
                        ativo={orientacoesMarcadas.has(o.chave)}
                        onClick={() => alternar(orientacoesMarcadas, o.chave, setOrientacoesMarcadas)}
                        label={o.titulo}
                      />
                    ))}
                  </div>
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

            <div className="bg-surface border border-text rounded-[var(--radius-panel,18px)] p-4 flex flex-col gap-2.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-bold text-text-dim uppercase tracking-wide">Anamnese — pronta pra copiar</span>
                <CopyButton texto={textoFinal} label="Copiar anamnese" variant="solid" />
              </div>
              <pre className="text-xs text-text whitespace-pre-wrap font-sans leading-relaxed bg-surface-2 rounded-[var(--radius-item,11px)] p-3 max-h-96 overflow-y-auto">
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
  'bg-surface-2 border border-border focus:border-text rounded-[var(--radius-input,9px)] px-2.5 py-1.5 text-sm text-text outline-none transition-colors'

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

function ToggleChip({ ativo, onClick, label, alerta }: { ativo: boolean; onClick: () => void; label: string; alerta?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${
        ativo
          ? alerta
            ? 'bg-warn-dim border-warn text-warn'
            : 'bg-text border-text text-bg'
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
