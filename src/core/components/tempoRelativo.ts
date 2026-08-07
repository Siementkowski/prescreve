/** "há 2 min", "há 3 h", "há 5 dias" — pt-BR, sem depender de libs de data. */
export function tempoRelativo(iso: string, agora: number = Date.now()): string {
  const diffMs = agora - new Date(iso).getTime()
  const diffMin = Math.round(diffMs / 60000)

  if (diffMin < 1) return 'agora mesmo'
  if (diffMin < 60) return `há ${diffMin} min`

  const diffH = Math.round(diffMin / 60)
  if (diffH < 24) return `há ${diffH} h`

  const diffDias = Math.round(diffH / 24)
  if (diffDias === 1) return 'há 1 dia'
  if (diffDias < 7) return `há ${diffDias} dias`

  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}
