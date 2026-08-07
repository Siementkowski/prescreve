import {
  Stethoscope,
  HeartPulse,
  Baby,
  Bone,
  Brain,
  Syringe,
  Pill,
  Thermometer,
  Activity,
  Eye,
  Ear,
  Wind,
  Droplet,
  Bug,
  Scissors,
  Waves,
  Shield,
  User,
  Users,
  AlertTriangle,
  Microscope,
  TestTube,
  Cross,
  Hospital,
  Ambulance,
  Bandage,
  Dna,
  FlaskConical,
  ClipboardList,
  Zap,
  Moon,
  Flame,
  Skull,
  type LucideIcon,
} from 'lucide-react'

export const ICONES: Record<string, LucideIcon> = {
  Stethoscope,
  HeartPulse,
  Baby,
  Bone,
  Brain,
  Syringe,
  Pill,
  Thermometer,
  Activity,
  Eye,
  Ear,
  Wind,
  Droplet,
  Bug,
  Scissors,
  Waves,
  Shield,
  User,
  Users,
  AlertTriangle,
  Microscope,
  TestTube,
  Cross,
  Hospital,
  Ambulance,
  Bandage,
  Dna,
  FlaskConical,
  ClipboardList,
  Zap,
  Moon,
  Flame,
  Skull,
}

export function IconePorNome({ nome, className }: { nome: string | null | undefined; className?: string }) {
  const Comp = (nome && ICONES[nome]) || ClipboardList
  return <Comp className={className} />
}

export function IconPicker({
  valor,
  onChange,
}: {
  valor: string | null
  onChange: (nome: string) => void
}) {
  return (
    <div className="grid grid-cols-8 gap-1.5 p-2 bg-surface-2 border border-border rounded-md max-h-40 overflow-y-auto">
      {Object.entries(ICONES).map(([nome, Icone]) => (
        <button
          key={nome}
          type="button"
          title={nome}
          onClick={() => onChange(nome)}
          className={`flex items-center justify-center aspect-square rounded-md border transition-colors ${
            valor === nome
              ? 'border-accent bg-accent/15 text-accent'
              : 'border-transparent text-text-dim hover:text-text hover:bg-surface'
          }`}
        >
          <Icone className="w-4 h-4" />
        </button>
      ))}
    </div>
  )
}
