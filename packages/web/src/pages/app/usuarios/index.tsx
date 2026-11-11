import type { Usuario } from '@hotelmind/contracts'
import { Pencil, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { usuariosService } from '@/api/usuarios.service'
import type { Column } from '@/components/data-table/data_table'
import { ListPageLayout } from '@/components/data-table/list_page_layout'
import { PagedDataTable } from '@/components/data-table/paged_data_table'
import { SearchBar } from '@/components/data-table/search_bar'
import { Button } from '@/components/ui/button'
import { usePageTitle } from '@/hooks/use_document_title'
import { usePaginacao } from '@/hooks/use_paginacao'

export function UsuariosPage() {
  usePageTitle('Usuários')
  const {
    pagina,
    limite,
    busca,
    ordenar_por,
    direcao,
    setParam,
    setPagina,
    toggleSort,
    isPending,
  } = usePaginacao()

  const columns: Column<Usuario>[] = [
    { key: 'nome_completo', header: 'Nome', sortable: true },
    { key: 'email', header: 'E-mail', sortable: true },
    { key: 'cpf', header: 'CPF' },
    {
      key: 'grupos_ids',
      header: 'Grupos',
      render: row =>
        row.grupos_ids ? (
          <span className="text-xs text-muted-foreground">
            {row.grupos_ids.split(',').length} grupo(s)
          </span>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        ),
    },
    {
      key: 'actions',
      header: '',
      render: row => (
        <div className="flex justify-end">
          <Button variant="ghost" size="icon" asChild>
            <Link to={`/usuarios/${row.id}/editar`}>
              <Pencil className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      ),
    },
  ]

  return (
    <ListPageLayout
      title="Usuários"
      action={
        <Button asChild>
          <Link to="/usuarios/novo">
            <Plus className="h-4 w-4 mr-2" />
            Novo usuário
          </Link>
        </Button>
      }
      searchBar={
        <SearchBar
          value={busca}
          onSearch={v => setParam('busca', v)}
          placeholder="Pesquisar usuários..."
        />
      }
    >
      <PagedDataTable
        columns={columns}
        queryKey={['usuarios', { pagina, limite, busca, ordenar_por, direcao }]}
        queryFn={() =>
          usuariosService.list({
            pagina,
            limite,
            busca: busca || undefined,
            ordenar_por: ordenar_por || undefined,
            direcao,
          })
        }
        label="Resultados de usuários"
        emptyMessage="Nenhum usuário encontrado."
        isPending={isPending}
        pagina={pagina}
        limite={limite}
        onPageChange={setPagina}
        onLimitChange={v => setParam('limite', v)}
        ordenar_por={ordenar_por}
        direcao={direcao}
        onSort={toggleSort}
      />
    </ListPageLayout>
  )
}
