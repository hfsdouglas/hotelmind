export function extract_hotel_prefix(hotel_name?: string | null): string {
  if (!hotel_name) return 'HT'
  const stopWords = new Set(['de', 'da', 'do', 'das', 'dos', 'e', 'em'])
  const words = hotel_name
    .trim()
    .split(/\s+/)
    .filter(w => !stopWords.has(w.toLowerCase()))

  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase()
  }
  if (words.length === 1) {
    const clean = words[0].replace(/[^a-zA-Z0-9]/g, '').toUpperCase()
    return clean.length >= 2 ? clean.slice(0, 2) : `${clean}X`.slice(0, 2)
  }
  return 'HT'
}
