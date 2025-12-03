'use client'

import { useState, useMemo, useEffect } from 'react'
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

const periodOptions = [
  { value: 'today', label: 'Hoje' },
  { value: 'yesterday', label: 'Ontem' },
  { value: 'last7days', label: 'Últimos 7 dias' },
  { value: 'last30days', label: 'Últimos 30 dias' },
  { value: 'thisMonth', label: 'Este mês' },
  { value: 'lastMonth', label: 'Mês passado' },
]

interface DailyClick {
  date: string
  clicks: number
}

interface GroupRanking {
  group_id: string
  group_name: string
  clicks: number
}

interface DeviceDistribution {
  device_type: string
  count: number
  percentage: number
}

export default function RelatoriosPage() {
  const [groups, setGroups] = useState<Group[]>([])
  const [isFiltersOpen, setIsFiltersOpen] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState('today')
  const [selectedGroups, setSelectedGroups] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const [reportGenerated, setReportGenerated] = useState(false)
  
  // Dados do relatório
  const [dailyClicks, setDailyClicks] = useState<DailyClick[]>([])
  const [groupRanking, setGroupRanking] = useState<GroupRanking[]>([])
  const [deviceDistribution, setDeviceDistribution] = useState<DeviceDistribution[]>([])
  const [totalClicks, setTotalClicks] = useState(0)

  const todayDate = new Date().toLocaleDateString('pt-BR')

  const handleGenerateReportForGroup = async (groupId: string, period: string) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/stats/filtered', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          period: period,
          groupIds: [groupId],
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao gerar relatório')
      }

      const data = await response.json()
      
      setDailyClicks(data.daily_clicks || [])
      setGroupRanking(data.group_ranking || [])
      setDeviceDistribution(data.device_distribution || [])
      setTotalClicks(data.total_clicks || 0)
      setReportGenerated(true)
    } catch (error) {
      console.error('Error generating report:', error)
      alert(error instanceof Error ? error.message : 'Erro ao gerar relatório')
    } finally {
      setIsLoading(false)
    }
  }

  // Buscar grupos ao carregar a página
  useEffect(() => {
    const fetchGroups = async () => {
      setIsInitialLoading(true)
      try {
        const response = await fetch('/api/groups')
        if (response.ok) {
          const data = await response.json()
          setGroups(data)
          
          // Verificar se há um grupo específico na URL
          const urlParams = new URLSearchParams(window.location.search)
          const groupId = urlParams.get('group')
          
          if (groupId) {
            // Selecionar apenas o grupo da URL
            setSelectedGroups([groupId])
            // Gerar relatório automaticamente após um pequeno delay
            setTimeout(() => {
              handleGenerateReportForGroup(groupId, selectedPeriod)
            }, 500)
          } else {
            // Selecionar todos os grupos por padrão
            setSelectedGroups(data.map((g: Group) => g.id))
          }
        }
      } catch (error) {
        console.error('Error fetching groups:', error)
      } finally {
        setIsInitialLoading(false)
      }
    }

    fetchGroups()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSelectAll = () => {
    setSelectedGroups(groups.map(g => g.id))
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
    if (selectedGroups.length === 0) {
      alert('Selecione pelo menos um grupo para gerar o relatório')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/stats/filtered', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          period: selectedPeriod,
          groupIds: selectedGroups,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao gerar relatório')
      }

      const data = await response.json()
      
      setDailyClicks(data.daily_clicks || [])
      setGroupRanking(data.group_ranking || [])
      setDeviceDistribution(data.device_distribution || [])
      setTotalClicks(data.total_clicks || 0)
      setReportGenerated(true)
    } catch (error) {
      console.error('Error generating report:', error)
      alert(error instanceof Error ? error.message : 'Erro ao gerar relatório')
    } finally {
      setIsLoading(false)
    }
  }

  const handleExportCSV = () => {
    // Criar CSV com os dados do relatório
    const csvRows = [
      ['Data', 'Cliques', 'Grupo', 'Dispositivo'],
      ...dailyClicks.flatMap(day => 
        groupRanking.map(group => [
          day.date,
          day.clicks.toString(),
          group.group_name,
          deviceDistribution[0]?.device_type || 'unknown'
        ])
      )
    ]

    const csvContent = csvRows.map(row => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `relatorio-${selectedPeriod}-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const maxClicks = useMemo(() => {
    return dailyClicks.length > 0 ? Math.max(...dailyClicks.map(d => d.clicks)) : 0
  }, [dailyClicks])

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
                  <span>Grupos: {selectedGroups.length} de {groups.length} selecionados</span>
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
                        selectedGroups.length === groups.length && groups.length > 0
                          ? 'bg-surface-hover text-white'
                          : 'text-text-muted hover:text-white'
                      }`}
                      disabled={groups.length === 0}
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
                      disabled={groups.length === 0}
                    >
                      Nenhum
                    </button>
                  </div>
                </div>

                {isInitialLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="text-center">
                      <div className="w-8 h-8 border-4 border-lime-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                      <p className="text-text-secondary">Carregando grupos...</p>
                    </div>
                  </div>
                ) : groups.length === 0 ? (
                  <div className="text-center py-8 text-text-muted">
                    <p>Nenhum grupo encontrado. Crie grupos primeiro.</p>
                  </div>
                ) : (
                  <>
                    <div className="max-h-60 overflow-y-auto space-y-1 bg-background/50 rounded-xl p-3 border border-surface-border">
                      {groups.map((group) => (
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
                      {selectedGroups.length} de {groups.length} grupos selecionados
                    </p>
                  </>
                )}
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
                  <p className="text-sm text-text-muted">Grupos Selecionados</p>
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
                    {dailyClicks.length > 0 ? Math.round(totalClicks / dailyClicks.length) : 0}
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
            {dailyClicks.length === 0 ? (
              <div className="text-center py-8 text-text-muted">
                <p>Nenhum dado disponível para o período selecionado</p>
              </div>
            ) : (
              <div className="space-y-3">
                {dailyClicks.map((day) => (
                  <div key={day.date} className="flex items-center gap-3">
                    <span className="text-xs text-text-muted w-20">
                      {new Date(day.date).toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit' })}
                    </span>
                    <div className="flex-1 h-6 bg-background rounded-lg overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-lime-500 to-lime-400 rounded-lg transition-all duration-500"
                        style={{ width: maxClicks > 0 ? `${(day.clicks / maxClicks) * 100}%` : '0%' }}
                      />
                    </div>
                    <span className="text-sm font-medium text-white w-12 text-right">
                      {day.clicks}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Ranking de Grupos */}
          <Card>
            <h3 className="text-lg font-semibold text-white mb-4">Ranking de Grupos</h3>
            {groupRanking.length === 0 ? (
              <div className="text-center py-8 text-text-muted">
                <p>Nenhum dado disponível para o período selecionado</p>
              </div>
            ) : (
              <div className="space-y-3">
                {groupRanking.map((group, index) => (
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
            )}
          </Card>

          {/* Distribuição por Dispositivo */}
          <Card className="lg:col-span-2">
            <h3 className="text-lg font-semibold text-white mb-4">Distribuição por Dispositivo</h3>
            {deviceDistribution.length === 0 ? (
              <div className="text-center py-8 text-text-muted">
                <p>Nenhum dado disponível para o período selecionado</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-3 gap-4">
                  {deviceDistribution.map((device) => (
                    <div key={device.device_type} className="text-center p-4 bg-background/50 rounded-xl">
                      <div className="text-3xl font-bold text-white mb-1">{device.percentage}%</div>
                      <div className="text-sm text-text-muted capitalize">{device.device_type}</div>
                      <div className="text-xs text-text-muted mt-1">{device.count} cliques</div>
                    </div>
                  ))}
                </div>
                
                {/* Barra de progresso */}
                {deviceDistribution.length > 0 && (
                  <>
                    <div className="mt-4 h-3 bg-background rounded-full overflow-hidden flex">
                      {deviceDistribution.map((device, index) => {
                        const colors = ['bg-lime-500', 'bg-blue-500', 'bg-purple-500', 'bg-orange-500', 'bg-pink-500']
                        return (
                          <div 
                            key={device.device_type}
                            className={`${colors[index] || 'bg-gray-500'} transition-all duration-500`}
                            style={{ width: `${device.percentage}%` }}
                            title={device.device_type}
                          />
                        )
                      })}
                    </div>
                    <div className="flex justify-center gap-6 mt-3 flex-wrap">
                      {deviceDistribution.map((device, index) => {
                        const colors = ['bg-lime-500', 'bg-blue-500', 'bg-purple-500', 'bg-orange-500', 'bg-pink-500']
                        return (
                          <div key={device.device_type} className="flex items-center gap-2">
                            <div className={`w-3 h-3 ${colors[index] || 'bg-gray-500'} rounded-full`} />
                            <span className="text-xs text-text-muted capitalize">{device.device_type}</span>
                          </div>
                        )
                      })}
                    </div>
                  </>
                )}
              </>
            )}
          </Card>
        </div>
      )}
    </>
  )
}

