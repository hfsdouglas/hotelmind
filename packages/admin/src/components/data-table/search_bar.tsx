import { Button, Input } from '@hotelmind/ui'
import { Search, X } from 'lucide-react'
import { useEffect, useState } from 'react'

export interface SearchBarProps {
  value?: string
  defaultValue?: string
  onSearch: (value: string) => void
  placeholder?: string
}

export function SearchBar({
  value,
  defaultValue = '',
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
    <form onSubmit={handleSubmit} className="flex w-full gap-2">
      <div className="relative min-w-0 flex-1 md:min-w-[360px]">
        <Input
          value={local}
          onChange={e => setLocal(e.target.value)}
          placeholder={placeholder}
          className={local ? 'pr-9 w-full' : 'w-full'}
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
        size="default"
        className="shrink-0"
      >
        <Search className="mr-2 h-4 w-4" />
        Pesquisar
      </Button>
    </form>
  )
}
