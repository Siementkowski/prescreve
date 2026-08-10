import { useMemo } from 'react'
import { EyeOff, ClipboardList } from 'lucide-react'
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
import { TratamentoCard } from './TratamentoCard'
import { CopyButton } from './components/CopyButton'

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

  const textoPrescricao = [principal, ...complementosSelecionados]
    .filter((t): t is NonNullable<typeof t> => !!t)
    .map((t) => textoTratamentoCompleto(t, itens, medicamentos, apresentacoes))
    .join('\n\n')

  const nadaSelecionado = !principal && complementosSelecionados.length === 0

  return (
    <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4 flex flex-col gap-5">
      {!patologia ? (
        <p className="text-sm text-text-dim px-1 py-4">Selecione uma área e uma patologia acima.</p>
      ) : (
        <>
          {patologia.sinonimos && (
            <p className="text-xs text-text-dim -mt-1">Também conhecida como: {patologia.sinonimos}</p>
          )}

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

          {patologia.observacoes && (
            <p className="text-sm text-text-dim -mt-2">{patologia.observacoes}</p>
          )}

          {/* Copiar prescrição — esquema escolhido + complementos marcados, nessa ordem,
              cada um já em duas linhas e separados por linha em branco. */}
          <div
            className={`flex items-center justify-between gap-3 rounded-xl border px-4 py-3 ${
              nadaSelecionado ? 'border-dashed border-border bg-surface-2' : 'border-accent bg-accent-dim'
            }`}
          >
            <div className="flex items-center gap-2 min-w-0">
              <ClipboardList className={`w-4 h-4 shrink-0 ${nadaSelecionado ? 'text-text-faint' : 'text-accent'}`} />
              <span className={`text-sm truncate ${nadaSelecionado ? 'text-text-dim' : 'text-text font-medium'}`}>
                {nadaSelecionado
                  ? 'Escolha um esquema e/ou marque complementos pra copiar tudo junto.'
                  : `${principal ? '1 esquema' : 'nenhum esquema'}${
                      complementosSelecionados.length > 0
                        ? ` + ${complementosSelecionados.length} complemento${complementosSelecionados.length > 1 ? 's' : ''}`
                        : ''
                    }`}
              </span>
            </div>
            <CopyButton
              texto={textoPrescricao}
              label="Copiar prescrição"
              variant="solid"
              className={nadaSelecionado ? 'opacity-50 pointer-events-none' : ''}
            />
          </div>

          {/* Escolha um esquema — só um, agrupado por linha (1ª linha, alternativa...). */}
          <div className="flex flex-col gap-2.5">
            <h4 className="text-xs font-semibold text-text-dim uppercase tracking-wide">Escolha um esquema</h4>

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
                  <div className="flex flex-col gap-3">
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
          </div>

          {/* Adicione se precisar — complementos vinculados, múltipla escolha, agrupados
              por classe. Só aparece quando a patologia tem algum vinculado. */}
          {temComplementos && (
            <div className="flex flex-col gap-2.5">
              <h4 className="text-xs font-semibold text-text-dim uppercase tracking-wide">Adicione se precisar</h4>

              {ocultosComplementos > 0 && (
                <div className="flex items-center gap-2 text-xs text-text-dim bg-surface-2 border border-border rounded-md px-3 py-2">
                  <EyeOff className="w-3.5 h-3.5 shrink-0" />
                  {ocultosComplementos} complemento{ocultosComplementos > 1 ? 's' : ''} oculto
                  {ocultosComplementos > 1 ? 's' : ''} por contraindicação na gestação
                </div>
              )}

              {gruposComplementos.map((grupo) => (
                <div key={grupo.classe} className="flex flex-col gap-2.5">
                  <h5 className="text-[11px] font-semibold text-text-faint uppercase tracking-wide">
                    {grupo.classe}
                  </h5>
                  <div className="flex flex-col gap-3">
                    {grupo.tratamentos.map((t) => (
                      <TratamentoCard
                        key={t.id}
                        tratamento={t}
                        itens={itens}
                        medicamentos={medicamentos}
                        apresentacoes={apresentacoes}
                        gestante={gestante}
                        selecao={{
                          tipo: 'multiplo',
                          selecionado: complementosSelecionadosIds.includes(t.id),
                          onToggle: () => toggleComplemento(t.id),
                        }}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
