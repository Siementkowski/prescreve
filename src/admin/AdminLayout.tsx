import { useEffect, useMemo } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import { ArrowLeft, FileCode2 } from 'lucide-react'
import type { ComponentType } from 'react'
import { OfflineBanner } from './components/OfflineBanner'
import { useRevisaoStore } from './revisaoStore'
import { useConfiguracoesStore } from '../core/configuracoes'
import { precisaRevisar } from '../core/revisao'
import { Icon, type NomeIconeEditorial } from './components/editorial/Icon'

// Sprite do Painel Editorial cobre a maior parte da nav; "Geradores" não tem símbolo no kit
// (33 ícones, nenhum de "código"), então continua em lucide-react ali — mistura pontual,
// não abandono do sprite.
const SECOES: { to: string; label: string; sprite?: NomeIconeEditorial; lucide?: ComponentType<{ className?: string }> }[] = [
  { to: '/painel/areas', label: 'Áreas', sprite: 'layers' },
  { to: '/painel/patologias', label: 'Patologias', sprite: 'path' },
  { to: '/painel/medicamentos', label: 'Medicamentos', sprite: 'pill' },
  { to: '/painel/complementos', label: 'Complementos', sprite: 'spark' },
  { to: '/painel/tratamentos', label: 'Prescrições', sprite: 'rx' },
  { to: '/painel/geradores', label: 'Geradores', lucide: FileCode2 },
  { to: '/painel/revisao', label: 'Revisão', sprite: 'check' },
]

/** Casca do Painel (/painel/*) — nav interna de seções do admin. O reskin "Painel
 *  Editorial" em si (tokens, fonte, claro/escuro) agora é aplicado na raiz do app
 *  (ver App.tsx), não mais só aqui — cobre o app inteiro, não só essa árvore de rotas. */
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

      {/* Faixa fina de atalho — volta pra página inicial ou pula lateralmente entre
          seções, sem precisar passar pelo hub toda vez. */}
      <div className="relative z-10 flex items-center gap-3 px-6 py-3 border-b border-border shrink-0 overflow-x-auto bg-surface">
        <Link
          to="/"
          className="flex items-center gap-1.5 text-sm font-medium text-text-dim hover:text-text transition-colors shrink-0"
        >
          <ArrowLeft className="w-4 h-4" />
          Página inicial
        </Link>
        <span className="w-px h-4 bg-border shrink-0" />
        <div className="flex items-center gap-1 shrink-0">
          {SECOES.map(({ to, label, sprite, lucide: Lucide }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-3 py-2 rounded-[var(--radius-nav)] text-sm font-medium transition-colors whitespace-nowrap ${
                  isActive ? 'bg-text text-bg' : 'text-text-dim hover:bg-surface-3 hover:text-text'
                }`
              }
            >
              {sprite ? <Icon name={sprite} size={16} /> : Lucide ? <Lucide className="w-4 h-4" /> : null}
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

      <div className="relative z-10 flex-1 min-h-0 overflow-hidden p-6 bg-bg">
        <Outlet />
      </div>
    </div>
  )
}
