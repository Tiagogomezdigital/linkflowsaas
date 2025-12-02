'use client'

import { useState, useEffect } from 'react'
import { 
  Building2, 
  Search, 
  Filter, 
  MoreVertical,
  Users,
  MousePointerClick,
  Calendar,
  ExternalLink,
  Edit2,
  Trash2,
  Eye,
  Mail,
  TrendingUp,
  TrendingDown
} from 'lucide-react'
import Header from '@/components/layout/Header'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import Modal from '@/components/ui/Modal'

// Mock data - será substituído por dados reais da API
const mockEmpresas = [
  {
    id: '1',
    name: 'Guilherme Costa',
    slug: 'guilhermecosta',
    email: 'guilherme@exemplo.com',
    plan: 'annual',
    status: 'active',
    users: 1,
    groups: 1,
    numbers: 0,
    clicks: 414,
    mrr: 81.00,
    createdAt: '2025-11-04',
    lastActive: '2025-12-02',
  },
  {
    id: '2',
    name: 'Demo Company',
    slug: 'demo-company',
    email: 'demo@linkflow.com',
    plan: null,
    status: 'trial',
    users: 1,
    groups: 2,
    numbers: 3,
    clicks: 0,
    mrr: 0,
    createdAt: '2025-11-10',
    lastActive: '2025-12-01',
  },
]

export default function EmpresasPage() {
  const [empresas, setEmpresas] = useState(mockEmpresas)
  const [filteredEmpresas, setFilteredEmpresas] = useState(mockEmpresas)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterPlan, setFilterPlan] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [selectedEmpresa, setSelectedEmpresa] = useState<typeof mockEmpresas[0] | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)

  useEffect(() => {
    let result = [...empresas]
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (e) =>
          e.name.toLowerCase().includes(query) ||
          e.email.toLowerCase().includes(query) ||
          e.slug.toLowerCase().includes(query)
      )
    }
    
    if (filterPlan) {
      result = result.filter((e) => e.plan === filterPlan)
    }
    
    if (filterStatus) {
      result = result.filter((e) => e.status === filterStatus)
    }
    
    setFilteredEmpresas(result)
  }, [searchQuery, filterPlan, filterStatus, empresas])

  const handleClearFilters = () => {
    setSearchQuery('')
    setFilterPlan('')
    setFilterStatus('')
  }

  const getPlanBadge = (plan: string | null) => {
    const config: Record<string, { variant: 'default' | 'success' | 'warning' | 'info'; label: string }> = {
      monthly: { variant: 'info', label: 'Mensal' },
      annual: { variant: 'success', label: 'Anual' },
    }
    if (!plan) return <Badge variant="default">Free</Badge>
    const { variant, label } = config[plan] || { variant: 'default' as const, label: plan }
    return <Badge variant={variant}>{label}</Badge>
  }

  const getStatusBadge = (status: string | null) => {
    const config: Record<string, { variant: 'default' | 'success' | 'danger' | 'warning'; label: string }> = {
      active: { variant: 'success', label: 'Ativo' },
      trial: { variant: 'warning', label: 'Em Trial' },
      past_due: { variant: 'danger', label: 'Pendente' },
      canceled: { variant: 'default', label: 'Cancelado' },
    }
    if (!status) return <Badge variant="warning">Trial</Badge>
    const { variant, label } = config[status] || { variant: 'default' as const, label: status }
    return <Badge variant={variant}>{label}</Badge>
  }

  const planOptions = [
    { value: '', label: 'Todos os planos' },
    { value: 'monthly', label: 'Mensal' },
    { value: 'annual', label: 'Anual' },
  ]

  const statusOptions = [
    { value: '', label: 'Todos os status' },
    { value: 'active', label: 'Ativo' },
    { value: 'trial', label: 'Em Trial' },
    { value: 'past_due', label: 'Pendente' },
    { value: 'canceled', label: 'Cancelado' },
  ]

  // Estatísticas rápidas
  const totalMRR = filteredEmpresas.reduce((acc, e) => acc + e.mrr, 0)
  const totalUsers = filteredEmpresas.reduce((acc, e) => acc + e.users, 0)
  const totalClicks = filteredEmpresas.reduce((acc, e) => acc + e.clicks, 0)

  return (
    <>
      <Header
        title="Empresas"
        description="Gerencie todas as empresas cadastradas na plataforma"
        actions={
          <Button variant="primary">
            + Nova Empresa
          </Button>
        }
      />

      {/* Stats Rápidos */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <Card className="!p-4">
          <p className="text-sm text-text-secondary">Total Empresas</p>
          <p className="text-2xl font-bold text-white">{filteredEmpresas.length}</p>
        </Card>
        <Card className="!p-4">
          <p className="text-sm text-text-secondary">MRR Total</p>
          <p className="text-2xl font-bold text-lime-400">R$ {totalMRR.toLocaleString('pt-BR')}</p>
        </Card>
        <Card className="!p-4">
          <p className="text-sm text-text-secondary">Total Usuários</p>
          <p className="text-2xl font-bold text-white">{totalUsers}</p>
        </Card>
        <Card className="!p-4">
          <p className="text-sm text-text-secondary">Total Cliques</p>
          <p className="text-2xl font-bold text-white">{totalClicks.toLocaleString()}</p>
        </Card>
      </div>

      <Card>
        <div className="flex flex-col gap-6">
          {/* Header */}
          <div className="flex items-center gap-3">
            <Building2 className="w-6 h-6 text-purple-400" />
            <h2 className="text-xl font-semibold text-white">Lista de Empresas</h2>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-[250px]">
              <Input
                placeholder="Buscar por nome, email ou slug..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={<Search className="w-4 h-4" />}
              />
            </div>
            <div className="w-44">
              <Select
                options={planOptions}
                value={filterPlan}
                onChange={(e) => setFilterPlan(e.target.value)}
              />
            </div>
            <div className="w-40">
              <Select
                options={statusOptions}
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              />
            </div>
            <Button
              variant="outline"
              leftIcon={<Filter className="w-4 h-4" />}
              onClick={handleClearFilters}
            >
              Limpar
            </Button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-surface-border">
                  <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">Empresa</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">Plano</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">Usuários</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">Grupos</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">Cliques</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">MRR</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-text-secondary">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmpresas.map((empresa) => (
                  <tr key={empresa.id} className="border-b border-surface-border hover:bg-surface-hover transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-surface flex items-center justify-center">
                          <Building2 className="w-5 h-5 text-text-muted" />
                        </div>
                        <div>
                          <p className="font-medium text-white">{empresa.name}</p>
                          <p className="text-xs text-text-muted">{empresa.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">{getPlanBadge(empresa.plan)}</td>
                    <td className="py-3 px-4">{getStatusBadge(empresa.status)}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4 text-text-muted" />
                        <span className="text-text-secondary">{empresa.users}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-text-secondary">{empresa.groups}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        <MousePointerClick className="w-4 h-4 text-text-muted" />
                        <span className="text-text-secondary">{empresa.clicks.toLocaleString()}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={empresa.mrr > 0 ? 'text-lime-400 font-medium' : 'text-text-muted'}>
                        R$ {empresa.mrr.toFixed(2)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => {
                            setSelectedEmpresa(empresa)
                            setIsDetailModalOpen(true)
                          }}
                          className="p-2 rounded-lg hover:bg-surface-hover transition-colors"
                          title="Ver detalhes"
                        >
                          <Eye className="w-4 h-4 text-text-muted" />
                        </button>
                        <button
                          className="p-2 rounded-lg hover:bg-surface-hover transition-colors"
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4 text-text-muted" />
                        </button>
                        <button
                          className="p-2 rounded-lg hover:bg-red-500/10 transition-colors"
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4 text-text-muted hover:text-red-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Card>

      {/* Modal de Detalhes */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false)
          setSelectedEmpresa(null)
        }}
        title={selectedEmpresa?.name || ''}
        size="lg"
      >
        {selectedEmpresa && (
          <div className="space-y-6">
            {/* Info Principal */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-background/50 rounded-xl">
                <p className="text-sm text-text-muted mb-1">Email</p>
                <p className="text-white">{selectedEmpresa.email}</p>
              </div>
              <div className="p-4 bg-background/50 rounded-xl">
                <p className="text-sm text-text-muted mb-1">Slug</p>
                <p className="text-white font-mono">{selectedEmpresa.slug}</p>
              </div>
              <div className="p-4 bg-background/50 rounded-xl">
                <p className="text-sm text-text-muted mb-1">Plano</p>
                {getPlanBadge(selectedEmpresa.plan)}
              </div>
              <div className="p-4 bg-background/50 rounded-xl">
                <p className="text-sm text-text-muted mb-1">Status</p>
                {getStatusBadge(selectedEmpresa.status)}
              </div>
            </div>

            {/* Métricas */}
            <div className="grid grid-cols-4 gap-4">
              <div className="text-center p-4 bg-surface rounded-xl">
                <Users className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">{selectedEmpresa.users}</p>
                <p className="text-xs text-text-muted">Usuários</p>
              </div>
              <div className="text-center p-4 bg-surface rounded-xl">
                <Building2 className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">{selectedEmpresa.groups}</p>
                <p className="text-xs text-text-muted">Grupos</p>
              </div>
              <div className="text-center p-4 bg-surface rounded-xl">
                <MousePointerClick className="w-6 h-6 text-lime-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">{selectedEmpresa.clicks.toLocaleString()}</p>
                <p className="text-xs text-text-muted">Cliques</p>
              </div>
              <div className="text-center p-4 bg-surface rounded-xl">
                <TrendingUp className="w-6 h-6 text-green-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-lime-400">R$ {selectedEmpresa.mrr}</p>
                <p className="text-xs text-text-muted">MRR</p>
              </div>
            </div>

            {/* Datas */}
            <div className="flex items-center gap-6 text-sm text-text-secondary">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>Cadastro: {new Date(selectedEmpresa.createdAt).toLocaleDateString('pt-BR')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>Último acesso: {new Date(selectedEmpresa.lastActive).toLocaleDateString('pt-BR')}</span>
              </div>
            </div>

            {/* Ações */}
            <div className="flex gap-3 pt-4 border-t border-surface-border">
              <Button variant="secondary" leftIcon={<Mail className="w-4 h-4" />}>
                Enviar Email
              </Button>
              <Button variant="secondary" leftIcon={<ExternalLink className="w-4 h-4" />}>
                Acessar como Admin
              </Button>
              <Button variant="outline" leftIcon={<Edit2 className="w-4 h-4" />}>
                Editar Empresa
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  )
}

