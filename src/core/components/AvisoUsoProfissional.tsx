/** Discreto, mas permanente — aparece em toda tela do app (fica fora do <main>, no rodapé
 *  fixo do layout). Importa sobretudo se o app for compartilhado com colegas: deixa claro
 *  que é apoio, não substituto de julgamento clínico. */
export function AvisoUsoProfissional() {
  return (
    <footer className="shrink-0 border-t border-border px-4 py-1.5 text-center">
      <p className="text-[11px] text-text-dim leading-tight">
        Ferramenta de apoio para profissional de saúde habilitado. Conteúdo mantido manualmente —
        não substitui julgamento clínico nem consulta a bulas e diretrizes oficiais.
      </p>
    </footer>
  )
}
