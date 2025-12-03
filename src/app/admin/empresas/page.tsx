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

interface Empresa {
  id: string
  name: string
  slug: string
  plan_type: string | null
  subscription_status: string | null
  users_count: number
  groups_count: number
  clicks_count: number
  created_at: string
}

export default function EmpresasPage() {
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [filteredEmpresas, setFilteredEmpresas] = useState<Empresa[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filterPlan, setFilterPlan] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [selectedEmpresa, setSelectedEmpresa] = useState<Empresa | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchEmpresas = async () => {
      setIsLoading(true)
      try {
        const params = new URLSearchParams()
        if (filterPlan) params.append('plan', filterPlan)
        if (filterStatus) params.append('status', filterStatus)
        if (searchQuery) params.append('search', searchQuery)

        const response = await fetch(`/api/admin/companies?${params.toString()}`)
        if (response.ok) {
          const data = await response.json()
          setEmpresas(data)
          setFilteredEmpresas(data)
        }
      } catch (error) {
        console.error('Error fetching companies:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchEmpresas()
  }, [filterPlan, filterStatus, searchQuery])


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
  const totalUsers = filteredEmpresas.reduce((acc, e) => acc + (e.users_count || 0), 0)
  const totalClicks = filteredEmpresas.reduce((acc, e) => acc + (e.clicks_count || 0), 0)

  return (
    <>
      <Header
        title="Empresas"
        description="Gerencie todas as empresas cadastradas na plataforma"
        actions={
          <Button 
            variant="primary"
            onClick={() => {
              // TODO: Implementar modal de criação de empresa
              alert('Funcionalidade de criar empresa será implementada em breve')
            }}
          >
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
          <p className="text-sm text-text-secondary">Total Grupos</p>
          <p className="text-2xl font-bold text-lime-400">{filteredEmpresas.reduce((acc, e) => acc + (e.groups_count || 0), 0)}</p>
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
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="w-8 h-8 border-4 border-lime-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-text-secondary">Carregando empresas...</p>
              </div>
            </div>
          ) : filteredEmpresas.length === 0 ? (
            <div className="text-center py-12 text-text-muted">
              <p>Nenhuma empresa encontrada</p>
            </div>
          ) : (
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
                            <p className="text-xs text-text-muted">{empresa.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">{getPlanBadge(empresa.plan_type)}</td>
                      <td className="py-3 px-4">{getStatusBadge(empresa.subscription_status)}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4 text-text-muted" />
                          <span className="text-text-secondary">{empresa.users_count || 0}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-text-secondary">{empresa.groups_count || 0}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1">
                          <MousePointerClick className="w-4 h-4 text-text-muted" />
                          <span className="text-text-secondary">{(empresa.clicks_count || 0).toLocaleString()}</span>
                        </div>
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
                          onClick={() => {
                            setSelectedEmpresa(empresa)
                            setIsDetailModalOpen(true)
                          }}
                          className="p-2 rounded-lg hover:bg-surface-hover transition-colors"
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4 text-text-muted" />
                        </button>
                        <button
                          onClick={async () => {
                            if (confirm(`Tem certeza que deseja excluir a empresa ${empresa.name}? Esta ação não pode ser desfeita.`)) {
                              // TODO: Implementar API para excluir empresa
                              alert('Funcionalidade de excluir empresa será implementada em breve')
                            }
                          }}
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
          )}
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
                <p className="text-sm text-text-muted mb-1">Slug</p>
                <p className="text-white font-mono">{selectedEmpresa.slug}</p>
              </div>
              <div className="p-4 bg-background/50 rounded-xl">
                <p className="text-sm text-text-muted mb-1">ID</p>
                <p className="text-white font-mono text-xs">{selectedEmpresa.id}</p>
              </div>
              <div className="p-4 bg-background/50 rounded-xl">
                <p className="text-sm text-text-muted mb-1">Plano</p>
                {getPlanBadge(selectedEmpresa.plan_type)}
              </div>
              <div className="p-4 bg-background/50 rounded-xl">
                <p className="text-sm text-text-muted mb-1">Status</p>
                {getStatusBadge(selectedEmpresa.subscription_status)}
              </div>
            </div>

            {/* Métricas */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-surface rounded-xl">
                <Users className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">{selectedEmpresa.users_count || 0}</p>
                <p className="text-xs text-text-muted">Usuários</p>
              </div>
              <div className="text-center p-4 bg-surface rounded-xl">
                <Building2 className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">{selectedEmpresa.groups_count || 0}</p>
                <p className="text-xs text-text-muted">Grupos</p>
              </div>
              <div className="text-center p-4 bg-surface rounded-xl">
                <MousePointerClick className="w-6 h-6 text-lime-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">{(selectedEmpresa.clicks_count || 0).toLocaleString()}</p>
                <p className="text-xs text-text-muted">Cliques</p>
              </div>
            </div>

            {/* Datas */}
            <div className="flex items-center gap-6 text-sm text-text-secondary">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>Cadastro: {new Date(selectedEmpresa.created_at).toLocaleDateString('pt-BR')}</span>
              </div>
            </div>

            {/* Ações */}
            <div className="flex gap-3 pt-4 border-t border-surface-border">
              <Button 
                variant="secondary" 
                leftIcon={<Mail className="w-4 h-4" />}
                onClick={() => {
                  // Buscar email do owner da empresa
                  // Por enquanto, apenas mostra mensagem
                  alert('Funcionalidade de enviar email será implementada em breve')
                }}
              >
                Enviar Email
              </Button>
              <Button 
                variant="secondary" 
                leftIcon={<ExternalLink className="w-4 h-4" />}
                onClick={() => {
                  // TODO: Implementar funcionalidade de acessar como admin
                  alert('Funcionalidade de acessar como admin será implementada em breve')
                }}
              >
                Acessar como Admin
              </Button>
              <Button 
                variant="outline" 
                leftIcon={<Edit2 className="w-4 h-4" />}
                onClick={() => {
                  // TODO: Implementar modal de edição de empresa
                  alert('Funcionalidade de editar empresa será implementada em breve')
                }}
              >
                Editar Empresa
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  )
}

