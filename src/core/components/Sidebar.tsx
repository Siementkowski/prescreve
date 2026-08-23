import { useState } from 'react'
import type { ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import type { ComponentType } from 'react'
import { Icon, type NomeIconeEditorial } from '../../admin/components/editorial/Icon'

const CHAVE_SIDEBAR_RECOLHIDA = 'prescreve-sidebar-recolhida'

function recolhidaSalva(): boolean {
  if (typeof window === 'undefined') return false
  return window.localStorage.getItem(CHAVE_SIDEBAR_RECOLHIDA) === '1'
}

export type ItemNav = {
  to: string
  label: string
  sprite?: NomeIconeEditorial
  lucide?: ComponentType<{ className?: string }>
  end?: boolean
  ativo?: boolean
}

/** Sidebar do shell — mesmo padrão do Sidebar do kit (app-shell.jsx): recolhível, com
 *  grupos rotulados ("Navegação"/"Painel") e NavItem com estado ativo em bloco sólido
 *  (bg-text). Usa NavLink de verdade (rotas reais), diferente do sandbox do kit que só
 *  troca de "page" em memória. */
export function Sidebar({
  principal,
  painel,
  rodape,
}: {
  principal: ItemNav[]
  painel: ItemNav[]
  rodape?: ReactNode
}) {
  const [recolhida, setRecolhida] = useState(recolhidaSalva)

  function alternar() {
    setRecolhida((r) => {
      const novo = !r
      window.localStorage.setItem(CHAVE_SIDEBAR_RECOLHIDA, novo ? '1' : '0')
      return novo
    })
  }

  return (
    <aside
      className={`relative shrink-0 border-r border-border h-full overflow-visible transition-[width] duration-200 ease-out ${
        recolhida ? 'w-[78px]' : 'w-[248px]'
      }`}
    >
      <button
        type="button"
        onClick={alternar}
        title={recolhida ? 'Expandir navegação' : 'Recolher navegação'}
        aria-label="Alternar navegação"
        className="absolute -right-[13px] top-4 z-10 w-[26px] h-[26px] rounded-full border border-border bg-surface text-text-dim hover:text-text flex items-center justify-center shadow-[var(--shadow-float,0_4px_14px_rgba(17,17,17,.08))] transition-colors"
      >
        <Icon
          name="chevron"
          size={14}
          strokeWidth={1.8}
          className={`transition-transform duration-200 ${recolhida ? 'rotate-180' : ''}`}
        />
      </button>

      <div className={`h-full flex flex-col transition-[padding] duration-200 ${recolhida ? 'px-3 py-7' : 'px-4.5 py-7'}`}>
        <div className="flex-1 min-h-0 overflow-y-auto">
          <GrupoNav titulo="Navegação" itens={principal} recolhida={recolhida} />
          {painel.length > 0 && <GrupoNav titulo="Painel" itens={painel} recolhida={recolhida} className="mt-6" />}
        </div>
        {rodape && !recolhida && <div className="shrink-0 pt-4 mt-2 border-t border-border">{rodape}</div>}
      </div>
    </aside>
  )
}

function GrupoNav({
  titulo,
  itens,
  recolhida,
  className = '',
}: {
  titulo: string
  itens: ItemNav[]
  recolhida: boolean
  className?: string
}) {
  return (
    <div className={className}>
      {!recolhida && (
        <div className="text-[10px] uppercase tracking-[1.2px] text-text-faint font-bold mx-3 mb-2 mt-2.5">{titulo}</div>
      )}
      {itens.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className={({ isActive }) =>
            `w-full flex items-center gap-2.5 my-0.5 rounded-[var(--radius-nav,10px)] font-medium transition-colors ${
              recolhida ? 'justify-center px-2.5 py-2.5' : 'px-3 py-2.5'
            } ${
              (item.ativo ?? isActive)
                ? 'bg-text text-bg'
                : 'text-text hover:bg-surface-3'
            }`
          }
        >
          <span className="w-[18px] h-[18px] flex items-center justify-center shrink-0">
            {item.sprite ? (
              <Icon name={item.sprite} size={17} />
            ) : item.lucide ? (
              <item.lucide className="w-[17px] h-[17px]" />
            ) : null}
          </span>
          {!recolhida && <span className="text-sm">{item.label}</span>}
        </NavLink>
      ))}
    </div>
  )
}
