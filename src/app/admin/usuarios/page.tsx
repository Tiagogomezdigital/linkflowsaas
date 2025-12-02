'use client'

import { useState, useEffect } from 'react'
import { 
  Users, 
  Search, 
  Filter, 
  Mail,
  Calendar,
  Building2,
  Shield,
  Eye,
  Edit2,
  Trash2,
  UserCheck,
  UserX,
  MoreVertical
} from 'lucide-react'
import Header from '@/components/layout/Header'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import Modal from '@/components/ui/Modal'

interface Usuario {
  id: string
  name: string
  email: string
  role: 'owner' | 'member'
  company: {
    id: string
    name: string
    slug: string
  } | null
  company_id: string
  is_active: boolean
  created_at: string
}

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [filteredUsuarios, setFilteredUsuarios] = useState<Usuario[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filterRole, setFilterRole] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [selectedUsuario, setSelectedUsuario] = useState<Usuario | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchUsuarios = async () => {
      setIsLoading(true)
      try {
        const response = await fetch('/api/admin/users')
        if (response.ok) {
          const data = await response.json()
          setUsuarios(data)
        }
      } catch (error) {
        console.error('Error fetching users:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUsuarios()
  }, [])

  useEffect(() => {
    let result = [...usuarios]
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (u) =>
          u.name.toLowerCase().includes(query) ||
          u.email.toLowerCase().includes(query) ||
          u.company?.name.toLowerCase().includes(query) ||
          false
      )
    }
    
    if (filterRole) {
      result = result.filter((u) => u.role === filterRole)
    }
    
    if (filterStatus) {
      result = result.filter((u) => 
        filterStatus === 'active' ? u.is_active : !u.is_active
      )
    }
    
    setFilteredUsuarios(result)
  }, [searchQuery, filterRole, filterStatus, usuarios])

  const handleClearFilters = () => {
    setSearchQuery('')
    setFilterRole('')
    setFilterStatus('')
  }

  const getRoleBadge = (role: string) => {
    const config: Record<string, { variant: 'default' | 'success' | 'warning' | 'info'; label: string }> = {
      owner: { variant: 'warning', label: 'Proprietário' },
      member: { variant: 'default', label: 'Membro' },
    }
    const { variant, label } = config[role] || config.member
    return <Badge variant={variant}>{label}</Badge>
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const roleOptions = [
    { value: '', label: 'Todos os roles' },
    { value: 'owner', label: 'Proprietário' },
    { value: 'member', label: 'Membro' },
  ]

  const statusOptions = [
    { value: '', label: 'Todos os status' },
    { value: 'active', label: 'Ativo' },
    { value: 'inactive', label: 'Inativo' },
  ]

  // Estatísticas rápidas
  const totalAtivos = filteredUsuarios.filter(u => u.is_active).length
  const totalOwners = filteredUsuarios.filter(u => u.role === 'owner').length

  return (
    <>
      <Header
        title="Usuários"
        description="Gerencie todos os usuários do sistema"
        actions={
          <Button variant="primary">
            + Novo Usuário
          </Button>
        }
      />

      {/* Stats Rápidos */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <Card className="!p-4">
          <p className="text-sm text-text-secondary">Total Usuários</p>
          <p className="text-2xl font-bold text-white">{filteredUsuarios.length}</p>
        </Card>
        <Card className="!p-4">
          <p className="text-sm text-text-secondary">Usuários Ativos</p>
          <p className="text-2xl font-bold text-lime-400">{totalAtivos}</p>
        </Card>
        <Card className="!p-4">
          <p className="text-sm text-text-secondary">Proprietários</p>
          <p className="text-2xl font-bold text-white">{totalOwners}</p>
        </Card>
        <Card className="!p-4">
          <p className="text-sm text-text-secondary">Empresas</p>
          <p className="text-2xl font-bold text-white">
            {new Set(filteredUsuarios.map(u => u.company_id).filter(Boolean)).size}
          </p>
        </Card>
      </div>

      <Card>
        <div className="flex flex-col gap-6">
          {/* Header */}
          <div className="flex items-center gap-3">
            <Users className="w-6 h-6 text-blue-400" />
            <h2 className="text-xl font-semibold text-white">Lista de Usuários</h2>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-[250px]">
              <Input
                placeholder="Buscar por nome, email ou empresa..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={<Search className="w-4 h-4" />}
              />
            </div>
            <div className="w-40">
              <Select
                options={roleOptions}
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
              />
            </div>
            <div className="w-36">
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
                <p className="text-text-secondary">Carregando usuários...</p>
              </div>
            </div>
          ) : filteredUsuarios.length === 0 ? (
            <div className="text-center py-12 text-text-muted">
              <p>Nenhum usuário encontrado</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-surface-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">Usuário</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">Empresa</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">Role</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">Cadastro</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-text-secondary">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsuarios.map((usuario) => (
                  <tr key={usuario.id} className="border-b border-surface-border hover:bg-surface-hover transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-surface flex items-center justify-center font-medium text-text-secondary">
                          {usuario.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                        <div>
                          <p className="font-medium text-white">{usuario.name}</p>
                          <p className="text-xs text-text-muted">{usuario.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-text-muted" />
                        <span className="text-text-secondary">{usuario.company?.name || 'Sem empresa'}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">{getRoleBadge(usuario.role)}</td>
                    <td className="py-3 px-4">
                      {usuario.is_active ? (
                        <div className="flex items-center gap-1 text-lime-400">
                          <UserCheck className="w-4 h-4" />
                          <span className="text-sm">Ativo</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-red-400">
                          <UserX className="w-4 h-4" />
                          <span className="text-sm">Inativo</span>
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-text-secondary text-sm">
                      {formatDate(usuario.created_at)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => {
                            setSelectedUsuario(usuario)
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
          )}
        </div>
      </Card>

      {/* Modal de Detalhes */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false)
          setSelectedUsuario(null)
        }}
        title="Detalhes do Usuário"
        size="md"
      >
        {selectedUsuario && (
          <div className="space-y-6">
            {/* Avatar e Nome */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-surface flex items-center justify-center text-xl font-medium text-text-secondary">
                {selectedUsuario.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white">{selectedUsuario.name}</h3>
                <p className="text-text-secondary">{selectedUsuario.email}</p>
              </div>
            </div>

            {/* Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-background/50 rounded-xl">
                <p className="text-sm text-text-muted mb-1">Empresa</p>
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-text-muted" />
                  <p className="text-white">{selectedUsuario.company?.name || 'Sem empresa'}</p>
                </div>
              </div>
              <div className="p-4 bg-background/50 rounded-xl">
                <p className="text-sm text-text-muted mb-1">Role</p>
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-text-muted" />
                  {getRoleBadge(selectedUsuario.role)}
                </div>
              </div>
              <div className="p-4 bg-background/50 rounded-xl">
                <p className="text-sm text-text-muted mb-1">Status</p>
                {selectedUsuario.is_active ? (
                  <Badge variant="success">Ativo</Badge>
                ) : (
                  <Badge variant="danger">Inativo</Badge>
                )}
              </div>
              <div className="p-4 bg-background/50 rounded-xl">
                <p className="text-sm text-text-muted mb-1">Cadastro</p>
                <p className="text-white">
                  {new Date(selectedUsuario.created_at).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>

            {/* Cadastro */}
            <div className="flex items-center gap-2 text-sm text-text-secondary">
              <Calendar className="w-4 h-4" />
              <span>Cadastrado em: {formatDate(selectedUsuario.created_at)}</span>
            </div>

            {/* Ações */}
            <div className="flex gap-3 pt-4 border-t border-surface-border">
              <Button variant="secondary" leftIcon={<Mail className="w-4 h-4" />}>
                Enviar Email
              </Button>
              <Button variant="outline" leftIcon={<Edit2 className="w-4 h-4" />}>
                Editar
              </Button>
              {selectedUsuario.is_active ? (
                <Button variant="danger" leftIcon={<UserX className="w-4 h-4" />}>
                  Desativar
                </Button>
              ) : (
                <Button variant="primary" leftIcon={<UserCheck className="w-4 h-4" />}>
                  Ativar
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </>
  )
}

