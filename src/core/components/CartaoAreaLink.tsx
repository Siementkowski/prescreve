import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

/** Cartão de área clínica — fundo liso, borda fina em degradê e, no hover, a sombra dura
 *  deslocada do Painel Editorial (mesma do ed-hover-lift) preenchida com o mesmo degradê.
 *  `box-shadow` não aceita degradê, então a sombra é um elemento irmão, deslocado, atrás do
 *  cartão; fica num wrapper porque, dentro do próprio cartão, um filho com z-index negativo
 *  pintaria por cima do fundo dele. */
export function CartaoAreaLink({
  to,
  cor,
  raio,
  className = '',
  children,
}: {
  to: string
  cor: string
  raio: string
  className?: string
  children: ReactNode
}) {
  const degrade = `linear-gradient(135deg, ${cor}, ${cor}40)`
  return (
    <div className="group relative transition-transform duration-200 hover:-translate-y-0.5">
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 translate-x-[5px] translate-y-[5px] opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        style={{ background: degrade, borderRadius: raio }}
      />
      <Link
        to={to}
        className={`relative block border-[1.5px] border-transparent ${className}`}
        style={{
          borderRadius: raio,
          background: `linear-gradient(var(--surface), var(--surface)) padding-box, ${degrade} border-box`,
        }}
      >
        {children}
      </Link>
    </div>
  )
}
