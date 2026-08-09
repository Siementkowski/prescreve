// Orquestra o cache offline: compara a base_versao local com a do servidor, baixa a base
// inteira quando muda, guarda em IndexedDB, e expõe status de conectividade/sincronização
// pra UI (indicador permanente, aviso de atualização disponível, bloqueio de edição offline).
import { create } from 'zustand'
import { supabase } from './supabase'
import { estaOnline, assinarConectividade, forcarOffline } from './network'
import { lerCache, gravarCache } from './db-local'
import {
  areasApi,
  patologiasApi,
  medicamentosApi,
  apresentacoesApi,
  tratamentosApi,
  tratamentoItensApi,
} from '../admin/api'
import type { Area, Patologia, Medicamento, Apresentacao, Tratamento, TratamentoItem } from '../admin/types'

const CHAVE_CACHE = 'base'

interface BaseCacheada {
  versao: number
  areas: Area[]
  patologias: Patologia[]
  medicamentos: Medicamento[]
  apresentacoes: Apresentacao[]
  tratamentos: Tratamento[]
  itens: TratamentoItem[]
  sincronizadoEm: string
}

interface SyncState {
  online: boolean
  inicializado: boolean
  carregandoInicial: boolean // true até o primeiro dado (cache ou rede) estar disponível
  sincronizando: boolean
  erro: string | null
  ultimaSincronizacao: string | null
  versaoLocal: number | null
  atualizacaoDisponivel: boolean // base mudou no servidor enquanto o app estava aberto

  areas: Area[]
  patologias: Patologia[]
  medicamentos: Medicamento[]
  apresentacoes: Apresentacao[]
  tratamentos: Tratamento[]
  itens: TratamentoItem[]

  inicializar: () => Promise<void>
  sincronizar: (opts?: { forcar?: boolean }) => Promise<void>
}

export const useSyncStore = create<SyncState>((set, get) => ({
  online: estaOnline(),
  inicializado: false,
  carregandoInicial: true,
  sincronizando: false,
  erro: null,
  ultimaSincronizacao: null,
  versaoLocal: null,
  atualizacaoDisponivel: false,

  areas: [],
  patologias: [],
  medicamentos: [],
  apresentacoes: [],
  tratamentos: [],
  itens: [],

  async inicializar() {
    if (get().inicializado) return
    set({ inicializado: true })

    assinarConectividade((online) => {
      set({ online })
      if (online) get().sincronizar()
    })

    try {
      // 1. O que tiver em cache aparece na hora, mesmo sem rede nenhuma.
      const cache = await lerCache<BaseCacheada>(CHAVE_CACHE)
      if (cache) {
        set({
          areas: cache.areas,
          patologias: cache.patologias,
          medicamentos: cache.medicamentos,
          apresentacoes: cache.apresentacoes ?? [],
          tratamentos: cache.tratamentos,
          itens: cache.itens,
          versaoLocal: cache.versao,
          ultimaSincronizacao: cache.sincronizadoEm,
        })
      }

      // 2. Com rede, checa se precisa atualizar (ou baixa pela primeira vez).
      if (estaOnline()) {
        await get().sincronizar()
      }
    } finally {
      set({ carregandoInicial: false })
    }

    // 3. Assina mudanças em base_versao — se a base mudar com o app aberto, só avisa.
    //    Nunca recarrega sozinho: quem decide é o botão "Atualizar" do aviso.
    supabase
      .channel('base_versao_mudou')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'base_versao' },
        (payload) => {
          const versaoServidor = (payload.new as { versao: number }).versao
          const versaoLocal = get().versaoLocal
          if (versaoLocal != null && versaoServidor !== versaoLocal) {
            set({ atualizacaoDisponivel: true })
          }
        }
      )
      .subscribe()
  },

  async sincronizar({ forcar = false } = {}) {
    if (!estaOnline()) {
      set({ erro: 'Sem conexão — não é possível sincronizar agora.' })
      return
    }
    if (get().sincronizando) return
    set({ sincronizando: true, erro: null })

    try {
      const { data, error } = await supabase.from('base_versao').select('versao').eq('id', 1).single()
      if (error) throw error
      const versaoServidor = data.versao as number

      if (!forcar && get().versaoLocal === versaoServidor) {
        set({ sincronizando: false, atualizacaoDisponivel: false })
        return
      }

      const [areas, patologias, medicamentos, apresentacoes, tratamentos, itens] = await Promise.all([
        areasApi.list(),
        patologiasApi.list(),
        medicamentosApi.list(),
        apresentacoesApi.list(),
        tratamentosApi.list(),
        tratamentoItensApi.list(),
      ])

      const sincronizadoEm = new Date().toISOString()
      const cache: BaseCacheada = {
        versao: versaoServidor,
        areas,
        patologias,
        medicamentos,
        apresentacoes,
        tratamentos,
        itens,
        sincronizadoEm,
      }
      await gravarCache(CHAVE_CACHE, cache)

      set({
        areas,
        patologias,
        medicamentos,
        apresentacoes,
        tratamentos,
        itens,
        versaoLocal: versaoServidor,
        ultimaSincronizacao: sincronizadoEm,
        sincronizando: false,
        atualizacaoDisponivel: false,
      })
    } catch (e) {
      const mensagem = (e as Error).message ?? 'Erro desconhecido ao sincronizar.'
      // Só reclassifica como offline se o erro tiver cara de falha de rede (fetch não
      // completou) — um erro real do Supabase (ex: RLS) não deve marcar o app como offline.
      const pareceFalhaDeRede = /fetch|network|conex/i.test(mensagem)
      if (pareceFalhaDeRede) {
        forcarOffline()
        set({ online: false })
      }
      set({ erro: mensagem, sincronizando: false })
    }
  },
}))
