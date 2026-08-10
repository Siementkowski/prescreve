import { supabase } from '../core/supabase'
import { estaOnline } from '../core/network'
import type {
  Area,
  AreaInput,
  Patologia,
  PatologiaInput,
  Medicamento,
  MedicamentoInput,
  Apresentacao,
  ApresentacaoInput,
  Tratamento,
  TratamentoInput,
  TratamentoItem,
  TratamentoItemInput,
  PatologiaComplemento,
} from './types'

const MENSAGEM_OFFLINE = 'Sem conexão — edição bloqueada até a rede voltar. Sincronizar edições offline exigiria resolver conflitos, e não vale a complexidade: edite no PC com internet.'

/** Toda escrita (insert/update/delete/reorder) passa por aqui primeiro. Leitura nunca é
 *  bloqueada — o admin só existe pra quem está no PC com internet mesmo, então travar a
 *  leitura offline não ajudaria em nada, só a escrita é que precisa do aviso claro. */
function exigirOnline(): void {
  if (!estaOnline()) throw new Error(MENSAGEM_OFFLINE)
}

// Fábrica de CRUD básico — reduz duplicação entre as entidades; cada entidade
// customiza apenas a ordenação da listagem e operações específicas (reorder etc.).
function crud<T extends { id: number }, TInput>(table: string, orderBy: string, ascending = true) {
  return {
    async list(): Promise<T[]> {
      const { data, error } = await supabase.from(table).select('*').order(orderBy, { ascending })
      if (error) throw error
      return (data ?? []) as T[]
    },
    async insert(payload: TInput): Promise<T> {
      exigirOnline()
      // Sem tipos gerados do schema (generate_typescript_types), o client do Supabase não
      // sabe validar o payload contra a tabela — cast explícito, o formato já é garantido
      // pelos tipos TInput de cada entidade em admin/types.ts.
      const { data, error } = await supabase.from(table).insert(payload as never).select().single()
      if (error) throw error
      return data as T
    },
    async update(id: number, payload: Partial<TInput>): Promise<T> {
      exigirOnline()
      const { data, error } = await supabase.from(table).update(payload as never).eq('id', id).select().single()
      if (error) throw error
      return data as T
    },
    async remove(id: number): Promise<void> {
      exigirOnline()
      const { error } = await supabase.from(table).delete().eq('id', id)
      if (error) throw error
    },
  }
}

/** Persiste uma nova ordem para uma lista de itens (drag & drop). */
async function reorder(table: string, itens: { id: number; ordem: number }[]): Promise<void> {
  exigirOnline()
  const resultados = await Promise.all(
    itens.map(({ id, ordem }) => supabase.from(table).update({ ordem }).eq('id', id))
  )
  const comErro = resultados.find((r) => r.error)
  if (comErro?.error) throw comErro.error
}

export const areasApi = {
  ...crud<Area, AreaInput>('areas', 'ordem'),
  reorder: (itens: { id: number; ordem: number }[]) => reorder('areas', itens),
}

export const patologiasApi = {
  ...crud<Patologia, PatologiaInput>('patologias', 'ordem'),
  async listByArea(areaId: number): Promise<Patologia[]> {
    const { data, error } = await supabase
      .from('patologias')
      .select('*')
      .eq('area_id', areaId)
      .order('ordem', { ascending: true })
    if (error) throw error
    return (data ?? []) as Patologia[]
  },
  reorder: (itens: { id: number; ordem: number }[]) => reorder('patologias', itens),
}

export const medicamentosApi = {
  ...crud<Medicamento, MedicamentoInput>('medicamentos', 'nome'),
}

export const apresentacoesApi = {
  ...crud<Apresentacao, ApresentacaoInput>('apresentacoes', 'ordem'),
  async listByMedicamento(medicamentoId: number): Promise<Apresentacao[]> {
    const { data, error } = await supabase
      .from('apresentacoes')
      .select('*')
      .eq('medicamento_id', medicamentoId)
      .order('ordem', { ascending: true })
    if (error) throw error
    return (data ?? []) as Apresentacao[]
  },
  reorder: (itens: { id: number; ordem: number }[]) => reorder('apresentacoes', itens),
}

export const tratamentosApi = {
  ...crud<Tratamento, TratamentoInput>('tratamentos', 'ordem'),
  /** Só os 'principal' — complemento nunca tem patologia_id fixo, então nem entra aqui. */
  async listByPatologia(patologiaId: number): Promise<Tratamento[]> {
    const { data, error } = await supabase
      .from('tratamentos')
      .select('*')
      .eq('patologia_id', patologiaId)
      .order('ordem', { ascending: true })
    if (error) throw error
    return (data ?? []) as Tratamento[]
  },
  /** A biblioteca de complementos inteira — sem patologia, reutilizável. */
  async listComplementos(): Promise<Tratamento[]> {
    const { data, error } = await supabase
      .from('tratamentos')
      .select('*')
      .eq('papel', 'complemento')
      .order('ordem', { ascending: true })
    if (error) throw error
    return (data ?? []) as Tratamento[]
  },
  reorder: (itens: { id: number; ordem: number }[]) => reorder('tratamentos', itens),
}

export const patologiaComplementosApi = {
  async listByPatologia(patologiaId: number): Promise<PatologiaComplemento[]> {
    const { data, error } = await supabase
      .from('patologia_complementos')
      .select('*')
      .eq('patologia_id', patologiaId)
      .order('ordem', { ascending: true })
    if (error) throw error
    return (data ?? []) as PatologiaComplemento[]
  },
  /** Todos os vínculos de uma vez — a Consulta usa isso pra saber quais complementos
   *  aparecem em cada patologia, já cacheado offline junto do resto da base. */
  async list(): Promise<PatologiaComplemento[]> {
    const { data, error } = await supabase
      .from('patologia_complementos')
      .select('*')
      .order('ordem', { ascending: true })
    if (error) throw error
    return (data ?? []) as PatologiaComplemento[]
  },
  /** Quantas (e quais) patologias usam um complemento — mostrado antes de editar ou
   *  excluir, pra saber o alcance da mudança antes de fazer. */
  async listPatologiasUsando(tratamentoId: number): Promise<{ patologia_id: number; nome: string }[]> {
    const { data, error } = await supabase
      .from('patologia_complementos')
      .select('patologia_id, patologias(nome)')
      .eq('tratamento_id', tratamentoId)
    if (error) throw error
    return (data ?? []).map((r) => {
      const rel = r as unknown as { patologia_id: number; patologias: { nome: string } | { nome: string }[] | null }
      const patologia = Array.isArray(rel.patologias) ? rel.patologias[0] : rel.patologias
      return { patologia_id: rel.patologia_id, nome: patologia?.nome ?? '—' }
    })
  },
  /** Vincula em 1 clique, sem redigitar nada — é isso que evita cinquenta cópias da
   *  dipirona divergindo entre si. */
  async vincular(patologiaId: number, tratamentoId: number, ordem: number): Promise<void> {
    exigirOnline()
    const { error } = await supabase
      .from('patologia_complementos')
      .insert({ patologia_id: patologiaId, tratamento_id: tratamentoId, ordem } as never)
    if (error) throw error
  },
  async desvincular(patologiaId: number, tratamentoId: number): Promise<void> {
    exigirOnline()
    const { error } = await supabase
      .from('patologia_complementos')
      .delete()
      .eq('patologia_id', patologiaId)
      .eq('tratamento_id', tratamentoId)
    if (error) throw error
  },
  /** Reordena os complementos já vinculados a uma patologia (arrastar na lista de
   *  vinculados) — não mexe em quais estão vinculados, só na ordem entre eles. */
  async reordenar(patologiaId: number, tratamentoIdsEmOrdem: number[]): Promise<void> {
    exigirOnline()
    const resultados = await Promise.all(
      tratamentoIdsEmOrdem.map((tratamento_id, ordem) =>
        supabase
          .from('patologia_complementos')
          .update({ ordem })
          .eq('patologia_id', patologiaId)
          .eq('tratamento_id', tratamento_id)
      )
    )
    const comErro = resultados.find((r) => r.error)
    if (comErro?.error) throw comErro.error
  },
}

export const tratamentoItensApi = {
  ...crud<TratamentoItem, TratamentoItemInput>('tratamento_itens', 'ordem'),
  async listByTratamento(tratamentoId: number): Promise<TratamentoItem[]> {
    const { data, error } = await supabase
      .from('tratamento_itens')
      .select('*')
      .eq('tratamento_id', tratamentoId)
      .order('ordem', { ascending: true })
    if (error) throw error
    return (data ?? []) as TratamentoItem[]
  },
  /** Todos os itens de vários tratamentos de uma vez — usado pra montar um resumo (nome
   *  do 1º medicamento) na lista, sem precisar de 1 query por card. */
  async listByTratamentos(tratamentoIds: number[]): Promise<TratamentoItem[]> {
    if (tratamentoIds.length === 0) return []
    const { data, error } = await supabase
      .from('tratamento_itens')
      .select('*')
      .in('tratamento_id', tratamentoIds)
      .order('ordem', { ascending: true })
    if (error) throw error
    return (data ?? []) as TratamentoItem[]
  },
  reorder: (itens: { id: number; ordem: number }[]) => reorder('tratamento_itens', itens),
}
