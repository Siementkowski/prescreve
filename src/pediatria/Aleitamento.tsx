import { useMemo, useState } from 'react'
import { useSyncStore } from '../core/sync'
import { SearchInput } from '../admin/components/SearchInput'
import { StatusRiscoBadge } from '../admin/components/StatusRiscoBadge'

/** Aleitamento — conteúdo de apoio majoritariamente estático (técnica, dificuldades
 *  comuns, contraindicações, conservação do leite), mais uma busca rápida no catálogo de
 *  medicamentos já existente (campo lactacao_status, cadastrado em Painel → Medicamentos)
 *  pra não duplicar essa informação em lugar nenhum. */
export function Aleitamento() {
  const medicamentos = useSyncStore((s) => s.medicamentos)
  const [busca, setBusca] = useState('')

  const resultados = useMemo(() => {
    const t = busca.trim().toLowerCase()
    if (!t) return []
    return medicamentos
      .filter((m) => m.nome.toLowerCase().includes(t) || (m.nome_comercial ?? '').toLowerCase().includes(t))
      .slice(0, 8)
  }, [medicamentos, busca])

  return (
    <div className="h-full overflow-y-auto p-4">
      <div className="max-w-3xl mx-auto flex flex-col gap-5 pb-10">
        <Secao titulo="Técnica e pega">
          <ul className="list-disc pl-5 flex flex-col gap-1.5">
            <li>Boa pega: boca bem aberta, abocanhando aréola (não só o mamilo), lábio inferior evertido, queixo tocando a mama.</li>
            <li>Postura: bebê de frente pro corpo da mãe, barriga com barriga, cabeça e corpo alinhados.</li>
            <li>Sinais de fome precoce: leva mãos à boca, movimentos de busca, sucção de dedos — mais confiáveis que o choro (sinal tardio).</li>
            <li>Sinais de mamada eficaz: deglutição audível, mama esvaziando, criança solta o peito sozinha, ganho de peso adequado.</li>
          </ul>
        </Secao>

        <Secao titulo="Dificuldades comuns">
          <div className="flex flex-col gap-3">
            <Item titulo="Ingurgitamento mamário">
              Mama tensa, dolorosa, brilhante. Conduta: manter amamentação frequente, ordenha de alívio antes da mamada se aréola estiver tensa, compressas frias entre mamadas, analgesia se necessário.
            </Item>
            <Item titulo="Fissuras mamilares">
              Geralmente por pega inadequada — corrigir a pega é a conduta principal. Considerar leite materno no local, evitar produtos que ressecam o mamilo.
            </Item>
            <Item titulo="Mastite">
              Dor, hiperemia, calor localizado, febre. Manter amamentação (inclusive do lado afetado), esvaziamento frequente, antibiótico se sinais de infecção bacteriana não melhorarem em 12-24h.
            </Item>
            <Item titulo="Baixa produção percebida">
              Frequentemente é percepção, não produção real — avaliar ganho de peso da criança antes de intervir. Aumentar frequência das mamadas costuma ser a primeira medida.
            </Item>
          </div>
        </Secao>

        <Secao titulo="Contraindicações ao aleitamento">
          <ul className="list-disc pl-5 flex flex-col gap-1.5">
            <li>HIV materno (no Brasil, contraindicação absoluta, independente de carga viral).</li>
            <li>HTLV-1 e HTLV-2.</li>
            <li>Uso materno de drogas ilícitas.</li>
            <li>Alguns medicamentos maternos incompatíveis (ver busca abaixo) — quimioterápicos, radiofármacos, entre outros.</li>
            <li>Galactosemia clássica no lactente (contraindica leite humano, não é contraindicação materna).</li>
          </ul>
        </Secao>

        <Secao titulo="Medicamentos e amamentação">
          <p className="text-sm text-text-dim mb-2">
            Busca no catálogo de medicamentos já cadastrado (mesmo campo usado na Consulta).
          </p>
          <SearchInput value={busca} onChange={setBusca} placeholder="Buscar medicamento…" />
          {busca.trim() && (
            <div className="flex flex-col gap-1.5 mt-3">
              {resultados.length === 0 ? (
                <p className="text-sm text-text-dim">Nenhum medicamento encontrado.</p>
              ) : (
                resultados.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center justify-between gap-2 border border-border rounded-lg px-3 py-2"
                  >
                    <span className="text-sm text-text truncate">{m.nome}</span>
                    <StatusRiscoBadge status={m.lactacao_status} />
                  </div>
                ))
              )}
            </div>
          )}
        </Secao>

        <Secao titulo="Ordenha e armazenamento do leite">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <CardArmazenamento titulo="Temperatura ambiente" valor="Até 4 horas" nota="Em local até 25°C" />
            <CardArmazenamento titulo="Geladeira" valor="Até 12 horas" nota="Evitar a porta da geladeira" />
            <CardArmazenamento titulo="Freezer" valor="15 a 30 dias" nota="Abaixo de -18°C; 10 dias se for doação" />
          </div>
          <p className="text-xs text-text-dim mt-3">
            Fonte: Ministério da Saúde / Rede Brasileira de Bancos de Leite Humano. Usar frascos com fechamento hermético, livres de BPA.
          </p>
        </Secao>
      </div>
    </div>
  )
}

function Secao({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div className="border border-border rounded-xl bg-surface p-4">
      <h2 className="font-display text-lg font-semibold text-text mb-3">{titulo}</h2>
      <div className="text-sm text-text-dim leading-relaxed">{children}</div>
    </div>
  )
}

function Item({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-sm font-semibold text-text">{titulo}</p>
      <p className="text-sm text-text-dim mt-0.5">{children}</p>
    </div>
  )
}

function CardArmazenamento({ titulo, valor, nota }: { titulo: string; valor: string; nota: string }) {
  return (
    <div className="rounded-lg bg-surface-2 border border-border p-3">
      <p className="text-[11px] text-text-dim uppercase tracking-wide">{titulo}</p>
      <p className="text-base font-semibold text-text mt-0.5">{valor}</p>
      <p className="text-xs text-text-dim mt-1">{nota}</p>
    </div>
  )
}
