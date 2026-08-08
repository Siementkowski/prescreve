import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { MapPinned, FolderHeart, Pill, ListChecks, ClipboardCheck, ArrowRight, Plus } from 'lucide-react'
import { areasApi, patologiasApi, medicamentosApi } from './api'
import { useRevisaoStore } from './revisaoStore'
import { useConfiguracoesStore } from '../core/configuracoes'
import { useAuth } from '../core/auth/AuthProvider'
import { precisaRevisar, tempoDesdeRevisao } from '../core/revisao'
import { LABEL_LINHA, LABEL_MODO_TRATAMENTO } from './types'

/** A tela inicial do admin — em vez de abas no topo, um painel com cards. Cada card é uma
 *  porta de entrada pra uma parte da base; a fila de revisão já aparece aqui, sem precisar
 *  procurar. É o "hub" que substitui a barra de abas antiga. */
export function AdminHub() {
  const { perfil } = useAuth()
  const [contagens, setContagens] = useState({ areas: 0, patologias: 0, medicamentos: 0 })

  const tratamentos = useRevisaoStore((s) => s.tratamentos)
  const carregar = useRevisaoStore((s) => s.carregar)
  const marcarRevisado = useRevisaoStore((s) => s.marcarRevisado)
  const mesesAteRevisar = useConfiguracoesStore((s) => s.mesesAteRevisar)
  const [marcando, setMarcando] = useState<number | null>(null)

  useEffect(() => {
    carregar()
    Promise.all([areasApi.list(), patologiasApi.list(), medicamentosApi.list()]).then(
      ([areas, patologias, medicamentos]) =>
        setContagens({ areas: areas.length, patologias: patologias.length, medicamentos: medicamentos.length })
    )
  }, [carregar])

  const pendentes = useMemo(
    () =>
      tratamentos
        .filter((t) => precisaRevisar({ precisaRevisao: t.precisa_revisao, revisadoEm: t.revisado_em }, mesesAteRevisar))
        .sort((a, b) => (a.revisado_em ?? '').localeCompare(b.revisado_em ?? '')),
    [tratamentos, mesesAteRevisar]
  )

  const primeiroNome = (perfil?.nome || 'você').split(' ')[0]

  return (
    <div className="max-w-5xl mx-auto px-2 pb-16">
      {/* saudação */}
      <div className="text-center pt-6 pb-2 relative">
        <span
          className="inline-flex items-center gap-1.5 bg-surface border border-border rounded-full px-4 py-1.5 text-xs font-semibold text-text-dim shadow-sm"
          style={{ transform: 'rotate(-2deg)' }}
        >
          ✨ Base viva, atualizada por você
        </span>
        <h1 className="font-display text-4xl font-semibold mt-5 leading-tight">
          Oi, {primeiroNome}! 👋
          <br />
          vamos cuidar da sua base?
        </h1>
        <p className="text-text-dim mt-3 max-w-md mx-auto">
          Cadastre áreas, patologias e medicamentos, monte os tratamentos e mantenha tudo revisado — tudo por
          aqui, num só lugar.
        </p>
      </div>

      {/* hub de cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-10">
        <HubCard
          to="/admin/areas"
          icone={MapPinned}
          corTexto="var(--color-cat-areas)"
          corFundo="var(--color-cat-areas-bg)"
          titulo="Áreas"
          descricao="As grandes especialidades. O primeiro nível da sua base."
          contador={`${contagens.areas} cadastrada${contagens.areas === 1 ? '' : 's'}`}
        />
        <HubCard
          to="/admin/patologias"
          icone={FolderHeart}
          corTexto="var(--color-cat-patologias)"
          corFundo="var(--color-cat-patologias-bg)"
          titulo="Patologias"
          descricao="Sinônimos e orientações que alimentam a busca da consulta."
          contador={`${contagens.patologias} cadastrada${contagens.patologias === 1 ? '' : 's'}`}
        />
        <HubCard
          to="/admin/medicamentos"
          icone={Pill}
          corTexto="var(--color-cat-medicamentos)"
          corFundo="var(--color-cat-medicamentos-bg)"
          titulo="Medicamentos"
          descricao="O catálogo — gestação, lactação e dose pediátrica num cadastro só."
          contador={`${contagens.medicamentos} cadastrado${contagens.medicamentos === 1 ? '' : 's'}`}
        />

        <Link
          to="/admin/tratamentos"
          className="sm:col-span-2 lg:col-span-2 bg-surface border border-border rounded-3xl p-6 flex items-center gap-5 hover:-translate-y-0.5 transition-transform"
        >
          <span
            className="w-16 h-16 rounded-[20px] flex items-center justify-center shrink-0"
            style={{ background: 'var(--color-cat-tratamentos-bg)', color: 'var(--color-cat-tratamentos)' }}
          >
            <ListChecks className="w-8 h-8" />
          </span>
          <span className="flex-1 min-w-0">
            <span className="font-display text-lg font-semibold block">Tratamentos</span>
            <span className="text-sm text-text-dim block mt-0.5">
              Onde a receita ganha forma — cabeçalho + itens com dose, via e posologia.
            </span>
          </span>
          <ArrowRight className="w-5 h-5 text-text-dim shrink-0" />
        </Link>

        <Link
          to="/admin/revisao"
          className="bg-surface border border-border rounded-3xl p-6 flex flex-col justify-between gap-4 hover:-translate-y-0.5 transition-transform"
        >
          <span
            className="w-12 h-12 rounded-2xl flex items-center justify-center"
            style={{ background: 'var(--color-cat-revisao-bg)', color: 'var(--color-cat-revisao)' }}
          >
            <ClipboardCheck className="w-6 h-6" />
          </span>
          <span>
            <span className="font-display text-lg font-semibold block">Revisão</span>
            <span className="text-xs font-semibold text-text-dim">
              {pendentes.length > 0 ? `${pendentes.length} pedindo atenção` : 'tudo em dia'}
            </span>
          </span>
        </Link>
      </div>

      {/* fila de revisão */}
      {pendentes.length > 0 && (
        <div className="mt-14">
          <div className="flex items-baseline justify-between mb-3">
            <h2 className="font-display text-xl font-semibold">Fila de revisão</h2>
            <span className="text-xs text-text-dim font-semibold">do mais antigo pro mais recente</span>
          </div>
          <div className="flex flex-col gap-2.5">
            {pendentes.slice(0, 4).map((t) => (
              <div
                key={t.id}
                className="bg-surface border border-border rounded-2xl px-5 py-3.5 flex items-center gap-4"
              >
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-danger-dim text-danger shrink-0">
                  {tempoDesdeRevisao(t.revisado_em)}
                </span>
                <span className="flex-1 min-w-0">
                  <span className="font-display text-[15px] font-semibold block truncate">
                    {t.titulo || `${LABEL_MODO_TRATAMENTO[t.modo]} · ${LABEL_LINHA[t.linha]}`}
                  </span>
                </span>
                <button
                  onClick={() => {
                    setMarcando(t.id)
                    marcarRevisado(t.id).finally(() => setMarcando(null))
                  }}
                  disabled={marcando === t.id}
                  className="text-xs font-bold text-cat-tratamentos bg-cat-tratamentos-bg px-3.5 py-2 rounded-full disabled:opacity-50 shrink-0"
                >
                  {marcando === t.id ? 'Marcando…' : 'Marcar como revisado'}
                </button>
              </div>
            ))}
            {pendentes.length > 4 && (
              <Link to="/admin/revisao" className="text-xs font-semibold text-accent text-center py-1.5">
                Ver mais {pendentes.length - 4} pendências →
              </Link>
            )}
          </div>
        </div>
      )}

      {/* cta */}
      <Link
        to="/admin/tratamentos"
        className="mt-14 flex items-center justify-between gap-6 rounded-3xl px-9 py-8 text-white overflow-hidden relative"
        style={{ background: '#201F2E' }}
      >
        <span>
          <span className="font-display text-2xl font-semibold block max-w-xs">
            Cadastre um tratamento novo agora
          </span>
          <span className="text-sm block mt-2 max-w-xs" style={{ color: '#B9B6CC' }}>
            Cabeçalho e itens no mesmo lugar — leva menos de dois minutos pra deixar pronto pra consulta.
          </span>
        </span>
        <span
          className="flex items-center gap-2 font-display font-semibold text-sm px-5 py-3 rounded-full shrink-0"
          style={{ background: 'var(--color-cat-areas-bg)', color: 'var(--color-cat-areas)' }}
        >
          <Plus className="w-4 h-4" />
          Novo tratamento
        </span>
      </Link>
    </div>
  )
}

function HubCard({
  to,
  icone: Icone,
  corTexto,
  corFundo,
  titulo,
  descricao,
  contador,
}: {
  to: string
  icone: typeof MapPinned
  corTexto: string
  corFundo: string
  titulo: string
  descricao: string
  contador: string
}) {
  return (
    <Link
      to={to}
      className="bg-surface border border-border rounded-3xl p-6 flex flex-col gap-4 hover:-translate-y-0.5 transition-transform"
    >
      <span
        className="w-12 h-12 rounded-2xl flex items-center justify-center"
        style={{ background: corFundo, color: corTexto }}
      >
        <Icone className="w-6 h-6" />
      </span>
      <span className="flex-1">
        <span className="font-display text-lg font-semibold block">{titulo}</span>
        <span className="text-sm text-text-dim block mt-1 leading-relaxed">{descricao}</span>
      </span>
      <span className="flex items-center justify-between">
        <span className="text-xs font-semibold text-text-dim">{contador}</span>
        <span className="w-8 h-8 rounded-full bg-surface-2 flex items-center justify-center">
          <ArrowRight className="w-4 h-4" />
        </span>
      </span>
    </Link>
  )
}
