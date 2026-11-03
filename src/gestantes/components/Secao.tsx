import type { ComponentType, ReactNode } from 'react'

/** Checkbox padrão do módulo — preenchimento preto (cor do texto) quando marcado, em vez do azul nativo. */
export const checkboxCls = 'w-4 h-4 accent-text shrink-0 cursor-pointer'

/** Card de seção padrão do módulo Gestantes — ícone + título font-display, mesmo
 *  tratamento em toda a aba (Suplementação/Vacinação/Intercorrências/Guia de Consulta).
 *  Existia redefinido localmente em 3 arquivos diferentes (mais um quarto quase-igual no
 *  Guia, só que com o estilo errado — label pequeno pensado pra tile compacto, não pra
 *  card de largura cheia); centralizado aqui pra parar de divergir. */
export function Secao({
  titulo,
  icone: Icone,
  tom,
  acao,
  children,
}: {
  titulo: string
  icone: ComponentType<{ className?: string }>
  tom?: 'ok' | 'warn' | 'danger'
  /** Botão/atalho opcional alinhado à direita do título. */
  acao?: ReactNode
  children: ReactNode
}) {
  const corIcone = tom === 'danger' ? 'text-danger' : tom === 'ok' ? 'text-ok' : tom === 'warn' ? 'text-warn' : 'text-text-dim'
  return (
    <div className="border border-border rounded-[var(--radius-card,14px)] bg-surface p-4">
      <div className="flex items-center justify-between gap-3 mb-3">
        <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-text">
          <Icone className={`w-[18px] h-[18px] ${corIcone}`} />
          {titulo}
        </h2>
        {acao}
      </div>
      {children}
    </div>
  )
}

/** Tabela simples com tokens do design system — mesma usada em Intercorrências e no
 *  esquema de tétano da Vacinação, antes cada uma com sua própria cópia. */
export function Tabela({ cabecalho, linhas }: { cabecalho: string[]; linhas: string[][] }) {
  return (
    <div className="overflow-x-auto rounded-[var(--radius-item,11px)] border border-border">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-surface-2">
            {cabecalho.map((c) => (
              <th key={c} className="text-left font-semibold text-text px-3 py-2 border-b border-border whitespace-nowrap">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {linhas.map((linha, i) => (
            <tr key={i} className={i % 2 === 1 ? 'bg-surface-2/40' : ''}>
              {linha.map((celula, j) => (
                <td key={j} className="text-text-dim px-3 py-2.5 align-top border-b border-border last:border-b-0">
                  {celula}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
