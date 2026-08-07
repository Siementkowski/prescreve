export function ConfirmDialog({
  aberto,
  titulo,
  mensagem,
  onConfirmar,
  onCancelar,
}: {
  aberto: boolean
  titulo: string
  mensagem: string
  onConfirmar: () => void
  onCancelar: () => void
}) {
  if (!aberto) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="w-full max-w-sm bg-surface border border-border rounded-lg p-6 shadow-xl">
        <h3 className="text-sm font-semibold text-text mb-2">{titulo}</h3>
        <p className="text-sm text-text-dim mb-6">{mensagem}</p>
        <div className="flex justify-end gap-2">
          <button
            onClick={onCancelar}
            className="px-3 py-1.5 text-sm text-text-dim hover:text-text transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirmar}
            className="px-3 py-1.5 text-sm bg-danger hover:bg-danger/90 text-white rounded-md transition-colors"
          >
            Excluir
          </button>
        </div>
      </div>
    </div>
  )
}
