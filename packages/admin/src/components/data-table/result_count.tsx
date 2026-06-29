interface ResultCountProps {
  total: number
}

export function ResultCount({ total }: ResultCountProps) {
  return (
    <span className="text-sm text-muted-foreground">
      {total === 1 ? '1 resultado encontrado' : `${total} resultados encontrados`}
    </span>
  )
}
