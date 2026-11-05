import { Search } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface SearchBarProps {
  value: string
  onSearch: (value: string) => void
  placeholder?: string
}

export function SearchBar({
  value,
  onSearch,
  placeholder = 'Pesquisar...',
}: SearchBarProps) {
  const [local, setLocal] = useState(value)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSearch(local)
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full gap-2">
      <Input
        value={local}
        onChange={e => setLocal(e.target.value)}
        placeholder={placeholder}
        className="min-w-0 flex-1 md:min-w-[360px]"
      />
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
