import { useMemo } from 'react'
import { ClipboardList, Baby, Utensils, Droplets, Moon, SmilePlus, ListChecks, Syringe, Stethoscope, FileCheck, RotateCcw } from 'lucide-react'
import { CopyButton } from '../consulta/components/CopyButton'
import { Secao } from '../gestantes/components/Secao'
import { Campo, ToggleChip, inputCls } from '../gestantes/GuiaConsulta'
import type { FaixaPuericultura } from './dados/guiaPuericultura'
import { CAMPOS, EXAME, FONTANELA, GRUPOS_ORDEM, chaveMarco, montarTexto, orientacoesDaFaixa, visivel, type Campo as CampoDef } from './dados/anamnesePuericultura'
import { useAnamneseStore } from './anamneseStore'
import { vacinasDevidas } from './CalendarioPNI'

const ICONES: Record<(typeof GRUPOS_ORDEM)[number], typeof ClipboardList> = {
  Consulta: ClipboardList,
  Nascimento: Baby,
  Alimentação: Utensils,
  Eliminações: Droplets,
  'Sono e hábitos': Moon,
  'Saúde bucal': SmilePlus,
}

/** Anamnese guiada de Puericultura — mesmo formato do Guia de Consulta das Gestantes
 *  (formulário à esquerda, preview S/O/A/P à direita com botão Copiar), mas os campos se
 *  adaptam à idade escolhida: só aparece o que faz sentido naquela consulta. */
export function GuiaAnamnese({ faixa }: { faixa: FaixaPuericultura }) {
  const s = useAnamneseStore()
  const m = faixa.idadeReferenciaMeses
  const v = (id: string) => s.valores[id] ?? ''

  const devidas = useMemo(() => vacinasDevidas(faixa), [faixa])
  const texto = useMemo(
    () =>
      montarTexto(faixa, devidas, {
        valores: s.valores,
        marcos: s.marcos,
        vacFaltando: s.vacFaltando,
        exameOff: s.exameOff,
        orientOff: s.orientOff,
        planoExtra: s.planoExtra,
      }),
    [faixa, devidas, s.valores, s.marcos, s.vacFaltando, s.exameOff, s.orientOff, s.planoExtra]
  )

  const novaConsulta = () => {
    if (window.confirm('Limpar todos os dados e começar uma nova consulta?')) s.limpar()
  }

  function renderCampo(c: CampoDef) {
    if (c.tipo === 'check') {
      return (
        <div key={c.id} className="sm:col-span-2">
          <ToggleChip ativo={v(c.id) === '1'} onClick={() => s.setValor(c.id, v(c.id) === '1' ? '' : '1')} label={c.label} />
        </div>
      )
    }
    return (
      <Campo key={c.id} label={c.label}>
        {c.tipo === 'select' ? (
          <select value={v(c.id)} onChange={(e) => s.setValor(c.id, e.target.value)} className={inputCls}>
            <option value="">—</option>
            {c.opcoes?.map(([val, rot]) => (
              <option key={val} value={val}>
                {rot}
              </option>
            ))}
          </select>
        ) : (
          <input value={v(c.id)} onChange={(e) => s.setValor(c.id, e.target.value)} placeholder={c.placeholder} className={inputCls + ' w-full'} />
        )}
      </Campo>
    )
  }

  const orientacoes = orientacoesDaFaixa(faixa)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <button
          onClick={novaConsulta}
          className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold px-3 py-1.5 rounded-[var(--radius-pill,999px)] bg-accent hover:bg-accent/90 text-accent-text transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Nova consulta
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 items-start">
        <div className="w-full lg:flex-1 min-w-0 flex flex-col gap-4">
          {GRUPOS_ORDEM.map((grupo) => {
            const campos = CAMPOS.filter((c) => c.grupo === grupo && visivel(c, m))
            if (campos.length === 0 && grupo !== 'Consulta') return null
            return (
              <Secao key={grupo} titulo={grupo} icone={ICONES[grupo]}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {grupo === 'Consulta' && (
                    <Campo label="Acompanhante">
                      <select value={v('acompanhante')} onChange={(e) => s.setValor('acompanhante', e.target.value)} className={inputCls}>
                        <option value="">—</option>
                        {['mãe', 'pai', 'avó', 'responsável'].map((x) => (
                          <option key={x} value={x}>
                            {x[0].toUpperCase() + x.slice(1)}
                          </option>
                        ))}
                      </select>
                    </Campo>
                  )}
                  {campos.map(renderCampo)}
                </div>
              </Secao>
            )
          })}

          {faixa.marcos.length > 0 && (
            <Secao titulo="Desenvolvimento (DNPM)" icone={ListChecks}>
              <p className="text-xs text-text-dim mb-2">Marque o que a criança já faz. O que ficar sem marcar entra como não adquirido.</p>
              <div className="flex flex-wrap gap-2">
                {faixa.marcos.map((x) => (
                  <ToggleChip key={x} ativo={s.marcos.has(chaveMarco(faixa.id, x))} onClick={() => s.alternarMarco(chaveMarco(faixa.id, x))} label={x} />
                ))}
              </div>
              <div className="mt-3">
                <Campo label="Observações (opcional)">
                  <input value={v('dnpmObs')} onChange={(e) => s.setValor('dnpmObs', e.target.value)} className={inputCls + ' w-full'} />
                </Campo>
              </div>
            </Secao>
          )}

          <Secao titulo="Vacinação" icone={Syringe}>
            <div className="flex flex-wrap items-center gap-2">
              <ToggleChip ativo={v('vacSituacao') === 'emDia'} onClick={() => s.setValor('vacSituacao', v('vacSituacao') === 'emDia' ? '' : 'emDia')} label="Em dia, conforme caderneta" />
              <ToggleChip
                ativo={v('vacSituacao') === 'incompleto'}
                onClick={() => s.setValor('vacSituacao', v('vacSituacao') === 'incompleto' ? '' : 'incompleto')}
                label="Incompleto"
                alerta
              />
            </div>
            {v('vacSituacao') === 'incompleto' && (
              <div className="mt-3">
                <p className="text-xs text-text-dim mb-2">Quais estão faltando?</p>
                <div className="flex flex-wrap gap-2">
                  {devidas.map((n) => (
                    <ToggleChip key={n} ativo={s.vacFaltando.has(n)} onClick={() => s.alternarVacina(n)} label={n} alerta />
                  ))}
                </div>
              </div>
            )}
          </Secao>

          <Secao titulo="Exame físico" icone={Stethoscope}>
            <div className="grid grid-cols-3 gap-3 mb-3">
              <Campo label="Peso (g)">
                <input inputMode="decimal" value={v('peso')} onChange={(e) => s.setValor('peso', e.target.value)} className={inputCls + ' w-full'} />
              </Campo>
              <Campo label="Estatura (cm)">
                <input inputMode="decimal" value={v('estatura')} onChange={(e) => s.setValor('estatura', e.target.value)} className={inputCls + ' w-full'} />
              </Campo>
              {m <= 24 && (
                <Campo label="PC (cm)">
                  <input inputMode="decimal" value={v('pc')} onChange={(e) => s.setValor('pc', e.target.value)} className={inputCls + ' w-full'} />
                </Campo>
              )}
            </div>
            {m <= 18 && (
              <div className="mb-3 max-w-xs">
                <Campo label="Fontanela anterior">
                  <select value={v('fontanela')} onChange={(e) => s.setValor('fontanela', e.target.value)} className={inputCls}>
                    <option value="">—</option>
                    {FONTANELA.map(([val, rot]) => (
                      <option key={val} value={val}>
                        {rot}
                      </option>
                    ))}
                  </select>
                </Campo>
              </div>
            )}
            <p className="text-xs text-text-dim mb-2">Tudo começa como sem alterações. Desligue o que estiver alterado e descreva abaixo.</p>
            <div className="flex flex-wrap gap-2">
              {EXAME.filter((x) => visivel(x, m)).map((x) => (
                <ToggleChip key={x.id} ativo={!s.exameOff.has(x.id)} onClick={() => s.alternarExame(x.id)} label={x.label} alerta={s.exameOff.has(x.id)} />
              ))}
            </div>
            <div className="mt-3">
              <Campo label="Achados / alterações">
                <textarea value={v('achados')} onChange={(e) => s.setValor('achados', e.target.value)} rows={2} className={inputCls + ' w-full resize-none'} />
              </Campo>
            </div>
          </Secao>

          <Secao titulo="Avaliação e plano" icone={FileCheck}>
            <div className="flex flex-col gap-3">
              <div>
                <p className="text-xs font-semibold text-text-dim mb-2">Orientações dadas</p>
                <div className="flex flex-wrap gap-2">
                  {orientacoes.map((o) => (
                    <ToggleChip key={o.id} ativo={!s.orientOff.has(o.id)} onClick={() => s.alternarOrient(o.id)} label={o.label} />
                  ))}
                </div>
              </div>
              <Campo label="Avaliação (opcional)">
                <input value={v('avaliacao')} onChange={(e) => s.setValor('avaliacao', e.target.value)} className={inputCls + ' w-full'} />
              </Campo>
              <Campo label="Plano extra (opcional)">
                <textarea value={s.planoExtra} onChange={(e) => s.setPlanoExtra(e.target.value)} rows={2} className={inputCls + ' w-full resize-none'} />
              </Campo>
            </div>
          </Secao>
        </div>

        <div className="w-full lg:w-[420px] lg:shrink-0 lg:sticky lg:top-4">
          <div className="bg-surface border border-text rounded-[var(--radius-panel,18px)] p-4 flex flex-col gap-2.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-bold text-text-dim uppercase tracking-wide">Preview</span>
              <CopyButton texto={texto} label="Copiar" variant="solid" />
            </div>
            <pre className="text-[11px] text-text whitespace-pre-wrap font-sans leading-relaxed bg-surface-2 rounded-[var(--radius-item,11px)] p-3 max-h-[calc(100vh-8rem)] overflow-y-auto">
              {texto}
            </pre>
          </div>
        </div>
      </div>
    </div>
  )
}
