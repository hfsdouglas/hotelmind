import { useState } from 'react'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface SearchBarProps {
  defaultValue?: string
  onSearch: (value: string) => void
  placeholder?: string
}

export function SearchBar({ defaultValue = '', onSearch, placeholder = 'Pesquisar...' }: SearchBarProps) {
  const [local, setLocal] = useState(defaultValue)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSearch(local)
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input
        value={local}
        onChange={e => setLocal(e.target.value)}
        placeholder={placeholder}
        className="max-w-sm"
      />
      <Button type="submit" variant="secondary" size="icon">
        <Search className="h-4 w-4" />
      </Button>
    </form>
  )
}
