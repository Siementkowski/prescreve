import { ShieldAlert, ShieldCheck, Syringe } from 'lucide-react'
import { VACINAS_CONTRAINDICADAS, VACINAS_INDICADAS, ESQUEMA_TETANO } from './dados/vacinas'
import { useGestantesStore, igAtualDaStore } from './store'
import { formatarIG } from './idade'

/** Vacinação na gestação — conteúdo majoritariamente estático (mesmo espírito de
 *  Aleitamento na Pediatria). Só a semana atual (se já calculada em Pré-natal, via store
 *  compartilhada) contextualiza o aviso da dTpa/tétano, que tem janela ideal marcada. */
export function Vacinacao() {
  const ig = useGestantesStore(igAtualDaStore)

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="max-w-3xl mx-auto flex flex-col gap-4 pb-16">
        <Secao titulo="Vacinas com vírus atenuado — contraindicadas" icone={ShieldAlert} tom="danger">
          <div className="flex flex-wrap gap-2">
            {VACINAS_CONTRAINDICADAS.map((v) => (
              <span
                key={v}
                className="text-[13px] font-semibold text-danger bg-danger-dim border border-danger/30 rounded-full px-3 py-1.5"
              >
                {v}
              </span>
            ))}
          </div>
        </Secao>

        <Secao titulo="Vacinas indicadas" icone={ShieldCheck} tom="ok">
          <div className="flex flex-col gap-2">
            {VACINAS_INDICADAS.map((v) => (
              <div key={v.nome} className="border border-border rounded-lg px-3.5 py-2.5">
                <strong className="block text-sm font-semibold text-text">{v.nome}</strong>
                {v.observacao && <span className="block text-xs text-text-dim mt-0.5">{v.observacao}</span>}
              </div>
            ))}
          </div>
        </Secao>

        <Secao titulo="Esquema para tétano" icone={Syringe}>
          {ig && (
            <p className="text-xs text-text-dim mb-2.5">
              Idade gestacional atual: {formatarIG(ig)} (calculada em Pré-natal)
              {ig.semanas >= 18 && ig.semanas <= 22 ? ' — dentro da janela ideal de aplicação.' : '.'}
            </p>
          )}
          <ul className="flex flex-col gap-1.5">
            {ESQUEMA_TETANO.map((item) => (
              <li key={item} className="text-sm text-text-dim leading-snug">
                • {item}
              </li>
            ))}
          </ul>
        </Secao>
      </div>
    </div>
  )
}

function Secao({
  titulo,
  icone: Icone,
  tom,
  children,
}: {
  titulo: string
  icone: typeof ShieldAlert
  tom?: 'danger' | 'ok'
  children: React.ReactNode
}) {
  const corIcone = tom === 'danger' ? 'text-danger' : tom === 'ok' ? 'text-ok' : 'text-text-dim'
  return (
    <div className="border border-border rounded-xl bg-surface p-4">
      <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-text mb-3">
        <Icone className={`w-[18px] h-[18px] ${corIcone}`} />
        {titulo}
      </h2>
      {children}
    </div>
  )
}
