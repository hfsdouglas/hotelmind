import { Button, Input } from '@hotelmind/ui'
import { Search, X } from 'lucide-react'
import { useEffect, useState } from 'react'

export interface SearchBarProps {
  defaultValue?: string
  value?: string
  onSearch: (value: string) => void
  placeholder?: string
}

export function SearchBar({
  defaultValue = '',
  value,
  onSearch,
  placeholder = 'Pesquisar...',
}: SearchBarProps) {
  const incomingValue = value !== undefined ? value : defaultValue
  const [local, setLocal] = useState(incomingValue)

  useEffect(() => {
    setLocal(incomingValue)
  }, [incomingValue])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSearch(local)
  }

  function handleClear() {
    setLocal('')
    onSearch('')
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <div className="relative max-w-sm flex-1">
        <Input
          value={local}
          onChange={e => setLocal(e.target.value)}
          placeholder={placeholder}
          className={local ? 'pr-9' : ''}
        />
        {Boolean(local) && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none focus-visible:ring-1 focus-visible:ring-ring rounded-sm"
            aria-label="Limpar pesquisa"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      <Button
        type="submit"
        variant="secondary"
        size="icon"
        aria-label="Pesquisar"
      >
        <Search className="h-4 w-4" />
      </Button>
    </form>
  )
}
