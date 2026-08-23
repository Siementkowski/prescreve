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
      <div className="w-full max-w-sm bg-surface border border-border rounded-[var(--radius-card,14px)] p-6 shadow-[var(--shadow-popover,0_14px_32px_rgba(0,0,0,.2))]">
        <h3 className="font-display text-[18px] tracking-[-.4px] text-text mb-2">{titulo}</h3>
        <p className="text-sm text-text-dim mb-6 leading-relaxed">{mensagem}</p>
        <div className="flex justify-end gap-2">
          <button
            onClick={onCancelar}
            className="px-4 py-2 text-sm font-medium text-text-dim hover:text-text transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirmar}
            className="px-4 py-2 text-sm font-semibold bg-danger hover:opacity-90 text-white rounded-[var(--radius-pill,999px)] transition-opacity"
          >
            Excluir
          </button>
        </div>
      </div>
    </div>
  )
}
