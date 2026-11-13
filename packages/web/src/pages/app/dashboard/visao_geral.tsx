import {
  Button,
  Calendar,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Label,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@hotelmind/ui'
import {
  Baby,
  Bed,
  BedDouble,
  CalendarCheck,
  CalendarX,
  CheckCircle,
  Home as HomeIcon,
  TrendingUp,
  Users,
  UtensilsCrossed,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { PageHeader } from '@/components/layout/page_header'
import { usePageTitle } from '@/hooks/use_document_title'

// Dados mockados - substituir por chamadas de API depois
interface DashboardData {
  totalPessoas: number
  totalCriancas: number
  pessoasPorRegime: {
    regime: string
    quantidade: number
  }[]
  checkInsHoje: number
  checkOutsHoje: number
  reservasConfirmadas: number
  quartosDisponiveis: number
  quartosOcupados: number
  taxaOcupacao: number
  distribuicaoPorTipo: {
    tipo: string
    quantidade: number
  }[]
}

// Função para gerar dados mockados baseados na data selecionada
function generateMockData(date: Date): DashboardData {
  // Simula variação baseada no dia do mês
  const dayOfMonth = date.getDate()
  const baseValue = dayOfMonth % 10

  return {
    totalPessoas: 45 + baseValue * 2,
    totalCriancas: 8 + Math.floor(baseValue / 2),
    pessoasPorRegime: [
      { regime: 'Café da Manhã', quantidade: 20 + baseValue },
      { regime: 'Meia Pensão', quantidade: 15 + Math.floor(baseValue / 2) },
      { regime: 'Pensão Completa', quantidade: 10 + Math.floor(baseValue / 3) },
      { regime: 'Sem Refeição', quantidade: 5 + Math.floor(baseValue / 4) },
    ],
    checkInsHoje: 3 + (baseValue % 3),
    checkOutsHoje: 2 + (baseValue % 2),
    reservasConfirmadas: 12 + baseValue,
    quartosDisponiveis: 15 - (baseValue % 5),
    quartosOcupados: 20 + (baseValue % 5),
    taxaOcupacao: 57 + (baseValue % 10),
    distribuicaoPorTipo: [
      { tipo: 'Standard', quantidade: 12 + (baseValue % 3) },
      { tipo: 'Deluxe', quantidade: 8 + (baseValue % 2) },
      { tipo: 'Suite', quantidade: 5 + (baseValue % 2) },
      { tipo: 'Premium', quantidade: 3 + (baseValue % 1) },
    ],
  }
}

export function VisaoGeral() {
  usePageTitle('Visão Geral')

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const [open, setOpen] = useState(false)
  const [date, setDate] = useState<Date>(new Date())

  // Atualiza os dados quando a data selecionada muda
  const dashboardData = useMemo(() => generateMockData(date), [date])

  return (
    <div className="flex flex-col">
      {/* Header */}
      <PageHeader
        title="Visão Geral"
        description="Dashboard com informações gerais do hotel"
      >
        <div className="flex items-center gap-2">
          <Label htmlFor="date" className="text-sm">
            Data
          </Label>

          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                id="date"
                className="w-36 justify-center font-normal"
              >
                {date ? date.toLocaleDateString() : 'Select date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto overflow-hidden p-0" align="end">
              <Calendar
                mode="single"
                selected={date}
                captionLayout="dropdown"
                onSelect={newdate => {
                  if (newdate) {
                    setDate(newdate)
                    setOpen(false)
                  }
                }}
              />
            </PopoverContent>
          </Popover>
        </div>
      </PageHeader>

      {/* Dashboard Content */}
      <div className="flex-1 space-y-6 overflow-y-auto">
        {/* Métricas Principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total de Pessoas
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {dashboardData.totalPessoas}
              </div>
              <p className="text-xs text-muted-foreground">
                Hóspedes no hotel hoje
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total de Crianças
              </CardTitle>
              <Baby className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {dashboardData.totalCriancas}
              </div>
              <p className="text-xs text-muted-foreground">
                Menores de 12 anos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Taxa de Ocupação
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {dashboardData.taxaOcupacao}%
              </div>
              <p className="text-xs text-muted-foreground">Quartos ocupados</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Reservas Confirmadas
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {dashboardData.reservasConfirmadas}
              </div>
              <p className="text-xs text-muted-foreground">
                Para o período selecionado
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Check-ins e Check-outs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Check-ins Hoje
              </CardTitle>
              <CalendarCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {dashboardData.checkInsHoje}
              </div>
              <p className="text-xs text-muted-foreground">
                Entradas programadas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Check-outs Hoje
              </CardTitle>
              <CalendarX className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {dashboardData.checkOutsHoje}
              </div>
              <p className="text-xs text-muted-foreground">
                Saídas programadas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Quartos Ocupados
              </CardTitle>
              <Bed className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {dashboardData.quartosOcupados}
              </div>
              <p className="text-xs text-muted-foreground">Em uso no momento</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Quartos Disponíveis
              </CardTitle>
              <BedDouble className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {dashboardData.quartosDisponiveis}
              </div>
              <p className="text-xs text-muted-foreground">
                Prontos para reserva
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Regime de Alimentação */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UtensilsCrossed className="h-5 w-5" />
                Pessoas por Regime de Alimentação
              </CardTitle>
              <CardDescription>
                Distribuição dos hóspedes por tipo de plano alimentar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboardData.pessoasPorRegime.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-3 w-3 rounded-full bg-primary" />
                      <span className="text-sm font-medium">{item.regime}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="h-2 w-32 rounded-full bg-muted">
                        <div
                          className="h-2 rounded-full bg-primary"
                          style={{
                            width: `${
                              (item.quantidade / dashboardData.totalPessoas) *
                              100
                            }%`,
                          }}
                        />
                      </div>
                      <span className="w-12 text-right text-sm font-bold">
                        {item.quantidade}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Distribuição por Tipo de Quarto */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HomeIcon className="h-5 w-5" />
                Distribuição por Tipo de Quarto
              </CardTitle>
              <CardDescription>
                Ocupação atual por categoria de acomodação
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {dashboardData.distribuicaoPorTipo.map((item, index) => (
                  <div
                    key={index}
                    className="flex flex-col items-center rounded-lg border bg-muted/50 p-4"
                  >
                    <span className="mb-2 text-sm font-medium">
                      {item.tipo}
                    </span>
                    <span className="text-2xl font-bold">
                      {item.quantidade}
                    </span>
                    <span className="mt-1 text-xs text-muted-foreground">
                      quartos
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
