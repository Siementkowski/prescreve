import type {
  Area,
  Patologia,
  Tratamento,
  TratamentoItem,
  Medicamento,
  Apresentacao,
  ModoTratamento,
  Linha,
} from '../admin/types'

export function areasVisiveis(areas: Area[], modo: ModoTratamento): Area[] {
  return areas
    .filter((a) => a.modo === modo || a.modo === 'ambos')
    .sort((a, b) => a.ordem - b.ordem)
}

function patologiaTemTratamentoNoModo(
  patologiaId: number,
  tratamentos: Tratamento[],
  modo: ModoTratamento
): boolean {
  return tratamentos.some((t) => t.patologia_id === patologiaId && (t.modo === modo || t.modo === 'ambos'))
}

export function patologiasVisiveis(
  patologias: Patologia[],
  areaId: number,
  tratamentos: Tratamento[],
  modo: ModoTratamento
): Patologia[] {
  return patologias
    .filter((p) => p.area_id === areaId)
    .filter((p) => patologiaTemTratamentoNoModo(p.id, tratamentos, modo))
    .sort((a, b) => a.ordem - b.ordem)
}

export function tratamentosVisiveis(tratamentos: Tratamento[], patologiaId: number, modo: ModoTratamento): Tratamento[] {
  return tratamentos.filter((t) => t.patologia_id === patologiaId && (t.modo === modo || t.modo === 'ambos'))
}

const ORDEM_LINHA: Record<Linha, number> = { '1a_linha': 0, alternativa: 1, opcao: 2, off_label: 3 }

/** Agrupa tratamentos por linha, na ordem: 1ª linha, alternativa, opção, off label. */
export function agruparPorLinha(tratamentos: Tratamento[]): { linha: Linha; tratamentos: Tratamento[] }[] {
  const ordenados = [...tratamentos].sort(
    (a, b) => ORDEM_LINHA[a.linha] - ORDEM_LINHA[b.linha] || a.ordem - b.ordem
  )
  const grupos: { linha: Linha; tratamentos: Tratamento[] }[] = []
  for (const t of ordenados) {
    const grupo = grupos.find((g) => g.linha === t.linha)
    if (grupo) grupo.tratamentos.push(t)
    else grupos.push({ linha: t.linha, tratamentos: [t] })
  }
  return grupos
}

export function itensDoTratamento(itens: TratamentoItem[], tratamentoId: number): TratamentoItem[] {
  return itens
    .filter((i) => i.tratamento_id === tratamentoId)
    .sort((a, b) => a.ordem - b.ordem)
}

export function medicamentoPorId(medicamentos: Medicamento[], id: number | null): Medicamento | null {
  if (id == null) return null
  return medicamentos.find((m) => m.id === id) ?? null
}

export function apresentacaoPorId(apresentacoes: Apresentacao[], id: number | null): Apresentacao | null {
  if (id == null) return null
  return apresentacoes.find((a) => a.id === id) ?? null
}

/** Um tratamento "contém contraindicado" se algum dos seus itens usa medicamento do cadastro
 *  com gestacao_status = 'contraindicado'. Itens de nome livre nunca contam (não há como saber). */
export function tratamentoTemContraindicadoGestacao(
  tratamentoId: number,
  itens: TratamentoItem[],
  medicamentos: Medicamento[]
): boolean {
  return itensDoTratamento(itens, tratamentoId).some((item) => {
    const med = medicamentoPorId(medicamentos, item.medicamento_id)
    return med?.gestacao_status === 'contraindicado'
  })
}
