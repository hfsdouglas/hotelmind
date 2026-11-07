import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import type { Hotel } from '@/api/hoteis.service'
import { hoteisService } from '@/api/hoteis.service'
import { suporteService } from '@/api/suporte.service'
import type { Column } from '@/components/data-table/data_table'
import { ListPageLayout } from '@/components/data-table/list_page_layout'
import { PagedDataTable } from '@/components/data-table/paged_data_table'
import { SearchBar } from '@/components/data-table/search_bar'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { usePageTitle } from '@/hooks/use_document_title'
import { usePaginacao } from '@/hooks/usePaginacao'

export function SuportePage() {
  usePageTitle('Suporte')
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

  const [activeHotel, setActiveHotel] = useState<Hotel | null>(null)
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)

  const { data: usuarios } = useQuery({
    queryKey: ['admin:suporte:usuarios', activeHotel?.id],
    queryFn: () => suporteService.listarUsuarios(activeHotel!.id),
    enabled: !!activeHotel,
  })

  function openPicker(hotel: Hotel) {
    setActiveHotel(hotel)
    setSelectedUserId(null)
  }

  function closePicker() {
    setActiveHotel(null)
    setSelectedUserId(null)
  }

  function handleAcessar() {
    if (!activeHotel || !selectedUserId) return
    window.open(
      suporteService.buildAcessoUrl(activeHotel.id, selectedUserId),
      '_blank'
    )
    closePicker()
  }

  const columns: Column<Hotel>[] = [
    { key: 'nome_fantasia', label: 'Nome Fantasia', sortable: true },
    { key: 'cnpj', label: 'CNPJ', sortable: false },
    { key: 'email_comercial', label: 'E-mail', sortable: false },
  ]

  return (
    <ListPageLayout
      title="Suporte"
      searchBar={
        <SearchBar defaultValue={busca} onSearch={v => setParam('busca', v)} />
      }
    >
      <PagedDataTable
        columns={columns}
        queryKey={[
          'admin:suporte:hoteis',
          pagina,
          limite,
          busca,
          ordenar_por,
          direcao,
        ]}
        queryFn={() =>
          hoteisService.list({
            status: 'S',
            pagina,
            limite,
            busca,
            ordenar_por,
            direcao,
          })
        }
        label="Hotéis disponíveis para suporte"
        isPending={isPending}
        pagina={pagina}
        limite={limite}
        onPagina={setPagina}
        onLimite={v => setParam('limite', String(v))}
        ordenar_por={ordenar_por}
        direcao={direcao}
        onSort={toggleSort}
        renderActions={row => (
          <Button size="sm" onClick={() => openPicker(row)}>
            Acessar
          </Button>
        )}
      />

      <AlertDialog
        open={!!activeHotel}
        onOpenChange={open => !open && closePicker()}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Acessar como...</AlertDialogTitle>
            <AlertDialogDescription>
              Escolha qual usuário de {activeHotel?.nome_fantasia} você deseja
              acessar.
            </AlertDialogDescription>
          </AlertDialogHeader>

          {usuarios && usuarios.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Este hotel não possui usuários.
            </p>
          ) : (
            <div className="space-y-2">
              {(usuarios ?? []).map(u => (
                <label
                  key={u.id}
                  className="flex cursor-pointer items-center gap-2 rounded-md border p-2 hover:bg-accent"
                >
                  <input
                    type="radio"
                    name="suporte-usuario"
                    checked={selectedUserId === u.id}
                    onChange={() => setSelectedUserId(u.id)}
                  />
                  <span className="text-sm">{u.nome_completo}</span>
                </label>
              ))}
            </div>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              disabled={!selectedUserId}
              onClick={handleAcessar}
            >
              Acessar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ListPageLayout>
  )
}
