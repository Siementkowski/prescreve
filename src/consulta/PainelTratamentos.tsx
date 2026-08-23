import { useMemo } from 'react'
import { EyeOff, ChevronDown, X } from 'lucide-react'
import { useConsultaStore } from './store'
import { useSyncStore } from '../core/sync'
import {
  agruparPorLinha,
  agruparPorClasse,
  principaisVisiveis,
  complementosDaPatologia,
  textoTratamentoCompleto,
  tratamentoTemContraindicadoGestacao,
} from './filtros'
import { LABEL_LINHA } from '../admin/types'
import type { Tratamento } from '../admin/types'
import { TratamentoCard } from './TratamentoCard'
import { ComplementoLinha } from './ComplementoLinha'
import { CopyButton } from './components/CopyButton'

/** Círculo numerado que abre cada seção — "3" pra escolher o esquema, "4" pra complementos.
 *  Continua a contagem visual de modo (1) e área/patologia (2), já resolvidos na barra de
 *  cima, então quem olha entende que estamos no meio de um fluxo de passos. */
function NumeroBadge({ n }: { n: number }) {
  return (
    <span className="w-5 h-5 rounded-full bg-text text-bg text-[11px] font-bold flex items-center justify-center shrink-0">
      {n}
    </span>
  )
}

export function PainelTratamentos() {
  const modo = useConsultaStore((s) => s.modo)
  const gestante = useConsultaStore((s) => s.gestante)
  const ocultarContraindicados = useConsultaStore((s) => s.ocultarContraindicados)
  const patologias = useSyncStore((s) => s.patologias)
  const tratamentos = useSyncStore((s) => s.tratamentos)
  const itens = useSyncStore((s) => s.itens)
  const medicamentos = useSyncStore((s) => s.medicamentos)
  const apresentacoes = useSyncStore((s) => s.apresentacoes)
  const patologiaComplementos = useSyncStore((s) => s.patologiaComplementos)
  const patologiaSelecionadaId = useConsultaStore((s) => s.patologiaSelecionadaId)
  const principalSelecionadoId = useConsultaStore((s) => s.principalSelecionadoId)
  const complementosSelecionadosIds = useConsultaStore((s) => s.complementosSelecionadosIds)
  const selecionarPrincipal = useConsultaStore((s) => s.selecionarPrincipal)
  const toggleComplemento = useConsultaStore((s) => s.toggleComplemento)
  const limparSelecao = useConsultaStore((s) => s.limparSelecao)
  const secaoEsquemaAberta = useConsultaStore((s) => s.secaoEsquemaAberta)
  const toggleSecaoEsquema = useConsultaStore((s) => s.toggleSecaoEsquema)

  const patologia = patologias.find((p) => p.id === patologiaSelecionadaId) ?? null

  // "Contraindicado + oculto" vale igual pros dois: é fácil o alerta cobrir só o principal
  // e passar batido no complemento — que é justamente onde moram dipirona e escopolamina.
  function ocultarSeContraindicado(lista: typeof tratamentos) {
    if (!gestante || !ocultarContraindicados) return { visiveis: lista, ocultos: 0 }
    const visiveis = lista.filter((t) => !tratamentoTemContraindicadoGestacao(t.id, itens, medicamentos))
    return { visiveis, ocultos: lista.length - visiveis.length }
  }

  const { gruposPrincipais, ocultosPrincipais } = useMemo(() => {
    if (patologiaSelecionadaId == null) return { gruposPrincipais: [], ocultosPrincipais: 0 }
    const todos = principaisVisiveis(tratamentos, patologiaSelecionadaId, modo)
    const { visiveis, ocultos } = ocultarSeContraindicado(todos)
    return { gruposPrincipais: agruparPorLinha(visiveis), ocultosPrincipais: ocultos }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tratamentos, patologiaSelecionadaId, modo, gestante, ocultarContraindicados, itens, medicamentos])

  const { gruposComplementos, ocultosComplementos } = useMemo(() => {
    if (patologiaSelecionadaId == null) return { gruposComplementos: [], ocultosComplementos: 0 }
    const todos = complementosDaPatologia(patologiaSelecionadaId, tratamentos, patologiaComplementos, modo)
    const { visiveis, ocultos } = ocultarSeContraindicado(todos)
    return { gruposComplementos: agruparPorClasse(visiveis), ocultosComplementos: ocultos }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tratamentos, patologiaComplementos, patologiaSelecionadaId, modo, gestante, ocultarContraindicados, itens, medicamentos])

  const temComplementos = gruposComplementos.length > 0 || ocultosComplementos > 0

  const principal = tratamentos.find((t) => t.id === principalSelecionadoId) ?? null
  const complementosSelecionados = complementosSelecionadosIds
    .map((id) => tratamentos.find((t) => t.id === id))
    .filter((t): t is NonNullable<typeof t> => !!t)

  const selecionados: Tratamento[] = [principal, ...complementosSelecionados].filter(
    (t): t is Tratamento => !!t
  )

  const textoPrescricao = selecionados
    .map((t) => textoTratamentoCompleto(t, itens, medicamentos, apresentacoes))
    .join('\n\n')

  const nadaSelecionado = selecionados.length === 0

  const resumoSelecao = nadaSelecionado
    ? null
    : `${principal ? '1 esquema' : 'nenhum esquema'}${
        complementosSelecionados.length > 0
          ? ` + ${complementosSelecionados.length} complemento${complementosSelecionados.length > 1 ? 's' : ''}`
          : ''
      }`

  if (!patologia) {
    return (
      <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4">
        <p className="text-sm text-text-dim px-1 py-4">Selecione uma área e uma patologia acima.</p>
      </div>
    )
  }

  return (
    <div className="flex-1 min-h-0 flex flex-col lg:flex-row">
      {/* coluna principal — orientações e as duas seções numeradas */}
      <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4 lg:px-6 lg:py-5 flex flex-col gap-5">
        {patologia.orientacoes && (
          <div className="border border-border rounded-xl bg-surface p-4 flex flex-col gap-2">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-sm font-semibold text-text">Orientações não medicamentosas</h3>
              <CopyButton texto={patologia.orientacoes} label="Copiar" />
            </div>
            <p className="text-sm text-text-dim whitespace-pre-wrap leading-relaxed">
              {patologia.orientacoes}
            </p>
          </div>
        )}

        {patologia.observacoes && <p className="text-sm text-text-dim -mt-2">{patologia.observacoes}</p>}

        {/* Escolha um esquema — só um, agrupado por linha (1ª linha, alternativa...).
            Recolhe sozinho ao escolher; o cabeçalho continua clicável pra reabrir e
            trocar a qualquer momento. */}
        <div className="flex flex-col gap-2.5">
          <button
            type="button"
            onClick={toggleSecaoEsquema}
            className={`flex items-center justify-between w-full gap-2 text-left transition-colors ${
              !secaoEsquemaAberta && principal
                ? 'rounded-lg border border-surface bg-surface hover:bg-surface-2 px-3 py-2.5'
                : ''
            }`}
          >
            <span className="flex items-center gap-2.5 min-w-0">
              <NumeroBadge n={3} />
              <h4
                className={
                  !secaoEsquemaAberta && principal
                    ? 'text-sm text-text truncate'
                    : 'text-xs font-semibold text-text-dim uppercase tracking-wide'
                }
              >
                Escolha um esquema
              </h4>
            </span>
            <span className="flex items-center gap-1.5 shrink-0">
              {!secaoEsquemaAberta && principal && (
                <span className="text-xs font-semibold text-text">Trocar</span>
              )}
              <ChevronDown
                className={`w-3.5 h-3.5 shrink-0 ${
                  !secaoEsquemaAberta && principal ? 'text-text' : 'text-text-dim'
                } transition-transform ${secaoEsquemaAberta ? 'rotate-180' : ''}`}
              />
            </span>
          </button>

          {secaoEsquemaAberta && (
            <>
              {ocultosPrincipais > 0 && (
                <div className="flex items-center gap-2 text-xs text-text-dim bg-surface-2 border border-border rounded-md px-3 py-2">
                  <EyeOff className="w-3.5 h-3.5 shrink-0" />
                  {ocultosPrincipais} esquema{ocultosPrincipais > 1 ? 's' : ''} oculto{ocultosPrincipais > 1 ? 's' : ''} por
                  contraindicação na gestação
                </div>
              )}

              {gruposPrincipais.length === 0 ? (
                <p className="text-sm text-text-dim px-1">Nenhuma prescrição cadastrada neste modo.</p>
              ) : (
                gruposPrincipais.map((grupo) => (
                  <div key={grupo.linha} className="flex flex-col gap-2.5">
                    <h5 className="text-[11px] font-semibold text-text-faint uppercase tracking-wide">
                      {LABEL_LINHA[grupo.linha]}
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {grupo.tratamentos.map((t) => (
                        <TratamentoCard
                          key={t.id}
                          tratamento={t}
                          itens={itens}
                          medicamentos={medicamentos}
                          apresentacoes={apresentacoes}
                          gestante={gestante}
                          selecao={{
                            tipo: 'unico',
                            selecionado: principalSelecionadoId === t.id,
                            onToggle: () => selecionarPrincipal(t.id),
                          }}
                        />
                      ))}
                    </div>
                  </div>
                ))
              )}
            </>
          )}
        </div>

        {/* Adicione se precisar — só aparece depois de escolher o esquema, sempre
            visível (sem recolher), linhas compactas agrupadas por classe. */}
        {principal && temComplementos && (
          <div className="flex flex-col gap-2.5">
            <span className="flex items-center gap-2.5">
              <NumeroBadge n={4} />
              <h4 className="text-xs font-semibold text-text-dim uppercase tracking-wide">Adicione se precisar</h4>
            </span>

            {ocultosComplementos > 0 && (
              <div className="flex items-center gap-2 text-xs text-text-dim bg-surface-2 border border-border rounded-md px-3 py-2">
                <EyeOff className="w-3.5 h-3.5 shrink-0" />
                {ocultosComplementos} complemento{ocultosComplementos > 1 ? 's' : ''} oculto
                {ocultosComplementos > 1 ? 's' : ''} por contraindicação na gestação
              </div>
            )}

            {gruposComplementos.map((grupo) => (
              <div key={grupo.classe} className="flex flex-col gap-1.5">
                <h5 className="text-[11px] font-semibold text-text-faint uppercase tracking-wide">
                  {grupo.classe}
                </h5>
                <div className="border border-border rounded-lg bg-surface divide-y divide-border overflow-hidden">
                  {grupo.tratamentos.map((t) => (
                    <ComplementoLinha
                      key={t.id}
                      tratamento={t}
                      itens={itens}
                      medicamentos={medicamentos}
                      apresentacoes={apresentacoes}
                      gestante={gestante}
                      selecionado={complementosSelecionadosIds.includes(t.id)}
                      onToggle={() => toggleComplemento(t.id)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* coluna direita — preview da receita, sempre visível, some no mobile (a barra de
          copiar continua acessível pela seção acima em telas pequenas via scroll). */}
      <aside className="shrink-0 border-t lg:border-t-0 lg:border-l border-border p-4 lg:p-5 lg:w-[320px] xl:w-[360px] lg:overflow-y-auto">
        <div className="lg:sticky lg:top-0 flex flex-col gap-4 border-2 border-text rounded-[var(--radius-card,14px)] bg-surface p-5">
          <span className="text-[11px] font-bold text-text-dim uppercase tracking-[0.8px]">Receita</span>

          <div>
            <h3 className="font-display text-[22px] leading-tight tracking-[-.6px] text-text">{patologia.nome}</h3>
            {patologia.sinonimos && (
              <p className="text-xs text-text-dim mt-1">Também conhecida como: {patologia.sinonimos}</p>
            )}
          </div>

          {nadaSelecionado ? (
            <p className="text-sm text-text-dim">
              Escolha um esquema e/ou marque complementos pra montar a receita.
            </p>
          ) : (
            <ol className="flex flex-col divide-y divide-border">
              {selecionados.map((t, i) => {
                const [linha1, linha2] = textoTratamentoCompleto(t, itens, medicamentos, apresentacoes).split('\n')
                return (
                  <li key={t.id} className="flex gap-2.5 py-3 first:pt-0 last:pb-0">
                    <span className="text-xs font-bold text-text-dim shrink-0 mt-0.5">{i + 1}.</span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-text">{linha1}</p>
                      {linha2 && <p className="text-xs text-text-dim mt-0.5">{linha2}</p>}
                    </div>
                  </li>
                )
              })}
            </ol>
          )}

          <CopyButton
            texto={textoPrescricao}
            label="Copiar receita"
            variant="solid"
            className={`w-full justify-center text-sm py-3 rounded-[var(--radius-control,12px)] ${
              nadaSelecionado ? 'opacity-50 pointer-events-none' : ''
            }`}
          />

          <div className="flex items-center justify-between gap-3 text-xs text-text-dim">
            <span>{resumoSelecao ?? 'nenhum esquema + 0 complementos'}</span>
            {!nadaSelecionado && (
              <button
                type="button"
                onClick={limparSelecao}
                className="flex items-center gap-1 font-semibold text-text hover:text-danger transition-colors shrink-0"
              >
                <X className="w-3 h-3" />
                Limpar
              </button>
            )}
          </div>
        </div>
      </aside>
    </div>
  )
}
