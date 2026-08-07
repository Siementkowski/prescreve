import { useEffect, useMemo } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { MapPinned, FolderHeart, Pill, ListChecks, ClipboardCheck } from 'lucide-react'
import { OfflineBanner } from './components/OfflineBanner'
import { useRevisaoStore } from './revisaoStore'
import { useConfiguracoesStore } from '../core/configuracoes'
import { precisaRevisar } from '../core/revisao'

const ABAS = [
  { to: '/admin/areas', label: 'Áreas', icone: MapPinned },
  { to: '/admin/patologias', label: 'Patologias', icone: FolderHeart },
  { to: '/admin/medicamentos', label: 'Medicamentos', icone: Pill },
  { to: '/admin/tratamentos', label: 'Tratamentos', icone: ListChecks },
]

export function AdminLayout() {
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
      <nav className="flex items-center gap-1 border-b border-border px-6 shrink-0">
        {ABAS.map(({ to, label, icone: Icone }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-1.5 px-3 py-3 text-sm border-b-2 transition-colors ${
                isActive
                  ? 'border-accent text-text'
                  : 'border-transparent text-text-dim hover:text-text'
              }`
            }
          >
            <Icone className="w-4 h-4" />
            {label}
          </NavLink>
        ))}
        <NavLink
          to="/admin/revisao"
          className={({ isActive }) =>
            `flex items-center gap-1.5 px-3 py-3 text-sm border-b-2 transition-colors ${
              isActive ? 'border-accent text-text' : 'border-transparent text-text-dim hover:text-text'
            }`
          }
        >
          <ClipboardCheck className="w-4 h-4" />
          Revisão
          {pendentes > 0 && (
            <span className="text-[11px] font-semibold bg-danger text-white rounded-full min-w-4 h-4 px-1 flex items-center justify-center">
              {pendentes}
            </span>
          )}
        </NavLink>
      </nav>
      <div className="flex-1 min-h-0 overflow-hidden p-6">
        <Outlet />
      </div>
    </div>
  )
}
