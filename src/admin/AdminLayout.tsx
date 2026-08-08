import { useEffect, useMemo } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { ArrowLeft, MapPinned, FolderHeart, Pill, ListChecks, ClipboardCheck } from 'lucide-react'
import { OfflineBanner } from './components/OfflineBanner'
import { useRevisaoStore } from './revisaoStore'
import { useConfiguracoesStore } from '../core/configuracoes'
import { precisaRevisar } from '../core/revisao'

const SECOES = [
  { to: '/admin/areas', label: 'Áreas', icone: MapPinned },
  { to: '/admin/patologias', label: 'Patologias', icone: FolderHeart },
  { to: '/admin/medicamentos', label: 'Medicamentos', icone: Pill },
  { to: '/admin/tratamentos', label: 'Prescrições', icone: ListChecks },
  { to: '/admin/revisao', label: 'Revisão', icone: ClipboardCheck },
]

export function AdminLayout() {
  const location = useLocation()
  const naPagInicial = location.pathname === '/admin' || location.pathname === '/admin/'

  const tratamentos = useRevisaoStore((s) => s.tratamentos)
  const carregar = useRevisaoStore((s) => s.carregar)
  const mesesAteRevisar = useConfiguracoesStore((s) => s.mesesAteRevisar)

  useEffect(() => {
    carregar()
  }, [carregar])

  const pendentes = useMemo(
    () =>
      tratamentos.filter((t) =>
        precisaRevisar({ precisaRevisao: t.precisa_revisao, revisadoEm: t.revisado_em }, mesesAteRevisar)
      ).length,
    [tratamentos, mesesAteRevisar]
  )

  return (
    <div className="flex flex-col h-full min-h-0">
      <OfflineBanner />

      {/* Sem barra de abas fixa — o painel (/admin) é o ponto de partida. Nas telas de
          dentro, essa faixa fina só ajuda a pular lateralmente sem voltar ao painel toda vez. */}
      {!naPagInicial && (
        <div className="flex items-center gap-3 px-6 py-3 border-b border-border shrink-0 overflow-x-auto">
          <Link
            to="/admin"
            className="flex items-center gap-1.5 text-sm font-semibold text-text-dim hover:text-text transition-colors shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
            Painel
          </Link>
          <span className="w-px h-4 bg-border shrink-0" />
          <div className="flex items-center gap-1 shrink-0">
            {SECOES.map(({ to, label, icone: Icone }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold transition-colors whitespace-nowrap ${
                    isActive ? 'bg-accent-dim text-accent' : 'text-text-dim hover:bg-surface-2 hover:text-text'
                  }`
                }
              >
                <Icone className="w-3.5 h-3.5" />
                {label}
                {label === 'Revisão' && pendentes > 0 && (
                  <span className="text-[10px] font-bold bg-danger text-white rounded-full min-w-4 h-4 px-1 flex items-center justify-center">
                    {pendentes}
                  </span>
                )}
              </NavLink>
            ))}
          </div>
        </div>
      )}

      <div className={`flex-1 min-h-0 p-6 ${naPagInicial ? 'overflow-y-auto' : 'overflow-hidden'}`}>
        <Outlet />
      </div>
    </div>
  )
}
