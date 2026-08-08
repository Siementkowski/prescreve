import { RefreshCw } from 'lucide-react'
import { useRegisterSW } from 'virtual:pwa-register/react'

/** Atualização do PWA em si (novo código publicado) — diferente da atualização de DADOS
 *  (ver AtualizacaoDisponivelBanner). registerType: 'prompt' no vite.config.ts garante que
 *  isso nunca troca a versão em uso sozinho: só troca quando você clicar. */
export function PwaUpdatePrompt() {
  const { needRefresh: [precisaAtualizar], updateServiceWorker } = useRegisterSW({
    onRegisteredSW(_url, registration) {
      // Verifica se já existe uma versão nova esperando, a cada hora — cobre o caso do
      // app ficar aberto por muito tempo sem ninguém navegar (o que dispararia o check padrão).
      if (registration) {
        setInterval(() => registration.update(), 60 * 60 * 1000)
      }
    },
  })

  if (!precisaAtualizar) return null

  return (
    <div className="flex items-center justify-between gap-3 bg-surface-2 border-b border-border px-4 py-2 text-sm shrink-0">
      <span className="flex items-center gap-2 text-text">
        <RefreshCw className="w-4 h-4 text-accent shrink-0" />
        Uma nova versão do app está disponível.
      </span>
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={() => updateServiceWorker(true)}
          className="bg-accent hover:bg-accent/90 text-accent-text text-xs font-semibold rounded-lg px-3 py-1.5 transition-colors"
        >
          Atualizar
        </button>
      </div>
    </div>
  )
}
