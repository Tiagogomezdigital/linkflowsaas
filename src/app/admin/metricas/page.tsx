'use client'

import { useState } from 'react'
import { 
  TrendingUp, 
  TrendingDown,
  Building2, 
  Users, 
  MousePointerClick,
  DollarSign,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Globe,
  Smartphone,
  Monitor,
  Tablet
} from 'lucide-react'
import Header from '@/components/layout/Header'
import Card from '@/components/ui/Card'
import Select from '@/components/ui/Select'
import Badge from '@/components/ui/Badge'

// Mock data
const mockMetrics = {
  // Crescimento
  empresasNovas: [12, 18, 15, 22, 19, 24, 28],
  usuariosNovos: [34, 45, 38, 56, 48, 62, 71],
  cliquesTotal: [8900, 12400, 10200, 15600, 13800, 18200, 21500],
  mrr: [3200, 3650, 3900, 4200, 4450, 4650, 4890],
  
  // Distribuição geográfica (simulada)
  topRegioes: [
    { nome: 'São Paulo', empresas: 18, percentage: 38 },
    { nome: 'Rio de Janeiro', empresas: 8, percentage: 17 },
    { nome: 'Minas Gerais', empresas: 6, percentage: 13 },
    { nome: 'Paraná', empresas: 5, percentage: 11 },
    { nome: 'Santa Catarina', empresas: 4, percentage: 8 },
    { nome: 'Outros', empresas: 6, percentage: 13 },
  ],
  
  // Dispositivos
  dispositivos: [
    { tipo: 'Mobile', count: 32450, percentage: 68, icon: Smartphone },
    { tipo: 'Desktop', count: 11900, percentage: 25, icon: Monitor },
    { tipo: 'Tablet', count: 3340, percentage: 7, icon: Tablet },
  ],
  
  // Conversão
  trialToStarter: 42,
  starterToPro: 28,
  proToEnterprise: 8,
  
  // Churn
  churnRate: 3.2,
  churnEmpresas: 2,
  
  // Top empresas por uso
  topEmpresas: [
    { nome: 'VendaMais LTDA', cliques: 45600, grupos: 25, growth: 24 },
    { nome: 'TechStart Solutions', cliques: 12340, grupos: 8, growth: 18 },
    { nome: 'Digital Growth', cliques: 8900, grupos: 6, growth: 32 },
    { nome: 'Marketing Pro', cliques: 5670, grupos: 3, growth: -5 },
    { nome: 'Imobiliária Central', cliques: 3200, grupos: 4, growth: -12 },
  ],
}

const periodoOptions = [
  { value: '7d', label: 'Últimos 7 dias' },
  { value: '30d', label: 'Últimos 30 dias' },
  { value: '90d', label: 'Últimos 90 dias' },
  { value: '12m', label: 'Últimos 12 meses' },
]

const diasSemana = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']

export default function MetricasPage() {
  const [periodo, setPeriodo] = useState('7d')

  const maxCliques = Math.max(...mockMetrics.cliquesTotal)
  const maxMRR = Math.max(...mockMetrics.mrr)

  return (
    <>
      <Header
        title="Métricas"
        description="Analytics globais da plataforma"
        actions={
          <div className="w-48">
            <Select
              options={periodoOptions}
              value={periodo}
              onChange={(e) => setPeriodo(e.target.value)}
            />
          </div>
        }
      />

      {/* Métricas de Resumo */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        <Card className="relative overflow-hidden">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-text-secondary mb-1">Novas Empresas</p>
              <p className="text-3xl font-bold text-white">
                {mockMetrics.empresasNovas.reduce((a, b) => a + b, 0)}
              </p>
              <div className="flex items-center gap-1 mt-2">
                <ArrowUpRight className="w-4 h-4 text-lime-400" />
                <span className="text-lime-400">+18%</span>
                <span className="text-text-muted text-sm ml-1">vs período anterior</span>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-purple-500/10">
              <Building2 className="w-6 h-6 text-purple-400" />
            </div>
          </div>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-text-secondary mb-1">Novos Usuários</p>
              <p className="text-3xl font-bold text-white">
                {mockMetrics.usuariosNovos.reduce((a, b) => a + b, 0)}
              </p>
              <div className="flex items-center gap-1 mt-2">
                <ArrowUpRight className="w-4 h-4 text-lime-400" />
                <span className="text-lime-400">+24%</span>
                <span className="text-text-muted text-sm ml-1">vs período anterior</span>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-blue-500/10">
              <Users className="w-6 h-6 text-blue-400" />
            </div>
          </div>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-text-secondary mb-1">Total Cliques</p>
              <p className="text-3xl font-bold text-white">
                {mockMetrics.cliquesTotal.reduce((a, b) => a + b, 0).toLocaleString()}
              </p>
              <div className="flex items-center gap-1 mt-2">
                <ArrowUpRight className="w-4 h-4 text-lime-400" />
                <span className="text-lime-400">+32%</span>
                <span className="text-text-muted text-sm ml-1">vs período anterior</span>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-lime-500/10">
              <MousePointerClick className="w-6 h-6 text-lime-400" />
            </div>
          </div>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-text-secondary mb-1">MRR Atual</p>
              <p className="text-3xl font-bold text-lime-400">
                R$ {mockMetrics.mrr[mockMetrics.mrr.length - 1].toLocaleString()}
              </p>
              <div className="flex items-center gap-1 mt-2">
                <ArrowUpRight className="w-4 h-4 text-lime-400" />
                <span className="text-lime-400">+15%</span>
                <span className="text-text-muted text-sm ml-1">vs período anterior</span>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-green-500/10">
              <DollarSign className="w-6 h-6 text-green-400" />
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-8">
        {/* Gráfico de Cliques */}
        <Card>
          <h3 className="text-lg font-semibold text-white mb-4">Cliques por Dia</h3>
          <div className="space-y-3">
            {mockMetrics.cliquesTotal.map((cliques, index) => (
              <div key={index} className="flex items-center gap-3">
                <span className="text-xs text-text-muted w-10">{diasSemana[index]}</span>
                <div className="flex-1 h-6 bg-background rounded-lg overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-lime-500 to-lime-400 rounded-lg transition-all duration-500"
                    style={{ width: `${(cliques / maxCliques) * 100}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-white w-16 text-right">
                  {cliques.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Gráfico de MRR */}
        <Card>
          <h3 className="text-lg font-semibold text-white mb-4">Evolução do MRR</h3>
          <div className="space-y-3">
            {mockMetrics.mrr.map((valor, index) => (
              <div key={index} className="flex items-center gap-3">
                <span className="text-xs text-text-muted w-10">{diasSemana[index]}</span>
                <div className="flex-1 h-6 bg-background rounded-lg overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-lg transition-all duration-500"
                    style={{ width: `${(valor / maxMRR) * 100}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-lime-400 w-20 text-right">
                  R$ {valor.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-3 gap-6 mb-8">
        {/* Distribuição por Dispositivo */}
        <Card>
          <h3 className="text-lg font-semibold text-white mb-4">Por Dispositivo</h3>
          <div className="space-y-4">
            {mockMetrics.dispositivos.map((device) => (
              <div key={device.tipo} className="flex items-center gap-4">
                <div className="p-2 rounded-lg bg-surface">
                  <device.icon className="w-5 h-5 text-text-muted" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-white">{device.tipo}</span>
                    <span className="text-sm text-text-muted">{device.percentage}%</span>
                  </div>
                  <div className="h-2 bg-background rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        device.tipo === 'Mobile' ? 'bg-lime-500' :
                        device.tipo === 'Desktop' ? 'bg-blue-500' : 'bg-purple-500'
                      }`}
                      style={{ width: `${device.percentage}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-text-muted mt-4 text-center">
            Total: {mockMetrics.dispositivos.reduce((a, b) => a + b.count, 0).toLocaleString()} cliques
          </p>
        </Card>

        {/* Funil de Conversão */}
        <Card>
          <h3 className="text-lg font-semibold text-white mb-4">Funil de Conversão</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-background/50 rounded-xl">
              <div>
                <p className="text-sm text-white">Trial → Starter</p>
                <p className="text-xs text-text-muted">Taxa de conversão</p>
              </div>
              <span className="text-xl font-bold text-lime-400">{mockMetrics.trialToStarter}%</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-background/50 rounded-xl">
              <div>
                <p className="text-sm text-white">Starter → Professional</p>
                <p className="text-xs text-text-muted">Taxa de upgrade</p>
              </div>
              <span className="text-xl font-bold text-blue-400">{mockMetrics.starterToPro}%</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-background/50 rounded-xl">
              <div>
                <p className="text-sm text-white">Professional → Enterprise</p>
                <p className="text-xs text-text-muted">Taxa de upgrade</p>
              </div>
              <span className="text-xl font-bold text-purple-400">{mockMetrics.proToEnterprise}%</span>
            </div>
          </div>
        </Card>

        {/* Churn */}
        <Card>
          <h3 className="text-lg font-semibold text-white mb-4">Churn Rate</h3>
          <div className="text-center py-6">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-red-500/10 border-4 border-red-500/30 mb-4">
              <span className="text-3xl font-bold text-red-400">{mockMetrics.churnRate}%</span>
            </div>
            <p className="text-text-secondary">Taxa de cancelamento mensal</p>
            <p className="text-sm text-text-muted mt-2">
              {mockMetrics.churnEmpresas} empresas cancelaram este mês
            </p>
          </div>
          <div className="flex items-center justify-center gap-2 text-sm">
            <ArrowDownRight className="w-4 h-4 text-lime-400" />
            <span className="text-lime-400">-0.8%</span>
            <span className="text-text-muted">vs mês anterior</span>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Top Empresas por Uso */}
        <Card>
          <h3 className="text-lg font-semibold text-white mb-4">Top Empresas por Uso</h3>
          <div className="space-y-3">
            {mockMetrics.topEmpresas.map((empresa, index) => (
              <div 
                key={empresa.nome}
                className="flex items-center gap-3 p-3 bg-background/50 rounded-xl"
              >
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  index === 0 ? 'bg-yellow-500/20 text-yellow-400' :
                  index === 1 ? 'bg-gray-400/20 text-gray-400' :
                  index === 2 ? 'bg-orange-500/20 text-orange-400' :
                  'bg-surface text-text-muted'
                }`}>
                  {index + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{empresa.nome}</p>
                  <p className="text-xs text-text-muted">{empresa.grupos} grupos</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-white">{empresa.cliques.toLocaleString()}</p>
                  <div className={`flex items-center gap-1 text-xs ${
                    empresa.growth > 0 ? 'text-lime-400' : 'text-red-400'
                  }`}>
                    {empresa.growth > 0 ? (
                      <TrendingUp className="w-3 h-3" />
                    ) : (
                      <TrendingDown className="w-3 h-3" />
                    )}
                    {empresa.growth > 0 ? '+' : ''}{empresa.growth}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Distribuição Geográfica */}
        <Card>
          <h3 className="text-lg font-semibold text-white mb-4">Distribuição por Região</h3>
          <div className="space-y-3">
            {mockMetrics.topRegioes.map((regiao) => (
              <div key={regiao.nome} className="flex items-center gap-3">
                <Globe className="w-4 h-4 text-text-muted" />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-white">{regiao.nome}</span>
                    <span className="text-sm text-text-muted">{regiao.empresas} empresas</span>
                  </div>
                  <div className="h-2 bg-background rounded-full overflow-hidden">
                    <div
                      className="h-full bg-purple-500 rounded-full transition-all duration-500"
                      style={{ width: `${regiao.percentage}%` }}
                    />
                  </div>
                </div>
                <span className="text-xs text-text-muted w-10 text-right">{regiao.percentage}%</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </>
  )
}

