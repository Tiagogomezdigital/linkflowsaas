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

// Mock data para demonstração - será substituído por dados reais da API /api/admin/stats
const mockStats = {
  totalEmpresas: 26,
  empresasAtivas: 1,
  novasEmpresasMes: 5,
  crescimentoEmpresas: 23.8,
  
  totalUsuarios: 20,
  usuariosAtivos: 20,
  novosUsuariosMes: 3,
  crescimentoUsuarios: 17.6,
  
  totalCliques: 414,
  cliquesMes: 156,
  crescimentoCliques: 60.5,
  
  mrr: 81.00,
  crescimentoMrr: 0,
  
  planos: {
    free: 25,
    monthly: 0,
    annual: 1,
  }
}

const mockRecentCompanies = [
  { id: '1', name: 'TechStart Solutions', plan: 'annual', createdAt: '2025-12-01', users: 5, clicks: 1234 },
  { id: '2', name: 'Marketing Pro', plan: 'monthly', createdAt: '2025-11-30', users: 2, clicks: 567 },
  { id: '3', name: 'VendaMais LTDA', plan: 'annual', createdAt: '2025-11-29', users: 12, clicks: 3456 },
  { id: '4', name: 'Consultoria ABC', plan: null, createdAt: '2025-11-28', users: 1, clicks: 89 },
  { id: '5', name: 'Digital Growth', plan: 'monthly', createdAt: '2025-11-27', users: 4, clicks: 2100 },
]

const mockActivityLog = [
  { id: '1', action: 'Nova empresa', description: 'TechStart Solutions se cadastrou', time: '5 min atrás', type: 'company' },
  { id: '2', action: 'Upgrade de plano', description: 'Marketing Pro: trial → starter', time: '1 hora atrás', type: 'upgrade' },
  { id: '3', action: 'Novo grupo criado', description: 'VendaMais criou "Equipe Vendas"', time: '2 horas atrás', type: 'group' },
  { id: '4', action: 'Limite atingido', description: 'Consultoria ABC atingiu limite de grupos', time: '3 horas atrás', type: 'warning' },
  { id: '5', action: 'Pagamento recebido', description: 'Digital Growth - R$ 149,00', time: '4 horas atrás', type: 'payment' },
]

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
  const [stats] = useState(mockStats)
  const [recentCompanies] = useState(mockRecentCompanies)
  const [activityLog] = useState(mockActivityLog)

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

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'company': return <Building2 className="w-4 h-4 text-purple-400" />
      case 'upgrade': return <TrendingUp className="w-4 h-4 text-lime-400" />
      case 'group': return <Users className="w-4 h-4 text-blue-400" />
      case 'warning': return <Activity className="w-4 h-4 text-yellow-400" />
      case 'payment': return <DollarSign className="w-4 h-4 text-green-400" />
      default: return <Zap className="w-4 h-4 text-text-muted" />
    }
  }

  return (
    <>
      <Header
        title="Dashboard Admin"
        description="Visão geral do sistema LinkFlow"
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total de Empresas"
          value={stats.totalEmpresas}
          change={stats.crescimentoEmpresas}
          changeLabel="este mês"
          icon={Building2}
          iconColor="text-purple-400"
          iconBg="bg-purple-500/10"
        />
        <StatCard
          title="Total de Usuários"
          value={stats.totalUsuarios}
          change={stats.crescimentoUsuarios}
          changeLabel="este mês"
          icon={Users}
          iconColor="text-blue-400"
          iconBg="bg-blue-500/10"
        />
        <StatCard
          title="Cliques Totais"
          value={stats.totalCliques.toLocaleString()}
          change={stats.crescimentoCliques}
          changeLabel="este mês"
          icon={MousePointerClick}
          iconColor="text-lime-400"
          iconBg="bg-lime-500/10"
        />
        <StatCard
          title="MRR"
          value={`R$ ${stats.mrr.toLocaleString('pt-BR')}`}
          change={stats.crescimentoMrr}
          changeLabel="este mês"
          icon={DollarSign}
          iconColor="text-green-400"
          iconBg="bg-green-500/10"
        />
      </div>

      {/* Distribuição por Planos */}
      <Card className="mb-8">
        <h3 className="text-lg font-semibold text-white mb-4">Distribuição por Plano</h3>
        <div className="grid grid-cols-4 gap-4">
          {Object.entries(stats.planos).map(([plan, count]) => (
            <div key={plan} className="text-center p-4 bg-background/50 rounded-xl">
              <div className="text-2xl font-bold text-white mb-1">{count}</div>
              <div className="text-sm text-text-muted capitalize">{plan}</div>
              <div className="mt-2">
                {getPlanBadge(plan)}
              </div>
            </div>
          ))}
        </div>
        
        {/* Barra de distribuição */}
        <div className="mt-4 h-3 bg-background rounded-full overflow-hidden flex">
          <div 
            className="bg-gray-500 transition-all duration-500"
            style={{ width: `${(stats.planos.free / stats.totalEmpresas) * 100}%` }}
            title="Free/Trial"
          />
          <div 
            className="bg-blue-500 transition-all duration-500"
            style={{ width: `${(stats.planos.monthly / stats.totalEmpresas) * 100}%` }}
            title="Monthly"
          />
          <div 
            className="bg-lime-500 transition-all duration-500"
            style={{ width: `${(stats.planos.annual / stats.totalEmpresas) * 100}%` }}
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
                      {company.users} usuários • {company.clicks.toLocaleString()} cliques
                    </p>
                  </div>
                </div>
                {getPlanBadge(company.plan)}
              </div>
            ))}
          </div>
        </Card>

        {/* Atividade Recente */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Atividade Recente</h3>
            <Badge variant="success" size="sm">
              <Activity className="w-3 h-3 mr-1" />
              Ao vivo
            </Badge>
          </div>
          <div className="space-y-3">
            {activityLog.map((activity) => (
              <div 
                key={activity.id}
                className="flex items-start gap-3 p-3 bg-background/50 rounded-xl"
              >
                <div className="mt-0.5">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white text-sm">{activity.action}</p>
                  <p className="text-xs text-text-muted truncate">{activity.description}</p>
                </div>
                <div className="flex items-center gap-1 text-xs text-text-muted flex-shrink-0">
                  <Clock className="w-3 h-3" />
                  {activity.time}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </>
  )
}

