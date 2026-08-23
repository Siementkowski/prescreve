// Ícone do sprite do Painel Editorial (public/icons/painel-sprite.svg, 33 símbolos, extraído
// do design system entregue). Só tem os ícones de navegação/ação fixos do kit (grid, pill,
// rx, layers, path, spark, check, wand, external, search, moon, sun, settings, chevron) —
// pra tudo que não está na lista, o admin continua com lucide-react (o kit não cobre ações
// genéricas de UI como excluir/arrastar/voltar, só os símbolos clínicos e de navegação).

export type NomeIconeEditorial =
  | 'grid'
  | 'pill'
  | 'rx'
  | 'layers'
  | 'path'
  | 'spark'
  | 'check'
  | 'wand'
  | 'external'
  | 'search'
  | 'moon'
  | 'sun'
  | 'settings'
  | 'chevron'
  | 'heart'
  | 'heart-plain'
  | 'allergy'
  | 'skin'
  | 'gastro'
  | 'blood'
  | 'virus'
  | 'brain'
  | 'eye'
  | 'bone'
  | 'ear'
  | 'child'
  | 'psy'
  | 'lung'
  | 'symptoms'
  | 'kidney'
  | 'vein'
  | 'vitamins'
  | 'woman'

export function Icon({
  name,
  size = 18,
  strokeWidth = 1.7,
  className,
}: {
  name: NomeIconeEditorial
  size?: number
  strokeWidth?: number
  className?: string
}) {
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      className={className}
      style={{ fill: 'none', stroke: 'currentColor', strokeWidth, strokeLinecap: 'round', strokeLinejoin: 'round', flex: '0 0 auto' }}
    >
      <use href={`/icons/painel-sprite.svg#i-${name}`} />
    </svg>
  )
}
