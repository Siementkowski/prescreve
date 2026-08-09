import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { MapPinned, FolderHeart, Pill, ListChecks, ArrowRight, Plus, Search } from 'lucide-react'
import { areasApi, patologiasApi, medicamentosApi } from './api'
import type { Patologia, Medicamento } from './types'
import { useAuth } from '../core/auth/AuthProvider'

/** Página Inicial — em vez de abas no topo, um painel com cards. Cada card é uma
 *  porta de entrada pra uma parte da base (que vive em /painel). Revisão fica de fora
 *  daqui de propósito: é manutenção interna, não o que alguém vem procurar ao abrir a
 *  página inicial — continua a um clique de distância pela faixa de atalhos do Painel. */
export function AdminHub() {
  const { perfil } = useAuth()
  const navigate = useNavigate()
  const [contagemAreas, setContagemAreas] = useState(0)
  const [patologias, setPatologias] = useState<Patologia[]>([])
  const [medicamentos, setMedicamentos] = useState<Medicamento[]>([])
  const [busca, setBusca] = useState('')

  useEffect(() => {
    areasApi.list().then((areas) => setContagemAreas(areas.length))
    patologiasApi.list().then(setPatologias)
    medicamentosApi.list().then(setMedicamentos)
  }, [])

  const primeiroNome = (perfil?.nome || 'você').split(' ')[0]

  const resultadosPatologias = useMemo(() => {
    const t = busca.trim().toLowerCase()
    if (!t) return []
    return patologias.filter((p) => p.nome.toLowerCase().includes(t)).slice(0, 5)
  }, [patologias, busca])

  const resultadosMedicamentos = useMemo(() => {
    const t = busca.trim().toLowerCase()
    if (!t) return []
    return medicamentos.filter((m) => m.nome.toLowerCase().includes(t)).slice(0, 5)
  }, [medicamentos, busca])

  const buscando = busca.trim().length > 0

  return (
    <div className="h-full overflow-y-auto p-6">
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
          Cadastre áreas, patologias e medicamentos, monte as prescrições — tudo por aqui, num só lugar.
        </p>
      </div>

      {/* busca rápida */}
      <div className="max-w-lg mx-auto mt-8 relative">
        <div className="flex items-center gap-2.5 bg-surface border border-border rounded-full px-5 py-3 shadow-sm">
          <Search className="w-4 h-4 text-text-dim shrink-0" />
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar patologia ou medicamento na base…"
            className="flex-1 bg-transparent outline-none text-sm text-text placeholder:text-text-dim"
          />
        </div>

        {buscando && (
          <div className="absolute z-10 top-full mt-2 w-full bg-surface border border-border rounded-2xl shadow-lg overflow-hidden">
            {resultadosPatologias.length === 0 && resultadosMedicamentos.length === 0 ? (
              <p className="text-sm text-text-dim px-5 py-4 text-center">Nada encontrado.</p>
            ) : (
              <>
                {resultadosPatologias.map((p) => (
                  <button
                    key={`p-${p.id}`}
                    onClick={() => navigate('/painel/patologias')}
                    className="w-full flex items-center gap-2.5 text-left px-5 py-2.5 hover:bg-surface-2 transition-colors"
                  >
                    <FolderHeart className="w-4 h-4 text-cat-patologias shrink-0" />
                    <span className="text-sm">{p.nome}</span>
                    <span className="text-xs text-text-dim ml-auto">Patologia</span>
                  </button>
                ))}
                {resultadosMedicamentos.map((m) => (
                  <button
                    key={`m-${m.id}`}
                    onClick={() => navigate('/painel/medicamentos')}
                    className="w-full flex items-center gap-2.5 text-left px-5 py-2.5 hover:bg-surface-2 transition-colors"
                  >
                    <Pill className="w-4 h-4 text-cat-medicamentos shrink-0" />
                    <span className="text-sm">{m.nome}</span>
                    <span className="text-xs text-text-dim ml-auto">Medicamento</span>
                  </button>
                ))}
              </>
            )}
          </div>
        )}
      </div>

      {/* hub de cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-10">
        <HubCard
          to="/painel/areas"
          icone={MapPinned}
          corTexto="var(--color-cat-areas)"
          corFundo="var(--color-cat-areas-bg)"
          titulo="Áreas"
          descricao="As grandes especialidades. O primeiro nível da sua base."
          contador={`${contagemAreas} cadastrada${contagemAreas === 1 ? '' : 's'}`}
        />
        <HubCard
          to="/painel/patologias"
          icone={FolderHeart}
          corTexto="var(--color-cat-patologias)"
          corFundo="var(--color-cat-patologias-bg)"
          titulo="Patologias"
          descricao="Sinônimos e orientações que alimentam a busca da consulta."
          contador={`${patologias.length} cadastrada${patologias.length === 1 ? '' : 's'}`}
        />
        <HubCard
          to="/painel/medicamentos"
          icone={Pill}
          corTexto="var(--color-cat-medicamentos)"
          corFundo="var(--color-cat-medicamentos-bg)"
          titulo="Medicamentos"
          descricao="O catálogo — gestação, lactação e dose pediátrica num cadastro só."
          contador={`${medicamentos.length} cadastrado${medicamentos.length === 1 ? '' : 's'}`}
        />

        <Link
          to="/painel/tratamentos"
          className="sm:col-span-2 lg:col-span-3 bg-surface border border-border rounded-3xl p-6 flex items-center gap-5 hover:-translate-y-0.5 transition-transform"
        >
          <span
            className="w-16 h-16 rounded-[20px] flex items-center justify-center shrink-0"
            style={{ background: 'var(--color-cat-tratamentos-bg)', color: 'var(--color-cat-tratamentos)' }}
          >
            <ListChecks className="w-8 h-8" />
          </span>
          <span className="flex-1 min-w-0">
            <span className="font-display text-lg font-semibold block">Prescrições</span>
            <span className="text-sm text-text-dim block mt-0.5">
              Onde a receita ganha forma — cabeçalho + itens com dose, via e posologia.
            </span>
          </span>
          <ArrowRight className="w-5 h-5 text-text-dim shrink-0" />
        </Link>
      </div>

      {/* cta */}
      <Link
        to="/painel/tratamentos"
        className="mt-10 flex items-center justify-between gap-6 rounded-3xl px-9 py-8 text-white overflow-hidden relative"
        style={{ background: '#201F2E' }}
      >
        <span>
          <span className="font-display text-2xl font-semibold block max-w-xs">
            Cadastre uma prescrição nova agora
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
          Nova prescrição
        </span>
      </Link>
    </div>
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
