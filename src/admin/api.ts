import { supabase } from '../core/supabase'
import { estaOnline } from '../core/network'
import type {
  Area,
  AreaInput,
  Patologia,
  PatologiaInput,
  Medicamento,
  MedicamentoInput,
  Tratamento,
  TratamentoInput,
  TratamentoItem,
  TratamentoItemInput,
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

export const tratamentosApi = {
  ...crud<Tratamento, TratamentoInput>('tratamentos', 'ordem'),
  async listByPatologia(patologiaId: number): Promise<Tratamento[]> {
    const { data, error } = await supabase
      .from('tratamentos')
      .select('*')
      .eq('patologia_id', patologiaId)
      .order('ordem', { ascending: true })
    if (error) throw error
    return (data ?? []) as Tratamento[]
  },
  reorder: (itens: { id: number; ordem: number }[]) => reorder('tratamentos', itens),
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
  reorder: (itens: { id: number; ordem: number }[]) => reorder('tratamento_itens', itens),
}
