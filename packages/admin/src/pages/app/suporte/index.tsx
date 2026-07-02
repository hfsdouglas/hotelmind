import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { hoteisService } from '@/api/hoteis.service'
import { suporteService } from '@/api/suporte.service'
import { usePaginacao } from '@/hooks/usePaginacao'
import { DataTable } from '@/components/data-table/data_table'
import { DataTablePagination } from '@/components/data-table/data_table_pagination'
import { SearchBar } from '@/components/data-table/search_bar'
import { ResultCount } from '@/components/data-table/result_count'
import { Button } from '@/components/ui/button'
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
import type { Hotel } from '@/api/hoteis.service'

export function SuportePage() {
  const { pagina, limite, busca, ordenar_por, direcao, setParam, setPagina, toggleSort } =
    usePaginacao()

  const { data, isLoading } = useQuery({
    queryKey: ['admin:suporte:hoteis', pagina, limite, busca, ordenar_por, direcao],
    queryFn: () => hoteisService.list({ status: 'S', pagina, limite, busca, ordenar_por, direcao }),
  })

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
    window.open(suporteService.buildAcessoUrl(activeHotel.id, selectedUserId), '_blank')
    closePicker()
  }

  const columns = [
    { key: 'nome_fantasia' as const, label: 'Nome Fantasia', sortable: true },
    { key: 'cnpj' as const, label: 'CNPJ', sortable: false },
    { key: 'email_comercial' as const, label: 'E-mail', sortable: false },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Suporte</h1>
      </div>

      <SearchBar defaultValue={busca} onSearch={v => setParam('busca', v)} />

      {data && <ResultCount total={data.meta.total} />}

      <DataTable<Hotel>
        columns={columns}
        rows={data?.data ?? []}
        isLoading={isLoading}
        ordenar_por={ordenar_por}
        direcao={direcao}
        onSort={toggleSort}
        renderActions={row => (
          <Button size="sm" onClick={() => openPicker(row)}>
            Acessar
          </Button>
        )}
      />

      {data && (
        <DataTablePagination
          pagina={data.meta.pagina}
          ultima_pagina={data.meta.ultima_pagina}
          limite={limite}
          onPagina={setPagina}
          onLimite={v => setParam('limite', String(v))}
        />
      )}

      <AlertDialog open={!!activeHotel} onOpenChange={open => !open && closePicker()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Acessar como...</AlertDialogTitle>
            <AlertDialogDescription>
              Escolha qual usuário de {activeHotel?.nome_fantasia} você deseja acessar.
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
            <AlertDialogAction disabled={!selectedUserId} onClick={handleAcessar}>
              Acessar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
