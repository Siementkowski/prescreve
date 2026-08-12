import { useEffect, useRef, useState } from 'react'

const ALTURA_PADRAO = 640
const ALTURA_MINIMA = 200
const ALTURA_MAXIMA = 4000

/** Executa HTML colado (geradores de anamnese) isolado num iframe sandbox — nunca no DOM
 *  da aplicação, nunca via dangerouslySetInnerHTML. `sandbox="allow-scripts"` sem
 *  `allow-same-origin` faz o conteúdo rodar numa origem opaca própria: o script roda
 *  normalmente, mas não enxerga localStorage, cookies, nem o DOM/sessão do app — mesmo
 *  isolamento vale pro preview do admin, que é justamente onde se cola código ainda não
 *  conferido.
 *
 *  Altura: como o iframe é cross-origin por causa do sandbox, não dá pra medir o conteúdo
 *  de fora — o próprio HTML avisa a altura via postMessage (ver trecho documentado na tela
 *  de Geradores). Sem esse aviso, fica na altura padrão com scroll interno do iframe. */
export function HtmlSandbox({ html, className }: { html: string; className?: string }) {
  const [altura, setAltura] = useState(ALTURA_PADRAO)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    setAltura(ALTURA_PADRAO)
  }, [html])

  useEffect(() => {
    function aoReceberMensagem(e: MessageEvent) {
      // Sandbox sem allow-same-origin faz e.origin vir como "null" — não dá pra validar
      // por origem. Validamos por e.source (é sempre a janela deste iframe específico) e
      // pelo formato exato da mensagem, então uma mensagem de outra origem/aba não afeta.
      if (e.source !== iframeRef.current?.contentWindow) return
      const dados = e.data
      if (dados && typeof dados === 'object' && dados.tipo === 'prescreve:altura' && typeof dados.altura === 'number') {
        setAltura(Math.min(ALTURA_MAXIMA, Math.max(ALTURA_MINIMA, Math.round(dados.altura))))
      }
    }
    window.addEventListener('message', aoReceberMensagem)
    return () => window.removeEventListener('message', aoReceberMensagem)
  }, [])

  return (
    <iframe
      ref={iframeRef}
      srcDoc={html}
      sandbox="allow-scripts"
      title="Gerador"
      className={`w-full border-0 rounded-lg ${className ?? ''}`}
      style={{ height: altura }}
    />
  )
}

/** Trecho pra colar no `<head>` (ou fim do `<body>`) do HTML do gerador — sem isso, o
 *  iframe fica na altura padrão com scroll interno em vez de ajustar sozinho. Exportado
 *  pra tela de admin exibir literalmente o mesmo texto (fonte única, nunca desalinha). */
export const SNIPPET_ALTURA = `<script>
  function avisarAltura() {
    parent.postMessage({ tipo: 'prescreve:altura', altura: document.documentElement.scrollHeight }, '*');
  }
  window.addEventListener('load', avisarAltura);
  new ResizeObserver(avisarAltura).observe(document.documentElement);
</script>`
