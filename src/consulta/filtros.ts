import type {
  Area,
  Patologia,
  Tratamento,
  TratamentoItem,
  Medicamento,
  Apresentacao,
  PatologiaComplemento,
  ModoTratamento,
  Linha,
} from '../admin/types'
import { textoReceitaDoItem } from '../core/receita'

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

/** Só os 'principal' — a conduta que resolve a patologia, escolha única. Complemento nunca
 *  tem patologia_id fixo, então já ficaria de fora de tratamentosVisiveis mesmo sem esse
 *  filtro, mas explícito é melhor que implícito aqui. */
export function principaisVisiveis(tratamentos: Tratamento[], patologiaId: number, modo: ModoTratamento): Tratamento[] {
  return tratamentosVisiveis(tratamentos, patologiaId, modo).filter((t) => t.papel === 'principal')
}

/** Complementos vinculados a uma patologia (via patologia_complementos), na ordem definida
 *  no admin, filtrados pelo modo — o mesmo suporte sintomático pode valer só ambulatorial,
 *  só hospitalar, ou os dois. */
export function complementosDaPatologia(
  patologiaId: number,
  tratamentos: Tratamento[],
  links: PatologiaComplemento[],
  modo: ModoTratamento
): Tratamento[] {
  const porId = new Map(tratamentos.map((t) => [t.id, t]))
  return links
    .filter((l) => l.patologia_id === patologiaId)
    .sort((a, b) => a.ordem - b.ordem)
    .map((l) => porId.get(l.tratamento_id))
    .filter((t): t is Tratamento => !!t && (t.modo === modo || t.modo === 'ambos'))
}

/** Agrupa complementos por classe (Analgésicos/antitérmicos, Antieméticos...) — sem classe
 *  cadastrada cai em "Outros", nunca some da lista. */
export function agruparPorClasse(tratamentos: Tratamento[]): { classe: string; tratamentos: Tratamento[] }[] {
  const grupos: { classe: string; tratamentos: Tratamento[] }[] = []
  for (const t of tratamentos) {
    const classe = t.classe?.trim() || 'Outros'
    const grupo = grupos.find((g) => g.classe === classe)
    if (grupo) grupo.tratamentos.push(t)
    else grupos.push({ classe, tratamentos: [t] })
  }
  return grupos
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

/** Texto completo de um tratamento (todos os itens, cada um em duas linhas, separados por
 *  linha em branco) — usado tanto no "Copiar tudo" de um card quanto no "Copiar
 *  prescrição" que junta o esquema escolhido com os complementos marcados. */
export function textoTratamentoCompleto(
  tratamento: Tratamento,
  itens: TratamentoItem[],
  medicamentos: Medicamento[],
  apresentacoes: Apresentacao[]
): string {
  return itensDoTratamento(itens, tratamento.id)
    .map((item) =>
      textoReceitaDoItem(
        item,
        medicamentoPorId(medicamentos, item.medicamento_id)?.nome ?? null,
        apresentacaoPorId(apresentacoes, item.apresentacao_id)
      )
    )
    .join('\n\n')
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
