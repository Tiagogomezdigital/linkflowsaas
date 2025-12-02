'use client'

import { useState, useMemo } from 'react'
import { 
  FileText, 
  Download, 
  Calendar, 
  Filter as FilterIcon, 
  ChevronDown,
  ChevronUp,
  Check,
  BarChart3,
  TrendingUp,
  Users,
  MousePointerClick
} from 'lucide-react'
import Header from '@/components/layout/Header'
import Button from '@/components/ui/Button'
import Select from '@/components/ui/Select'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import EmptyState from '@/components/ui/EmptyState'
import type { Group } from '@/types'

// Mock data
const mockGroups: Group[] = [
  { id: '1', company_id: '1', name: 'Grupo Teste Guilherme', slug: 'grupo-teste-guilherme', is_active: true, created_at: '', updated_at: '' },
  { id: '2', company_id: '1', name: 'Form Test Group 1763981674072', slug: 'form-test-group-1763981674072', is_active: true, created_at: '', updated_at: '' },
  { id: '3', company_id: '1', name: 'Form Test Group 1763981673211', slug: 'form-test-group-1763981673211', is_active: true, created_at: '', updated_at: '' },
  { id: '4', company_id: '1', name: 'Form Test Group 1763981671079', slug: 'form-test-group-1763981671079', is_active: true, created_at: '', updated_at: '' },
  { id: '5', company_id: '1', name: 'Teste E2E Vendas', slug: 'teste-e2e-vendas', is_active: true, created_at: '', updated_at: '' },
  { id: '6', company_id: '1', name: 'Grupo Beta Teste', slug: 'grupo-beta-teste', is_active: true, created_at: '', updated_at: '' },
  { id: '7', company_id: '1', name: 'Grupo Alpha Teste', slug: 'grupo-alpha-teste', is_active: true, created_at: '', updated_at: '' },
]

const mockDailyClicks = [
  { date: '2025-11-26', clicks: 45 },
  { date: '2025-11-27', clicks: 67 },
  { date: '2025-11-28', clicks: 52 },
  { date: '2025-11-29', clicks: 89 },
  { date: '2025-11-30', clicks: 34 },
  { date: '2025-12-01', clicks: 78 },
  { date: '2025-12-02', clicks: 56 },
]

const mockGroupRanking = [
  { group_id: '1', group_name: 'Grupo Teste Guilherme', clicks: 156 },
  { group_id: '5', group_name: 'Teste E2E Vendas', clicks: 89 },
  { group_id: '2', group_name: 'Form Test Group 1763981674072', clicks: 67 },
  { group_id: '6', group_name: 'Grupo Beta Teste', clicks: 45 },
  { group_id: '7', group_name: 'Grupo Alpha Teste', clicks: 32 },
]

const mockDeviceDistribution = [
  { device_type: 'mobile', count: 245, percentage: 65 },
  { device_type: 'desktop', count: 98, percentage: 26 },
  { device_type: 'tablet', count: 34, percentage: 9 },
]

const periodOptions = [
  { value: 'today', label: 'Hoje' },
  { value: 'yesterday', label: 'Ontem' },
  { value: 'last7days', label: 'Últimos 7 dias' },
  { value: 'last30days', label: 'Últimos 30 dias' },
  { value: 'thisMonth', label: 'Este mês' },
  { value: 'lastMonth', label: 'Mês passado' },
]

export default function RelatoriosPage() {
  const [isFiltersOpen, setIsFiltersOpen] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState('today')
  const [selectedGroups, setSelectedGroups] = useState<string[]>(mockGroups.map(g => g.id))
  const [isLoading, setIsLoading] = useState(false)
  const [reportGenerated, setReportGenerated] = useState(false)

  const todayDate = new Date().toLocaleDateString('pt-BR')

  const handleSelectAll = () => {
    setSelectedGroups(mockGroups.map(g => g.id))
  }

  const handleSelectNone = () => {
    setSelectedGroups([])
  }

  const toggleGroup = (groupId: string) => {
    setSelectedGroups(prev =>
      prev.includes(groupId)
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    )
  }

  const handleGenerateReport = async () => {
    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1500))
      setReportGenerated(true)
    } finally {
      setIsLoading(false)
    }
  }

  const handleExportCSV = () => {
    // Simular exportação CSV
    alert('Exportando relatório em CSV...')
  }

  const totalClicks = useMemo(() => {
    return mockDailyClicks.reduce((acc, day) => acc + day.clicks, 0)
  }, [])

  const maxClicks = useMemo(() => {
    return Math.max(...mockDailyClicks.map(d => d.clicks))
  }, [])

  return (
    <>
      <Header
        title="Relatórios"
        description="Visualize e exporte relatórios de click dos grupos."
        breadcrumbs={[{ label: 'Relatórios de Links' }]}
        actions={
          <Button
            variant="outline"
            leftIcon={<Download className="w-4 h-4" />}
            onClick={handleExportCSV}
            disabled={!reportGenerated}
          >
            Exportar CSV
          </Button>
        }
      />

      {/* Filtros Avançados */}
      <Card className="mb-6">
        <div className="flex flex-col gap-6">
          {/* Header dos Filtros */}
          <button
            onClick={() => setIsFiltersOpen(!isFiltersOpen)}
            className="flex items-center justify-between w-full"
          >
            <div className="flex items-center gap-3">
              <FilterIcon className="w-5 h-5 text-text-muted" />
              <h2 className="text-xl font-semibold text-white">Filtros Avançados</h2>
              <Badge variant="success" size="sm">
                Dados carregados
              </Badge>
            </div>
            {isFiltersOpen ? (
              <ChevronUp className="w-5 h-5 text-text-muted" />
            ) : (
              <ChevronDown className="w-5 h-5 text-text-muted" />
            )}
          </button>

          {isFiltersOpen && (
            <>
              {/* Info */}
              <div className="flex items-center gap-6 text-sm text-text-secondary">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>Hoje: {todayDate}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FilterIcon className="w-4 h-4" />
                  <span>Grupos: {selectedGroups.length} selecionados</span>
                </div>
              </div>

              {/* Período */}
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Período
                </label>
                <Select
                  options={periodOptions}
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                />
              </div>

              {/* Grupos */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium text-text-secondary">
                    Grupos
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleSelectAll}
                      className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                        selectedGroups.length === mockGroups.length
                          ? 'bg-surface-hover text-white'
                          : 'text-text-muted hover:text-white'
                      }`}
                    >
                      Todos
                    </button>
                    <button
                      onClick={handleSelectNone}
                      className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                        selectedGroups.length === 0
                          ? 'bg-surface-hover text-white'
                          : 'text-text-muted hover:text-white'
                      }`}
                    >
                      Nenhum
                    </button>
                  </div>
                </div>

                <div className="max-h-60 overflow-y-auto space-y-1 bg-background/50 rounded-xl p-3 border border-surface-border">
                  {mockGroups.map((group) => (
                    <label
                      key={group.id}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-surface-hover cursor-pointer transition-colors"
                    >
                      <div className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${
                        selectedGroups.includes(group.id)
                          ? 'bg-lime-500 border-lime-500'
                          : 'border-surface-border'
                      }`}>
                        {selectedGroups.includes(group.id) && (
                          <Check className="w-3 h-3 text-black" />
                        )}
                      </div>
                      <span className="text-sm text-white">{group.name}</span>
                    </label>
                  ))}
                </div>

                <p className="mt-2 text-xs text-text-muted">
                  {selectedGroups.length} de {mockGroups.length} grupos selecionados
                </p>
              </div>

              {/* Botão Gerar */}
              <Button
                variant="primary"
                className="w-full"
                onClick={handleGenerateReport}
                isLoading={isLoading}
              >
                Gerar Relatório
              </Button>
            </>
          )}
        </div>
      </Card>

      {/* Área do Relatório */}
      {!reportGenerated ? (
        <Card>
          <EmptyState
            icon={<FileText className="w-8 h-8" />}
            title="Nenhum relatório gerado"
            description="Configure os filtros acima e clique em 'Gerar Relatório' para visualizar os dados."
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Resumo */}
          <Card className="lg:col-span-2">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-lime-500/10">
                  <MousePointerClick className="w-6 h-6 text-lime-400" />
                </div>
                <div>
                  <p className="text-sm text-text-muted">Total de Cliques</p>
                  <p className="text-2xl font-bold text-white">{totalClicks}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-blue-500/10">
                  <Users className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-text-muted">Grupos Ativos</p>
                  <p className="text-2xl font-bold text-white">{selectedGroups.length}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-purple-500/10">
                  <TrendingUp className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-text-muted">Média Diária</p>
                  <p className="text-2xl font-bold text-white">
                    {Math.round(totalClicks / mockDailyClicks.length)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-orange-500/10">
                  <BarChart3 className="w-6 h-6 text-orange-400" />
                </div>
                <div>
                  <p className="text-sm text-text-muted">Pico de Cliques</p>
                  <p className="text-2xl font-bold text-white">{maxClicks}</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Gráfico de Cliques Diários */}
          <Card>
            <h3 className="text-lg font-semibold text-white mb-4">Cliques por Dia</h3>
            <div className="space-y-3">
              {mockDailyClicks.map((day) => (
                <div key={day.date} className="flex items-center gap-3">
                  <span className="text-xs text-text-muted w-20">
                    {new Date(day.date).toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit' })}
                  </span>
                  <div className="flex-1 h-6 bg-background rounded-lg overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-lime-500 to-lime-400 rounded-lg transition-all duration-500"
                      style={{ width: `${(day.clicks / maxClicks) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-white w-12 text-right">
                    {day.clicks}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          {/* Ranking de Grupos */}
          <Card>
            <h3 className="text-lg font-semibold text-white mb-4">Ranking de Grupos</h3>
            <div className="space-y-3">
              {mockGroupRanking.map((group, index) => (
                <div key={group.group_id} className="flex items-center gap-3">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    index === 0 ? 'bg-yellow-500/20 text-yellow-400' :
                    index === 1 ? 'bg-gray-400/20 text-gray-400' :
                    index === 2 ? 'bg-orange-500/20 text-orange-400' :
                    'bg-surface text-text-muted'
                  }`}>
                    {index + 1}
                  </span>
                  <span className="flex-1 text-sm text-white truncate">{group.group_name}</span>
                  <span className="text-sm font-medium text-lime-400">{group.clicks} cliques</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Distribuição por Dispositivo */}
          <Card className="lg:col-span-2">
            <h3 className="text-lg font-semibold text-white mb-4">Distribuição por Dispositivo</h3>
            <div className="grid grid-cols-3 gap-4">
              {mockDeviceDistribution.map((device) => (
                <div key={device.device_type} className="text-center p-4 bg-background/50 rounded-xl">
                  <div className="text-3xl font-bold text-white mb-1">{device.percentage}%</div>
                  <div className="text-sm text-text-muted capitalize">{device.device_type}</div>
                  <div className="text-xs text-text-muted mt-1">{device.count} cliques</div>
                </div>
              ))}
            </div>
            
            {/* Barra de progresso */}
            <div className="mt-4 h-3 bg-background rounded-full overflow-hidden flex">
              <div 
                className="bg-lime-500 transition-all duration-500"
                style={{ width: `${mockDeviceDistribution[0].percentage}%` }}
                title="Mobile"
              />
              <div 
                className="bg-blue-500 transition-all duration-500"
                style={{ width: `${mockDeviceDistribution[1].percentage}%` }}
                title="Desktop"
              />
              <div 
                className="bg-purple-500 transition-all duration-500"
                style={{ width: `${mockDeviceDistribution[2].percentage}%` }}
                title="Tablet"
              />
            </div>
            <div className="flex justify-center gap-6 mt-3">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-lime-500 rounded-full" />
                <span className="text-xs text-text-muted">Mobile</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full" />
                <span className="text-xs text-text-muted">Desktop</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-purple-500 rounded-full" />
                <span className="text-xs text-text-muted">Tablet</span>
              </div>
            </div>
          </Card>
        </div>
      )}
    </>
  )
}

