import {
  Activity,
  Baby,
  Bug,
  Brain,
  Droplets,
  Eye,
  Flame,
  HeartPulse,
  Leaf,
  Pill,
  Sparkles,
  Syringe,
  Wind,
  Zap,
  type LucideIcon,
} from 'lucide-react'

export const CLASSE_SEM_CATEGORIA = 'Outros'

/** Ícone e cor (par de tokens --tint-* do Painel Editorial) de cada classe. Classe nova,
 *  cadastrada pelo editor sem entrada aqui, cai no padrão (pílula cinza) — nunca quebra. */
interface VisualCategoria {
  icone: LucideIcon
  tint: string
}

const VISUAIS: Record<string, VisualCategoria> = {
  Antimicrobianos: { icone: Bug, tint: 'blue' },
  Antiparasitários: { icone: Bug, tint: 'yellow' },
  Anticonvulsivantes: { icone: Brain, tint: 'purple' },
  Antidepressivos: { icone: Brain, tint: 'indigo' },
  Antipsicóticos: { icone: Brain, tint: 'slate' },
  'Outros psiquiátricos': { icone: Brain, tint: 'magenta' },
  Neurológicos: { icone: Zap, tint: 'cyan' },
  Analgésicos: { icone: Activity, tint: 'green' },
  'Anti-Inflamatórios': { icone: Flame, tint: 'red' },
  'Relaxantes musculares': { icone: Activity, tint: 'peach' },
  Corticosteroides: { icone: Syringe, tint: 'blue' },
  Respiratórios: { icone: Wind, tint: 'orange' },
  'Anti-Histamínicos': { icone: Sparkles, tint: 'orange' },
  Gastrointestinais: { icone: Droplets, tint: 'yellow' },
  Cardiovasculares: { icone: HeartPulse, tint: 'red' },
  'Vitaminas e Ferro': { icone: Leaf, tint: 'lime' },
  Hormonais: { icone: Baby, tint: 'pink' },
  Oftalmológicos: { icone: Eye, tint: 'aqua' },
  Dermatológicos: { icone: Sparkles, tint: 'coral' },
  Reumatológicos: { icone: Activity, tint: 'slate' },
  Vasculares: { icone: HeartPulse, tint: 'purple' },
  Urológicos: { icone: Droplets, tint: 'cyan' },
}

export function visualCategoria(classe: string): { icone: LucideIcon; bg: string; fg: string } {
  const v = VISUAIS[classe] ?? { icone: Pill, tint: 'gray' }
  return { icone: v.icone, bg: `var(--tint-${v.tint}-bg)`, fg: `var(--tint-${v.tint}-fg)` }
}
