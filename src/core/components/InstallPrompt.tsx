import { useEffect, useState } from 'react'
import { Download } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

/** Botão de instalar só aparece quando o navegador oferece a possibilidade (Chrome/Edge,
 *  Android e desktop). No iOS Safari não existe esse evento — lá a instalação é manual,
 *  via "Adicionar à Tela de Início" no menu de compartilhar, sem como automatizar. */
export function InstallPrompt() {
  const [evento, setEvento] = useState<BeforeInstallPromptEvent | null>(null)
  const [instalado, setInstalado] = useState(false)

  useEffect(() => {
    function aoOferecerInstalacao(e: Event) {
      e.preventDefault()
      setEvento(e as BeforeInstallPromptEvent)
    }
    function aoInstalar() {
      setInstalado(true)
      setEvento(null)
    }
    window.addEventListener('beforeinstallprompt', aoOferecerInstalacao)
    window.addEventListener('appinstalled', aoInstalar)
    return () => {
      window.removeEventListener('beforeinstallprompt', aoOferecerInstalacao)
      window.removeEventListener('appinstalled', aoInstalar)
    }
  }, [])

  if (!evento || instalado) return null

  async function instalar() {
    if (!evento) return
    await evento.prompt()
    await evento.userChoice
    setEvento(null)
  }

  return (
    <button
      onClick={instalar}
      className="flex items-center gap-1.5 text-xs font-medium text-text-dim hover:text-text border border-border rounded-md px-2.5 py-1.5 transition-colors shrink-0"
      title="Instalar o Prescreve como app"
    >
      <Download className="w-3.5 h-3.5" />
      <span className="hidden lg:inline">Instalar</span>
    </button>
  )
}
