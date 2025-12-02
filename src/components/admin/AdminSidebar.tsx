'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  Building2, 
  Users, 
  CreditCard,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Shield,
  LogOut,
  TrendingUp,
  MousePointerClick
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface NavItem {
  href: string
  label: string
  sublabel?: string
  icon: React.ComponentType<{ className?: string }>
}

const navigationItems: NavItem[] = [
  {
    href: '/admin',
    label: 'Dashboard',
    sublabel: 'Visão geral do sistema',
    icon: LayoutDashboard,
  },
  {
    href: '/admin/empresas',
    label: 'Empresas',
    sublabel: 'Gerenciar clientes',
    icon: Building2,
  },
  {
    href: '/admin/usuarios',
    label: 'Usuários',
    sublabel: 'Todos os usuários',
    icon: Users,
  },
  {
    href: '/admin/metricas',
    label: 'Métricas',
    sublabel: 'Analytics globais',
    icon: TrendingUp,
  },
]

const systemItems: NavItem[] = [
  {
    href: '/admin/planos',
    label: 'Planos',
    sublabel: 'Configurar planos',
    icon: CreditCard,
  },
  {
    href: '/admin/configuracoes',
    label: 'Configurações',
    sublabel: 'Configurações do sistema',
    icon: Settings,
  },
]

export default function AdminSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const pathname = usePathname()

  return (
    <aside 
      className={cn(
        'flex flex-col h-screen bg-background border-r border-surface-border transition-all duration-300',
        isCollapsed ? 'w-20' : 'w-72'
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 p-4 border-b border-surface-border">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20">
          <Shield className="w-5 h-5 text-purple-500" />
        </div>
        {!isCollapsed && (
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold text-white">LinkFlow</h1>
            <p className="text-xs text-purple-400">Painel Admin</p>
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 rounded-lg hover:bg-surface-hover transition-colors"
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4 text-text-secondary" />
          ) : (
            <ChevronLeft className="w-4 h-4 text-text-secondary" />
          )}
        </button>
      </div>

      {/* Navegação Principal */}
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="px-3 space-y-6">
          {/* Seção Principal */}
          <div>
            {!isCollapsed && (
              <p className="px-3 mb-2 text-xs font-semibold text-text-muted uppercase tracking-wider">
                Principal
              </p>
            )}
            <ul className="space-y-1">
              {navigationItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200',
                      pathname === item.href 
                        ? 'bg-purple-500/10 border border-purple-500/20 text-purple-400' 
                        : 'hover:bg-surface-hover text-text-secondary hover:text-white'
                    )}
                  >
                    <item.icon className={cn(
                      'w-5 h-5 flex-shrink-0',
                      pathname === item.href ? 'text-purple-400' : ''
                    )} />
                    {!isCollapsed && (
                      <div className="flex-1 min-w-0">
                        <p className="font-medium">{item.label}</p>
                        {item.sublabel && (
                          <p className="text-xs text-text-muted truncate">{item.sublabel}</p>
                        )}
                      </div>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Seção Sistema */}
          <div>
            {!isCollapsed && (
              <p className="px-3 mb-2 text-xs font-semibold text-text-muted uppercase tracking-wider">
                Sistema
              </p>
            )}
            <ul className="space-y-1">
              {systemItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200',
                      pathname === item.href 
                        ? 'bg-purple-500/10 border border-purple-500/20 text-purple-400' 
                        : 'hover:bg-surface-hover text-text-secondary hover:text-white'
                    )}
                  >
                    <item.icon className={cn(
                      'w-5 h-5 flex-shrink-0',
                      pathname === item.href ? 'text-purple-400' : ''
                    )} />
                    {!isCollapsed && (
                      <div className="flex-1 min-w-0">
                        <p className="font-medium">{item.label}</p>
                        {item.sublabel && (
                          <p className="text-xs text-text-muted truncate">{item.sublabel}</p>
                        )}
                      </div>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Link para Dashboard Cliente */}
          <div>
            {!isCollapsed && (
              <p className="px-3 mb-2 text-xs font-semibold text-text-muted uppercase tracking-wider">
                Acesso Rápido
              </p>
            )}
            <Link
              href="/dashboard/grupos"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-text-secondary hover:text-white hover:bg-surface-hover transition-all duration-200"
            >
              <MousePointerClick className="w-5 h-5 flex-shrink-0" />
              {!isCollapsed && (
                <span className="font-medium">Painel Cliente</span>
              )}
            </Link>
          </div>
        </nav>
      </div>

      {/* Footer - Super Admin */}
      <div className="p-4 border-t border-surface-border">
        <div className={cn(
          'flex items-center gap-3',
          isCollapsed ? 'justify-center' : ''
        )}>
          <div className="flex items-center justify-center w-9 h-9 rounded-full bg-purple-500/20 text-purple-400 font-semibold text-sm">
            SA
          </div>
          {!isCollapsed && (
            <>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">Super Admin</p>
                <p className="text-xs text-text-muted truncate">Acesso total</p>
              </div>
              <Link
                href="/logout"
                className="p-2 rounded-lg hover:bg-surface-hover transition-colors"
                title="Sair"
              >
                <LogOut className="w-4 h-4 text-text-muted" />
              </Link>
            </>
          )}
        </div>
      </div>
    </aside>
  )
}

