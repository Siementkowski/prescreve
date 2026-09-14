import type { ReactNode } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Icon } from '../../admin/components/editorial/Icon'
import type { ItemNav } from './Sidebar'

/** Barra superior fixa — mesmo padrão do Topbar do kit (app-shell.jsx): 72px, borda
 *  inferior, fundo com leve blur, logo à esquerda, cluster de ações à direita.
 *
 *  `painel` — atalhos de editor (Medicamentos, Painel) que antes viviam num grupo à parte
 *  na Sidebar; migrados pra cá como ícones redondos, mesmo tratamento visual do botão de
 *  tema — ficam junto do resto das ações globais em vez de ocupar espaço permanente na
 *  navegação principal (só aparecem pra quem é editor, ver App.tsx). */
export function Topbar({
  tema,
  onAlternarTema,
  painel,
  children,
}: {
  tema: 'light' | 'dark'
  onAlternarTema: () => void
  painel?: ItemNav[]
  children?: ReactNode
}) {
  return (
    <header className="h-[72px] shrink-0 border-b border-border flex items-center justify-between px-6 sm:px-9 sticky top-0 z-20 backdrop-blur-md bg-bg/90">
      <Link to="/" className="font-display font-bold text-[22px] tracking-[-.8px] text-text shrink-0">
        prescreve<span className="font-medium">.</span>
      </Link>

      <div className="flex items-center gap-2.5 min-w-0">
        {painel?.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            title={item.label}
            aria-label={item.label}
            className={({ isActive }) =>
              `shrink-0 w-[42px] h-[42px] rounded-full border flex items-center justify-center transition-colors ${
                (item.ativo ?? isActive)
                  ? 'bg-text border-text text-bg'
                  : 'border-border bg-surface text-text hover:bg-surface-2'
              }`
            }
          >
            {item.sprite ? <Icon name={item.sprite} size={18} /> : item.lucide ? <item.lucide className="w-[18px] h-[18px]" /> : null}
          </NavLink>
        ))}

        <button
          type="button"
          onClick={onAlternarTema}
          title={tema === 'dark' ? 'Tema claro' : 'Tema escuro'}
          aria-label="Alternar tema"
          className="shrink-0 w-[42px] h-[42px] rounded-full border border-border bg-surface text-text hover:bg-surface-2 transition-colors flex items-center justify-center"
        >
          <Icon name={tema === 'dark' ? 'sun' : 'moon'} size={18} />
        </button>
        {children}
      </div>
    </header>
  )
}
