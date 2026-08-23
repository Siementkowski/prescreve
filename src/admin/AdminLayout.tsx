import { useEffect, useMemo, useState } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import { ArrowLeft, FileCode2 } from 'lucide-react'
import type { ComponentType } from 'react'
import { OfflineBanner } from './components/OfflineBanner'
import { useRevisaoStore } from './revisaoStore'
import { useConfiguracoesStore } from '../core/configuracoes'
import { precisaRevisar } from '../core/revisao'
import { Icon, type NomeIconeEditorial } from './components/editorial/Icon'
import './painel-editorial.css'

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

type TemaPainel = 'light' | 'dark'
const CHAVE_TEMA_PAINEL = 'prescreve-painel-tema'

function temaSalvo(): TemaPainel {
  if (typeof window === 'undefined') return 'light'
  return window.localStorage.getItem(CHAVE_TEMA_PAINEL) === 'dark' ? 'dark' : 'light'
}

/** Casca do Painel Editorial (/painel/*) — reskin completo a partir do design system
 *  entregue (ver painel-editorial.css pro escopo de tokens). Só essa árvore de rotas muda
 *  de identidade visual; Consulta/Pediatria/Anamnese/Página inicial continuam como estavam.
 *  Claro/escuro é preferência só do Painel — `data-theme` fica no wrapper `.tema-editorial`
 *  aqui embaixo, nunca em `<html>`, então não vaza pra nenhuma tela fora do admin. */
export function AdminLayout() {
  const tratamentos = useRevisaoStore((s) => s.tratamentos)
  const carregar = useRevisaoStore((s) => s.carregar)
  const mesesAteRevisar = useConfiguracoesStore((s) => s.mesesAteRevisar)
  const [tema, setTema] = useState<TemaPainel>(temaSalvo)

  useEffect(() => {
    carregar()
  }, [carregar])

  useEffect(() => {
    window.localStorage.setItem(CHAVE_TEMA_PAINEL, tema)
  }, [tema])

  const pendentes = useMemo(
    () =>
      tratamentos.filter((t) =>
        precisaRevisar({ precisaRevisao: t.precisa_revisao, revisadoEm: t.revisado_em }, mesesAteRevisar)
      ).length,
    [tratamentos, mesesAteRevisar]
  )

  return (
    <div className="tema-editorial flex flex-col h-full min-h-0" data-theme={tema}>
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

        <button
          type="button"
          onClick={() => setTema((t) => (t === 'dark' ? 'light' : 'dark'))}
          title={tema === 'dark' ? 'Tema claro' : 'Tema escuro'}
          aria-label="Alternar tema do painel"
          className="ml-auto shrink-0 w-9 h-9 rounded-full border border-border bg-surface text-text-dim hover:text-text hover:border-text-dim transition-colors flex items-center justify-center"
        >
          <Icon name={tema === 'dark' ? 'sun' : 'moon'} size={16} />
        </button>
      </div>

      <div className="relative z-10 flex-1 min-h-0 overflow-hidden p-6 bg-bg">
        <Outlet />
      </div>
    </div>
  )
}
