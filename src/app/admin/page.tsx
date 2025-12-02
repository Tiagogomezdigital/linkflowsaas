'use client'

import { useState, useEffect } from 'react'
import { 
  Building2, 
  Users, 
  MousePointerClick, 
  TrendingUp,
  DollarSign,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Zap
} from 'lucide-react'
import Header from '@/components/layout/Header'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'

interface Stats {
  empresas: {
    total: number
    ativas: number
    novasMes: number
  }
  usuarios: {
    total: number
    ativos: number
    novosMes: number
  }
  cliques: {
    total: number
    mes: number
  }
  planos: {
    free: number
    monthly: number
    annual: number
  }
}

interface RecentCompany {
  id: string
  name: string
  plan: string | null
  createdAt: string
  users_count: number
  clicks_count: number
}

function StatCard({ 
  title, 
  value, 
  change, 
  changeLabel,
  icon: Icon, 
  iconColor = 'text-purple-400',
  iconBg = 'bg-purple-500/10'
}: {
  title: string
  value: string | number
  change?: number
  changeLabel?: string
  icon: React.ComponentType<{ className?: string }>
  iconColor?: string
  iconBg?: string
}) {
  const isPositive = change && change > 0
  
  return (
    <Card className="relative overflow-hidden">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-text-secondary mb-1">{title}</p>
          <p className="text-3xl font-bold text-white">{value}</p>
          {change !== undefined && (
            <div className="flex items-center gap-1 mt-2">
              {isPositive ? (
                <ArrowUpRight className="w-4 h-4 text-lime-400" />
              ) : (
                <ArrowDownRight className="w-4 h-4 text-red-400" />
              )}
              <span className={isPositive ? 'text-lime-400' : 'text-red-400'}>
                {isPositive ? '+' : ''}{change}%
              </span>
              {changeLabel && (
                <span className="text-text-muted text-sm ml-1">{changeLabel}</span>
              )}
            </div>
          )}
        </div>
        <div className={`p-3 rounded-xl ${iconBg}`}>
          <Icon className={`w-6 h-6 ${iconColor}`} />
        </div>
      </div>
      {/* Decoração de fundo */}
      <div className={`absolute -right-8 -bottom-8 w-32 h-32 rounded-full ${iconBg} opacity-50 blur-2xl`} />
    </Card>
  )
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [recentCompanies, setRecentCompanies] = useState<RecentCompany[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        // Buscar estatísticas
        const statsResponse = await fetch('/api/admin/stats')
        if (statsResponse.ok) {
          const statsData = await statsResponse.json()
          setStats(statsData)
        }

        // Buscar empresas recentes (últimas 5)
        const companiesResponse = await fetch('/api/admin/companies')
        if (companiesResponse.ok) {
          const companiesData = await companiesResponse.json()
          setRecentCompanies(companiesData.slice(0, 5))
        }
      } catch (error) {
        console.error('Error fetching admin data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const getPlanBadge = (plan: string | null) => {
    if (!plan) return <Badge variant="default">Free</Badge>
    const variants: Record<string, 'default' | 'success' | 'warning' | 'info'> = {
      monthly: 'info',
      annual: 'success',
    }
    const labels: Record<string, string> = {
      monthly: 'Mensal',
      annual: 'Anual',
    }
    return <Badge variant={variants[plan] || 'default'}>{labels[plan] || plan}</Badge>
  }


  return (
    <>
      <Header
        title="Dashboard Admin"
        description="Visão geral do sistema LinkFlow"
      />

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-lime-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-text-secondary">Carregando dados...</p>
          </div>
        </div>
      ) : stats ? (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Total de Empresas"
              value={stats.empresas.total}
              change={stats.empresas.novasMes > 0 ? ((stats.empresas.novasMes / stats.empresas.total) * 100) : 0}
              changeLabel="este mês"
              icon={Building2}
              iconColor="text-purple-400"
              iconBg="bg-purple-500/10"
            />
            <StatCard
              title="Total de Usuários"
              value={stats.usuarios.total}
              change={stats.usuarios.novosMes > 0 ? ((stats.usuarios.novosMes / stats.usuarios.total) * 100) : 0}
              changeLabel="este mês"
              icon={Users}
              iconColor="text-blue-400"
              iconBg="bg-blue-500/10"
            />
            <StatCard
              title="Cliques Totais"
              value={stats.cliques.total.toLocaleString()}
              change={stats.cliques.mes > 0 ? ((stats.cliques.mes / stats.cliques.total) * 100) : 0}
              changeLabel="este mês"
              icon={MousePointerClick}
              iconColor="text-lime-400"
              iconBg="bg-lime-500/10"
            />
            <StatCard
              title="MRR"
              value="R$ 0"
              change={undefined}
              changeLabel="este mês"
              icon={DollarSign}
              iconColor="text-green-400"
              iconBg="bg-green-500/10"
            />
          </div>

          {/* Distribuição por Planos */}
          <Card className="mb-8">
            <h3 className="text-lg font-semibold text-white mb-4">Distribuição por Plano</h3>
            <div className="grid grid-cols-3 gap-4">
              {Object.entries(stats.planos).map(([plan, count]) => (
                <div key={plan} className="text-center p-4 bg-background/50 rounded-xl">
                  <div className="text-2xl font-bold text-white mb-1">{count}</div>
                  <div className="text-sm text-text-muted capitalize">{plan === 'free' ? 'Free/Trial' : plan}</div>
                  <div className="mt-2">
                    {getPlanBadge(plan === 'free' ? null : plan)}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Barra de distribuição */}
            {stats.empresas.total > 0 && (
              <>
                <div className="mt-4 h-3 bg-background rounded-full overflow-hidden flex">
                  <div 
                    className="bg-gray-500 transition-all duration-500"
                    style={{ width: `${(stats.planos.free / stats.empresas.total) * 100}%` }}
                    title="Free/Trial"
                  />
                  <div 
                    className="bg-blue-500 transition-all duration-500"
                    style={{ width: `${(stats.planos.monthly / stats.empresas.total) * 100}%` }}
                    title="Monthly"
                  />
                  <div 
                    className="bg-lime-500 transition-all duration-500"
                    style={{ width: `${(stats.planos.annual / stats.empresas.total) * 100}%` }}
                    title="Annual"
                  />
                </div>
                <div className="flex justify-center gap-6 mt-3">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-gray-500 rounded-full" />
                    <span className="text-xs text-text-muted">Free/Trial</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full" />
                    <span className="text-xs text-text-muted">Monthly</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-lime-500 rounded-full" />
                    <span className="text-xs text-text-muted">Annual</span>
                  </div>
                </div>
              </>
            )}
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Empresas Recentes */}
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Empresas Recentes</h3>
                <a href="/admin/empresas" className="text-sm text-purple-400 hover:text-purple-300">
                  Ver todas →
                </a>
              </div>
              {recentCompanies.length === 0 ? (
                <div className="text-center py-8 text-text-muted">
                  <p>Nenhuma empresa encontrada</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentCompanies.map((company) => (
                    <div 
                      key={company.id}
                      className="flex items-center justify-between p-3 bg-background/50 rounded-xl"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-surface flex items-center justify-center">
                          <Building2 className="w-5 h-5 text-text-muted" />
                        </div>
                        <div>
                          <p className="font-medium text-white">{company.name}</p>
                          <p className="text-xs text-text-muted">
                            {company.users_count || 0} usuários • {(company.clicks_count || 0).toLocaleString()} cliques
                          </p>
                        </div>
                      </div>
                      {getPlanBadge(company.plan)}
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Atividade Recente - Removido por enquanto */}
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Atividade Recente</h3>
                <Badge variant="success" size="sm">
                  <Activity className="w-3 h-3 mr-1" />
                  Em breve
                </Badge>
              </div>
              <div className="text-center py-8 text-text-muted">
                <p>Funcionalidade em desenvolvimento</p>
              </div>
            </Card>
          </div>
        </>
      ) : (
        <Card>
          <div className="text-center py-12 text-text-muted">
            <p>Erro ao carregar dados</p>
          </div>
        </Card>
      )}
    </>
  )
}

