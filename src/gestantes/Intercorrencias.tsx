import { AlertTriangle } from 'lucide-react'

/** Intercorrências comuns do pré-natal — conteúdo majoritariamente estático (mesmo
 *  espírito de Aleitamento.tsx na Pediatria): prosa + tabelas de interpretação, sem
 *  cálculo por trás. Fica direto no componente em vez de dados/*.ts porque a maior parte
 *  já é estruturada como tabela/condicional, não como lista homogênea de registros. */
export function Intercorrencias() {
  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="max-w-3xl mx-auto flex flex-col gap-4 pb-16">
        <Secao titulo="Anemia na gravidez">
          <SubTitulo>Interpretação do hemograma</SubTitulo>
          <div className="flex flex-col gap-2.5">
            <Item titulo="Hb ≥ 11 g/dL">
              Considerado normal (hemodiluição fisiológica da gravidez). Suplementação de ferro elementar: 40 mg/dia.
            </Item>
            <Item titulo="Hb < 11 g/dL">
              Anemia diagnosticada. Investigar dieta inadequada e parasitoses; avaliação complementar com hematologista
              se necessário. Suplementação terapêutica: ferro elementar 120 a 240 mg/dia.
            </Item>
          </div>

          <SubTitulo className="mt-4">Definição técnica de anemia na gestação</SubTitulo>
          <ul className="list-disc pl-5 flex flex-col gap-1">
            <li>1º e 3º trimestre: Hb &lt; 11 g/dL ou ferritina &lt; 30 ng/mL.</li>
            <li>2º trimestre: Hb &lt; 10,7 g/dL.</li>
          </ul>
        </Secao>

        <Secao titulo="Aloimunização Rh">
          <div className="flex flex-col gap-3">
            <Item titulo="Rh positivo e Coombs indireto negativo">
              Não há risco de aloimunização Rh. Conduta: pré-natal de rotina.
            </Item>

            <div>
              <p className="text-sm font-semibold text-text mb-1.5">Rh negativo e Coombs indireto negativo</p>
              <p className="text-sm text-text-dim mb-2">Realizar tipagem sanguínea do pai biológico do feto.</p>
              <Tabela
                cabecalho={['Pai Rh negativo', 'Pai Rh positivo ou desconhecido']}
                linhas={[['Sem risco de aloimunização Rh. Pré-natal de rotina.', 'Risco de aloimunização Rh. Coombs indireto mensal + profilaxia com Imunoglobulina anti-D.']]}
              />
            </div>

            <Item titulo="Rh negativo e Coombs indireto positivo" alerta>
              Gestante já está aloimunizada contra o Rh. Conduta: pré-natal de alto risco.
            </Item>
          </div>

          <SubTitulo className="mt-4">Profilaxia (Imunoglobulina anti-D)</SubTitulo>
          <div className="flex flex-col gap-1.5 text-sm">
            <p><strong className="text-text font-semibold">Para quem:</strong> <span className="text-text-dim">gestantes Rh negativas com Coombs indireto negativo.</span></p>
            <p><strong className="text-text font-semibold">Como:</strong> <span className="text-text-dim">Imunoglobulina anti-D 300 µg IM.</span></p>
          </div>
          <p className="text-sm font-semibold text-text mt-2 mb-1">Quando administrar:</p>
          <ul className="list-disc pl-5 flex flex-col gap-1 text-sm text-text-dim">
            <li>Com 28 semanas de gestação.</li>
            <li>Após sangramentos na gestação.</li>
            <li>Após procedimentos intrauterinos invasivos.</li>
            <li>Após trauma abdominal.</li>
            <li>Em até 72 horas após o parto (se o recém-nascido for Rh positivo).</li>
          </ul>
        </Secao>

        <Secao titulo="Sífilis">
          <div className="flex flex-col gap-2.5">
            <Item titulo="Diagnóstico">Teste positivo para sífilis (testes treponêmico e não treponêmico).</Item>
            <Item titulo="Conduta imediata" alerta>Não aguardar confirmação diagnóstica para iniciar tratamento.</Item>
            <Item titulo="Tratamento">
              Gestante: Penicilina Benzatina IM. Parceiro: Penicilina Benzatina IM — sempre tratar concomitantemente.
            </Item>
          </div>

          <SubTitulo className="mt-4">Dose conforme estágio clínico</SubTitulo>
          <Tabela
            cabecalho={['Sífilis recente (< 1 ano)', 'Sífilis tardia (> 1 ano) ou indeterminada']}
            linhas={[['2,4 milhões UI — dose única', '2,4 milhões UI, 1x/semana, por 3 semanas']]}
          />
        </Secao>

        <Secao titulo="Toxoplasmose">
          <SubTitulo>Interpretação sorológica</SubTitulo>
          <Tabela
            cabecalho={['IgM', 'IgG', 'Interpretação', 'Conduta']}
            linhas={[
              ['Negativo', 'Negativo', 'Susceptível (risco de infecção)', 'Orientar medidas preventivas, repetir exames periodicamente'],
              ['Negativo', 'Positivo', 'Imune (infecção antiga)', 'Tranquilizar e acompanhar normalmente'],
              ['Positivo', 'Negativo', 'Infecção recente', 'Avaliação e tratamento imediato'],
              ['Positivo', 'Positivo', 'Avaliar teste de avidez (se IG < 16 semanas)', 'Avaliar tempo da infecção'],
            ]}
          />

          <SubTitulo className="mt-4">Teste de avidez IgG (se gestação &lt; 16 semanas)</SubTitulo>
          <div className="flex flex-col gap-2.5">
            <Item titulo="Baixa avidez" alerta>Indica infecção recente → tratamento imediato.</Item>
            <Item titulo="Alta avidez">Indica infecção antiga (&gt; 4 meses) → tranquilizar e acompanhar.</Item>
          </div>
        </Secao>

        <Secao titulo="Infecção urinária (ITU)">
          <SubTitulo>Aspectos gerais</SubTitulo>
          <ul className="list-disc pl-5 flex flex-col gap-1 text-sm text-text-dim">
            <li>Comum na gestação devido a alterações fisiológicas.</li>
            <li>Pode levar a complicações maternas (pielonefrite, sepse) e fetais (prematuridade, infecções neonatais).</li>
            <li>Triagem com urina tipo I e urocultura é essencial, mesmo em gestantes assintomáticas.</li>
          </ul>

          <SubTitulo className="mt-4">Classificações</SubTitulo>
          <div className="flex flex-col gap-2.5">
            <Item titulo="Bacteriúria assintomática">
              Prevalência de 2% a 15%. Associada a pielonefrite e complicações neonatais. Deve ser sempre tratada.
            </Item>
            <Item titulo="ITU baixa (cistite)">
              Disúria, polaciúria, dor suprapúbica — sem febre ou dor lombar (provavelmente não é pielonefrite). Trata
              empiricamente após coletar urocultura.
            </Item>
            <Item titulo="ITU alta (pielonefrite)" alerta>
              Febre, dor lombar, disúria. Manejo hospitalar, com antibiótico venoso e urocultura. Troca para
              antibiótico oral após melhora em 24-48h.
            </Item>
          </div>

          <SubTitulo className="mt-4">Tratamento</SubTitulo>
          <p className="text-sm text-text-dim mb-1.5">
            Antibióticos seguros: Cefalexina, Amoxicilina, Amoxicilina-Clavulanato, Nitrofurantoína.
          </p>
          <span className="flex items-start gap-1.5 text-[12.5px] font-semibold text-warn bg-warn-dim border border-warn/30 rounded-full px-3 py-1.5 w-fit mb-1.5">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            Nitrofurantoína: evitar no 1º e 3º trimestre
          </span>
          <p className="text-sm text-text-dim">Duração: 3 a 7 dias (ideal ainda não definido).</p>

          <SubTitulo className="mt-4">Exames e diagnóstico</SubTitulo>
          <ul className="list-disc pl-5 flex flex-col gap-1 text-sm text-text-dim">
            <li>Urocultura é indispensável em qualquer sintoma urinário.</li>
            <li>EQU, nitrito e Gram de gota têm baixa acurácia — cuidado com contaminações.</li>
            <li>Resultados de urocultura demoram 2-3 dias — fluxos laboratoriais devem ser otimizados.</li>
          </ul>

          <SubTitulo className="mt-4">ITU de repetição</SubTitulo>
          <p className="text-sm text-text-dim mb-1.5">
            Definida por ≥ 3 uroculturas positivas — excluir diagnósticos incorretos (ex: urina contaminada).
          </p>
          <p className="text-sm font-semibold text-text mb-1">Conduta:</p>
          <ul className="list-disc pl-5 flex flex-col gap-1 text-sm text-text-dim">
            <li>Tratar conforme antibiograma.</li>
            <li>Iniciar quimioprofilaxia: Nitrofurantoína 100 mg/dia ou Cefalexina até o parto (e até ~40 dias no puerpério).</li>
          </ul>

          <SubTitulo className="mt-4">Conduta frente a pielonefrite</SubTitulo>
          <ul className="list-disc pl-5 flex flex-col gap-1 text-sm text-text-dim">
            <li>Internação imediata, iniciar antibiótico venoso (ex: cefalosporina de 3ª geração).</li>
            <li>Avaliar sinais de sepse e iniciar protocolos específicos quando necessário.</li>
          </ul>
        </Secao>

        <p className="text-xs text-text-dim px-0.5">
          Conteúdo de referência — não substitui avaliação clínica individual.
        </p>
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

function SubTitulo({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <p className={`text-[11px] font-bold text-text-dim uppercase tracking-wide mb-2 ${className}`}>{children}</p>
}

function Item({ titulo, alerta, children }: { titulo: string; alerta?: boolean; children: React.ReactNode }) {
  return (
    <div className={alerta ? 'border border-warn/30 bg-warn-dim rounded-lg px-3 py-2.5' : ''}>
      <p className={`text-sm font-semibold flex items-center gap-1.5 ${alerta ? 'text-warn' : 'text-text'}`}>
        {alerta && <AlertTriangle className="w-3.5 h-3.5 shrink-0" />}
        {titulo}
      </p>
      <p className={`text-sm mt-0.5 ${alerta ? 'text-warn/90' : 'text-text-dim'}`}>{children}</p>
    </div>
  )
}

function Tabela({ cabecalho, linhas }: { cabecalho: string[]; linhas: string[][] }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-surface-2">
            {cabecalho.map((c) => (
              <th key={c} className="text-left font-semibold text-text px-3 py-2 border-b border-border whitespace-nowrap">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {linhas.map((linha, i) => (
            <tr key={i} className={i % 2 === 1 ? 'bg-surface-2/40' : ''}>
              {linha.map((celula, j) => (
                <td key={j} className="text-text-dim px-3 py-2.5 align-top border-b border-border last:border-b-0">
                  {celula}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
