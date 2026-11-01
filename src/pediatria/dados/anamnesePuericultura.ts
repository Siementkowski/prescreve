// Anamnese guiada de Puericultura, por faixa etária — mesma ideia do gerador de anamnese
// infantil (cada idade mostra só os campos que fazem sentido, o texto final sai em
// parágrafos), mas enxuta: ficaram de fora os campos que quase nunca eram preenchidos
// (G_P_C_A, bolsa rota, Apgar, comprimento/PC ao nascer, 5 refeições do recordatório, animais,
// substâncias em casa, socialização...). Para voltar com algum, é só acrescentar um objeto em
// CAMPOS (ou em EXAME). `min`/`max` são em meses completos, comparados com
// `idadeReferenciaMeses` da faixa.

import type { FaixaPuericultura } from './guiaPuericultura'
import { FAIXAS_PUERICULTURA } from './guiaPuericultura'
import { calcularFerro, calcularVitaminaD } from './suplementacao'

export interface Campo {
  id: string
  grupo: string
  label: string
  tipo: 'text' | 'select' | 'check'
  opcoes?: [string, string][]
  placeholder?: string
  min?: number
  max?: number
  /** Só aparece quando a condição sobre os valores já preenchidos é verdadeira. */
  quando?: (valores: Record<string, string>) => boolean
  /** Até essa idade (em meses) o campo sai no cabeçalho (#), não no S. */
  cabAte?: number
  /** Frase que entra no texto quando o campo está preenchido (check: valor = '1'). */
  frase: (valor: string, sexo?: string) => string
}

/** Concordância de gênero conforme o sexo escolhido (neutro enquanto não escolhido). */
export function gen(sexo: string | undefined, masc: string, fem: string, neutro: string) {
  return sexo === 'masculino' ? masc : sexo === 'feminino' ? fem : neutro
}

const nr = (v: string) => (v === 'nega' ? 'Nega' : 'Refere')
const NEGA_REFERE: [string, string][] = [
  ['nega', 'Nega'],
  ['refere', 'Refere'],
]

export const GRUPOS_ORDEM = [
  'Consulta',
  'Nascimento',
  'Alimentação',
  'Eliminações',
  'Sono e hábitos',
  'Saúde bucal',
] as const

export const CAMPOS: Campo[] = [
  // ---- Consulta ----
  {
    id: 'sexo',
    grupo: 'Consulta',
    label: 'Sexo',
    tipo: 'select',
    opcoes: [
      ['masculino', 'Masculino'],
      ['feminino', 'Feminino'],
    ],
    frase: () => '',
  },
  { id: 'queixa', grupo: 'Consulta', label: 'Queixa principal', tipo: 'text', frase: (v) => `Queixa: ${v}.` },
  {
    id: 'negaQueixas',
    grupo: 'Consulta',
    label: 'Nega febre, vômitos, diarreia, dispneia e convulsões',
    tipo: 'check',
    frase: () => 'Nega febre, vômitos, diarreia, dispneia, convulsões e outras queixas.',
  },

  // ---- Nascimento (cabeçalho — 7 dias a 4 meses) ----
  { id: 'capurro', grupo: 'Nascimento', label: 'IG (Capurro), semanas', tipo: 'text', max: 4, frase: (v) => v },
  {
    id: 'classPeso',
    grupo: 'Nascimento',
    label: 'Peso para a IG',
    tipo: 'select',
    opcoes: [
      ['PIG', 'PIG'],
      ['AIG', 'AIG'],
      ['GIG', 'GIG'],
    ],
    max: 4,
    frase: (v) => v,
  },
  { id: 'apgar', grupo: 'Nascimento', label: 'Apgar', tipo: 'text', placeholder: 'ex: 9/10', max: 4, frase: (v) => v },
  { id: 'doencasGest', grupo: 'Nascimento', label: 'Doenças obstétricas', tipo: 'select', opcoes: NEGA_REFERE, max: 4, frase: (v) => v },
  {
    id: 'doencasGestDet',
    grupo: 'Nascimento',
    label: 'Quais doenças?',
    tipo: 'text',
    max: 4,
    quando: (x) => x.doencasGest === 'refere',
    frase: (v) => v,
  },
  { id: 'pesoNasc', grupo: 'Nascimento', label: 'Peso ao nascimento (g)', tipo: 'text', max: 1, frase: (v) => v },
  { id: 'compNasc', grupo: 'Nascimento', label: 'Comprimento ao nascimento (cm)', tipo: 'text', max: 1, frase: (v) => v },
  { id: 'pcNasc', grupo: 'Nascimento', label: 'PC ao nascimento (cm)', tipo: 'text', max: 1, frase: (v) => v },
  { id: 'pesoAlta', grupo: 'Nascimento', label: 'Peso de alta (g) e perda em %', tipo: 'text', placeholder: 'ex: 3100 g (-6%)', max: 4, frase: (v) => v },
  {
    id: 'triagens',
    grupo: 'Nascimento',
    label: 'Triagens neonatais',
    tipo: 'select',
    opcoes: [
      ['realizadas, sem alterações', 'Realizadas, sem alterações'],
      ['realizadas, com alterações', 'Realizadas, com alterações'],
      ['pendentes', 'Pendentes'],
    ],
    max: 4,
    frase: (v) => v,
  },
  {
    id: 'triagensDet',
    grupo: 'Nascimento',
    label: 'Quais alterações?',
    tipo: 'text',
    max: 4,
    quando: (x) => x.triagens === 'realizadas, com alterações',
    frase: (v) => v,
  },

  // ---- Alimentação ----
  {
    id: 'aleitamento',
    grupo: 'Alimentação',
    label: 'Aleitamento materno',
    tipo: 'select',
    opcoes: [
      ['exclusivo', 'Exclusivo'],
      ['parcial', 'Parcial'],
      ['desmamado', 'Desmamado'],
    ],
    max: 23,
    cabAte: 4,
    frase: (v) => `Aleitamento materno ${v}.`,
  },
  {
    id: 'desmameIdade',
    grupo: 'Alimentação',
    label: 'Desmamado com que idade?',
    tipo: 'text',
    max: 23,
    cabAte: 4,
    quando: (x) => x.aleitamento === 'desmamado',
    frase: (v) => `Desmame aos ${v}.`,
  },
  {
    id: 'desmameMotivo',
    grupo: 'Alimentação',
    label: 'Motivo do desmame',
    tipo: 'text',
    max: 23,
    cabAte: 4,
    quando: (x) => x.aleitamento === 'desmamado',
    frase: (v) => `Motivo do desmame: ${v}.`,
  },
  {
    id: 'formulaLeite',
    grupo: 'Alimentação',
    label: 'Fórmula/leite em uso',
    tipo: 'text',
    max: 23,
    cabAte: 4,
    quando: (x) => x.aleitamento === 'desmamado',
    frase: (v) => `Em uso de ${v}.`,
  },
    { id: 'mamadas', grupo: 'Alimentação', label: 'Mamadas (nº/dia ou intervalo)', tipo: 'text', max: 6, frase: (v) => `Mamadas: ${v}.` },
  { id: 'fissuras', grupo: 'Alimentação', label: 'Dor ou fissuras mamárias (mãe)', tipo: 'select', opcoes: NEGA_REFERE, max: 1, frase: (v) => `${nr(v)} dor ou fissuras mamárias.` },
  { id: 'semAgua', grupo: 'Alimentação', label: 'Nega água, chás ou outros alimentos', tipo: 'check', max: 5, frase: () => 'Nega oferta de água, chás ou outros alimentos.' },
  { id: 'introAlim', grupo: 'Alimentação', label: 'Introdução alimentar aos (meses)', tipo: 'text', min: 6, max: 23, frase: (v) => `Introdução alimentar aos ${v} meses.` },
  {
    id: 'textura',
    grupo: 'Alimentação',
    label: 'Textura dos alimentos',
    tipo: 'select',
    opcoes: [
      ['amassada', 'Amassada'],
      ['pedaços macios', 'Pedaços macios'],
      ['a mesma da família', 'Mesma da família'],
    ],
    min: 6,
    max: 17,
    frase: (v) => `Textura dos alimentos: ${v}.`,
  },
  {
    id: 'alergenicos',
    grupo: 'Alimentação',
    label: 'Alergênicos (amendoim, ovo...)',
    tipo: 'select',
    opcoes: [
      ['realizada com boa resposta', 'Introduzidos, boa resposta'],
      ['pendente', 'Pendente'],
      ['com reação', 'Com reação'],
    ],
    min: 6,
    max: 11,
    frase: (v) => `Introdução de alimentos alergênicos ${v}.`,
  },
  { id: 'recordatorio', grupo: 'Alimentação', label: 'Recordatório (resumo do dia)', tipo: 'text', min: 6, frase: (v) => `Recordatório alimentar: ${v}.` },
  { id: 'negaAcucar', grupo: 'Alimentação', label: 'Nega açúcar, doces, frituras e ultraprocessados', tipo: 'check', min: 6, frase: () => 'Nega consumo de açúcar, refrigerante, doces, frituras e ultraprocessados.' },
  {
    id: 'qualidade',
    grupo: 'Alimentação',
    label: 'Qualidade da alimentação',
    tipo: 'select',
    opcoes: [
      ['adequada', 'Adequada'],
      ['inadequada', 'Inadequada'],
    ],
    min: 12,
    frase: (v) => `Alimentação ${v} qualitativamente.`,
  },

  // ---- Eliminações ----
  { id: 'fraldas', grupo: 'Eliminações', label: 'Trocas de fralda/dia (urina)', tipo: 'text', max: 17, frase: (v) => `Urina: troca de fralda ${v}x/dia.` },
  { id: 'evacuacoes', grupo: 'Eliminações', label: 'Evacuações/dia', tipo: 'text', frase: (v) => `Evacuações: ${v}/dia.` },
  { id: 'consistencia', grupo: 'Eliminações', label: 'Consistência das fezes', tipo: 'text', placeholder: 'ex: pastosa', frase: (v) => v },
  { id: 'corFezes', grupo: 'Eliminações', label: 'Cor das fezes', tipo: 'text', placeholder: 'ex: amarelada', frase: (v) => v },
  { id: 'colicas', grupo: 'Eliminações', label: 'Cólicas', tipo: 'select', opcoes: NEGA_REFERE, max: 4, frase: (v) => `${nr(v)} cólicas.` },
  {
    id: 'desfralde',
    grupo: 'Eliminações',
    label: 'Desfralde',
    tipo: 'select',
    opcoes: [
      ['ainda sem desfralde', 'Ainda sem'],
      ['em início de desfralde', 'Em início'],
      ['desfralde diurno completo', 'Diurno completo'],
      ['desfralde diurno e noturno completo', 'Diurno e noturno'],
    ],
    min: 18,
    frase: (v) => `${v[0].toUpperCase()}${v.slice(1)}.`,
  },

  // ---- Sono e hábitos ----
  { id: 'sono', grupo: 'Sono e hábitos', label: 'Sono (h/noite)', tipo: 'text', frase: (v) => `Sono: ${v}h/noite.` },
  { id: 'despertares', grupo: 'Sono e hábitos', label: 'Despertares noturnos', tipo: 'text', frase: (v) => `${v} despertares noturnos.` },
  { id: 'dorsal', grupo: 'Sono e hábitos', label: 'Dorme de barriga pra cima, em superfície firme', tipo: 'check', max: 11, frase: () => 'Dorme em decúbito dorsal, em superfície firme.' },
  {
    id: 'dormeCom',
    grupo: 'Sono e hábitos',
    label: 'Dorme',
    tipo: 'select',
    opcoes: [
      ['sozinho', 'Sozinho(a), cama própria'],
      ['pais', 'Com os pais'],
    ],
    frase: (v, sexo) => (v === 'sozinho' ? `Dorme ${gen(sexo, 'sozinho', 'sozinha', 'sozinho(a)')} em cama própria.` : 'Dorme com os pais.'),
  },
  { id: 'tela', grupo: 'Sono e hábitos', label: 'Tempo de tela', tipo: 'select', opcoes: NEGA_REFERE, min: 6, frase: (v) => (v === 'nega' ? 'Nega exposição a telas.' : 'Refere exposição a telas.') },
  { id: 'creche', grupo: 'Sono e hábitos', label: 'Creche/escola', tipo: 'text', min: 12, frase: (v) => `Creche/escola: ${v}.` },
  { id: 'visaoAudicao', grupo: 'Sono e hábitos', label: 'Nega queixas de visão e audição', tipo: 'check', min: 12, frase: () => 'Nega queixas de visão e audição.' },

  // ---- Saúde bucal ----
  { id: 'dentes', grupo: 'Saúde bucal', label: 'Dentes erupcionados', tipo: 'text', min: 6, frase: (v) => `${v} dente(s) erupcionado(s).` },
  { id: 'escovacao', grupo: 'Saúde bucal', label: 'Escovação com creme fluoretado', tipo: 'select', opcoes: [['sim', 'Sim'], ['não', 'Não']], min: 12, frase: (v) => (v === 'sim' ? 'Escova os dentes com creme dental fluoretado.' : 'Não escova os dentes com creme dental fluoretado.') },
  { id: 'dentista', grupo: 'Saúde bucal', label: 'Acompanhamento odontológico', tipo: 'select', opcoes: [['sim', 'Sim'], ['não', 'Não']], min: 12, frase: (v) => (v === 'sim' ? 'Em acompanhamento odontológico.' : 'Sem acompanhamento odontológico.') },
]

/** Exame físico: cada item é um achado "normal" que fica ligado por padrão; desligar tira da
 *  linha. Texto pode variar com a idade. */
export interface ItemExame {
  id: string
  label: string
  min?: number
  max?: number
  texto: (meses: number, sexo?: string) => string
}

export const EXAME: ItemExame[] = [
  {
    id: 'geral',
    label: 'Estado geral',
    texto: (m) => (m <= 6 ? 'BEG, ativo e reativo, choroso ao exame. Anictérico, acianótico, hidratado, normocorado.' : 'BEG, ativo e reativo, interage com o examinador. Anictérico, acianótico, hidratado, normocorado.'),
  },
  { id: 'pele', label: 'Pele', texto: () => 'Pele íntegra, sem lesões ou manchas.' },
  { id: 'olhos', label: 'Olhos', texto: (m) => (m <= 6 ? 'Reflexo vermelho presente bilateralmente. Conjuntivas sem hiperemia ou secreções.' : 'Pupilas isocóricas e fotorreagentes, motilidade ocular preservada. Conjuntivas sem hiperemia ou secreções.') },
  { id: 'ouvidos', label: 'Otoscopia', texto: () => 'Otoscopia: conduto pérvio, membrana timpânica íntegra e translúcida bilateralmente.' },
  { id: 'boca', label: 'Oroscopia', texto: (m) => (m <= 6 ? 'Oroscopia: mucosa oral úmida e corada, sem lesões ou placas. Palato íntegro. Freio lingual sem alterações.' : 'Oroscopia: mucosa oral úmida e corada, sem lesões. Amígdalas sem hipertrofia ou exsudato. Dentes sem lesões cariosas visíveis.') },
  { id: 'linfonodos', label: 'Linfonodos', min: 6, texto: () => 'Ausência de linfonodomegalia.' },
  { id: 'ac', label: 'Cardiovascular', texto: (m) => (m <= 6 ? 'AC: BNT em 2T, RR, sem sopros. Pulsos femorais palpáveis e simétricos.' : 'AC: BNT em 2T, RR, sem sopros.') },
  { id: 'ap', label: 'Respiratório', texto: () => 'AP: MV+ bilateralmente, simétrico, sem RA e/ou esforço.' },
  { id: 'abdome', label: 'Abdome', texto: (m) => (m <= 1 ? 'Abdome globoso, flácido, sem visceromegalias ou herniações. Coto umbilical limpo, sem sinais flogísticos. Ânus pérvio.' : 'Abdome flácido, indolor, sem visceromegalias, RHA presentes.') },
  { id: 'genital', label: 'Genitália', texto: (_m, sexo) => (sexo === 'masculino' ? 'Genitália masculina típica, testículos tópicos, sem alterações.' : sexo === 'feminino' ? 'Genitália feminina típica, sem alterações.' : 'Genitália sem alterações (testículos tópicos, em meninos).') },
  { id: 'quadril', label: 'Ortolani e Barlow', max: 4, texto: () => 'Ortolani e Barlow negativos.' },
  { id: 'membros', label: 'Membros e coluna', texto: (m) => `MMSS e MMII simétricos, sem deformidades, mobilidade preservada.${m >= 12 ? ' Marcha sem alterações.' : ''}${m >= 24 ? ' Coluna sem escoliose ou assimetrias.' : ''}` },
  { id: 'neuro', label: 'Neurológico', texto: (m) => (m <= 6 ? 'Tônus e postura adequados para a idade. Reflexos primitivos presentes e simétricos.' : 'Tônus preservado, força grau V, reflexos presentes e simétricos.') },
]

export const FONTANELA: [string, string][] = [
  ['normotensa, sem abaulamentos', 'Normotensa'],
  ['abaulada', 'Abaulada'],
  ['deprimida', 'Deprimida'],
  ['fechada', 'Fechada'],
]

/** Reflexos primitivos — nas consultas até 1 mês entram no lugar do checklist de marcos. */
export const REFLEXOS = ['Moro', 'Sucção', 'Busca', 'Preensão palmar', 'Preensão plantar', 'Marcha reflexa']
export const mostraReflexos = (meses: number) => meses <= 1
export const ehMarcoReflexo = (x: string) => /^Reflexos primitivos/i.test(x)

export const ORIENTACOES = [
  { id: 'aleitamento', label: 'Aleitamento', texto: 'aleitamento materno' },
  { id: 'alimentacao', label: 'Alimentação', texto: 'alimentação' },
  { id: 'tela', label: 'Tempo de tela', texto: 'tempo de tela' },
  { id: 'seguranca', label: 'Segurança', texto: 'prevenção de acidentes e sono seguro' },
  { id: 'alarme', label: 'Sinais de alarme', texto: 'sinais de alarme para retorno precoce' },
] as const

export function visivel(item: { min?: number; max?: number }, meses: number) {
  return (item.min == null || meses >= item.min) && (item.max == null || meses <= item.max)
}

export function orientacoesDaFaixa(f: FaixaPuericultura) {
  return ORIENTACOES.filter((o) => {
    if (o.id === 'aleitamento') return !!f.aleitamento
    if (o.id === 'alimentacao') return f.alimentacao.length > 0
    return true
  })
}

export function rotuloIdade(f: FaixaPuericultura) {
  return f.id === 'acima2a' ? 'acima de 2 anos' : f.titulo.replace('Consulta de ', '')
}

export function proximaFaixa(f: FaixaPuericultura) {
  const i = FAIXAS_PUERICULTURA.findIndex((x) => x.id === f.id)
  return FAIXAS_PUERICULTURA[i + 1] ?? null
}

export interface EstadoAnamnese {
  valores: Record<string, string>
  marcos: Set<string>
  reflexos: Set<string>
  vacFaltando: Set<string>
  exameOff: Set<string>
  orientOff: Set<string>
  planoExtra: string
}

export function chaveMarco(faixaId: string, marco: string) {
  return `${faixaId}|${marco}`
}

const DESMAME = ['desmameIdade', 'desmameMotivo', 'formulaLeite']

/** Monta o texto final (S / O / A / P) — mesmo formato das Gestantes. */
export function montarTexto(f: FaixaPuericultura, nomesVacinasDevidas: string[], e: EstadoAnamnese): string {
  const m = f.idadeReferenciaMeses
  const v = (id: string) => (e.valores[id] ?? '').trim()

  // ---- S ----
  const s: string[] = []
  const acompanhante = v('acompanhante')
  s.push(`Consulta de puericultura (${rotuloIdade(f)})${acompanhante ? `, ${gen(v('sexo'), 'acompanhado', 'acompanhada', 'acompanhado(a)')} de ${acompanhante}` : ''}.`)

  for (const grupo of GRUPOS_ORDEM) {
    if (grupo === 'Nascimento') continue // vai no cabeçalho
    const frases = CAMPOS.filter((c) => c.grupo === grupo && visivel(c, m) && (!c.quando || c.quando(e.valores)) && !DESMAME.includes(c.id))
      .map((c) => {
        if (!v(c.id)) return ''
        if (c.id === 'aleitamento' && v(c.id) === 'desmamado') {
          return `${gen(v('sexo'), 'Desmamado', 'Desmamada', 'Desmamado(a)')}${v('desmameIdade') ? ' ao ' + v('desmameIdade') : ''}${v('desmameMotivo') ? ' por ' + v('desmameMotivo') : ''}${v('formulaLeite') ? ', atualmente em uso de ' + v('formulaLeite') : ''}.`
        }
        return c.frase(v(c.id), v('sexo'))
      })
      .filter(Boolean)
    if (grupo === 'Eliminações') {
      const linhas: string[] = []
      if (v('fraldas') && visivel({ max: 17 }, m)) linhas.push(`Eliminações vesicais: presentes, sem alterações. Troca de fralda ${v('fraldas')}x ao dia.`)
      if (v('evacuacoes') || v('consistencia') || v('corFezes')) {
        const partes = [
          v('evacuacoes') ? `${v('evacuacoes')}x ao dia` : '',
          v('consistencia') ? `consistência ${v('consistencia')}` : '',
          v('corFezes') ? `cor ${v('corFezes')}` : '',
        ].filter(Boolean)
        linhas.push(`Evacuações: ${partes.join(', ')}.`)
      }
      const outras = ['colicas', 'desfralde']
        .map((id) => CAMPOS.find((c) => c.id === id)!)
        .filter((c) => visivel(c, m) && v(c.id))
        .map((c) => c.frase(v(c.id), v('sexo')))
      if (outras.length) linhas.push(outras.join(' '))
      s.push(...linhas)
      continue
    }
    if (!frases.length) continue
    if (grupo === 'Consulta') s.push(frases.join(' '))
    else s.push(`${grupo}: ${frases.join(' ')}`)
  }

  const marcosDaFaixa = f.marcos.filter((x) => !ehMarcoReflexo(x))
  const marcados = marcosDaFaixa.filter((x) => e.marcos.has(chaveMarco(f.id, x)))
  if (marcosDaFaixa.length > 0 && marcados.length > 0) {
    const faltam = marcosDaFaixa.filter((x) => !e.marcos.has(chaveMarco(f.id, x)))
    s.push(
      faltam.length === 0
        ? `DNPM: adquiriu os marcos esperados para a idade (${marcados.join('; ')}).`
        : `DNPM: ${marcados.join('; ')}. Marcos esperados não adquiridos: ${faltam.join('; ')}.`
    )
  }
  if (mostraReflexos(m) && e.reflexos.size > 0) {
    s.push(`DNPM: reflexos primitivos presentes (${REFLEXOS.filter((x) => e.reflexos.has(x)).map((x) => (x === 'Moro' ? x : x.toLowerCase())).join(', ')}).`)
  }
  if (v('dnpmObs')) s.push(`Obs. DNPM: ${v('dnpmObs')}`)

  const faltando = nomesVacinasDevidas.filter((n) => e.vacFaltando.has(n))

  // ---- O ----
  const o: string[] = []
  const medidas: string[] = []
  if (v('peso')) medidas.push(`Peso: ${v('peso')}g`)
  if (v('estatura')) medidas.push(`Estatura: ${v('estatura')}cm`)
  if (v('pc') && m <= 24) medidas.push(`PC: ${v('pc')}cm`)
  if (medidas.length) o.push(`${medidas.join('. ')}.`)
  if (v('fontanela') && m <= 18) o.push(`Fontanela anterior ${v('fontanela')}.`)
  o.push(
    ...EXAME.filter((x) => visivel(x, m) && !e.exameOff.has(x.id)).map((x) => x.texto(m, v('sexo')))
  )
  if (v('achados')) o.push(`Outros achados: ${v('achados')}`)

  // ---- A ----
  const a = `Criança de ${rotuloIdade(f)}, em acompanhamento de puericultura.${v('avaliacao') ? ' ' + v('avaliacao') : ''}`

  // ---- P ----
  const p: string[] = []
  if (faltando.length) p.push(`Atualizar vacinas pendentes: ${faltando.join(', ')}.`)
  else if (f.vacinas.length) p.push(`Vacinas previstas para esta consulta: ${f.vacinas.join('; ')}.`)

  const ctx = { idadeMeses: m, prematuroOuBaixoPeso: false, fatorRiscoVitaminaD: false }
  for (const r of [calcularFerro(ctx), calcularVitaminaD(ctx)]) {
    if (r.status === 'iniciar') p.push(`${r.nome}: ${r.dose}.`)
  }
  const exames = f.exames.filter((x) => !/^Sem /i.test(x))
  if (exames.length) p.push(`Exames/triagens: ${exames.join('; ')}.`)
  const orient = orientacoesDaFaixa(f).filter((x) => !e.orientOff.has(x.id))
  if (orient.length) p.push(`Orientado(a) sobre ${orient.map((x) => x.texto).join(', ')}.`)
  if (e.planoExtra.trim()) p.push(e.planoExtra.trim())
  const prox = proximaFaixa(f)
  p.push(prox ? `Retorno para ${prox.titulo.replace('Consulta de ', 'consulta de ')}.` : 'Retorno para acompanhamento anual.')
  p.push('Responsável entende, concorda e afirma não haver dúvidas.')

  // ---- Cabeçalho ----
  const cap = (x: string) => (x ? x[0].toUpperCase() + x.slice(1) : x)
  const bl = (x: string) => x || '___'
  const linhaCab = (rotulo: string, id: string) => (v(id) ? `# ${rotulo}: ${cap(v(id))}` : `# Nega ${rotulo}`)
  const cab: string[] = [linhaCab('MUC', 'muc'), linhaCab('comorbidades', 'comorbidades'), linhaCab('alergias', 'alergias')]

  // Dados do nascimento e aleitamento: só nas consultas de 7 dias a 4 meses
  if (m <= 4) {
    cab.push(`# IG (Capurro): ${v('capurro') ? v('capurro') + ' semanas' : '___'}`)
    cab.push(`# PIG/AIG/GIG: ${bl(v('classPeso'))}`)
    cab.push(`# Apgar: ${bl(v('apgar'))}`)
    const doencas =
      v('doencasGest') === 'refere'
        ? `Refere ${v('doencasGestDet') ? v('doencasGestDet') + ' ' : 'doenças '}durante a gestação`
        : v('doencasGest') === 'nega'
          ? 'Nega'
          : '___'
    cab.push(`# Doenças obstétricas: ${doencas}`)
    if (m <= 1) {
      cab.push(['# Ao nascimento:', ` - Peso: ${bl(v('pesoNasc'))}g`, ` - Comprimento: ${bl(v('compNasc'))}cm`, ` - PC: ${bl(v('pcNasc'))}cm`].join('\n'))
    }
    cab.push(`# Peso de alta: ${bl(v('pesoAlta'))}`)
    cab.push(
      `# Triagens neonatais: ${cap(bl(v('triagens')))}${v('triagens') === 'realizadas, com alterações' && v('triagensDet') ? ': ' + v('triagensDet') : ''}`
    )

    const al = v('aleitamento')
    let valorAl = al === 'desmamado' ? gen(v('sexo'), 'Desmamado', 'Desmamada', 'Desmamado(a)') : cap(al) || '___'
    if (al === 'desmamado') {
      if (v('desmameIdade')) valorAl += ` ao ${v('desmameIdade')}`
      if (v('desmameMotivo')) valorAl += ` por ${v('desmameMotivo')}`
      if (v('formulaLeite')) valorAl += `, atualmente em uso de ${v('formulaLeite')}`
    }
    cab.push(`# Aleitamento materno: ${valorAl}`)
  }

  // Calendário vacinal (todas as idades): sem marcar nada = em dia
  const faltandoCab = nomesVacinasDevidas.filter((n) => e.vacFaltando.has(n))
  cab.push(`# Calendário vacinal: ${faltandoCab.length ? 'Faltando ' + faltandoCab.join(', ') : 'Em dia'}`)
  const cabecalho = cab.join('\n')

  return [
    cabecalho,
    `S\n${s.join('\n')}`,
    `O\n${o.join('\n')}`,
    `A\n${a}`,
    `P\n${p.map((t, i) => `${i + 1}- ${t}`).join('\n')}`,
  ].join('\n\n')
}
