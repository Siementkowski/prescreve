import { useEffect, useRef, useState } from 'react'

// Sem medição ainda: sem `alturaPadrao` (Consulta), preenche a altura do container pai —
// é o pai que define o quanto de tela está disponível. Com `alturaPadrao` (preview do
// admin, que fica dentro de um formulário rolável, não da viewport inteira), usa esse
// valor fixo. Nos dois casos, o scroll que aparece por padrão é o interno do iframe.
const ALTURA_MINIMA_ACEITA = 40 // abaixo disso, o valor não parece altura de documento real
const ALTURA_MAXIMA_ACEITA = 20000 // acima disso, é claramente um valor absurdo — ignora

/** Executa HTML colado (geradores de anamnese) isolado num iframe sandbox — nunca no DOM
 *  da aplicação, nunca via dangerouslySetInnerHTML. `sandbox="allow-scripts"` sem
 *  `allow-same-origin` faz o conteúdo rodar numa origem opaca própria: o script roda
 *  normalmente, mas não enxerga localStorage, cookies, nem o DOM/sessão do app — mesmo
 *  isolamento vale pro preview do admin, que é justamente onde se cola código ainda não
 *  conferido.
 *
 *  Altura: como o iframe é cross-origin por causa do sandbox, não dá pra medir o conteúdo
 *  de fora — o próprio HTML avisa a altura via postMessage (ver SNIPPET_ALTURA, exibido na
 *  tela de Geradores). Até chegar o primeiro aviso válido, o iframe preenche o espaço
 *  disponível (ou `alturaPadrao`, se informado) com scroll interno — nunca os dois scrolls
 *  (página + iframe) ao mesmo tempo, porque só um dos dois cresce além do necessário. */
export function HtmlSandbox({
  html,
  className,
  alturaPadrao,
}: {
  html: string
  className?: string
  /** Altura fixa (px) antes/sem medição — omitir faz preencher 100% do container pai
   *  (uso na Consulta, que já reserva a altura da viewport). O preview do admin passa um
   *  valor fixo porque vive dentro de um formulário rolável, não da viewport inteira. */
  alturaPadrao?: number
}) {
  const [alturaMedida, setAlturaMedida] = useState<number | null>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    setAlturaMedida(null) // HTML novo — volta a preencher o espaço até medir de novo
  }, [html])

  useEffect(() => {
    function aoReceberMensagem(e: MessageEvent) {
      // Sandbox sem allow-same-origin faz e.origin vir como "null" — não dá pra validar
      // por origem. Validamos por e.source (é sempre a janela deste iframe específico) e
      // pelo formato exato da mensagem, então uma mensagem de outra origem/aba/iframe não
      // afeta este componente.
      if (e.source !== iframeRef.current?.contentWindow) return
      const dados = e.data
      if (!dados || typeof dados !== 'object' || dados.tipo !== 'prescreve:altura') return
      const altura = dados.altura
      if (typeof altura !== 'number' || !Number.isFinite(altura)) return
      if (altura < ALTURA_MINIMA_ACEITA || altura > ALTURA_MAXIMA_ACEITA) return // valor absurdo — ignora
      setAlturaMedida(Math.round(altura))
    }
    window.addEventListener('message', aoReceberMensagem)
    return () => window.removeEventListener('message', aoReceberMensagem)
  }, [])

  const altura = alturaMedida ?? alturaPadrao ?? '100%'

  return (
    <iframe
      ref={iframeRef}
      srcDoc={html}
      sandbox="allow-scripts"
      title="Gerador"
      className={`w-full border-0 rounded-lg block ${className ?? ''}`}
      style={{ height: altura }}
    />
  )
}

/** Trecho pra colar no HTML do gerador — mede a altura real do documento, avisa o app via
 *  postMessage, e reage a mudanças de conteúdo (seções que abrem, campos que aparecem) com
 *  ResizeObserver. Opcional, mas recomendado: sem ele, o gerador fica na altura padrão com
 *  scroll interno em vez de acompanhar o conteúdo. Exportado pra tela de admin exibir
 *  literalmente o mesmo texto (fonte única, nunca desalinha). */
export const SNIPPET_ALTURA = `<script>
  function avisarAltura() {
    parent.postMessage({ tipo: 'prescreve:altura', altura: document.documentElement.scrollHeight }, '*');
  }
  window.addEventListener('load', avisarAltura);
  new ResizeObserver(avisarAltura).observe(document.documentElement);
</script>`
