import { CAMPO_META, FORMAS_CONFIG, type DadosCamposForma, type FormaFarmaceutica } from '../../core/formas'
import { numOuNull } from '../numeric'
import { TextField } from './Field'

/** Campos numéricos/texto de uma apresentação, renderizados a partir de
 *  `FORMAS_CONFIG[forma].campos` — trocar a forma troca os campos sozinho, sem nenhum
 *  `if (forma === 'gotas')` espalhado pela tela. Cada chave de campo tem exatamente um
 *  widget fixo em CAMPO_META (core/formas.ts); esta função só faz o `.map()`. */
export function CamposFormaDinamicos({
  forma,
  dados,
  onChange,
  destacarFaltando = false,
}: {
  forma: string
  dados: DadosCamposForma
  onChange: (patch: Partial<DadosCamposForma>) => void
  /** Depois de uma tentativa de salvar sem sucesso — pinta em vermelho só os campos que a
   *  forma exige e ainda estão vazios, sem travar a digitação. */
  destacarFaltando?: boolean
}) {
  const config = FORMAS_CONFIG[forma as FormaFarmaceutica]
  if (!config) return null

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
      {config.campos.map((chave) => {
        const meta = CAMPO_META[chave]
        const faltando = destacarFaltando && !meta.preenchido(dados)
        const erroClass = faltando ? 'border-danger/60' : ''

        if (chave === 'concentracao') {
          return (
            <div key={chave} className="col-span-2 sm:col-span-2 grid grid-cols-2 gap-2">
              <TextField
                label={meta.label}
                type="number"
                step="any"
                value={dados.concentracao ?? ''}
                onChange={(e) => onChange({ concentracao: numOuNull(e.target.value) })}
                placeholder={meta.placeholder}
                className={erroClass}
              />
              <TextField
                label={meta.unidade!.label}
                value={dados.unidade ?? ''}
                onChange={(e) => onChange({ unidade: e.target.value })}
                placeholder={meta.unidade!.placeholder}
                className={erroClass}
              />
            </div>
          )
        }

        if (chave === 'por_volume') {
          return (
            <div key={chave} className="col-span-2 sm:col-span-2 grid grid-cols-2 gap-2">
              <TextField
                label={meta.label}
                hint={meta.hint}
                type="number"
                step="any"
                value={dados.por_volume ?? ''}
                onChange={(e) => onChange({ por_volume: numOuNull(e.target.value) })}
                placeholder={meta.placeholder}
                className={erroClass}
              />
              <TextField
                label={meta.unidade!.label}
                value={dados.por_volume_unidade ?? ''}
                onChange={(e) => onChange({ por_volume_unidade: e.target.value })}
                placeholder={meta.unidade!.placeholder}
                className={erroClass}
              />
            </div>
          )
        }

        // Campos de valor único (gotas_por_ml, volume_ampola, concentracao_percentual, peso_tubo).
        const valorAtual = dados[chave] as number | null
        return (
          <TextField
            key={chave}
            label={meta.label}
            hint={meta.hint}
            type="number"
            step="any"
            value={valorAtual ?? ''}
            onChange={(e) => onChange({ [chave]: numOuNull(e.target.value) } as Partial<DadosCamposForma>)}
            placeholder={meta.placeholder}
            className={erroClass}
          />
        )
      })}
    </div>
  )
}
